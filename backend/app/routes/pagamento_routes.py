# app/routes/pagamento_routes.py
import os
import hmac
import hashlib
import json
import requests
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt
from app.database import get_db_connection

router = APIRouter()
security = HTTPBearer()

SECRET_KEY      = "zapchat_senha_MmC"
ALGORITHM       = "HS256"
MP_ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN")
MP_API          = "https://api.mercadopago.com"

PLANOS = {
    "starter": {
        "nome": "ZapChat Starter",
        "preco_mensal": 127.00,
        "preco_anual":  106.00,
        "trial_dias": 7,
    },
    "pro": {
        "nome": "ZapChat Pro",
        "preco_mensal": 297.00,
        "preco_anual":  248.00,
        "trial_dias": 0,
    },
    "business": {
        "nome": "ZapChat Business",
        "preco_mensal": 797.00,
        "preco_anual":  664.00,
        "trial_dias": 0,
    },
}

# ─── AUTENTICAÇÃO ─────────────────────────────────────────────────────────────

def get_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado. Faça login novamente.")

# ─── HELPERS ──────────────────────────────────────────────────────────────────

def headers_mp():
    return {
        "Authorization": f"Bearer {MP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

def verificar_hmac_webhook(body_bytes: bytes, x_signature: str, x_request_id: str) -> bool:
    webhook_secret = os.getenv("MP_WEBHOOK_SECRET")
    if not webhook_secret:
        ambiente = os.getenv("AMBIENTE", "dev")
        if ambiente == "producao":
            return False
        print("AVISO: MP_WEBHOOK_SECRET não configurado.")
        return True
    try:
        partes = dict(p.split("=", 1) for p in x_signature.split(","))
        ts = partes.get("ts", "")
        v1 = partes.get("v1", "")
        data_id = ""
        try:
            body_json = json.loads(body_bytes)
            data_id = str(body_json.get("data", {}).get("id", ""))
        except Exception:
            pass
        manifest = f"id:{data_id};request-id:{x_request_id};ts:{ts};"
        hash_esperado = hmac.new(
            webhook_secret.encode("utf-8"),
            manifest.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(hash_esperado, v1)
    except Exception as e:
        print(f"Erro na validação HMAC: {e}")
        return False

# ─── MODELS ───────────────────────────────────────────────────────────────────

class AssinarPayload(BaseModel):
    plano: str    # "starter" | "pro" | "business"
    periodo: str  # "mensal" | "anual"

# ─── ROTA: CRIAR PLANO NO MP (rodar 1x por combinação) ────────────────────────

@router.post("/pagamentos/criar-plano-mp")
def criar_plano_mp(plano: str, periodo: str, usuario: dict = Depends(get_usuario_atual)):
    if plano not in PLANOS:
        raise HTTPException(status_code=400, detail="Plano inválido.")
    if periodo not in ("mensal", "anual"):
        raise HTTPException(status_code=400, detail="Período inválido.")

    dados = PLANOS[plano]
    preco = dados["preco_mensal"] if periodo == "mensal" else dados["preco_anual"]
    freq  = 1 if periodo == "mensal" else 12

    body = {
        "reason": f"{dados['nome']} — {periodo.capitalize()}",
        "auto_recurring": {
            "frequency":          freq,
            "frequency_type":     "months",
            "transaction_amount": preco,
            "currency_id":        "BRL",
        },
        "back_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard",
        "payment_methods_allowed": {
            "payment_types": [
                {"id": "credit_card"},
                {"id": "pix"},
            ]
        },
    }

    resp = requests.post(f"{MP_API}/preapproval_plan", json=body, headers=headers_mp())
    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail=f"Erro MP: {resp.text}")

    return resp.json()

# ─── ROTA: ASSINAR ────────────────────────────────────────────────────────────

@router.post("/pagamentos/assinar")
def assinar(payload: AssinarPayload, usuario: dict = Depends(get_usuario_atual)):
    """
    Retorna o link do checkout do plano no Mercado Pago.
    O usuário escolhe e cadastra o cartão diretamente no checkout do MP.
    """
    if payload.plano not in PLANOS:
        raise HTTPException(status_code=400, detail="Plano inválido.")
    if payload.periodo not in ("mensal", "anual"):
        raise HTTPException(status_code=400, detail="Período inválido.")

    usuario_id = int(usuario["sub"])
    dados = PLANOS[payload.plano]

    # Bloqueia se já tem assinatura ativa ou em trial
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT status, plano FROM assinaturas
        WHERE usuario_id = %s ORDER BY id DESC LIMIT 1
    """, (usuario_id,))
    existente = cursor.fetchone()
    cursor.close()
    conn.close()

    if existente and existente["status"] in ("ativo", "trial"):
        raise HTTPException(
            status_code=400,
            detail=f"Você já possui o plano {existente['plano']} ativo."
        )

    # Starter: ativa trial direto sem MP
    if payload.plano == "starter" and dados["trial_dias"] > 0:
        return _ativar_trial(usuario_id, payload.plano)

    # Busca o plan_id no .env
    env_key = f"MP_PLAN_ID_{payload.plano.upper()}_{payload.periodo.upper()}"
    plan_id = os.getenv(env_key)
    if not plan_id:
        raise HTTPException(
            status_code=500,
            detail=f"Plano MP não configurado. Rode /pagamentos/criar-plano-mp e salve o ID no .env como {env_key}."
        )

    # Busca email do usuário para preencher o checkout
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT nome, email FROM usuarios WHERE id = %s", (usuario_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # Salva como pendente no banco antes de redirecionar
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO assinaturas (usuario_id, plano, periodo, status)
        VALUES (%s, %s, %s, 'pendente')
        ON DUPLICATE KEY UPDATE
            plano   = VALUES(plano),
            periodo = VALUES(periodo),
            status  = 'pendente'
    """, (usuario_id, payload.plano, payload.periodo))
    conn.commit()
    cursor.close()
    conn.close()

    # Monta o link de checkout do plano diretamente
    # O usuário cadastra o cartão no checkout do MP e a assinatura é criada lá
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    checkout_url = (
        f"https://www.mercadopago.com.br/subscriptions/checkout"
        f"?preapproval_plan_id={plan_id}"
        f"&payer_email={user['email']}"
        f"&external_reference={usuario_id}"
        f"&back_url={frontend_url}/dashboard"
    )

    return {
        "checkout_url": checkout_url,
        "subscription_id": None,
    }

