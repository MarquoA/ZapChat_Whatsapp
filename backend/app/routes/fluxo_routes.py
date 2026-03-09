from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt
import json
from app.models.fluxo_model import salvar_fluxo, buscar_fluxo, listar_fluxos, deletar_fluxo

router = APIRouter()
security = HTTPBearer()

SECRET_KEY = "zapchat_senha_MmC"
ALGORITHM = "HS256"

def get_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado. Faça login novamente.")

class FluxoPayload(BaseModel):
    id: int = 0
    usuario_id: int
    nome_fluxo: str = "Novo Fluxo"
    nodes: list
    edges: list

@router.post("/fluxos/salvar")
def salvar(payload: FluxoPayload, usuario: dict = Depends(get_usuario_atual)):
    # Garante que o usuário só salva fluxos dele
    if str(payload.usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    try:
        fluxo_id = salvar_fluxo(
            usuario_id=payload.usuario_id,
            fluxo_id=payload.id,
            nome_fluxo=payload.nome_fluxo,
            nodes=payload.nodes,
            edges=payload.edges
        )
        if fluxo_id is None:
            raise HTTPException(status_code=500, detail="Erro ao salvar fluxo no banco.")
        return {"success": True, "id": fluxo_id, "mensagem": "Fluxo salvo com sucesso!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fluxos/listar/{usuario_id}")
def listar(usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    fluxos = listar_fluxos(usuario_id)
    return {"fluxos": [
        {
            "id": f["id"],
            "nome_fluxo": f["nome_fluxo"],
            "data_criacao": str(f["data_criacao"]),
        }
        for f in fluxos
    ]}

@router.get("/fluxos/{fluxo_id}/{usuario_id}")
def carregar(fluxo_id: int, usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    fluxo = buscar_fluxo(fluxo_id, usuario_id)
    if not fluxo:
        raise HTTPException(status_code=404, detail="Fluxo não encontrado.")
    dados = json.loads(fluxo["dados_json"])
    return {
        "id": fluxo["id"],
        "nome_fluxo": fluxo["nome_fluxo"],
        "nodes": dados.get("nodes", []),
        "edges": dados.get("edges", []),
        "data_criacao": str(fluxo["data_criacao"]),
    }

@router.delete("/fluxos/{fluxo_id}/{usuario_id}")
def deletar(fluxo_id: int, usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    sucesso = deletar_fluxo(fluxo_id, usuario_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Fluxo não encontrado.")
    return {"success": True, "mensagem": "Fluxo deletado com sucesso!"}