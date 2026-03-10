# app/routes/bot_routes.py
import json
import httpx
import os
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from app.database import get_db_connection
from app.bot.bot_engine import BotEngine

router = APIRouter()

# URL base da Evolution API (configurar no .env quando tiver a VPS)
# Exemplo: EVOLUTION_API_URL=https://api.seudominio.com.br
#          EVOLUTION_API_KEY=sua_chave_aqui
EVOLUTION_URL = os.getenv("EVOLUTION_API_URL", "")
EVOLUTION_KEY = os.getenv("EVOLUTION_API_KEY", "")

# Sessão expira após X minutos sem interação → bot reinicia do início
SESSAO_TIMEOUT_MINUTOS = 30


# ─── MODELS ───────────────────────────────────────────────────────────────────

class SimularPayload(BaseModel):
    fluxo_id: int
    usuario_id: int
    node_id_atual: str = ""
    mensagem_usuario: str = ""


# ─── HELPERS DE SESSÃO ────────────────────────────────────────────────────────

def get_sessao(instancia_id: int, contato: str) -> dict | None:
    """
    Retorna a sessão ativa do contato nessa instância.
    Retorna None se não existir ou se tiver expirado (SESSAO_TIMEOUT_MINUTOS).
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT node_id_atual, fluxo_id
            FROM sessoes_bot
            WHERE instancia_id = %s
              AND contato = %s
              AND atualizado_em >= DATE_SUB(NOW(), INTERVAL %s MINUTE)
        """, (instancia_id, contato, SESSAO_TIMEOUT_MINUTOS))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def salvar_sessao(instancia_id: int, contato: str, node_id: str, fluxo_id: int):
    """Cria ou atualiza a sessão do contato."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO sessoes_bot (instancia_id, contato, node_id_atual, fluxo_id)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                node_id_atual = VALUES(node_id_atual),
                fluxo_id      = VALUES(fluxo_id),
                atualizado_em = NOW()
        """, (instancia_id, contato, node_id, fluxo_id))
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def deletar_sessao(instancia_id: int, contato: str):
    """Remove a sessão ao fim do fluxo."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM sessoes_bot WHERE instancia_id = %s AND contato = %s",
            (instancia_id, contato)
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def get_instancia(instancia_id: int) -> dict | None:
    """Busca a instância e o fluxo vinculado."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT i.id, i.usuario_id, i.fluxo_id, i.nome,
                   f.dados_json
            FROM instancias i
            JOIN fluxos f ON f.id = i.fluxo_id
            WHERE i.id = %s AND i.status != 'deletado'
        """, (instancia_id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


# ─── ENVIO DE MENSAGEM VIA EVOLUTION API ──────────────────────────────────────

async def enviar_mensagem(nome_instancia: str, contato: str, mensagem: str):
    """
    Envia mensagem de texto via Evolution API.
    Só executa se EVOLUTION_API_URL estiver configurado no .env.
    """
    if not EVOLUTION_URL or not EVOLUTION_KEY:
        # VPS ainda não configurada — apenas loga
        print(f"[BOT] (sem VPS) → {contato}: {mensagem[:60]}...")
        return

    url = f"{EVOLUTION_URL}/message/sendText/{nome_instancia}"
    payload = {
        "number": contato,
        "text": mensagem,
    }
    headers = {"apikey": EVOLUTION_KEY, "Content-Type": "application/json"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code not in (200, 201):
                print(f"[BOT] Erro ao enviar para {contato}: {resp.text}")
    except Exception as e:
        print(f"[BOT] Falha na requisição Evolution API: {e}")


# ─── LÓGICA PRINCIPAL DO BOT ──────────────────────────────────────────────────

async def processar_mensagem(
    instancia_id: int,
    nome_instancia: str,
    contato: str,
    mensagem_usuario: str
):
    """
    Núcleo do bot:
    1. Busca sessão ativa do contato
    2. Se não existir → começa do início do fluxo
    3. Processa a mensagem com o BotEngine
    4. Envia resposta via Evolution API
    5. Salva/deleta sessão conforme o estado
    """
    instancia = get_instancia(instancia_id)
    if not instancia:
        print(f"[BOT] Instância {instancia_id} não encontrada.")
        return

    engine = BotEngine(instancia["dados_json"])
    sessao = get_sessao(instancia_id, contato)

    # ── Início da conversa (sem sessão ativa) ──
    if not sessao:
        no_inicial = engine.get_no_inicial()
        if not no_inicial:
            print(f"[BOT] Fluxo {instancia['fluxo_id']} sem nó inicial.")
            return

        mensagem_resposta = engine.montar_mensagem_com_opcoes(no_inicial)
        salvar_sessao(instancia_id, contato, no_inicial["id"], instancia["fluxo_id"])
        await enviar_mensagem(nome_instancia, contato, mensagem_resposta)
        return

    # ── Continua a conversa ──
    resultado = engine.processar_resposta(sessao["node_id_atual"], mensagem_usuario)

    if not resultado["encontrou"]:
        # Opção inválida — repete o nó atual
        no_atual = engine.get_no(sessao["node_id_atual"])
        fallback = "Opção inválida. Escolha uma das opções abaixo:\n\n"
        if no_atual:
            fallback += engine.montar_mensagem_com_opcoes(no_atual)
        await enviar_mensagem(nome_instancia, contato, fallback)
        return

    # Monta a mensagem do próximo nó com opções
    proximo_node = engine.get_no(resultado["proximo_node_id"])
    if proximo_node:
        mensagem_resposta = engine.montar_mensagem_com_opcoes(proximo_node)
    else:
        mensagem_resposta = resultado["mensagem"]

    await enviar_mensagem(nome_instancia, contato, mensagem_resposta)

    # ── Fim do fluxo → remove sessão ──
    if resultado["fim_fluxo"]:
        deletar_sessao(instancia_id, contato)
    else:
        salvar_sessao(instancia_id, contato, resultado["proximo_node_id"], sessao["fluxo_id"])


# ─── ROTA: WEBHOOK DA EVOLUTION API ──────────────────────────────────────────

@router.post("/bot/webhook/{instancia_id}")
async def webhook(instancia_id: int, request: Request, background_tasks: BackgroundTasks):
    """
    Recebe eventos da Evolution API.
    A Evolution API envia um POST nessa URL a cada mensagem recebida.

    Como configurar na Evolution API (quando a VPS estiver pronta):
      URL: https://seudominio.com.br/bot/webhook/{instancia_id}
      Eventos: MESSAGES_UPSERT
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Payload inválido.")

    # A Evolution API envia evento "MESSAGES_UPSERT"
    evento = body.get("event")
    if evento != "MESSAGES_UPSERT":
        return {"status": "ignorado", "evento": evento}

    dados = body.get("data", {})

    # Ignora mensagens enviadas pelo próprio bot (fromMe = True)
    key = dados.get("key", {})
    if key.get("fromMe"):
        return {"status": "ignorado", "motivo": "mensagem própria"}

    # Extrai número do contato (remove @s.whatsapp.net se vier)
    contato_raw = key.get("remoteJid", "")
    contato = contato_raw.replace("@s.whatsapp.net", "").replace("@g.us", "")

    # Ignora grupos
    if "@g.us" in contato_raw:
        return {"status": "ignorado", "motivo": "grupo"}

    # Extrai o texto da mensagem
    message = dados.get("message", {})
    texto = (
        message.get("conversation")
        or message.get("extendedTextMessage", {}).get("text")
        or ""
    ).strip()

    if not texto:
        return {"status": "ignorado", "motivo": "mensagem sem texto"}

    # Nome da instância (para envio via Evolution API)
    nome_instancia = body.get("instance", "") or str(instancia_id)

    # Processa em background para responder o webhook imediatamente
    background_tasks.add_task(
        processar_mensagem,
        instancia_id,
        nome_instancia,
        contato,
        texto,
    )

    return {"status": "ok"}


