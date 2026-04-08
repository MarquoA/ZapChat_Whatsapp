# app/routes/admin_routes.py
# ── NOVO ARQUIVO: Rotas administrativas do ZapChat
# Funcionalidades: gestão de usuários, CRUD de templates, métricas globais

import os
import json
import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from jose import JWTError, jwt
from app.database import get_db_connection

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"


# ══════════════════════════════════════════════════════════════════════════════
# AUTH + VERIFICAÇÃO DE ADMIN
# ══════════════════════════════════════════════════════════════════════════════

def get_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido.")


def verificar_admin(usuario: dict = Depends(get_usuario_atual)):
    """
    Verifica se o usuário logado tem role='admin' no banco.
    Se não for admin, retorna 403.
    """
    uid = int(usuario["sub"])
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT role FROM usuarios WHERE id = %s", (uid,))
        row = cursor.fetchone()
        if not row or row.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Acesso restrito a administradores.")
        return usuario
    finally:
        cursor.close()
        conn.close()


# ══════════════════════════════════════════════════════════════════════════════
# MODELS
# ══════════════════════════════════════════════════════════════════════════════

class TemplateCreate(BaseModel):
    slug: str
    nome: str
    descricao: str = ""
    categoria: str = "geral"
    icone: str = "💬"
    cor_destaque: str = "#25D366"
    plano_minimo: str = "starter"
    fluxo_json: dict  # { nodes: [...], edges: [...] }
    imagem_url: Optional[str] = None
    imagem_descricao: Optional[str] = None
    ativo: bool = True


class TemplateUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    categoria: Optional[str] = None
    icone: Optional[str] = None
    cor_destaque: Optional[str] = None
    plano_minimo: Optional[str] = None
    fluxo_json: Optional[dict] = None
    imagem_url: Optional[str] = None
    imagem_descricao: Optional[str] = None
    ativo: Optional[bool] = None


class UserRoleUpdate(BaseModel):
    role: str  # "admin" ou "user"


# ══════════════════════════════════════════════════════════════════════════════
# ROTA: VERIFICAR SE É ADMIN (frontend usa para mostrar/esconder botão)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/admin/check")
def check_admin(usuario: dict = Depends(get_usuario_atual)):
    """
    Retorna { is_admin: true/false }.
    O frontend chama isso no carregamento do Dashboard para decidir
    se mostra o botão de "Painel Admin".
    """
    uid = int(usuario["sub"])
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT role FROM usuarios WHERE id = %s", (uid,))
        row = cursor.fetchone()
        return {"is_admin": row and row.get("role") == "admin"}
    finally:
        cursor.close()
        conn.close()


# ══════════════════════════════════════════════════════════════════════════════
# ROTAS: GESTÃO DE USUÁRIOS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/admin/usuarios")
def listar_usuarios(admin: dict = Depends(verificar_admin)):
    """Lista todos os usuários com dados de assinatura."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                u.id, u.nome, u.email, u.role, u.data_cadastro,
                COALESCE(a.plano, 'sem_plano') AS plano,
                a.status AS status_assinatura,
                a.periodo,
                a.periodo_fim,
                a.trial_fim,
                (SELECT COUNT(*) FROM fluxos WHERE usuario_id = u.id) AS total_fluxos,
                (SELECT COUNT(*) FROM instancias WHERE usuario_id = u.id) AS total_instancias
            FROM usuarios u
            LEFT JOIN assinaturas a 
                ON a.usuario_id = u.id 
                AND a.id = (SELECT MAX(a2.id) FROM assinaturas a2 WHERE a2.usuario_id = u.id)
            ORDER BY u.data_cadastro DESC
        """)
        usuarios = cursor.fetchall()

        # Serializa datas
        for u in usuarios:
            for campo in ("data_cadastro", "periodo_fim", "trial_fim"):
                if u.get(campo):
                    u[campo] = str(u[campo])

        return {"usuarios": usuarios, "total": len(usuarios)}
    finally:
        cursor.close()
        conn.close()


