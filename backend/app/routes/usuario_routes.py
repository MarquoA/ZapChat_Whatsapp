from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt
from app.models.instancia_model import (
    salvar_instancia, listar_instancias,
    atualizar_status, deletar_instancia
)

router = APIRouter()
security = HTTPBearer()

SECRET_KEY = "zapchat_senha_MmC"
ALGORITHM = "HS256"

def get_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado. Faça login novamente.")

class InstanciaPayload(BaseModel):
    usuario_id: int
    nome: str
    fluxo_id: int

class StatusPayload(BaseModel):
    usuario_id: int
    status: str

@router.post("/instancias/criar")
def criar(payload: InstanciaPayload, usuario: dict = Depends(get_usuario_atual)):
    if str(payload.usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    instancia_id = salvar_instancia(
        usuario_id=payload.usuario_id,
        nome=payload.nome,
        fluxo_id=payload.fluxo_id
    )
    if instancia_id is None:
        raise HTTPException(status_code=500, detail="Erro ao criar instância.")
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
def deletar(instancia_id: int, usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    sucesso = deletar_instancia(instancia_id, usuario_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Instância não encontrada.")
    return {"success": True, "mensagem": "Instância deletada com sucesso!"}