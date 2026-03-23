# app/routes/bot_routes.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.database import get_db_connection
from app.bot.bot_engine import BotEngine
from jose import JWTError, jwt
import json, os

router = APIRouter()
security = HTTPBearer()

SECRET_KEY = "zapchat_senha_MmC"
ALGORITHM  = "HS256"

SESSAO_TIMEOUT_MINUTOS = 30


# ── Auth ─────────────────────────────────────────────────────────────────────

def verificar_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido.")

def get_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return verificar_token(credentials.credentials)


# ── Helpers de sessão ─────────────────────────────────────────────────────────

def get_sessao(conn, instancia_id: int, contato: str) -> dict | None:
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM sessoes_bot
        WHERE instancia_id = %s AND contato = %s
          AND atualizado_em >= NOW() - INTERVAL %s MINUTE
    """, (instancia_id, contato, SESSAO_TIMEOUT_MINUTOS))
    row = cursor.fetchone()
    cursor.close()
    return row

def salvar_sessao(conn, instancia_id: int, contato: str, fluxo_id: int, node_id: str):
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO sessoes_bot (instancia_id, contato, fluxo_id, node_id_atual)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            fluxo_id      = VALUES(fluxo_id),
            node_id_atual = VALUES(node_id_atual),
            atualizado_em = NOW()
    """, (instancia_id, contato, fluxo_id, node_id))
    conn.commit()
    cursor.close()

def deletar_sessao(conn, instancia_id: int, contato: str):
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM sessoes_bot WHERE instancia_id = %s AND contato = %s",
        (instancia_id, contato)
    )
    conn.commit()
    cursor.close()

def get_instancia(conn, instancia_id: int) -> dict | None:
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM instancias WHERE id = %s", (instancia_id,))
    row = cursor.fetchone()
    cursor.close()
    return row


# ── /bot/simular ─────────────────────────────────────────────────────────────

class SimularInicio(BaseModel):
    fluxo_id: int

class SimularResposta(BaseModel):
    fluxo_id:      int
    node_id_atual: str
    mensagem:      str


@router.post("/bot/simular/inicio")
async def simular_inicio(dados: SimularInicio, usuario: dict = Depends(get_usuario_atual)):
    """Inicia a simulação — retorna o primeiro nó do fluxo."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, nome_fluxo, dados_json FROM fluxos WHERE id = %s AND usuario_id = %s",
            (dados.fluxo_id, usuario["sub"])
        )
        fluxo = cursor.fetchone()
        if not fluxo:
            raise HTTPException(status_code=404, detail="Fluxo não encontrado.")

        engine      = BotEngine(fluxo["dados_json"])
        no_inicial  = engine.get_no_inicial()
        if not no_inicial:
            raise HTTPException(status_code=400, detail="Fluxo sem nó inicial.")

        resposta = engine.montar_resposta_no(no_inicial)

        return {
            "fluxo_id":      fluxo["id"],
            "nome_fluxo":    fluxo["nome_fluxo"],
            "node_id_atual": no_inicial["id"],
            **resposta,
        }
    finally:
        cursor.close()
        conn.close()


@router.post("/bot/simular")
async def simular_resposta(dados: SimularResposta, usuario: dict = Depends(get_usuario_atual)):
    """
    Recebe a mensagem do usuário e avança o fluxo.
    Retorna: tipo_node, mensagem, image_url, opcoes, delay, fim_fluxo, proximo_node_id
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT dados_json FROM fluxos WHERE id = %s AND usuario_id = %s",
            (dados.fluxo_id, usuario["sub"])
        )
        fluxo = cursor.fetchone()
        if not fluxo:
            raise HTTPException(status_code=404, detail="Fluxo não encontrado.")

        engine    = BotEngine(fluxo["dados_json"])
        resultado = engine.processar_resposta(dados.node_id_atual, dados.mensagem)

        return resultado
    finally:
        cursor.close()
        conn.close()


# ── /bot/webhook (Evolution API — ativado quando tiver a API KEY) ─────────────

