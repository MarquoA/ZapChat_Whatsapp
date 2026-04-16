# app/routes/usuario_routes.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.database import get_db_connection
from passlib.context import CryptContext
from jose import JWTError, jwt
import os

router   = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
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


# ── DELETE /usuarios/{id} — Exclui a conta do usuário e todos os dados ───────

@router.delete("/usuarios/{usuario_id}")
async def deletar_conta(
    usuario_id: int,
    usuario: dict = Depends(get_usuario_atual)
):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor(dictionary=True)
    try:
        # Confirma que o usuário existe
        cursor.execute("SELECT id FROM usuarios WHERE id = %s", (usuario_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        # Remove dados em ordem para não violar foreign keys
        tabelas_dependentes = [
            "historico_tokens_ia",
            "tokens_ia",
            "agentes_ia",
            "disparos",
            "sessoes_bot",
            "assinaturas",
            "historico_pagamentos",
            "tokens_redefinicao",
            "fluxos",
        ]
        # Instâncias têm subconsulta pois sessoes_bot depende delas
        cursor.execute("DELETE FROM sessoes_bot WHERE instancia_id IN (SELECT id FROM instancias WHERE usuario_id = %s)", (usuario_id,))
        cursor.execute("DELETE FROM instancias WHERE usuario_id = %s", (usuario_id,))

        for tabela in tabelas_dependentes:
            try:
                cursor.execute(f"DELETE FROM {tabela} WHERE usuario_id = %s", (usuario_id,))
            except Exception:
                pass  # Tabela pode não ter coluna usuario_id

        # Por último, remove o usuário
        cursor.execute("DELETE FROM usuarios WHERE id = %s", (usuario_id,))
        conn.commit()

        return {"message": "Conta excluída com sucesso. Todos os dados foram removidos."}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao excluir conta: {str(e)}")
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