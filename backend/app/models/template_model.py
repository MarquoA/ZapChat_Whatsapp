# app/models/template_model.py
from app.database import get_db_connection


def _parse_json_field(value):
    import json
    if not value:
        return {}
    if isinstance(value, (dict, list)):
        return value
    
    if isinstance(value, str):
        try:
            # Tenta carregar direto
            return json.loads(value)
        except json.JSONDecodeError:
            try:
                # Limpa quebras de linha reais e tabs que podem ter vindo do SQL
                normalized = value.replace('\n', '\\n').replace('\r', '\\n').replace('\t', ' ')
                return json.loads(normalized)
            except Exception as e:
                print(f"Erro crítico ao processar JSON: {e}")
                return {"nodes": [], "edges": []} # Retorna estrutura mínima
    return {}

def listar_templates(apenas_ativos: bool = True):
    """Retorna todos os templates. Por padrão, somente os ativos."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        if apenas_ativos:
            cursor.execute(
                "SELECT id, slug, nome, descricao, categoria, icone, cor_destaque, plano_minimo, "
                "imagem_url, imagem_descricao, customizacoes_globais, fluxo_json "
                "FROM templates WHERE ativo = 1 ORDER BY categoria, nome"
            )
        else:
            cursor.execute(
                "SELECT id, slug, nome, descricao, categoria, icone, cor_destaque, plano_minimo, "
                "imagem_url, imagem_descricao, customizacoes_globais, fluxo_json, ativo "
                "FROM templates ORDER BY categoria, nome"
            )
        templates = cursor.fetchall()
        for template in templates:
            template['customizacoes_globais'] = _parse_json_field(template.get('customizacoes_globais')) or {}
            template['fluxo_json'] = _parse_json_field(template.get('fluxo_json')) or {}
        return templates
    finally:
        cursor.close()
        conn.close()


def buscar_template_por_slug(slug: str):
    """Retorna um template completo (inclui fluxo_json) pelo slug."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM templates WHERE slug = %s AND ativo = 1",
            (slug,)
        )
        template = cursor.fetchone()
        if template:
            template['fluxo_json'] = _parse_json_field(template.get('fluxo_json')) or {}
            template['customizacoes_globais'] = _parse_json_field(template.get('customizacoes_globais')) or {}
        return template
    finally:
        cursor.close()
        conn.close()


def buscar_template_por_id(template_id: int):
    """Retorna um template completo pelo id."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM templates WHERE id = %s AND ativo = 1",
            (template_id,)
        )
        template = cursor.fetchone()
        if template:
            template['fluxo_json'] = _parse_json_field(template.get('fluxo_json')) or {}
            template['customizacoes_globais'] = _parse_json_field(template.get('customizacoes_globais')) or {}
        return template
    finally:
        cursor.close()
        conn.close()