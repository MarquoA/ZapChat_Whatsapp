# app/routes/ia_routes.py
import os
import json
import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List
from jose import JWTError, jwt
from app.database import get_db_connection

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

MODELOS_PERMITIDOS = {"gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"}

# Limite de tokens por mensagem por plano (controla o slider no dashboard)
LIMITE_TOKENS_PLANO = {
    "pro":      10000,
    "business": 10000,
}

# Limite de créditos mensais por plano
LIMITE_CICLO_PLANO = {
    "pro":      2_000_000,
    "business": 3_000_000,
}


def get_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")


def _get_plano_ia(usuario_id: int) -> str:
    """Retorna o plano ativo do usuário. Lança 403 se for starter."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT plano FROM assinaturas
            WHERE usuario_id = %s AND status IN ('ativo', 'trial')
            ORDER BY id DESC LIMIT 1
        """, (usuario_id,))
        row = cursor.fetchone()
        plano = row["plano"] if row else "starter"
    finally:
        cursor.close()
        conn.close()

    if plano == "starter":
        raise HTTPException(
            status_code=403,
            detail="A IA está disponível nos planos Pro e Business."
        )
    return plano


# ══════════════════════════════════════════════════════════════════════════════
# ROTA: LIMITES DO PLANO (frontend usa para configurar o slider de tokens)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/ia/limites")
def limites_ia(usuario: dict = Depends(get_usuario_atual)):
    """Retorna os limites de tokens do plano atual do usuário."""
    uid = int(usuario["sub"])
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT plano FROM assinaturas
            WHERE usuario_id = %s AND status IN ('ativo', 'trial')
            ORDER BY id DESC LIMIT 1
        """, (uid,))
        row = cursor.fetchone()
        plano = row["plano"] if row else "starter"
    finally:
        cursor.close()
        conn.close()

    teto = LIMITE_TOKENS_PLANO.get(plano, 0)
    return {
        "plano": plano,
        "ia_disponivel": plano != "starter",
        "max_tokens_por_mensagem": teto,
    }


@router.get("/ia/tokens")
def saldo_tokens(usuario: dict = Depends(get_usuario_atual)):
    """Retorna o saldo de tokens disponível, o total usado e o limite do plano atual."""
    uid = int(usuario["sub"])
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT plano FROM assinaturas
            WHERE usuario_id = %s AND status IN ('ativo', 'trial')
            ORDER BY id DESC LIMIT 1
        """, (uid,))
        plano_row = cursor.fetchone()
        plano = plano_row["plano"] if plano_row else "pro"
        limite = LIMITE_CICLO_PLANO.get(plano, 2_000_000)

        _garantir_saldo_ia(conn, uid)
        cursor.execute(
            "SELECT saldo, total_usado, ultimo_reset FROM tokens_ia WHERE usuario_id = %s",
            (uid,)
        )
        row = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not row:
        return {"saldo": limite, "total_usado": 0, "limite_ciclo": limite, "ultimo_reset": None}

    return {
        "saldo": row["saldo"],
        "total_usado": row["total_usado"],
        "limite_ciclo": limite,
        "ultimo_reset": str(row["ultimo_reset"]) if row["ultimo_reset"] else None,
    }


# ══════════════════════════════════════════════════════════════════════════════
# MODELS
# ══════════════════════════════════════════════════════════════════════════════

class MensagemItem(BaseModel):
    role: str   # "user" ou "assistant"
    content: str

class ChatPayload(BaseModel):
    mensagens: List[MensagemItem]
    system_prompt: str
    modelo: str = "gpt-4o-mini"
    max_tokens: int = 1000

class AgentePayload(BaseModel):
    id: int = 0
    usuario_id: int
    nome: str
    tom: str = "equilibrado"
    modelo: str = "gpt-4o-mini"
    max_tokens: int = 1000
    prompt: str
    finalizacao: str = ""
    base_conhecimento: list = []
    ferramentas: dict = {}


# ══════════════════════════════════════════════════════════════════════════════
# ROTA: CHAT COM GPT-4o-mini
# ══════════════════════════════════════════════════════════════════════════════

def _garantir_saldo_ia(conn, usuario_id: int):
    """Garante que o usuário tem linha na tabela tokens_ia. Cria com saldo inicial de 2M se não existir."""
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT IGNORE INTO tokens_ia (usuario_id, saldo, total_usado, ultimo_reset) VALUES (%s, 2000000, 0, NOW())",
            (usuario_id,)
        )
        conn.commit()
    finally:
        cursor.close()


def _checar_saldo_ia(conn, usuario_id: int) -> int:
    """Retorna o saldo atual de tokens. Lança 402 se esgotado."""
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT saldo FROM tokens_ia WHERE usuario_id = %s", (usuario_id,))
        row = cursor.fetchone()
        saldo = row["saldo"] if row else 0
    finally:
        cursor.close()

    if saldo <= 0:
        raise HTTPException(
            status_code=402,
            detail="Saldo de tokens esgotado. Aguarde a recarga mensal ou adquira tokens adicionais."
        )
    return saldo


def _debitar_tokens_ia(conn, usuario_id: int, tokens: int, modelo: str):
    """Debita tokens usados e registra no histórico."""
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE tokens_ia SET saldo = GREATEST(saldo - %s, 0), total_usado = total_usado + %s WHERE usuario_id = %s",
            (tokens, tokens, usuario_id)
        )
        cursor.execute(
            "INSERT INTO historico_tokens_ia (usuario_id, tokens_usados, modelo, criado_em) VALUES (%s, %s, %s, NOW())",
            (usuario_id, tokens, modelo)
        )
        conn.commit()
    except Exception as e:
        logger.error(f"Erro ao debitar tokens de usuario {usuario_id}: {e}")
    finally:
        cursor.close()


