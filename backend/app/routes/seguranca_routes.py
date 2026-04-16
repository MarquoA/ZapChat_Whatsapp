# app/routes/seguranca_routes.py
# Autenticação de dois fatores (2FA) via e-mail.
import os, secrets, logging
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt
from passlib.context import CryptContext
import requests
from app.database import get_db_connection

router   = APIRouter()
security = HTTPBearer()
logger   = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY    = os.getenv("SECRET_KEY")
ALGORITHM     = "HS256"
RESEND_API_KEY   = os.getenv("RESEND_API_KEY", "")
EMAIL_REMETENTE  = os.getenv("EMAIL_REMETENTE", "onboarding@resend.dev")


def get_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido.")


class SenhaBody(BaseModel):
    senha: str


def _enviar_email_2fa(para: str, nome: str, codigo: str):
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY não configurada — e-mail de 2FA não enviado.")
        return
    resp = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
        json={
            "from":    EMAIL_REMETENTE,
            "to":      [para],
            "subject": "Código de verificação — ZapChat",
            "html": f"""
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0f0a;font-family:'DM Sans',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0a;padding:40px 20px;">
<tr><td align="center">
  <table width="480" cellpadding="0" cellspacing="0" style="background:#0f1a0f;border-radius:16px;border:1px solid rgba(37,211,102,0.15);padding:48px 40px;">
    <tr><td align="center" style="padding-bottom:28px;">
      <h1 style="margin:0;font-size:24px;font-weight:900;letter-spacing:-1px;color:white;">ZAP<span style="color:#25D366;">CHAT</span></h1>
    </td></tr>
    <tr><td style="color:white;">
      <h2 style="font-size:20px;font-weight:800;margin:0 0 12px;">Verificação em duas etapas</h2>
      <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;margin:0 0 28px;">
        Olá, <strong style="color:white;">{nome}</strong>!<br><br>
        Use o código abaixo para confirmar seu acesso. Ele expira em <strong style="color:white;">10 minutos</strong>.
      </p>
      <div style="background:rgba(37,211,102,0.08);border:1px solid rgba(37,211,102,0.2);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <span style="font-size:36px;font-weight:900;letter-spacing:10px;color:#25D366;">{codigo}</span>
      </div>
      <p style="color:rgba(255,255,255,0.25);font-size:12px;line-height:1.6;margin:0;">
        Se você não solicitou este código, ignore este e-mail — sua conta está segura.
      </p>
    </td></tr>
    <tr><td style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.05);">
      <p style="color:rgba(255,255,255,0.15);font-size:11px;text-align:center;margin:0;">© 2026 ZapChat Tecnologia.</p>
    </td></tr>
  </table>
</td></tr>
</table></body></html>""",
        },
        timeout=10,
    )
    if resp.status_code not in (200, 201):
        logger.error(f"Erro Resend 2FA: {resp.status_code} — {resp.text}")
        raise HTTPException(status_code=500, detail="Erro ao enviar e-mail de verificação.")


# ── GET /me/2fa/status ────────────────────────────────────────────────────────

@router.get("/me/2fa/status")
def status_2fa(usuario: dict = Depends(get_usuario_atual)):
    usuario_id = int(usuario["sub"])
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT dois_fatores_ativo, email FROM usuarios WHERE id = %s", (usuario_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        return {"ativo": bool(row["dois_fatores_ativo"]), "email": row["email"]}
    finally:
        cursor.close(); conn.close()


# ── POST /me/2fa/ativar — envia código para confirmar ativação ────────────────

@router.post("/me/2fa/ativar")
def iniciar_ativacao_2fa(body: SenhaBody, usuario: dict = Depends(get_usuario_atual)):
    usuario_id = int(usuario["sub"])
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT email, nome, senha, dois_fatores_ativo FROM usuarios WHERE id = %s", (usuario_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        if not pwd_context.verify(body.senha, user["senha"]):
            raise HTTPException(status_code=401, detail="Senha incorreta.")
        if user["dois_fatores_ativo"]:
            raise HTTPException(status_code=400, detail="2FA já está ativo.")

        codigo = str(secrets.randbelow(900000) + 100000)  # 6 dígitos
        expira = datetime.utcnow() + timedelta(minutes=10)

        cursor.execute("""
            INSERT INTO codigos_2fa (usuario_id, codigo, expira_em, usado)
            VALUES (%s, %s, %s, 0)
        """, (usuario_id, codigo, expira))
        conn.commit()
        cursor.close()

        _enviar_email_2fa(user["email"], user["nome"], codigo)
        return {"mensagem": f"Código enviado para {user['email']}."}
    finally:
        conn.close()


# ── POST /me/2fa/confirmar — valida código e ativa 2FA ───────────────────────

class CodigoBody(BaseModel):
    codigo: str

@router.post("/me/2fa/confirmar")
def confirmar_2fa(body: CodigoBody, usuario: dict = Depends(get_usuario_atual)):
    usuario_id = int(usuario["sub"])
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id FROM codigos_2fa
            WHERE usuario_id = %s AND codigo = %s AND usado = 0 AND expira_em > NOW()
            ORDER BY id DESC LIMIT 1
        """, (usuario_id, body.codigo.strip()))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

        cursor.execute("UPDATE codigos_2fa SET usado = 1 WHERE id = %s", (row["id"],))
        cursor.execute("UPDATE usuarios SET dois_fatores_ativo = 1 WHERE id = %s", (usuario_id,))
        conn.commit()
        cursor.close()
        return {"mensagem": "2FA ativado com sucesso."}
    finally:
        conn.close()


# ── POST /me/2fa/desativar ────────────────────────────────────────────────────

@router.post("/me/2fa/desativar")
def desativar_2fa(body: SenhaBody, usuario: dict = Depends(get_usuario_atual)):
    usuario_id = int(usuario["sub"])
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT senha, dois_fatores_ativo FROM usuarios WHERE id = %s", (usuario_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        if not pwd_context.verify(body.senha, user["senha"]):
            raise HTTPException(status_code=401, detail="Senha incorreta.")
        if not user["dois_fatores_ativo"]:
            raise HTTPException(status_code=400, detail="2FA não está ativo.")

        cursor.execute("UPDATE usuarios SET dois_fatores_ativo = 0 WHERE id = %s", (usuario_id,))
        conn.commit()
        cursor.close()
        return {"mensagem": "2FA desativado."}
    finally:
        conn.close()
