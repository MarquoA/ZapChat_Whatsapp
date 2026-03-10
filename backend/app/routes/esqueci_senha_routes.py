# app/routes/esqueci_senha_routes.py
import os
import secrets
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.database import get_db_connection
from jose import JWTError, jwt

router = APIRouter()

RESEND_API_KEY  = os.getenv("RESEND_API_KEY")
FRONTEND_URL    = os.getenv("FRONTEND_URL", "http://localhost:3000")
EMAIL_REMETENTE = os.getenv("EMAIL_REMETENTE", "onboarding@resend.dev")

# ─── MODELS ───────────────────────────────────────────────────────────────────

class SolicitarRedefinicao(BaseModel):
    email: str

class RedefinirSenha(BaseModel):
    token: str
    nova_senha: str

# ─── ROTA: SOLICITAR REDEFINIÇÃO ──────────────────────────────────────────────

@router.post("/esqueci-senha")
def solicitar_redefinicao(payload: SolicitarRedefinicao):
    """
    Recebe o email, gera um token seguro e envia o link por email via Resend.
    Sempre retorna sucesso (não revela se o email existe ou não — segurança).
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nome FROM usuarios WHERE email = %s", (payload.email,))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()

    # Mesmo se o email não existir, retorna sucesso (evita enumeração de emails)
    if not usuario:
        return {"mensagem": "Se este e-mail estiver cadastrado, você receberá as instruções em instantes."}

    # Gera token seguro de 32 bytes
    token = secrets.token_urlsafe(32)
    expira_em = datetime.utcnow() + timedelta(hours=2)

    # Salva token no banco
    conn = get_db_connection()
    cursor = conn.cursor()
    # Remove tokens antigos desse usuário
    cursor.execute("DELETE FROM tokens_redefinicao WHERE usuario_id = %s", (usuario["id"],))
    cursor.execute("""
        INSERT INTO tokens_redefinicao (usuario_id, token, expira_em)
        VALUES (%s, %s, %s)
    """, (usuario["id"], token, expira_em))
    conn.commit()
    cursor.close()
    conn.close()

    # Monta link de redefinição
    link = f"{FRONTEND_URL}/redefinir-senha?token={token}"

    # Envia email via Resend
    resp = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from":    EMAIL_REMETENTE,
            "to":      [payload.email],
            "subject": "Redefinição de senha — ZapChat",
            "html":    f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0f0a;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#0f1a0f;border-radius:16px;border:1px solid rgba(37,211,102,0.15);padding:48px 40px;">
        <tr><td align="center" style="padding-bottom:32px;">
          <h1 style="margin:0;font-size:24px;font-weight:900;letter-spacing:-1px;color:white;">
            ZAP<span style="color:#25D366;">CHAT</span>
          </h1>
        </td></tr>
        <tr><td style="color:white;">
          <h2 style="font-size:20px;font-weight:800;margin:0 0 12px;">Redefinição de senha</h2>
          <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;margin:0 0 32px;">
            Olá, <strong style="color:white;">{usuario['nome']}</strong>!<br><br>
            Recebemos uma solicitação para redefinir a senha da sua conta ZapChat.
            Clique no botão abaixo para criar uma nova senha.
          </p>
          <a href="{link}" style="display:block;background:#25D366;color:#0a0f0a;text-decoration:none;padding:16px 32px;border-radius:10px;font-weight:900;font-size:14px;text-align:center;margin-bottom:24px;">
            REDEFINIR MINHA SENHA
          </a>
          <p style="color:rgba(255,255,255,0.25);font-size:12px;line-height:1.6;margin:0;">
            Este link expira em <strong style="color:rgba(255,255,255,0.5);">2 horas</strong>.<br>
            Se você não solicitou a redefinição, ignore este email — sua senha continua a mesma.
          </p>
        </td></tr>
        <tr><td style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.05);margin-top:32px;">
          <p style="color:rgba(255,255,255,0.15);font-size:11px;text-align:center;margin:0;">
            © 2026 ZapChat Tecnologia. Todos os direitos reservados.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
            """,
        },
    )

    if resp.status_code not in (200, 201):
        # Loga o erro mas não expõe para o usuário
        print(f"Erro ao enviar email Resend: {resp.text}")
        raise HTTPException(status_code=500, detail="Erro ao enviar email. Tente novamente.")

    return {"mensagem": "Se este e-mail estiver cadastrado, você receberá as instruções em instantes."}


# ─── ROTA: REDEFINIR SENHA ────────────────────────────────────────────────────

@router.post("/redefinir-senha")
def redefinir_senha(payload: RedefinirSenha):
    """
    Valida o token e atualiza a senha do usuário.
    """
    if len(payload.nova_senha) < 6:
        raise HTTPException(status_code=400, detail="A senha deve ter pelo menos 6 caracteres.")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT usuario_id, expira_em, usado
        FROM tokens_redefinicao
        WHERE token = %s
    """, (payload.token,))
    registro = cursor.fetchone()
    cursor.close()
    conn.close()

    if not registro:
        raise HTTPException(status_code=400, detail="Link inválido ou expirado.")

    if registro.get("usado"):
        raise HTTPException(status_code=400, detail="Este link já foi utilizado.")

    if datetime.utcnow() > registro["expira_em"]:
        raise HTTPException(status_code=400, detail="Este link expirou. Solicite um novo.")

    # Criptografa nova senha
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    nova_senha_hash = pwd_context.hash(payload.nova_senha)

    # Atualiza senha e marca token como usado
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE usuarios SET senha = %s WHERE id = %s
    """, (nova_senha_hash, registro["usuario_id"]))
    cursor.execute("""
        UPDATE tokens_redefinicao SET usado = TRUE WHERE token = %s
    """, (payload.token,))
    conn.commit()
    cursor.close()
    conn.close()

    return {"mensagem": "Senha redefinida com sucesso! Você já pode fazer login."}


# ─── ROTA: VALIDAR TOKEN (frontend verifica se link ainda é válido) ────────────

@router.get("/redefinir-senha/validar")
def validar_token(token: str):
    """
    O frontend chama essa rota ao carregar a página de redefinição
    para verificar se o token ainda é válido antes de mostrar o formulário.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT expira_em, usado FROM tokens_redefinicao WHERE token = %s
    """, (token,))
    registro = cursor.fetchone()
    cursor.close()
    conn.close()

    if not registro or registro.get("usado") or datetime.utcnow() > registro["expira_em"]:
        return {"valido": False}

    return {"valido": True}