# app/routes/pagamento_routes.py
import logging
import os
import hmac
import hashlib
import json
import requests
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt
from app.database import get_db_connection

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

# ─── FIX BUG #SEGURANÇA: SECRET_KEY nunca deve ficar hardcoded no código.
# Era: SECRET_KEY = "zapchat_senha_MmC"
# Agora lê do .env. Se não estiver configurada, o sistema não sobe.
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY não definida no .env. Gere com: python -c \"import secrets; print(secrets.token_hex(32))\"")

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
        "preco_mensal": 597.00,
        "preco_anual":  497.00,
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
        logger.warning("MP_WEBHOOK_SECRET não configurado. Em produção isso rejeitaria o webhook.")
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

        # ─── FIX BUG #7: hmac.new() não existe como método do módulo.
        # Era: hmac.new(key, msg, hashlib.sha256).hexdigest()
        # Correto: hmac.digest() — disponível desde Python 3.7, mais limpo.
        hash_esperado = hmac.digest(
            webhook_secret.encode("utf-8"),
            manifest.encode("utf-8"),
            "sha256"
        ).hex()

        return hmac.compare_digest(hash_esperado, v1)

    except Exception as e:
        logger.error(f"Erro na validação HMAC: {e}")
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
        "back_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/pagamento-confirmado",
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
    if payload.plano not in PLANOS:
        raise HTTPException(status_code=400, detail="Plano inválido.")
    if payload.periodo not in ("mensal", "anual"):
        raise HTTPException(status_code=400, detail="Período inválido.")

    usuario_id = int(usuario["sub"])
    dados = PLANOS[payload.plano]

    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)

        # Verifica assinatura atual (ativa ou trial em curso)
        cursor.execute("""
            SELECT status, plano FROM assinaturas
            WHERE usuario_id = %s ORDER BY id DESC LIMIT 1
        """, (usuario_id,))
        existente = cursor.fetchone()

        # Verifica se o usuário JÁ usou trial alguma vez (mesmo que expirado)
        cursor.execute("""
            SELECT COUNT(*) AS total FROM assinaturas
            WHERE usuario_id = %s AND trial_fim IS NOT NULL
        """, (usuario_id,))
        ja_usou_trial = (cursor.fetchone() or {}).get("total", 0) > 0

        cursor.close()
    finally:
        conn.close()

    if existente and existente["status"] in ("ativo", "trial"):
        raise HTTPException(
            status_code=400,
            detail=f"Você já possui o plano {existente['plano']} ativo."
        )

    # Starter: ativa trial direto sem MP — mas bloqueia reativação
    if payload.plano == "starter" and dados["trial_dias"] > 0:
        if ja_usou_trial:
            raise HTTPException(
                status_code=400,
                detail="Você já utilizou o período de trial gratuito. Para continuar, assine um plano pago."
            )
        return _ativar_trial(usuario_id, payload.plano)

    # Busca o plan_id no .env
    env_key = f"MP_PLAN_ID_{payload.plano.upper()}_{payload.periodo.upper()}"
    plan_id = os.getenv(env_key)
    if not plan_id:
        raise HTTPException(
            status_code=500,
            detail=f"Plano MP não configurado. Rode /pagamentos/criar-plano-mp e salve o ID no .env como {env_key}."
        )

    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT nome, email FROM usuarios WHERE id = %s", (usuario_id,))
        user = cursor.fetchone()
        cursor.close()
    finally:
        conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # Salva como pendente antes de redirecionar
    conn = get_db_connection()
    try:
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
    finally:
        conn.close()

    # ─── FIX BUG #URL: usar urlencode para evitar quebra com emails especiais.
    # Era: f"&payer_email={user['email']}" — perigoso com caracteres como + @ &
    from urllib.parse import urlencode
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    params = {
        "preapproval_plan_id": plan_id,
        "payer_email":         user["email"],
        "external_reference":  str(usuario_id),
        "back_url":            f"{frontend_url}/pagamento-confirmado",
    }
    checkout_url = f"https://www.mercadopago.com.br/subscriptions/checkout?{urlencode(params)}"

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

    # ─── FIX BUG #2: external_reference vem como string do MP.
    # Era: ext_ref = mp_data.get("external_reference") — podia ser "123" (string)
    # e o WHERE usuario_id = %s falhava silenciosamente sem atualizar nenhuma linha.
    try:
        ext_ref = int(mp_data.get("external_reference", 0))
    except (ValueError, TypeError):
        logger.warning(f"[WEBHOOK] external_reference inválido: {mp_data.get('external_reference')}")
        return {"status": "external_reference inválido"}

    if not ext_ref:
        return {"status": "sem external_reference"}

    status_map = {
        "authorized": "ativo",
        "paused":     "pausado",
        "cancelled":  "cancelado",
        "pending":    "pendente",
    }
    novo_status = status_map.get(mp_status, "pendente")

    # ─── FIX BUG #3: periodo_fim era sempre 1 mês mesmo para planos anuais.
    # Solução: usa o next_payment_date que o próprio MP retorna — mais confiável
    # do que calcular manualmente, pois o MP já considera cobranças, pausas, etc.
    prox_pagamento = mp_data.get("next_payment_date")  # ex: "2025-04-13T00:00:00.000-03:00"

    if prox_pagamento:
        # MP retorna ISO 8601 — converte para datetime para o MySQL
        try:
            periodo_fim = datetime.fromisoformat(prox_pagamento.replace("Z", "+00:00"))
        except ValueError:
            # Fallback: calcula manualmente pela frequência
            frequencia = mp_data.get("auto_recurring", {}).get("frequency", 1)
            from dateutil.relativedelta import relativedelta
            periodo_fim = datetime.now() + relativedelta(months=frequencia)
    else:
        # Sem next_payment_date (ex: status cancelado), usa frequência
        frequencia = mp_data.get("auto_recurring", {}).get("frequency", 1)
        from dateutil.relativedelta import relativedelta
        periodo_fim = datetime.now() + relativedelta(months=frequencia)

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE assinaturas
            SET status             = %s,
                mp_subscription_id = %s,
                periodo_inicio     = NOW(),
                periodo_fim        = %s
            WHERE usuario_id = %s
        """, (novo_status, subscription_id, periodo_fim, ext_ref))
        conn.commit()
        rows_afetados = cursor.rowcount
        cursor.close()
    finally:
        conn.close()

    logger.info(f"[WEBHOOK] usuario_id={ext_ref} | status={novo_status} | rows={rows_afetados} | periodo_fim={periodo_fim}")

    if rows_afetados == 0:
        logger.warning(f"[WEBHOOK] Nenhuma linha atualizada para usuario_id={ext_ref}. Tentando INSERT.")
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            plano_dados = mp_data.get("reason", "").lower()
            plano = "business" if "business" in plano_dados else "pro" if "pro" in plano_dados else "starter"
            frequencia = mp_data.get("auto_recurring", {}).get("frequency", 1)
            periodo = "anual" if frequencia == 12 else "mensal"
            cursor.execute("""
                INSERT INTO assinaturas
                    (usuario_id, plano, periodo, status, mp_subscription_id, periodo_inicio, periodo_fim)
                VALUES (%s, %s, %s, %s, %s, NOW(), %s)
            """, (ext_ref, plano, periodo, novo_status, subscription_id, periodo_fim))
            conn.commit()
            cursor.close()
        finally:
            conn.close()

    # Registra no histórico e reseta tokens quando pagamento é aprovado
    if novo_status == "ativo":
        valor = mp_data.get("auto_recurring", {}).get("transaction_amount", 0)
        plano_dados = mp_data.get("reason", "").lower()
        plano = "business" if "business" in plano_dados else "pro" if "pro" in plano_dados else "starter"
        frequencia = mp_data.get("auto_recurring", {}).get("frequency", 1)
        periodo = "anual" if frequencia == 12 else "mensal"

        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO historico_pagamentos
                    (usuario_id, mp_payment_id, mp_subscription_id, plano, periodo, valor, status, metodo_pagamento)
                VALUES (%s, %s, %s, %s, %s, %s, 'aprovado', 'credit_card')
            """, (ext_ref, subscription_id, subscription_id, plano, periodo, valor))
            conn.commit()
            cursor.close()
        finally:
            conn.close()

        # Reseta saldo de tokens para o novo ciclo de cobrança
        _LIMITE_CICLO = {"pro": 2_000_000, "business": 3_000_000}
        limite_ciclo = _LIMITE_CICLO.get(plano, 2_000_000)
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO tokens_ia (usuario_id, saldo, total_usado, ultimo_reset)
                VALUES (%s, %s, 0, NOW())
                ON DUPLICATE KEY UPDATE
                    saldo        = %s,
                    total_usado  = 0,
                    ultimo_reset = NOW()
            """, (ext_ref, limite_ciclo, limite_ciclo))
            conn.commit()
            cursor.close()
        except Exception as e:
            logger.error(f"[WEBHOOK] Erro ao resetar tokens_ia para usuario {ext_ref}: {e}")
        finally:
            conn.close()

    return {"status": "ok"}

# ─── ROTA: MINHA ASSINATURA ───────────────────────────────────────────────────

@router.get("/pagamentos/minha-assinatura")
def minha_assinatura(usuario: dict = Depends(get_usuario_atual)):
    usuario_id = int(usuario["sub"])

    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)

        # ─── FIX BUG #4: trial expirado nunca era marcado como expirado.
        # Agora toda vez que o usuário consulta a assinatura, o sistema verifica
        # se o trial já acabou e atualiza o status antes de retornar.
        cursor.execute("""
            UPDATE assinaturas
            SET status = 'expirado'
            WHERE usuario_id = %s
              AND status = 'trial'
              AND trial_fim < NOW()
        """, (usuario_id,))
        conn.commit()

        cursor.execute("""
            SELECT plano, periodo, status, periodo_inicio, periodo_fim, trial_fim
            FROM assinaturas
            WHERE usuario_id = %s ORDER BY id DESC LIMIT 1
        """, (usuario_id,))
        assinatura = cursor.fetchone()
        cursor.close()
    finally:
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
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT mp_subscription_id FROM assinaturas
            WHERE usuario_id = %s AND status IN ('ativo', 'trial')
            ORDER BY id DESC LIMIT 1
        """, (usuario_id,))
        assinatura = cursor.fetchone()
        cursor.close()
    finally:
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
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE assinaturas SET status = 'cancelado'
            WHERE usuario_id = %s AND status IN ('ativo', 'trial')
        """, (usuario_id,))
        conn.commit()
        cursor.close()
    finally:
        conn.close()

    return {"status": "cancelado"}

# ─── HELPER: ATIVAR TRIAL ─────────────────────────────────────────────────────

def _ativar_trial(usuario_id: int, plano: str):
    trial_dias = PLANOS[plano]["trial_dias"]
    conn = get_db_connection()
    try:
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
    finally:
        conn.close()

    return {
        "checkout_url": None,
        "status":       "trial",
        "trial_dias":   trial_dias,
        "mensagem":     f"Trial de {trial_dias} dias ativado com sucesso.",
    }