import logging
import os
import mysql.connector.pooling
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_pool = None


def _get_pool():
    global _pool
    if _pool is None: 
        _pool = mysql.connector.pooling.MySQLConnectionPool(
            pool_name="zapchat_pool",
            pool_size=10,
            pool_reset_session=True,
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASS"),
            database=os.getenv("DB_NAME"),
            connect_timeout=10,
        )
    return _pool


def get_db_connection():
    try:
        return _get_pool().get_connection()
    except Exception as e:
        logger.error(f"Erro ao obter conexão do pool: {e}")
        return None