@router.put("/admin/usuarios/{usuario_id}/role")
def alterar_role(usuario_id: int, body: UserRoleUpdate, admin: dict = Depends(verificar_admin)):
    """Altera o role de um usuário (admin/user)."""
    if body.role not in ("admin", "user"):
        raise HTTPException(status_code=400, detail="Role deve ser 'admin' ou 'user'.")

    # Não pode remover o próprio admin
    if int(admin["sub"]) == usuario_id and body.role != "admin":
        raise HTTPException(status_code=400, detail="Você não pode remover seu próprio acesso admin.")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE usuarios SET role = %s WHERE id = %s", (body.role, usuario_id))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        return {"success": True, "mensagem": f"Role alterado para '{body.role}'."}
    finally:
        cursor.close()
        conn.close()


# ══════════════════════════════════════════════════════════════════════════════
# ROTAS: CRUD DE TEMPLATES
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/admin/templates")
def listar_templates_admin(admin: dict = Depends(verificar_admin)):
    """Lista TODOS os templates (incluindo inativos)."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT id, slug, nome, descricao, categoria, icone, cor_destaque, 
                   plano_minimo, imagem_url, imagem_descricao, ativo, criado_em
            FROM templates 
            ORDER BY categoria, nome
        """)
        templates = cursor.fetchall()
        for t in templates:
            if t.get("criado_em"):
                t["criado_em"] = str(t["criado_em"])
        return {"templates": templates, "total": len(templates)}
    finally:
        cursor.close()
        conn.close()


