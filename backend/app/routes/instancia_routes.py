import logging
import os
import httpx
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt
from app.models.instancia_model import (
    salvar_instancia, listar_instancias,
    atualizar_status, deletar_instancia,
    buscar_instancia_por_id, salvar_evolution_id               # ── NOVO: imports das funções novas
)
from app.database import get_db_connection

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY")                                # ── ALTERADO: lê do .env em vez de hardcoded
ALGORITHM = "HS256"

# ── NOVO: Configuração da Evolution API (lê do .env)
EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL", "http://localhost:8080")
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY", "")

# Limite de instâncias por plano
LIMITE_INSTANCIAS = {
    "starter":  1,
    "pro":      3,
    "business": 999,  # ilimitado
}

def get_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado. Faça login novamente.")

def get_plano_usuario(usuario_id: int) -> str:
    """Retorna o plano ativo do usuário ou None se não tiver assinatura."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT plano, status FROM assinaturas
        WHERE usuario_id = %s AND status IN ('ativo', 'trial')
        ORDER BY id DESC LIMIT 1
    """, (usuario_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row["plano"] if row else None


# ══════════════════════════════════════════════════════════════════════════════
# ── NOVO: Helper para chamadas à Evolution API
# ══════════════════════════════════════════════════════════════════════════════

def _evolution_headers():
    """Headers padrão para chamadas à Evolution API."""
    return {
        "apikey": EVOLUTION_API_KEY,
        "Content-Type": "application/json",
    }


def _gerar_nome_evolution(instancia_id: int, nome: str) -> str:
    """
    Gera um nome único para a instância na Evolution API.
    A Evolution não aceita espaços nem caracteres especiais no nome.
    Formato: zapchat_<id>_<nome_limpo>
    """
    import re
    nome_limpo = re.sub(r'[^a-zA-Z0-9]', '', nome.lower())[:20]
    return f"zapchat_{instancia_id}_{nome_limpo}"


# ══════════════════════════════════════════════════════════════════════════════
# MODELS
# ══════════════════════════════════════════════════════════════════════════════

class InstanciaPayload(BaseModel):
    usuario_id: int
    nome: str
    fluxo_id: int

class StatusPayload(BaseModel):
    usuario_id: int
    status: str


# ══════════════════════════════════════════════════════════════════════════════
# ROTAS EXISTENTES (com ajustes para Evolution API)
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/instancias/criar")
async def criar(payload: InstanciaPayload, usuario: dict = Depends(get_usuario_atual)):  # ── ALTERADO: agora é async
    if str(payload.usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    # Verifica plano
    plano = get_plano_usuario(payload.usuario_id)
    if not plano:
        raise HTTPException(
            status_code=403,
            detail="Você precisa de uma assinatura ativa para criar instâncias."
        )

    # Verifica limite de instâncias
    instancias_atuais = listar_instancias(payload.usuario_id)
    limite = LIMITE_INSTANCIAS.get(plano, 1)
    if len(instancias_atuais) >= limite:
        nomes = {"starter": "Pro ou Business", "pro": "Business"}
        upgrade = nomes.get(plano, "superior")
        raise HTTPException(
            status_code=403,
            detail=f"Limite de {limite} instância(s) atingido para o plano {plano.capitalize()}. Faça upgrade para o plano {upgrade}."
        )

    # 1) Salva no banco local primeiro (sem evolution_instance_id por enquanto)
    instancia_id = salvar_instancia(
        usuario_id=payload.usuario_id,
        nome=payload.nome,
        fluxo_id=payload.fluxo_id
    )
    if instancia_id is None:
        raise HTTPException(status_code=500, detail="Erro ao criar instância.")

    # ── NOVO: 2) Cria a instância na Evolution API
    nome_evolution = _gerar_nome_evolution(instancia_id, payload.nome)

    if EVOLUTION_API_KEY:  # Só tenta se a Evolution estiver configurada
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(
                    f"{EVOLUTION_API_URL}/instance/create",
                    headers=_evolution_headers(),
                    json={
                        "instanceName": nome_evolution,
                        "integration": "WHATSAPP-BAILEYS",
                        "qrcode": True,
                        # Webhook para receber mensagens nesta instância
                        "webhook": {
                            "url": f"{os.getenv('BACKEND_URL', 'http://host.docker.internal:8000')}/bot/webhook/{instancia_id}",
                            "byEvents": False,
                            "base64": False,
                            "events": ["MESSAGES_UPSERT", "CONNECTION_UPDATE"],
                        },
                    },
                )

            if resp.status_code in (200, 201):
                # Salva o nome da instância Evolution no banco
                salvar_evolution_id(instancia_id, payload.usuario_id, nome_evolution)
            else:
                # Se falhou na Evolution, loga mas não impede (o QR pode ser gerado depois)
                logger.warning(f"[EVOLUTION] Erro ao criar instância: {resp.status_code} — {resp.text}")

        except Exception as e:
            logger.error(f"[EVOLUTION] Erro de conexão ao criar instância: {e}")
            # Não falha — a instância já foi criada no banco, QR pode ser tentado depois

    else:
        # Se não tem EVOLUTION_API_KEY, salva o nome mesmo assim para uso futuro
        salvar_evolution_id(instancia_id, payload.usuario_id, nome_evolution)

    return {"success": True, "id": instancia_id, "mensagem": "Instância criada com sucesso!"}


@router.get("/instancias/listar/{usuario_id}")
def listar(usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    instancias = listar_instancias(usuario_id)
    return {"instancias": [
        {
            "id": i["id"],
            "nome": i["nome"],
            "status": i["status"],
            "fluxo_id": i["fluxo_id"],
            "fluxo_nome": i["nome_fluxo"] or "—",
            "criado_em": str(i["criado_em"]),
        }
        for i in instancias
    ]}

@router.put("/instancias/{instancia_id}/status")
def atualizar(instancia_id: int, payload: StatusPayload, usuario: dict = Depends(get_usuario_atual)):
    if str(payload.usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    sucesso = atualizar_status(instancia_id, payload.usuario_id, payload.status)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Instância não encontrada.")
    return {"success": True, "mensagem": "Status atualizado!"}


@router.delete("/instancias/{instancia_id}/{usuario_id}")
async def deletar(instancia_id: int, usuario_id: int, usuario: dict = Depends(get_usuario_atual)):  # ── ALTERADO: agora é async
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    # ── NOVO: Tenta deletar da Evolution API antes de remover do banco
    inst = buscar_instancia_por_id(instancia_id, usuario_id)
    if inst and inst.get("evolution_instance_id") and EVOLUTION_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.delete(
                    f"{EVOLUTION_API_URL}/instance/delete/{inst['evolution_instance_id']}",
                    headers=_evolution_headers(),
                )
        except Exception as e:
            logger.error(f"[EVOLUTION] Erro ao deletar instância: {e}")
            # Não impede a exclusão local

    sucesso = deletar_instancia(instancia_id, usuario_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Instância não encontrada.")
    return {"success": True, "mensagem": "Instância deletada com sucesso!"}


# ══════════════════════════════════════════════════════════════════════════════
# ── NOVO: Rota para gerar QR Code via Evolution API
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/instancias/{instancia_id}/qrcode/{usuario_id}")
async def obter_qrcode(instancia_id: int, usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    """
    Gera/obtém o QR Code da instância via Evolution API.
    O frontend chama esta rota quando o usuário clica em CONECTAR.
    Retorna: { "qrcode": "data:image/png;base64,..." }
    """
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    if not EVOLUTION_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Evolution API não configurada. Adicione EVOLUTION_API_URL e EVOLUTION_API_KEY no .env."
        )

    # Busca a instância no banco
    inst = buscar_instancia_por_id(instancia_id, usuario_id)
    if not inst:
        raise HTTPException(status_code=404, detail="Instância não encontrada.")

    nome_evolution = inst.get("evolution_instance_id")

    # Se não tem nome Evolution (instância criada antes da integração), gera e salva
    if not nome_evolution:
        nome_evolution = _gerar_nome_evolution(instancia_id, inst["nome"])
        salvar_evolution_id(instancia_id, usuario_id, nome_evolution)

    try:
        async with httpx.AsyncClient(timeout=20) as client:

            # 1) Tenta buscar o estado atual da instância
            status_resp = await client.get(
                f"{EVOLUTION_API_URL}/instance/connectionState/{nome_evolution}",
                headers=_evolution_headers(),
            )

            # Se a instância não existe na Evolution, cria ela
            if status_resp.status_code == 404 or status_resp.status_code == 400:
                create_resp = await client.post(
                    f"{EVOLUTION_API_URL}/instance/create",
                    headers=_evolution_headers(),
                    json={
                        "instanceName": nome_evolution,
                        "integration": "WHATSAPP-BAILEYS",
                        "qrcode": True,
                        "webhook": {
                            "url": f"{os.getenv('BACKEND_URL', 'http://host.docker.internal:8000')}/bot/webhook/{instancia_id}",
                            "byEvents": False,
                            "base64": False,
                            "events": ["MESSAGES_UPSERT", "CONNECTION_UPDATE"],
                        },
                    },
                )

                if create_resp.status_code not in (200, 201):
                    raise HTTPException(
                        status_code=502,
                        detail=f"Erro ao criar instância na Evolution: {create_resp.text}"
                    )

                create_data = create_resp.json()

                # A Evolution v2 retorna o QR na resposta de criação
                qr_base64 = None
                if isinstance(create_data, dict):
                    qr_base64 = (
                        create_data.get("qrcode", {}).get("base64")
                        or create_data.get("base64")
                        or create_data.get("qr")
                    )

                if qr_base64:
                    # Garante que tem o prefixo data:image
                    if not qr_base64.startswith("data:"):
                        qr_base64 = f"data:image/png;base64,{qr_base64}"
                    atualizar_status(instancia_id, usuario_id, "aguardando")
                    return {"qrcode": qr_base64}

                # Instância criada mas QR count=0: versão desatualizada
                qrcode_info = create_data.get("qrcode", {}) if isinstance(create_data, dict) else {}
                if isinstance(qrcode_info, dict) and qrcode_info.get("count", -1) == 0:
                    raise HTTPException(
                        status_code=503,
                        detail=(
                            "Versão do WhatsApp incompatível com o servidor. "
                            "A versão do protocolo configurada no servidor está desatualizada. "
                            "Entre em contato com o suporte para atualizar a configuração."
                        )
                    )

            # 2) Se a instância já existe, verifica se está conectada
            if status_resp.status_code == 200:
                state_data = status_resp.json()
                state = "unknown"
                if isinstance(state_data, dict):
                    state = (
                        state_data.get("state")
                        or state_data.get("instance", {}).get("state")
                        or "unknown"
                    )

                if state == "open":
                    # Já está conectado!
                    atualizar_status(instancia_id, usuario_id, "conectado")
                    return {"qrcode": None, "status": "conectado", "mensagem": "WhatsApp já está conectado!"}

            # 3) Busca o QR Code pelo endpoint connect
            qr_resp = await client.get(
                f"{EVOLUTION_API_URL}/instance/connect/{nome_evolution}",
                headers=_evolution_headers(),
            )

            if qr_resp.status_code != 200:
                raise HTTPException(
                    status_code=502,
                    detail=f"Erro ao obter QR Code da Evolution: {qr_resp.text}"
                )

            qr_data = qr_resp.json()
            qr_base64 = None
            if isinstance(qr_data, dict):
                qr_base64 = (
                    qr_data.get("base64")
                    or qr_data.get("qrcode", {}).get("base64")
                    or qr_data.get("code")
                )

            if not qr_base64:
                # {"count": 0} sem base64 = Baileys não conseguiu conectar ao WhatsApp.
                # Causa mais comum: CONFIG_SESSION_PHONE_VERSION desatualizada.
                count = qr_data.get("count", -1) if isinstance(qr_data, dict) else -1
                if count == 0:
                    raise HTTPException(
                        status_code=503,
                        detail=(
                            "Versão do WhatsApp incompatível com o servidor. "
                            "A versão do protocolo configurada no servidor está desatualizada. "
                            "Entre em contato com o suporte para atualizar a configuração."
                        )
                    )
                raise HTTPException(
                    status_code=502,
                    detail="Evolution API não retornou QR Code. Tente novamente em alguns segundos."
                )

            # Garante prefixo data:image
            if not qr_base64.startswith("data:"):
                qr_base64 = f"data:image/png;base64,{qr_base64}"

            atualizar_status(instancia_id, usuario_id, "aguardando")
            return {"qrcode": qr_base64}

    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Não foi possível conectar à Evolution API. Verifique se o Docker está rodando."
        )
    except HTTPException:
        raise  # Re-lança HTTPExceptions sem envolver
    except Exception as e:
        logger.error(f"[EVOLUTION] Erro inesperado no QR Code: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


# ══════════════════════════════════════════════════════════════════════════════
# ── NOVO: Rota para verificar status de conexão (polling do frontend)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/instancias/{instancia_id}/status-evolution/{usuario_id}")
async def verificar_status_evolution(instancia_id: int, usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    """
    O frontend faz polling nesta rota (a cada 3s) para saber quando
    o usuário escaneou o QR Code e o WhatsApp conectou.
    """
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    inst = buscar_instancia_por_id(instancia_id, usuario_id)
    if not inst:
        raise HTTPException(status_code=404, detail="Instância não encontrada.")

    # Se já está marcado como conectado no banco, retorna direto
    if inst["status"] == "conectado":
        return {"status": "conectado"}

    nome_evolution = inst.get("evolution_instance_id")
    if not nome_evolution or not EVOLUTION_API_KEY:
        return {"status": inst["status"]}

    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(
                f"{EVOLUTION_API_URL}/instance/connectionState/{nome_evolution}",
                headers=_evolution_headers(),
            )

        if resp.status_code == 200:
            data = resp.json()
            state = "unknown"
            if isinstance(data, dict):
                state = (
                    data.get("state")
                    or data.get("instance", {}).get("state")
                    or "unknown"
                )

            if state == "open":
                atualizar_status(instancia_id, usuario_id, "conectado")
                return {"status": "conectado"}
            elif state == "connecting":
                return {"status": "aguardando"}
            else:
                return {"status": "desconectado"}

        return {"status": inst["status"]}

    except Exception as e:
        logger.error(f"[EVOLUTION] Erro ao verificar status: {e}")
        return {"status": inst["status"]}