# app/routes/bot_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_db_connection
from app.bot.bot_engine import BotEngine

router = APIRouter()

# ─── MODELS ──────────────────────────────────────────────────────────────────

class SimularPayload(BaseModel):
    fluxo_id: int
    usuario_id: int
    node_id_atual: str = ""       # vazio = começa do início
    mensagem_usuario: str = ""    # vazia = começa do início

# ─── ROTA: INICIAR OU CONTINUAR SIMULAÇÃO ────────────────────────────────────

@router.post("/bot/simular")
def simular(payload: SimularPayload):
    """
    Simula o bot sem precisar do WhatsApp.
    - Se node_id_atual vazio → retorna o primeiro nó
    - Se node_id_atual preenchido → processa a resposta e retorna o próximo nó
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")

    cursor = conn.cursor(dictionary=True)
    try:
        # Busca o fluxo no banco
        cursor.execute(
            "SELECT dados_json FROM fluxos WHERE id = %s AND usuario_id = %s",
            (payload.fluxo_id, payload.usuario_id)
        )
        fluxo = cursor.fetchone()
        if not fluxo:
            raise HTTPException(status_code=404, detail="Fluxo não encontrado.")

        engine = BotEngine(fluxo["dados_json"])

        # Início da conversa — retorna o primeiro nó
        if not payload.node_id_atual:
            no_inicial = engine.get_no_inicial()
            if not no_inicial:
                raise HTTPException(status_code=404, detail="Fluxo sem nó inicial.")
            mensagem = engine.montar_mensagem_com_opcoes(no_inicial)
            return {
                "node_id_atual": no_inicial["id"],
                "mensagem": mensagem,
                "opcoes": no_inicial["data"].get("options", []),
                "delay": no_inicial["data"].get("delay", 2),
                "fim_fluxo": False,
            }

        # Continua a conversa — processa resposta do usuário
        resultado = engine.processar_resposta(payload.node_id_atual, payload.mensagem_usuario)

        if not resultado["encontrou"]:
            # Repete o nó atual com aviso
            no_atual = engine.get_no(payload.node_id_atual)
            mensagem_fallback = "Opção inválida. Por favor, escolha uma das opções abaixo:\n\n"
            if no_atual:
                mensagem_fallback += engine.montar_mensagem_com_opcoes(no_atual)
            return {
                "node_id_atual": payload.node_id_atual,
                "mensagem": mensagem_fallback,
                "opcoes": no_atual["data"].get("options", []) if no_atual else [],
                "delay": 1,
                "fim_fluxo": False,
            }

        # Monta mensagem com opções se houver
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