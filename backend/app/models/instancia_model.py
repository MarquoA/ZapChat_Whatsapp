import logging
from app.database import get_db_connection

logger = logging.getLogger(__name__)

def salvar_instancia(usuario_id: int, nome: str, fluxo_id: int, evolution_instance_id: str = None):  # ── ALTERADO: adicionado parâmetro evolution_instance_id
    conn = get_db_connection()
    if not conn:
        return None
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO instancias (usuario_id, nome, fluxo_id, status, evolution_instance_id) VALUES (%s, %s, %s, 'desconectado', %s)",  # ── ALTERADO: salva o ID da Evolution
            (usuario_id, nome, fluxo_id, evolution_instance_id)
        )
        conn.commit()
        return cursor.lastrowid
    except Exception as e:
        conn.rollback()
        logger.error(f"Erro ao salvar instância: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def listar_instancias(usuario_id: int):
    conn = get_db_connection()
    if not conn:
        return []
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT i.id, i.nome, i.status, i.criado_em, i.fluxo_id,
                   i.evolution_instance_id,
                   f.nome_fluxo
            FROM instancias i
            LEFT JOIN fluxos f ON f.id = i.fluxo_id
            WHERE i.usuario_id = %s
            ORDER BY i.criado_em DESC
        """, (usuario_id,))  # ── ALTERADO: agora retorna evolution_instance_id também
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

def atualizar_status(instancia_id: int, usuario_id: int, status: str):
    conn = get_db_connection()
    if not conn:
        return False
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE instancias SET status = %s WHERE id = %s AND usuario_id = %s",
            (status, instancia_id, usuario_id)
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        cursor.close()
        conn.close()

def deletar_instancia(instancia_id: int, usuario_id: int):
    conn = get_db_connection()
    if not conn:
        return False
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM instancias WHERE id = %s AND usuario_id = %s",
            (instancia_id, usuario_id)
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        cursor.close()
        conn.close()


# ══════════════════════════════════════════════════════════════════════════════
# ── NOVO: Funções auxiliares para integração com a Evolution API
# ══════════════════════════════════════════════════════════════════════════════

def buscar_instancia_por_id(instancia_id: int, usuario_id: int):
    """Retorna uma instância específica do usuário (para validação antes de ações na Evolution)."""
    conn = get_db_connection()
    if not conn:
        return None
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM instancias WHERE id = %s AND usuario_id = %s",
            (instancia_id, usuario_id)
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def salvar_evolution_id(instancia_id: int, usuario_id: int, evolution_instance_id: str):
    """Salva o nome/ID da instância na Evolution API após criação bem-sucedida."""
    conn = get_db_connection()
    if not conn:
        return False
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE instancias SET evolution_instance_id = %s WHERE id = %s AND usuario_id = %s",
            (evolution_instance_id, instancia_id, usuario_id)
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        cursor.close()
        conn.close()