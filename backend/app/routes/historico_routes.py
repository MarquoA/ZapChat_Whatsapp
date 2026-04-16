# app/routes/historico_routes.py
import json
import logging
import os
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_db_connection
from jose import JWTError, jwt

router   = APIRouter()
security = HTTPBearer()
logger   = logging.getLogger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM  = "HS256"


def verificar_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido.")

def get_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return verificar_token(credentials.credentials)


# ── GET /historico/conversas ──────────────────────────────────────────────────

@router.get("/historico/conversas")
async def listar_conversas(
    page:         int = Query(1, ge=1),
    limit:        int = Query(20, ge=1, le=100),
    instancia_id: int = Query(None),
    usuario:      dict = Depends(get_usuario_atual),
):
    """Lista conversas finalizadas do usuário, mais recentes primeiro."""
    uid    = int(usuario["sub"])
    offset = (page - 1) * limit

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor(dictionary=True)
    try:
        if instancia_id:
            cursor.execute("""
                SELECT hc.id, hc.instancia_id, hc.contato, hc.fluxo_id,
                       hc.dados_sessao, hc.finalizado_em,
                       i.nome AS instancia_nome,
                       f.nome_fluxo
                FROM historico_conversas hc
                JOIN instancias i ON i.id = hc.instancia_id
                LEFT JOIN fluxos f ON f.id = hc.fluxo_id
                WHERE hc.usuario_id = %s AND hc.instancia_id = %s
                ORDER BY hc.finalizado_em DESC
                LIMIT %s OFFSET %s
            """, (uid, instancia_id, limit, offset))
        else:
            cursor.execute("""
                SELECT hc.id, hc.instancia_id, hc.contato, hc.fluxo_id,
                       hc.dados_sessao, hc.finalizado_em,
                       i.nome AS instancia_nome,
                       f.nome_fluxo
                FROM historico_conversas hc
                JOIN instancias i ON i.id = hc.instancia_id
                LEFT JOIN fluxos f ON f.id = hc.fluxo_id
                WHERE hc.usuario_id = %s
                ORDER BY hc.finalizado_em DESC
                LIMIT %s OFFSET %s
            """, (uid, limit, offset))

        conversas = cursor.fetchall()

        # Total para paginação
        if instancia_id:
            cursor.execute(
                "SELECT COUNT(*) AS total FROM historico_conversas WHERE usuario_id = %s AND instancia_id = %s",
                (uid, instancia_id)
            )
        else:
            cursor.execute(
                "SELECT COUNT(*) AS total FROM historico_conversas WHERE usuario_id = %s",
                (uid,)
            )
        total = int((cursor.fetchone() or {}).get("total", 0))

        # Normaliza campos
        for c in conversas:
            raw = c.get("dados_sessao")
            if isinstance(raw, str):
                try:
                    c["dados_sessao"] = json.loads(raw)
                except Exception:
                    c["dados_sessao"] = {}
            elif raw is None:
                c["dados_sessao"] = {}

            if c.get("finalizado_em"):
                c["finalizado_em"] = str(c["finalizado_em"])

        return {
            "conversas":   conversas,
            "total":       total,
            "page":        page,
            "limit":       limit,
            "total_paginas": max(1, -(-total // limit)),  # ceil sem math
        }

    except Exception as e:
        logger.error(f"Erro ao listar conversas para usuario {uid}: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar conversas.")
    finally:
        cursor.close()
        conn.close()


# ── GET /historico/conversas/{id} ─────────────────────────────────────────────

@router.get("/historico/conversas/{conversa_id}")
async def detalhe_conversa(
    conversa_id: int,
    usuario:     dict = Depends(get_usuario_atual),
):
    """Retorna os detalhes completos de uma conversa finalizada."""
    uid  = int(usuario["sub"])
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT hc.*, i.nome AS instancia_nome, f.nome_fluxo
            FROM historico_conversas hc
            JOIN instancias i ON i.id = hc.instancia_id
            LEFT JOIN fluxos f ON f.id = hc.fluxo_id
            WHERE hc.id = %s AND hc.usuario_id = %s
        """, (conversa_id, uid))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Conversa não encontrada.")

        raw = row.get("dados_sessao")
        if isinstance(raw, str):
            try:
                row["dados_sessao"] = json.loads(raw)
            except Exception:
                row["dados_sessao"] = {}
        elif raw is None:
            row["dados_sessao"] = {}

        if row.get("finalizado_em"):
            row["finalizado_em"] = str(row["finalizado_em"])

        return row

    finally:
        cursor.close()
        conn.close()


# ── GET /historico/metricas ───────────────────────────────────────────────────

@router.get("/historico/metricas")
async def metricas_historico(usuario: dict = Depends(get_usuario_atual)):
    """Retorna contadores de conversas finalizadas."""
    uid  = int(usuario["sub"])
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN DATE(finalizado_em) = CURDATE()                 THEN 1 ELSE 0 END) AS hoje,
                SUM(CASE WHEN finalizado_em >= NOW() - INTERVAL 7 DAY         THEN 1 ELSE 0 END) AS semana,
                SUM(CASE WHEN finalizado_em >= NOW() - INTERVAL 30 DAY        THEN 1 ELSE 0 END) AS mes
            FROM historico_conversas
            WHERE usuario_id = %s
        """, (uid,))
        row = cursor.fetchone() or {}
        return {
            "total":  int(row.get("total",  0) or 0),
            "hoje":   int(row.get("hoje",   0) or 0),
            "semana": int(row.get("semana", 0) or 0),
            "mes":    int(row.get("mes",    0) or 0),
        }
    finally:
        cursor.close()
        conn.close()
