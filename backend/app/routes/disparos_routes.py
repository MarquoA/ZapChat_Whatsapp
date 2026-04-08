import logging
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt
from typing import List
import asyncio, random, httpx
from app.database import get_db_connection
import json, os

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM  = "HS256"

# Limite diário por plano
LIMITE_DIARIO = { "pro": 200, "business": 1000 }
# Delay entre mensagens (segundos) — imita comportamento humano
DELAY_MIN = 8
DELAY_MAX = 20

def get_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")

def get_plano_usuario(usuario_id: int) -> str:
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT plano FROM assinaturas
        WHERE usuario_id = %s AND status IN ('ativo', 'trial')
        ORDER BY id DESC LIMIT 1
    """, (usuario_id,))
    row = cursor.fetchone()
    cursor.close(); conn.close()
    return row["plano"] if row else None

def contar_disparos_hoje(usuario_id: int) -> int:
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT COUNT(*) as total FROM disparos
        WHERE usuario_id = %s AND DATE(criado_em) = CURDATE() AND status = 'enviado'
    """, (usuario_id,))
    row = cursor.fetchone()
    cursor.close(); conn.close()
    return row["total"] if row else 0

def registrar_disparo(usuario_id: int, contato: str, mensagem: str, status: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO disparos (usuario_id, contato, mensagem, status, criado_em)
        VALUES (%s, %s, %s, %s, NOW())
    """, (usuario_id, contato, mensagem, status))
    conn.commit()
    cursor.close(); conn.close()

class DisparoPayload(BaseModel):
    usuario_id: int
    contatos: List[str]       # lista de números: ["5511999999999", ...]
    mensagem: str
    instancia_id: int

class ContatoItem(BaseModel):
    numero: str
    nome: str = ""

class ListaContatosPayload(BaseModel):
    usuario_id: int
    contatos: List[ContatoItem]

@router.post("/disparos/enviar")
async def enviar_disparos(
    payload: DisparoPayload,
    background_tasks: BackgroundTasks,
    usuario: dict = Depends(get_usuario_atual)
):
    if str(payload.usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    plano = get_plano_usuario(payload.usuario_id)
    if not plano or plano == "starter":
        raise HTTPException(status_code=403, detail="Disparos em massa disponíveis apenas nos planos Pro e Business.")

    limite = LIMITE_DIARIO.get(plano, 200)
    enviados_hoje = contar_disparos_hoje(payload.usuario_id)

    if enviados_hoje >= limite:
        raise HTTPException(
            status_code=429,
            detail=f"Limite diário de {limite} disparos atingido para o plano {plano.capitalize()}. Tente novamente amanhã."
        )

    # Calcula quantos podem ser enviados ainda hoje
    restantes = limite - enviados_hoje
    contatos_a_enviar = payload.contatos[:restantes]

    if len(contatos_a_enviar) < len(payload.contatos):
        aviso = f"Serão enviados {len(contatos_a_enviar)} de {len(payload.contatos)} (limite diário)."
    else:
        aviso = None

    # Dispara em background com delay entre mensagens
    background_tasks.add_task(
        processar_disparos,
        payload.usuario_id,
        contatos_a_enviar,
        payload.mensagem,
        payload.instancia_id
    )

    return {
        "success": True,
        "mensagem": f"Disparo iniciado para {len(contatos_a_enviar)} contato(s).",
        "aviso": aviso,
        "enviados_hoje": enviados_hoje,
        "limite_diario": limite,
    }

async def _buscar_evolution_instance_id(instancia_id: int, usuario_id: int) -> str | None:
    """Retorna o evolution_instance_id (nome na Evolution API) da instância."""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT evolution_instance_id FROM instancias WHERE id = %s AND usuario_id = %s",
            (instancia_id, usuario_id)
        )
        row = cursor.fetchone()
        cursor.close()
        return row["evolution_instance_id"] if row else None
    except Exception as e:
        logger.error(f"Erro ao buscar evolution_instance_id: {e}")
        return None
    finally:
        conn.close()


async def processar_disparos(usuario_id: int, contatos: list, mensagem: str, instancia_id: int):
    """Envia mensagens com delay aleatório para evitar ban."""
    EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL", "")
    EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY", "")

    evolution_instance_id = None
    if EVOLUTION_API_URL and EVOLUTION_API_KEY:
        evolution_instance_id = await _buscar_evolution_instance_id(instancia_id, usuario_id)
        if not evolution_instance_id:
            logger.error(f"Instância {instancia_id} sem evolution_instance_id — disparos abortados.")
            for contato in contatos:
                registrar_disparo(usuario_id, contato, mensagem, "erro")
            return

    for contato in contatos:
        try:
            if evolution_instance_id and EVOLUTION_API_URL and EVOLUTION_API_KEY:
                async with httpx.AsyncClient(timeout=15) as client:
                    resp = await client.post(
                        f"{EVOLUTION_API_URL}/message/sendText/{evolution_instance_id}",
                        headers={"apikey": EVOLUTION_API_KEY, "Content-Type": "application/json"},
                        json={"number": contato, "text": mensagem, "delay": 1200},
                    )
                if resp.status_code not in (200, 201):
                    logger.error(f"Evolution API erro ao disparar para {contato}: {resp.status_code} — {resp.text[:200]}")
                    registrar_disparo(usuario_id, contato, mensagem, "erro")
                else:
                    registrar_disparo(usuario_id, contato, mensagem, "enviado")
            else:
                # Evolution API não configurada — registra sem enviar
                logger.warning("EVOLUTION_API_URL/KEY não configurados; disparo não enviado.")
                registrar_disparo(usuario_id, contato, mensagem, "erro")
        except Exception as e:
            logger.error(f"Erro ao disparar para {contato}: {e}")
            registrar_disparo(usuario_id, contato, mensagem, "erro")
        # Delay humano entre mensagens
        await asyncio.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

@router.get("/disparos/historico/{usuario_id}")
def historico(usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT contato, mensagem, status, criado_em
        FROM disparos
        WHERE usuario_id = %s
        ORDER BY criado_em DESC
        LIMIT 100
    """, (usuario_id,))
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    return {"historico": [{ **r, "criado_em": str(r["criado_em"]) } for r in rows]}

@router.get("/disparos/status-hoje/{usuario_id}")
def status_hoje(usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    plano = get_plano_usuario(usuario_id)
    enviados = contar_disparos_hoje(usuario_id)
    limite = LIMITE_DIARIO.get(plano, 0)
    return { "enviados_hoje": enviados, "limite_diario": limite, "plano": plano }