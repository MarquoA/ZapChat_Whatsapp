# app/routes/usuario_routes.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.database import get_db_connection
from passlib.context import CryptContext
from jose import JWTError, jwt

router   = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "zapchat_senha_MmC"
ALGORITHM  = "HS256"


def verificar_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido.")

def get_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return verificar_token(credentials.credentials)


class AtualizarNome(BaseModel):
    nome: str

class AtualizarSenha(BaseModel):
    senha_atual: str
    nova_senha:  str


# ── GET /usuarios/{id} ────────────────────────────────────────────────────────

@router.get("/usuarios/{usuario_id}")
async def get_usuario(usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT u.id, u.nome, u.email,
                   COALESCE(a.plano, 'starter') AS plano,
                   a.status AS status_assinatura,
                   a.periodo
            FROM usuarios u
            LEFT JOIN assinaturas a
                ON a.usuario_id = u.id
                AND a.status IN ('ativo', 'trial')
            WHERE u.id = %s
            ORDER BY a.id DESC
            LIMIT 1
        """, (usuario_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        return user
    finally:
        cursor.close()
        conn.close()


# ── PUT /usuarios/{id}/nome ───────────────────────────────────────────────────

@router.put("/usuarios/{usuario_id}/nome")
async def atualizar_nome(
    usuario_id: int,
    dados: AtualizarNome,
    usuario: dict = Depends(get_usuario_atual)
):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    if not dados.nome.strip():
        raise HTTPException(status_code=400, detail="Nome não pode ser vazio.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE usuarios SET nome = %s WHERE id = %s",
            (dados.nome.strip(), usuario_id)
        )
        conn.commit()
        return {"message": "Nome atualizado com sucesso."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Erro: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# ── PUT /usuarios/{id}/senha ──────────────────────────────────────────────────

@router.put("/usuarios/{usuario_id}/senha")
async def atualizar_senha(
    usuario_id: int,
    dados: AtualizarSenha,
    usuario: dict = Depends(get_usuario_atual)
):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    if len(dados.nova_senha) < 6:
        raise HTTPException(status_code=400, detail="A nova senha deve ter pelo menos 6 caracteres.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT senha FROM usuarios WHERE id = %s", (usuario_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        if not pwd_context.verify(dados.senha_atual, user["senha"]):
            raise HTTPException(status_code=401, detail="Senha atual incorreta.")

        nova_hash = pwd_context.hash(dados.nova_senha)
        cursor.execute(
            "UPDATE usuarios SET senha = %s WHERE id = %s",
            (nova_hash, usuario_id)
        )
        conn.commit()
        return {"message": "Senha atualizada com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Erro: {str(e)}")
    finally:
        cursor.close()
        conn.close()