@router.post("/ia/chat")
async def chat_ia(payload: ChatPayload, usuario: dict = Depends(get_usuario_atual)):
    """
    Envia mensagens ao modelo OpenAI e retorna a resposta.
    A OPENAI_API_KEY fica segura no backend, nunca exposta ao browser.
    Controla saldo de tokens por usuário (Pro: 2M, Business: 3M por ciclo mensal).
    """
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="OPENAI_API_KEY não configurada no servidor. Adicione no .env e reinicie o backend."
        )

    uid = int(usuario["sub"])
    plano = _get_plano_ia(uid)

    teto_plano = LIMITE_TOKENS_PLANO.get(plano, 2000)
    max_tokens = min(payload.max_tokens, teto_plano)
    modelo = payload.modelo if payload.modelo in MODELOS_PERMITIDOS else "gpt-4o-mini"

    # Verificar e garantir saldo de tokens
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    try:
        _garantir_saldo_ia(conn, uid)
        _checar_saldo_ia(conn, uid)
    finally:
        conn.close()

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=OPENAI_API_KEY)

        resposta = await client.chat.completions.create(
            model=modelo,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": payload.system_prompt},
                *[{"role": m.role, "content": m.content} for m in payload.mensagens],
            ],
        )

        texto = resposta.choices[0].message.content or ""
        tokens_usados = resposta.usage.total_tokens if resposta.usage else 0

        # Debitar tokens consumidos
        conn2 = get_db_connection()
        if conn2:
            try:
                _debitar_tokens_ia(conn2, uid, tokens_usados, modelo)
            finally:
                conn2.close()

        return {
            "resposta": texto,
            "modelo": modelo,
            "tokens_usados": tokens_usados,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao chamar OpenAI: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao chamar IA: {str(e)}")


# ══════════════════════════════════════════════════════════════════════════════
# ROTAS: CRUD DE AGENTES
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/ia/agentes/salvar")
def salvar_agente(payload: AgentePayload, usuario: dict = Depends(get_usuario_atual)):
    if str(payload.usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor()
    try:
        base_json = json.dumps(payload.base_conhecimento, ensure_ascii=False)
        ferramentas_json = json.dumps(payload.ferramentas, ensure_ascii=False)

        if payload.id and payload.id > 0:
            cursor.execute("""
                UPDATE agentes_ia
                SET nome=%s, tom=%s, modelo=%s, max_tokens=%s, prompt=%s,
                    finalizacao=%s, base_conhecimento=%s, ferramentas=%s,
                    atualizado_em=NOW()
                WHERE id=%s AND usuario_id=%s
            """, (payload.nome, payload.tom, payload.modelo, payload.max_tokens,
                  payload.prompt, payload.finalizacao, base_json, ferramentas_json,
                  payload.id, payload.usuario_id))
            conn.commit()
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Agente não encontrado.")
            return {"success": True, "id": payload.id, "mensagem": "Agente atualizado!"}
        else:
            cursor.execute("""
                INSERT INTO agentes_ia
                    (usuario_id, nome, tom, modelo, max_tokens, prompt, finalizacao,
                     base_conhecimento, ferramentas)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (payload.usuario_id, payload.nome, payload.tom, payload.modelo,
                  payload.max_tokens, payload.prompt, payload.finalizacao,
                  base_json, ferramentas_json))
            conn.commit()
            return {"success": True, "id": cursor.lastrowid, "mensagem": "Agente salvo!"}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Erro ao salvar agente: {e}")
        raise HTTPException(status_code=500, detail="Erro ao salvar agente.")
    finally:
        cursor.close()
        conn.close()


@router.get("/ia/agentes/listar/{usuario_id}")
def listar_agentes(usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT id, nome, tom, modelo, max_tokens, criado_em
            FROM agentes_ia WHERE usuario_id = %s ORDER BY atualizado_em DESC
        """, (usuario_id,))
        agentes = cursor.fetchall()
        for a in agentes:
            if a.get("criado_em"):
                a["criado_em"] = str(a["criado_em"])
        return {"agentes": agentes}
    finally:
        cursor.close()
        conn.close()


@router.get("/ia/agentes/{agente_id}/{usuario_id}")
def carregar_agente(agente_id: int, usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM agentes_ia WHERE id = %s AND usuario_id = %s",
            (agente_id, usuario_id)
        )
        agente = cursor.fetchone()
        if not agente:
            raise HTTPException(status_code=404, detail="Agente não encontrado.")

        for campo in ("base_conhecimento", "ferramentas"):
            if isinstance(agente.get(campo), str):
                try:
                    agente[campo] = json.loads(agente[campo])
                except Exception:
                    agente[campo] = [] if campo == "base_conhecimento" else {}

        for campo in ("criado_em", "atualizado_em"):
            if agente.get(campo):
                agente[campo] = str(agente[campo])

        return agente
    finally:
        cursor.close()
        conn.close()


@router.delete("/ia/agentes/{agente_id}/{usuario_id}")
def deletar_agente(agente_id: int, usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM agentes_ia WHERE id = %s AND usuario_id = %s",
            (agente_id, usuario_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Agente não encontrado.")
        return {"success": True, "mensagem": "Agente deletado!"}
    finally:
        cursor.close()
        conn.close()
