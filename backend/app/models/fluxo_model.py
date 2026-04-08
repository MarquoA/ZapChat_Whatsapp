import logging
from app.database import get_db_connection
import json

logger = logging.getLogger(__name__)

def salvar_fluxo(usuario_id: int, fluxo_id: int, nome_fluxo: str, nodes: list, edges: list):
    conn = get_db_connection()
    if not conn:
        return None
    cursor = conn.cursor(dictionary=True)

    # Junta nodes e edges em um único dados_json, como sua tabela espera
    dados_json = json.dumps({"nodes": nodes, "edges": edges})

    try:
        if fluxo_id and fluxo_id != 0:
            # Verifica se o fluxo existe E pertence ao usuário
            cursor.execute(
                "SELECT id FROM fluxos WHERE id = %s AND usuario_id = %s",
                (fluxo_id, usuario_id)
            )
            existente = cursor.fetchone()

            if existente:
                cursor.execute(
                    "UPDATE fluxos SET nome_fluxo = %s, dados_json = %s WHERE id = %s AND usuario_id = %s",
                    (nome_fluxo, dados_json, fluxo_id, usuario_id)
                )
                conn.commit()
                return fluxo_id

        # Insere novo fluxo
        cursor.execute(
            "INSERT INTO fluxos (usuario_id, nome_fluxo, dados_json) VALUES (%s, %s, %s)",
            (usuario_id, nome_fluxo, dados_json)
        )
        conn.commit()
        return cursor.lastrowid

    except Exception as e:
        conn.rollback()
        logger.error(f"Erro ao salvar fluxo: {e}")
        return None
    finally:
        cursor.close()
        conn.close()


def buscar_fluxo(fluxo_id: int, usuario_id: int):
    conn = get_db_connection()
    if not conn:
        return None
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM fluxos WHERE id = %s AND usuario_id = %s",
            (fluxo_id, usuario_id)
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def listar_fluxos(usuario_id: int):
    conn = get_db_connection()
    if not conn:
        return []
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, nome_fluxo, data_criacao FROM fluxos WHERE usuario_id = %s ORDER BY data_criacao DESC",
            (usuario_id,)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def deletar_fluxo(fluxo_id: int, usuario_id: int):
    conn = get_db_connection()
    if not conn:
        return False
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM fluxos WHERE id = %s AND usuario_id = %s",
            (fluxo_id, usuario_id)
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        cursor.close()
        conn.close()