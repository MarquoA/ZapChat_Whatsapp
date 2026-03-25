# app/routes/template_routes.py
import json
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt
import os

from app.database import get_db_connection
from app.models.template_model import (
    listar_templates,
    buscar_template_por_id,
    buscar_template_por_slug,
)

router = APIRouter()
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "zapchat_secret")
ALGORITHM = "HS256"


# ─── Helper JWT ──────────────────────────────────────────────────────────────
def verificar_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id: int = payload.get("sub")
        if usuario_id is None:
            raise HTTPException(status_code=401, detail="Token inválido.")
        return int(usuario_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido.")


# ─── Helper: verificar plano do usuário ──────────────────────────────────────
def _plano_usuario(usuario_id: int) -> str:
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT plano FROM assinaturas WHERE usuario_id = %s AND status IN ('ativo','trial')",
            (usuario_id,)
        )
        row = cursor.fetchone()
        return row["plano"] if row else "starter"
    finally:
        cursor.close()
        conn.close()


_ORDEM_PLANO = {"starter": 0, "pro": 1, "business": 2}


def _plano_suficiente(plano_usuario: str, plano_minimo: str) -> bool:
    return _ORDEM_PLANO.get(plano_usuario, 0) >= _ORDEM_PLANO.get(plano_minimo, 0)


def _normalizar_edges_template(nodes, edges):
    if not isinstance(edges, list):
        return []
    normalized = [dict(e) for e in edges]
    by_source = {}

    for edge in normalized:
        source = edge.get('source')
        if source is None:
            continue
        by_source.setdefault(source, []).append(edge)

    for node in nodes or []:
        options = node.get('data', {}).get('options', []) or []
        outgoing = by_source.get(node.get('id'), [])

        if options:
            candidate = 0
            for i in range(len(options)):
                handle = f"opt{i}"
                if any(e.get('sourceHandle') == handle for e in outgoing):
                    continue
                while candidate < len(outgoing) and outgoing[candidate].get('sourceHandle'):
                    candidate += 1
                if candidate < len(outgoing):
                    outgoing[candidate]['sourceHandle'] = handle
                    candidate += 1
        elif len(outgoing) == 1 and not outgoing[0].get('sourceHandle'):
            outgoing[0]['sourceHandle'] = 'default'

    return normalized


# ─── Modelo de requisição ────────────────────────────────────────────────────
class UsarTemplateInput(BaseModel):
    template_id: int
    usuario_id: int
    nome_fluxo: str | None = None   # se None, usa o nome do template


# ─── ROTAS ───────────────────────────────────────────────────────────────────

@router.get("/")
def listar(usuario_id: int = Depends(verificar_token)):
    """
    Retorna todos os templates ativos.
    Marca quais o usuário pode usar de acordo com seu plano.
    """
    templates = listar_templates()
    plano = _plano_usuario(usuario_id)
    resultado = []
    for t in templates:
        resultado.append({
            **t,
            "disponivel": _plano_suficiente(plano, t["plano_minimo"]),
        })
    return {"templates": resultado, "plano_usuario": plano}


@router.post("/usar")
def usar_template(body: UsarTemplateInput, usuario_id: int = Depends(verificar_token)):
    """
    Cria um novo fluxo para o usuário a partir de um template.
    Retorna o id do fluxo criado para redirecionar ao editor.
    """
    # 1. Validação de Segurança
    if body.usuario_id != usuario_id:
        raise HTTPException(status_code=403, detail="Acesso negado.")

    # 2. Busca o template (O model já roda o _parse_json_field aqui)
    template = buscar_template_por_id(body.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado.")

    # 3. Verificação de Plano
    plano = _plano_usuario(usuario_id)
    if not _plano_suficiente(plano, template["plano_minimo"]):
        raise HTTPException(
            status_code=403,
            detail=f"Este template requer o plano {template['plano_minimo'].capitalize()}."
        )

    # 4. Extração simplificada dos dados
    # Como o Model já tratou o JSON, fluxo_data já é um dict ou um dict vazio {}
    fluxo_data = template.get("fluxo_json", {})
    
    nodes_template = fluxo_data.get("nodes", [])
    edges_template = fluxo_data.get("edges", [])

    # Verificação de integridade: evita salvar fluxos vazios por erro de banco
    if not nodes_template and not edges_template:
        raise HTTPException(
            status_code=422, 
            detail="Erro: Os dados do template estão vazios ou corrompidos no banco de dados."
        )

    nome_fluxo = body.nome_fluxo or template["nome"]

    # 5. Prepara o JSON final para salvar na tabela 'fluxos'
    # Usamos ensure_ascii=False para manter acentos e emojis legíveis
    dados_json_str = json.dumps({
        "nodes": nodes_template,
        "edges": edges_template,
    }, ensure_ascii=False)

    # 6. Persistência no Banco
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO fluxos (usuario_id, nome_fluxo, dados_json) VALUES (%s, %s, %s)",
            (usuario_id, nome_fluxo, dados_json_str)
        )
        conn.commit()
        fluxo_id = cursor.lastrowid
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar o fluxo: {str(e)}")
    finally:
        cursor.close()
        conn.close()

    # 7. Retorno para o Frontend
    return {
        "id": fluxo_id,
        "nome_fluxo": nome_fluxo,
        "nodes": nodes_template,
        "edges": edges_template,
        "mensagem": f"Fluxo criado a partir do template '{template['nome']}'."
    }