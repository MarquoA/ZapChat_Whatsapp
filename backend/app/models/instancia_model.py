from app.database import get_db_connection

def salvar_instancia(usuario_id: int, nome: str, fluxo_id: int):
    conn = get_db_connection()
    if not conn:
        return None
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO instancias (usuario_id, nome, fluxo_id, status) VALUES (%s, %s, %s, 'desconectado')",
            (usuario_id, nome, fluxo_id)
        )
        conn.commit()
        return cursor.lastrowid
    except Exception as e:
        conn.rollback()
        print(f"Erro ao salvar instância: {e}")
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
                   f.nome_fluxo
            FROM instancias i
            LEFT JOIN fluxos f ON f.id = i.fluxo_id
            WHERE i.usuario_id = %s
            ORDER BY i.criado_em DESC
        """, (usuario_id,))
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