@router.post("/bot/webhook/{instancia_id}")
async def bot_webhook(instancia_id: int, payload: dict):
    """
    Recebe eventos da Evolution API.
    Quando EVOLUTION_API_KEY estiver configurada no .env, este endpoint
    processa automaticamente as mensagens recebidas.
    """
    EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL", "")
    EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY", "")

    # Ignora eventos que não são mensagens de texto/imagem recebidas
    event = payload.get("event", "")
    if event not in ["messages.upsert", "message"]:
        return {"status": "ignorado"}

    data     = payload.get("data", {})
    mensagem = data.get("message", {})
    key      = data.get("key", {})

    # Ignora mensagens enviadas pelo próprio bot
    if key.get("fromMe"):
        return {"status": "ignorado"}

    contato        = key.get("remoteJid", "").replace("@s.whatsapp.net", "")
    texto_recebido = (
        mensagem.get("conversation")
        or mensagem.get("extendedTextMessage", {}).get("text")
        or ""
    ).strip()

    if not texto_recebido or not contato:
        return {"status": "ignorado"}

    conn = get_db_connection()
    if not conn:
        return {"status": "erro_banco"}

    try:
        instancia = get_instancia(conn, instancia_id)
        if not instancia:
            return {"status": "instancia_nao_encontrada"}

        # Busca fluxo padrão da instância
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, dados_json FROM fluxos WHERE usuario_id = %s ORDER BY data_criacao DESC LIMIT 1",
            (instancia["usuario_id"],)
        )
        fluxo = cursor.fetchone()
        cursor.close()
        if not fluxo:
            return {"status": "sem_fluxo"}

        engine  = BotEngine(fluxo["dados_json"])
        sessao  = get_sessao(conn, instancia_id, contato)

        if not sessao:
            # Nova conversa — começa do nó inicial
            no_inicial = engine.get_no_inicial()
            if not no_inicial:
                return {"status": "fluxo_invalido"}
            resposta = engine.montar_resposta_no(no_inicial)
            salvar_sessao(conn, instancia_id, contato, fluxo["id"], no_inicial["id"])
        else:
            resposta = engine.processar_resposta(sessao["node_id_atual"], texto_recebido)
            if resposta["fim_fluxo"]:
                deletar_sessao(conn, instancia_id, contato)
            else:
                salvar_sessao(conn, instancia_id, contato, fluxo["id"], resposta["proximo_node_id"])

        # ── Envia resposta via Evolution API ──────────────────────────────────
        # REQUER: EVOLUTION_API_URL e EVOLUTION_API_KEY no .env
        if EVOLUTION_API_URL and EVOLUTION_API_KEY:
            import httpx
            headers = {
                "apikey":       EVOLUTION_API_KEY,
                "Content-Type": "application/json",
            }
            nome_instancia = instancia.get("nome_instancia", str(instancia_id))

            if resposta.get("tipo_node") == "imagem" and resposta.get("image_url"):
                # Envia imagem
                await httpx.AsyncClient().post(
                    f"{EVOLUTION_API_URL}/message/sendMedia/{nome_instancia}",
                    headers=headers,
                    json={
                        "number":   contato,
                        "mediatype": "image",
                        "mimetype":  "image/jpeg",
                        "media":     resposta["image_url"],
                        "caption":   resposta.get("mensagem", ""),
                    }
                )
            else:
                # Envia texto
                texto = engine.montar_mensagem_com_opcoes(
                    engine.get_no(resposta.get("proximo_node_id") or sessao["node_id_atual"])
                ) if resposta.get("opcoes") else resposta.get("mensagem", "")

                await httpx.AsyncClient().post(
                    f"{EVOLUTION_API_URL}/message/sendText/{nome_instancia}",
                    headers=headers,
                    json={
                        "number": contato,
                        "text":   texto,
                        "delay":  resposta.get("delay", 2) * 1000,
                    }
                )

        return {"status": "ok"}

    except Exception as e:
        return {"status": "erro", "detalhe": str(e)}
    finally:
        conn.close()