# ─── ROTA: WEBHOOK ────────────────────────────────────────────────────────────

@router.post("/pagamentos/webhook")
async def webhook(request: Request):
    body_bytes = await request.body()

    x_signature  = request.headers.get("x-signature", "")
    x_request_id = request.headers.get("x-request-id", "")

    if x_signature and not verificar_hmac_webhook(body_bytes, x_signature, x_request_id):
        raise HTTPException(status_code=401, detail="Assinatura do webhook inválida.")

    body = json.loads(body_bytes)
    tipo = body.get("type")

    if tipo not in ("subscription_preapproval", "preapproval"):
        return {"status": "ignorado"}

    subscription_id = body.get("data", {}).get("id")
    if not subscription_id:
        return {"status": "sem id"}

    # Consulta status real no MP
    resp = requests.get(f"{MP_API}/preapproval/{subscription_id}", headers=headers_mp())
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Erro ao consultar MP.")

    mp_data   = resp.json()
    mp_status = mp_data.get("status")
    ext_ref   = mp_data.get("external_reference")

    status_map = {
        "authorized": "ativo",
        "paused":     "pausado",
        "cancelled":  "cancelado",
        "pending":    "pendente",
    }
    novo_status = status_map.get(mp_status, "pendente")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE assinaturas
        SET status = %s,
            mp_subscription_id = %s,
            periodo_inicio = NOW(),
            periodo_fim = DATE_ADD(NOW(), INTERVAL 1 MONTH)
        WHERE usuario_id = %s
    """, (novo_status, subscription_id, ext_ref))
    conn.commit()
    cursor.close()
    conn.close()

    return {"status": "ok"}

# ─── ROTA: MINHA ASSINATURA ───────────────────────────────────────────────────

@router.get("/pagamentos/minha-assinatura")
def minha_assinatura(usuario: dict = Depends(get_usuario_atual)):
    usuario_id = int(usuario["sub"])

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT plano, periodo, status, periodo_inicio, periodo_fim, trial_fim
        FROM assinaturas
        WHERE usuario_id = %s ORDER BY id DESC LIMIT 1
    """, (usuario_id,))
    assinatura = cursor.fetchone()
    cursor.close()
    conn.close()

    if not assinatura:
        return {"tem_assinatura": False}

    for campo in ("periodo_inicio", "periodo_fim", "trial_fim"):
        if assinatura.get(campo):
            assinatura[campo] = str(assinatura[campo])

    return {"tem_assinatura": True, **assinatura}

# ─── ROTA: CANCELAR ───────────────────────────────────────────────────────────

@router.post("/pagamentos/cancelar")
def cancelar_assinatura(usuario: dict = Depends(get_usuario_atual)):
    usuario_id = int(usuario["sub"])

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT mp_subscription_id FROM assinaturas
        WHERE usuario_id = %s AND status IN ('ativo', 'trial')
        ORDER BY id DESC LIMIT 1
    """, (usuario_id,))
    assinatura = cursor.fetchone()
    cursor.close()
    conn.close()

    if not assinatura:
        raise HTTPException(status_code=404, detail="Assinatura ativa não encontrada.")

    if assinatura.get("mp_subscription_id"):
        resp = requests.put(
            f"{MP_API}/preapproval/{assinatura['mp_subscription_id']}",
            json={"status": "cancelled"},
            headers=headers_mp(),
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=502, detail=f"Erro MP: {resp.text}")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE assinaturas SET status = 'cancelado'
        WHERE usuario_id = %s AND status IN ('ativo', 'trial')
    """, (usuario_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return {"status": "cancelado"}

# ─── HELPER: ATIVAR TRIAL ─────────────────────────────────────────────────────

def _ativar_trial(usuario_id: int, plano: str):
    trial_dias = PLANOS[plano]["trial_dias"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO assinaturas
            (usuario_id, plano, periodo, status, trial_fim, periodo_inicio, periodo_fim)
        VALUES
            (%s, %s, 'mensal', 'trial',
             DATE_ADD(NOW(), INTERVAL %s DAY),
             NOW(),
             DATE_ADD(NOW(), INTERVAL %s DAY))
        ON DUPLICATE KEY UPDATE
            plano          = VALUES(plano),
            status         = 'trial',
            trial_fim      = VALUES(trial_fim),
            periodo_inicio = NOW(),
            periodo_fim    = VALUES(periodo_fim)
    """, (usuario_id, plano, trial_dias, trial_dias))
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "checkout_url": None,
        "status":       "trial",
        "trial_dias":   trial_dias,
        "mensagem":     f"Trial de {trial_dias} dias ativado com sucesso.",
    }