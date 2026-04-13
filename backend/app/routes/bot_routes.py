# app/routes/bot_routes.py
import logging
import json
import os
from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.database import get_db_connection
from app.bot.bot_engine import BotEngine
from jose import JWTError, jwt
from openai import AsyncOpenAI

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM  = "HS256"

SESSAO_TIMEOUT_MINUTOS = 30

OPENAI_API_KEY    = os.getenv("OPENAI_API_KEY", "")
MODELOS_PERMITIDOS = {"gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"}

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

def salvar_sessao(
    conn,
    instancia_id: int,
    contato: str,
    fluxo_id: int,
    node_id: str,
    modo_ia: int = 0,
    ia_agente_id: int | None = None,
    ia_historico: str | None = None,
):
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO sessoes_bot
            (instancia_id, contato, fluxo_id, node_id_atual,
             modo_ia, ia_agente_id, ia_historico)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            fluxo_id              = VALUES(fluxo_id),
            node_id_atual         = VALUES(node_id_atual),
            modo_ia               = VALUES(modo_ia),
            ia_agente_id          = VALUES(ia_agente_id),
            ia_historico          = VALUES(ia_historico),
            timeout_aviso_enviado = 0,
            atualizado_em         = NOW()
    """, (instancia_id, contato, fluxo_id, node_id,
          modo_ia, ia_agente_id, ia_historico))
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

def _get_agente(conn, agente_id: int) -> dict | None:
    """Carrega um agente de IA do banco pelo ID."""
    if not agente_id:
        return None
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM agentes_ia WHERE id = %s", (agente_id,))
    row = cursor.fetchone()
    cursor.close()
    return row


# ── Helpers de IA ─────────────────────────────────────────────────────────────

def _system_prompt_ia(agente: dict) -> str:
    """Monta o system prompt com instrução de encerramento embutida."""
    base = (agente.get("prompt") or "Você é um assistente prestativo.").strip()
    return (
        base
        + "\n\nDIRETRIZES DE COMPORTAMENTO:\n"
        + "- Mantenha as respostas CURTAS e objetivas — no máximo 2 a 3 parágrafos.\n"
        + "- Você é um assistente via WhatsApp, não um ensaio — seja direto.\n"
        + "- Quando a conversa chegar ao fim natural (usuário disse tchau, obrigado, "
          "não precisa mais de ajuda, ou confirmou que pode encerrar), comece sua "
          "resposta EXATAMENTE com [FIM] seguido da mensagem de despedida. "
          "Exemplo: [FIM]Fico feliz em ter ajudado! Até mais. 😊\n"
        + "- Fora isso, responda normalmente sem usar [FIM]."
    )

async def _chamar_gpt(
    system_prompt: str,
    historico: list,
    modelo: str = "gpt-4o-mini",
    max_tokens: int = 300,
) -> str:
    """Chama o GPT com um system prompt e histórico de conversa."""
    if not OPENAI_API_KEY:
        return "[IA não configurada — adicione OPENAI_API_KEY no .env]"
    modelo = modelo if modelo in MODELOS_PERMITIDOS else "gpt-4o-mini"
    try:
        client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        resposta = await client.chat.completions.create(
            model=modelo,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system_prompt},
                *historico,
            ],
        )
        return resposta.choices[0].message.content or ""
    except Exception as e:
        logger.error(f"Erro ao chamar OpenAI no bot: {e}")
        return "[Erro ao chamar IA. Tente novamente.]"


# ── Helpers de envio Evolution API ───────────────────────────────────────────

async def _enviar_texto_evolution(
    api_url: str,
    api_key: str,
    nome_inst: str,
    contato: str,
    texto: str,
    delay: int = 2,
):
    import httpx
    headers = {"apikey": api_key, "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=15) as client:
        await client.post(
            f"{api_url}/message/sendText/{nome_inst}",
            headers=headers,
            json={"number": contato, "text": texto, "delay": int(delay) * 1000},
        )

async def _enviar_resposta_evolution(
    api_url: str,
    api_key: str,
    nome_inst: str,
    contato: str,
    resposta: dict,
    engine: BotEngine,
):
    import httpx
    headers = {"apikey": api_key, "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=15) as client:
        if resposta.get("tipo_node") == "imagem" and resposta.get("image_url"):
            await client.post(
                f"{api_url}/message/sendMedia/{nome_inst}",
                headers=headers,
                json={
                    "number":    contato,
                    "mediatype": "image",
                    "mimetype":  "image/jpeg",
                    "media":     resposta["image_url"],
                    "caption":   resposta.get("mensagem", ""),
                },
            )
        else:
            proximo_id = resposta.get("proximo_node_id")
            node = engine.get_no(proximo_id) if proximo_id else None
            texto = (
                engine.montar_mensagem_com_opcoes(node)
                if node and resposta.get("opcoes")
                else resposta.get("mensagem", "")
            )
            await client.post(
                f"{api_url}/message/sendText/{nome_inst}",
                headers=headers,
                json={
                    "number": contato,
                    "text":   texto,
                    "delay":  resposta.get("delay", 2) * 1000,
                },
            )


# ── Processamento em background ───────────────────────────────────────────────

async def _processar_mensagem_bg(instancia_id: int, contato: str, texto_recebido: str):
    """
    Processa uma mensagem do WhatsApp em background.

    Fluxo:
      - Se a sessão está em modo_ia=1 → continua a conversa com o agente
        · Detecta [FIM] na resposta → encerra e avança para o próximo nó (ou fecha)
        · Caso contrário → mantém no mesmo nó, atualiza histórico
      - Se não está em modo IA → processa o fluxo normalmente
        · Se cair num iaNode → entra em modo IA
        · Senão → avança fluxo normalmente
    """
    EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL", "")
    EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY", "")

    conn = get_db_connection()
    if not conn:
        logger.error(f"Webhook BG: erro de banco (instância {instancia_id})")
        return

    try:
        instancia = get_instancia(conn, instancia_id)
        if not instancia:
            return

        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, dados_json FROM fluxos WHERE usuario_id = %s ORDER BY data_criacao DESC LIMIT 1",
            (instancia["usuario_id"],)
        )
        fluxo = cursor.fetchone()
        cursor.close()
        if not fluxo:
            return

        engine    = BotEngine(fluxo["dados_json"])
        sessao    = get_sessao(conn, instancia_id, contato)
        nome_inst = (
            instancia.get("evolution_instance_id")
            or instancia.get("nome", str(instancia_id))
        )

        # ── MODO IA ───────────────────────────────────────────────────────────
        if sessao and sessao.get("modo_ia"):
            agente = _get_agente(conn, sessao.get("ia_agente_id"))
            if not agente:
                deletar_sessao(conn, instancia_id, contato)
                return

            historico = json.loads(sessao.get("ia_historico") or "[]")
            historico.append({"role": "user", "content": texto_recebido})

            resposta_ia = await _chamar_gpt(
                system_prompt=_system_prompt_ia(agente),
                historico=historico,
                modelo=agente.get("modelo", "gpt-4o-mini"),
                max_tokens=agente.get("max_tokens", 300),
            )

            fim = resposta_ia.lstrip().startswith("[FIM]")
            texto_final = resposta_ia.lstrip().removeprefix("[FIM]").strip() if fim else resposta_ia

            # Envia a resposta da IA
            if EVOLUTION_API_URL and EVOLUTION_API_KEY:
                await _enviar_texto_evolution(
                    EVOLUTION_API_URL, EVOLUTION_API_KEY,
                    nome_inst, contato, texto_final,
                    agente.get("max_tokens", 2),  # usa delay padrão 2s
                )

            if fim:
                # Verifica se o nó IA tem um próximo nó para avançar
                ia_node_id = sessao["node_id_atual"]
                proximo_id = next(
                    (e["target"] for e in engine.edges if e["source"] == ia_node_id), None
                )
                if proximo_id:
                    proximo_node = engine.get_no(proximo_id)
                    if proximo_node:
                        prox_resp = engine.montar_resposta_no(proximo_node)
                        salvar_sessao(conn, instancia_id, contato, fluxo["id"], proximo_id)
                        if EVOLUTION_API_URL and EVOLUTION_API_KEY:
                            await _enviar_resposta_evolution(
                                EVOLUTION_API_URL, EVOLUTION_API_KEY,
                                nome_inst, contato, prox_resp, engine,
                            )
                    else:
                        deletar_sessao(conn, instancia_id, contato)
                else:
                    deletar_sessao(conn, instancia_id, contato)
            else:
                # Continua no mesmo nó — atualiza histórico
                historico.append({"role": "assistant", "content": texto_final})
                salvar_sessao(
                    conn, instancia_id, contato, fluxo["id"],
                    sessao["node_id_atual"],
                    modo_ia=1,
                    ia_agente_id=sessao.get("ia_agente_id"),
                    ia_historico=json.dumps(historico, ensure_ascii=False),
                )
            return

        # ── MODO NORMAL ───────────────────────────────────────────────────────
        if not sessao:
            no_inicial = engine.get_no_inicial()
            if not no_inicial:
                return
            resposta      = engine.montar_resposta_no(no_inicial)
            node_id_atual = no_inicial["id"]
        else:
            resposta      = engine.processar_resposta(sessao["node_id_atual"], texto_recebido)
            node_id_atual = resposta.get("proximo_node_id", sessao["node_id_atual"])

        # ── Nó IA: entrar em modo IA ──────────────────────────────────────────
        if resposta.get("tipo_node") == "ia":
            agente_id = resposta.get("ia_agente_id")
            agente    = _get_agente(conn, agente_id)

            if not agente:
                if EVOLUTION_API_URL and EVOLUTION_API_KEY:
                    await _enviar_texto_evolution(
                        EVOLUTION_API_URL, EVOLUTION_API_KEY, nome_inst, contato,
                        "Desculpe, o assistente de IA não está disponível no momento.", 1,
                    )
                return

            primeiro_texto = texto_recebido if sessao else "Olá"
            historico_init = [{"role": "user", "content": primeiro_texto}]

            resposta_ia = await _chamar_gpt(
                system_prompt=_system_prompt_ia(agente),
                historico=historico_init,
                modelo=agente.get("modelo", "gpt-4o-mini"),
                max_tokens=agente.get("max_tokens", 300),
            )

            fim = resposta_ia.lstrip().startswith("[FIM]")
            texto_final = resposta_ia.lstrip().removeprefix("[FIM]").strip() if fim else resposta_ia
            historico_init.append({"role": "assistant", "content": texto_final})

            if fim:
                deletar_sessao(conn, instancia_id, contato)
            else:
                salvar_sessao(
                    conn, instancia_id, contato, fluxo["id"], node_id_atual,
                    modo_ia=1,
                    ia_agente_id=agente_id,
                    ia_historico=json.dumps(historico_init, ensure_ascii=False),
                )

            if EVOLUTION_API_URL and EVOLUTION_API_KEY:
                await _enviar_texto_evolution(
                    EVOLUTION_API_URL, EVOLUTION_API_KEY, nome_inst, contato,
                    texto_final, 2,
                )
            return

        # ── Nó normal ─────────────────────────────────────────────────────────
        if resposta.get("fim_fluxo"):
            deletar_sessao(conn, instancia_id, contato)
        else:
            salvar_sessao(conn, instancia_id, contato, fluxo["id"], node_id_atual)

        if EVOLUTION_API_URL and EVOLUTION_API_KEY:
            await _enviar_resposta_evolution(
                EVOLUTION_API_URL, EVOLUTION_API_KEY,
                nome_inst, contato, resposta, engine,
            )

    except Exception as e:
        logger.error(f"Erro no processamento BG (instância {instancia_id}): {e}")
    finally:
        conn.close()


# ── /bot/simular ─────────────────────────────────────────────────────────────

class SimularInicio(BaseModel):
    fluxo_id: int

class SimularResposta(BaseModel):
    fluxo_id:      int
    node_id_atual: str
    mensagem:      str


@router.post("/bot/simular/inicio")
async def simular_inicio(dados: SimularInicio, usuario: dict = Depends(get_usuario_atual)):
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

        engine     = BotEngine(fluxo["dados_json"])
        no_inicial = engine.get_no_inicial()
        if not no_inicial:
            raise HTTPException(status_code=400, detail="Fluxo sem nó inicial.")

        resposta = engine.montar_resposta_no(no_inicial)

        if resposta.get("tipo_node") == "ia":
            agente_id = resposta.get("ia_agente_id")
            agente    = _get_agente(conn, agente_id)
            if agente:
                texto_ia = await _chamar_gpt(
                    system_prompt=_system_prompt_ia(agente),
                    historico=[{"role": "user", "content": "Olá"}],
                    modelo=agente.get("modelo", "gpt-4o-mini"),
                    max_tokens=agente.get("max_tokens", 300),
                )
                fim = texto_ia.lstrip().startswith("[FIM]")
                resposta["mensagem"] = texto_ia.lstrip().removeprefix("[FIM]").strip() if fim else texto_ia
            else:
                resposta["mensagem"] = "[Agente de IA não encontrado. Configure o bloco IA.]"

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

        if resultado.get("tipo_node") == "ia" and not resultado.get("fim_fluxo"):
            agente_id = resultado.get("ia_agente_id")
            agente    = _get_agente(conn, agente_id)
            if agente:
                texto_ia = await _chamar_gpt(
                    system_prompt=_system_prompt_ia(agente),
                    historico=[{"role": "user", "content": dados.mensagem}],
                    modelo=agente.get("modelo", "gpt-4o-mini"),
                    max_tokens=agente.get("max_tokens", 300),
                )
                fim = texto_ia.lstrip().startswith("[FIM]")
                resultado["mensagem"] = texto_ia.lstrip().removeprefix("[FIM]").strip() if fim else texto_ia
                if fim:
                    resultado["fim_fluxo"] = True
            else:
                resultado["mensagem"] = "[Agente de IA não encontrado. Configure o bloco IA.]"

        return resultado
    finally:
        cursor.close()
        conn.close()


# ── /bot/webhook ──────────────────────────────────────────────────────────────

@router.post("/bot/webhook/{instancia_id}")
async def bot_webhook(
    instancia_id: int,
    payload: dict,
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Recebe eventos da Evolution API e retorna imediatamente (202).
    O processamento completo (incluindo chamadas à IA) ocorre em background.
    """
    EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY", "")

    if EVOLUTION_API_KEY:
        if request.headers.get("apikey", "") != EVOLUTION_API_KEY:
            raise HTTPException(status_code=401, detail="Não autorizado.")
    else:
        logger.warning("EVOLUTION_API_KEY não configurada — webhook sem autenticação.")

    event = payload.get("event", "")
    if event not in ["messages.upsert", "message"]:
        return {"status": "ignorado"}

    data     = payload.get("data", {})
    mensagem = data.get("message", {})
    key      = data.get("key", {})

    if key.get("fromMe"):
        return {"status": "ignorado"}

    contato = key.get("remoteJid", "").replace("@s.whatsapp.net", "")
    texto   = (
        mensagem.get("conversation")
        or mensagem.get("extendedTextMessage", {}).get("text")
        or ""
    ).strip()

    if not texto or not contato:
        return {"status": "ignorado"}

    background_tasks.add_task(_processar_mensagem_bg, instancia_id, contato, texto)
    return {"status": "recebido"}