@router.post("/admin/templates")
def criar_template(body: TemplateCreate, admin: dict = Depends(verificar_admin)):
    """Cria um novo template."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Verifica slug único
        cursor.execute("SELECT id FROM templates WHERE slug = %s", (body.slug,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail=f"Já existe um template com slug '{body.slug}'.")

        fluxo_str = json.dumps(body.fluxo_json, ensure_ascii=False)
        cursor.execute("""
            INSERT INTO templates (slug, nome, descricao, categoria, icone, cor_destaque, 
                                   plano_minimo, fluxo_json, imagem_url, imagem_descricao, ativo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (body.slug, body.nome, body.descricao, body.categoria, body.icone,
              body.cor_destaque, body.plano_minimo, fluxo_str,
              body.imagem_url, body.imagem_descricao, body.ativo))
        conn.commit()
        return {"success": True, "id": cursor.lastrowid, "mensagem": "Template criado com sucesso!"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Erro ao criar template: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao criar template.")
    finally:
        cursor.close()
        conn.close()


@router.put("/admin/templates/{template_id}")
def atualizar_template(template_id: int, body: TemplateUpdate, admin: dict = Depends(verificar_admin)):
    """Atualiza campos de um template existente."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Verifica se existe
        cursor.execute("SELECT id FROM templates WHERE id = %s", (template_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Template não encontrado.")

        # Monta UPDATE dinâmico (só campos que vieram)
        campos = []
        valores = []
        dados = body.dict(exclude_unset=True)

        for campo, valor in dados.items():
            if campo == "fluxo_json" and valor is not None:
                campos.append("fluxo_json = %s")
                valores.append(json.dumps(valor, ensure_ascii=False))
            else:
                campos.append(f"{campo} = %s")
                valores.append(valor)

        if not campos:
            raise HTTPException(status_code=400, detail="Nenhum campo para atualizar.")

        valores.append(template_id)
        sql = f"UPDATE templates SET {', '.join(campos)} WHERE id = %s"
        cursor.execute(sql, valores)
        conn.commit()

        return {"success": True, "mensagem": "Template atualizado com sucesso!"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Erro ao atualizar template {template_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao atualizar template.")
    finally:
        cursor.close()
        conn.close()


@router.delete("/admin/templates/{template_id}")
def deletar_template(template_id: int, admin: dict = Depends(verificar_admin)):
    """Deleta um template permanentemente."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM templates WHERE id = %s", (template_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Template não encontrado.")
        return {"success": True, "mensagem": "Template deletado com sucesso!"}
    finally:
        cursor.close()
        conn.close()


@router.put("/admin/templates/{template_id}/toggle")
def toggle_template(template_id: int, admin: dict = Depends(verificar_admin)):
    """Ativa/desativa um template (toggle)."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT ativo FROM templates WHERE id = %s", (template_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Template não encontrado.")

        novo_status = not row["ativo"]
        cursor.execute("UPDATE templates SET ativo = %s WHERE id = %s", (novo_status, template_id))
        conn.commit()
        return {"success": True, "ativo": novo_status, "mensagem": f"Template {'ativado' if novo_status else 'desativado'}."}
    finally:
        cursor.close()
        conn.close()


# ══════════════════════════════════════════════════════════════════════════════
# ROTA: MÉTRICAS GLOBAIS (visão admin)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/admin/metricas")
def metricas_globais(admin: dict = Depends(verificar_admin)):
    """Retorna métricas globais da plataforma."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Total de usuários
        cursor.execute("SELECT COUNT(*) AS total FROM usuarios")
        total_usuarios = cursor.fetchone()["total"]

        # Usuários por plano
        cursor.execute("""
            SELECT COALESCE(a.plano, 'sem_plano') AS plano, COUNT(DISTINCT u.id) AS total
            FROM usuarios u
            LEFT JOIN assinaturas a ON a.usuario_id = u.id AND a.status IN ('ativo', 'trial')
            GROUP BY COALESCE(a.plano, 'sem_plano')
        """)
        usuarios_por_plano = {r["plano"]: r["total"] for r in cursor.fetchall()}

        # Total de fluxos
        cursor.execute("SELECT COUNT(*) AS total FROM fluxos")
        total_fluxos = cursor.fetchone()["total"]

        # Total de instâncias + conectadas
        cursor.execute("""
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'conectado' THEN 1 ELSE 0 END) AS conectadas
            FROM instancias
        """)
        inst = cursor.fetchone()

        # Total de templates
        cursor.execute("SELECT COUNT(*) AS total, SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) AS ativos FROM templates")
        tmpl = cursor.fetchone()

        # Disparos hoje
        cursor.execute("""
            SELECT COUNT(*) AS total FROM disparos WHERE DATE(criado_em) = CURDATE()
        """)
        disparos_hoje = cursor.fetchone()["total"]

        # Cadastros últimos 7 dias
        cursor.execute("""
            SELECT DATE(data_cadastro) AS dia, COUNT(*) AS total
            FROM usuarios
            WHERE data_cadastro >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(data_cadastro)
            ORDER BY dia
        """)
        cadastros_7d = [{"dia": str(r["dia"]), "total": r["total"]} for r in cursor.fetchall()]

        # Disparos últimos 7 dias (para gráfico)
        cursor.execute("""
            SELECT DATE(criado_em) AS dia, COUNT(*) AS total,
                   SUM(CASE WHEN status='enviado' THEN 1 ELSE 0 END) AS enviados,
                   SUM(CASE WHEN status='erro' THEN 1 ELSE 0 END) AS erros
            FROM disparos
            WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(criado_em)
            ORDER BY dia
        """)
        disparos_7d = [{"dia": str(r["dia"]), "total": r["total"], "enviados": int(r["enviados"] or 0), "erros": int(r["erros"] or 0)} for r in cursor.fetchall()]

        # Top 5 usuários mais ativos (por fluxos)
        cursor.execute("""
            SELECT u.id, u.nome, u.email, COUNT(f.id) AS total_fluxos
            FROM usuarios u
            LEFT JOIN fluxos f ON f.usuario_id = u.id
            GROUP BY u.id, u.nome, u.email
            ORDER BY total_fluxos DESC
            LIMIT 5
        """)
        top_usuarios = cursor.fetchall()

        # Receita estimada (soma dos planos ativos)
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN plano='starter' AND periodo='mensal' THEN 127 
                         WHEN plano='starter' AND periodo='anual' THEN 106
                         WHEN plano='pro' AND periodo='mensal' THEN 297
                         WHEN plano='pro' AND periodo='anual' THEN 248
                         WHEN plano='business' AND periodo='mensal' THEN 797
                         WHEN plano='business' AND periodo='anual' THEN 664
                         ELSE 0 END) AS mrr
            FROM assinaturas WHERE status IN ('ativo')
        """)
        mrr_row = cursor.fetchone()
        mrr = float(mrr_row["mrr"] or 0)

        return {
            "total_usuarios": total_usuarios,
            "usuarios_por_plano": usuarios_por_plano,
            "total_fluxos": total_fluxos,
            "total_instancias": inst["total"] or 0,
            "instancias_conectadas": inst["conectadas"] or 0,
            "total_templates": tmpl["total"] or 0,
            "templates_ativos": tmpl["ativos"] or 0,
            "disparos_hoje": disparos_hoje,
            "cadastros_7d": cadastros_7d,
            "disparos_7d": disparos_7d,
            "top_usuarios": top_usuarios,
            "mrr": mrr,
        }
    finally:
        cursor.close()
        conn.close()


# ══════════════════════════════════════════════════════════════════════════════
# ── NOVO: Promover um fluxo existente a template (drag-and-drop, sem JSON)
# ══════════════════════════════════════════════════════════════════════════════

class PromoverTemplatePayload(BaseModel):
    fluxo_id: int
    slug: str
    nome: str
    descricao: str = ""
    categoria: str = "geral"
    icone: str = "💬"
    cor_destaque: str = "#25D366"
    plano_minimo: str = "starter"
    imagem_url: Optional[str] = None
    imagem_descricao: Optional[str] = None


@router.post("/admin/templates/promover-fluxo")
def promover_fluxo_a_template(body: PromoverTemplatePayload, admin: dict = Depends(verificar_admin)):
    """
    Transforma um fluxo existente (criado no editor visual) em template.
    O admin cria o fluxo normalmente no editor drag-and-drop, depois
    vem aqui e promove a template preenchendo apenas os metadados.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Verifica slug único
        cursor.execute("SELECT id FROM templates WHERE slug = %s", (body.slug,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail=f"Já existe template com slug '{body.slug}'.")

        # Busca o fluxo
        cursor.execute("SELECT dados_json FROM fluxos WHERE id = %s", (body.fluxo_id,))
        fluxo = cursor.fetchone()
        if not fluxo:
            raise HTTPException(status_code=404, detail="Fluxo não encontrado.")

        fluxo_json = fluxo["dados_json"]  # já é string JSON

        cursor.execute("""
            INSERT INTO templates (slug, nome, descricao, categoria, icone, cor_destaque,
                                   plano_minimo, fluxo_json, imagem_url, imagem_descricao, ativo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
        """, (body.slug, body.nome, body.descricao, body.categoria, body.icone,
              body.cor_destaque, body.plano_minimo, fluxo_json,
              body.imagem_url, body.imagem_descricao))
        conn.commit()
        return {"success": True, "id": cursor.lastrowid, "mensagem": f"Fluxo promovido a template '{body.nome}' com sucesso!"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Erro ao promover fluxo {body.fluxo_id} a template: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao promover fluxo a template.")
    finally:
        cursor.close()
        conn.close()


@router.get("/admin/fluxos")
def listar_fluxos_admin(admin: dict = Depends(verificar_admin)):
    """Lista todos os fluxos de todos os usuários (para o admin escolher qual promover)."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT f.id, f.nome_fluxo, f.data_criacao, u.nome AS usuario_nome, u.email AS usuario_email
            FROM fluxos f
            JOIN usuarios u ON u.id = f.usuario_id
            ORDER BY f.data_criacao DESC
            LIMIT 50
        """)
        fluxos = cursor.fetchall()
        for f in fluxos:
            if f.get("data_criacao"):
                f["data_criacao"] = str(f["data_criacao"])
        return {"fluxos": fluxos}
    finally:
        cursor.close()
        conn.close()