# ─── ROTA: SIMULAR BOT (sem WhatsApp) ────────────────────────────────────────

@router.post("/bot/simular")
def simular(payload: SimularPayload):
    """
    Simula o bot sem precisar do WhatsApp.
    Útil para testar os fluxos diretamente pelo dashboard.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT dados_json FROM fluxos WHERE id = %s AND usuario_id = %s",
            (payload.fluxo_id, payload.usuario_id)
        )
        fluxo = cursor.fetchone()
        if not fluxo:
            raise HTTPException(status_code=404, detail="Fluxo não encontrado.")

        engine = BotEngine(fluxo["dados_json"])

        if not payload.node_id_atual:
            no_inicial = engine.get_no_inicial()
            if not no_inicial:
                raise HTTPException(status_code=404, detail="Fluxo sem nó inicial.")
            return {
                "node_id_atual": no_inicial["id"],
                "mensagem": engine.montar_mensagem_com_opcoes(no_inicial),
                "opcoes": no_inicial["data"].get("options", []),
                "delay": no_inicial["data"].get("delay", 2),
                "fim_fluxo": False,
            }

        resultado = engine.processar_resposta(payload.node_id_atual, payload.mensagem_usuario)

        if not resultado["encontrou"]:
            no_atual = engine.get_no(payload.node_id_atual)
            fallback = "Opção inválida. Escolha uma das opções abaixo:\n\n"
            if no_atual:
                fallback += engine.montar_mensagem_com_opcoes(no_atual)
            return {
                "node_id_atual": payload.node_id_atual,
                "mensagem": fallback,
                "opcoes": no_atual["data"].get("options", []) if no_atual else [],
                "delay": 1,
                "fim_fluxo": False,
            }

        proximo_node = engine.get_no(resultado["proximo_node_id"])
        mensagem = engine.montar_mensagem_com_opcoes(proximo_node) if proximo_node else resultado["mensagem"]

        return {
            "node_id_atual": resultado["proximo_node_id"],
            "mensagem": mensagem,
            "opcoes": resultado["opcoes"],
            "delay": resultado["delay"],
            "fim_fluxo": resultado["fim_fluxo"],
        }

    finally:
        cursor.close()
        conn.close()