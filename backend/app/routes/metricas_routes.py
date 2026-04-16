# app/routes/metricas_routes.py
import logging
import os
from fastapi import APIRouter, HTTPException, Depends
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


# ── GET /metricas/dashboard ───────────────────────────────────────────────────

@router.get("/metricas/dashboard")
async def metricas_dashboard(usuario: dict = Depends(get_usuario_atual)):
    """
    Retorna métricas REAIS do usuário para o Dashboard.
    
    Dados extraídos do banco:
    - Total de disparos (geral e hoje)
    - Disparos por hora (últimas 24h) → gráfico de barras
    - Disparos por status (enviado/erro/pendente)
    - Total de fluxos
    - Sessões de bot ativas (últimos 30min)
    - Fluxos mais usados (por sessões encerradas)
    - Plano atual

    Dados que dependem da Evolution API (retornam null até configurar):
    - TMR, TMA reais → null
    - Tokens de IA → null (requer tabela futura)
    """
    uid = int(usuario["sub"])
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")
    cursor = conn.cursor(dictionary=True)

    try:
        # ── 1. Total de disparos ──────────────────────────────────────────────
        cursor.execute("""
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN DATE(criado_em) = CURDATE() THEN 1 ELSE 0 END) AS hoje,
                SUM(CASE WHEN status = 'enviado'  THEN 1 ELSE 0 END) AS enviados,
                SUM(CASE WHEN status = 'erro'     THEN 1 ELSE 0 END) AS erros,
                SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) AS pendentes
            FROM disparos
            WHERE usuario_id = %s
        """, (uid,))
        disparos = cursor.fetchone() or {}

        # ── 2. Disparos por hora nas últimas 24h (para o gráfico) ─────────────
        cursor.execute("""
            SELECT
                HOUR(criado_em) AS hora,
                COUNT(*)        AS total
            FROM disparos
            WHERE usuario_id = %s
              AND criado_em >= NOW() - INTERVAL 24 HOUR
            GROUP BY HOUR(criado_em)
            ORDER BY hora
        """, (uid,))
        disparos_por_hora_raw = cursor.fetchall()

        # Garante todas as 24 horas no array (0–23), sem gaps
        horas_map = {row["hora"]: row["total"] for row in disparos_por_hora_raw}
        disparos_por_hora = [
            {"hora": f"{h:02d}h", "total": horas_map.get(h, 0)}
            for h in range(24)
        ]

        # ── 3. Total de fluxos ────────────────────────────────────────────────
        cursor.execute("SELECT COUNT(*) AS total FROM fluxos WHERE usuario_id = %s", (uid,))
        total_fluxos = (cursor.fetchone() or {}).get("total", 0)

        # ── 4. Sessões de bot ativas agora (últimos 30min) ────────────────────
        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM sessoes_bot sb
            JOIN instancias i ON i.id = sb.instancia_id
            WHERE i.usuario_id = %s
              AND sb.atualizado_em >= NOW() - INTERVAL 30 MINUTE
        """, (uid,))
        sessoes_ativas = (cursor.fetchone() or {}).get("total", 0)

        # ── 5. Total de conversas (histórico real de conversas finalizadas) ──────
        cursor.execute("""
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN DATE(finalizado_em) = CURDATE() THEN 1 ELSE 0 END) AS hoje
            FROM historico_conversas
            WHERE usuario_id = %s
        """, (uid,))
        conv_row = cursor.fetchone() or {}
        total_conversas = int(conv_row.get("total", 0) or 0)
        conversas_hoje  = int(conv_row.get("hoje",  0) or 0)

        # ── 6. Fluxos mais usados ─────────────────────────────────────────────
        # Conta por número de sessões ativas por fluxo
        cursor.execute("""
            SELECT f.nome_fluxo, COUNT(sb.id) AS usos
            FROM fluxos f
            LEFT JOIN sessoes_bot sb ON sb.fluxo_id = f.id
            WHERE f.usuario_id = %s
            GROUP BY f.id, f.nome_fluxo
            ORDER BY usos DESC
            LIMIT 5
        """, (uid,))
        fluxos_mais_usados = cursor.fetchall()

        # Calcula percentual em relação ao mais usado
        max_usos = max((f["usos"] for f in fluxos_mais_usados), default=1) or 1
        for f in fluxos_mais_usados:
            f["percentual"] = round(f["usos"] / max_usos * 100)

        # ── 7. Plano atual ────────────────────────────────────────────────────
        cursor.execute("""
            SELECT plano, periodo, status
            FROM assinaturas
            WHERE usuario_id = %s AND status IN ('ativo', 'trial')
            ORDER BY id DESC LIMIT 1
        """, (uid,))
        assinatura = cursor.fetchone() or {"plano": "starter", "periodo": None, "status": "trial"}

        # ── 8. Instâncias conectadas ──────────────────────────────────────────
        cursor.execute("""
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'conectado' THEN 1 ELSE 0 END) AS conectadas
            FROM instancias
            WHERE usuario_id = %s
        """, (uid,))
        instancias = cursor.fetchone() or {"total": 0, "conectadas": 0}

        # ── 9. Tokens de IA (saldo e uso real da tabela tokens_ia) ───────────
        cursor.execute("""
            SELECT saldo, total_usado, ultimo_reset
            FROM tokens_ia
            WHERE usuario_id = %s
        """, (uid,))
        tokens_row = cursor.fetchone()

        tokens_usados  = int(tokens_row["total_usado"] or 0) if tokens_row else None
        tokens_saldo   = int(tokens_row["saldo"] or 0)       if tokens_row else None
        tokens_limite  = 1_000_000
        tokens_reset   = str(tokens_row["ultimo_reset"]) if tokens_row and tokens_row.get("ultimo_reset") else None

        # ── 10. Tokens usados nos últimos 30 dias (por modelo) ───────────────
        cursor.execute("""
            SELECT modelo, SUM(tokens_usados) AS total
            FROM historico_tokens_ia
            WHERE usuario_id = %s
              AND criado_em >= NOW() - INTERVAL 30 DAY
            GROUP BY modelo
            ORDER BY total DESC
        """, (uid,))
        tokens_por_modelo = [
            {"modelo": r["modelo"], "total": int(r["total"] or 0)}
            for r in cursor.fetchall()
        ]

        # ── Monta resposta final ──────────────────────────────────────────────
        return {
            # Contadores principais
            "total_disparos":    int(disparos.get("total", 0) or 0),
            "disparos_hoje":     int(disparos.get("hoje", 0) or 0),
            "disparos_enviados": int(disparos.get("enviados", 0) or 0),
            "disparos_erros":    int(disparos.get("erros", 0) or 0),
            "disparos_pendentes":int(disparos.get("pendentes", 0) or 0),
            "total_fluxos":      int(total_fluxos or 0),
            "sessoes_ativas":    int(sessoes_ativas or 0),
            "total_conversas":   total_conversas,
            "conversas_hoje":    conversas_hoje,
            "instancias_total":  int(instancias.get("total", 0) or 0),
            "instancias_conectadas": int(instancias.get("conectadas", 0) or 0),

            # Para o gráfico de barras (array de 24 posições)
            "disparos_por_hora": disparos_por_hora,

            # Ranking de fluxos
            "fluxos_mais_usados": fluxos_mais_usados,

            # Plano
            "plano":    assinatura["plano"],
            "periodo":  assinatura["periodo"],

            # Tokens de IA (dados reais da tabela tokens_ia)
            "tokens_usados":      tokens_usados,
            "tokens_saldo":       tokens_saldo,
            "tokens_limite":      tokens_limite,
            "tokens_reset":       tokens_reset,
            "tokens_por_modelo":  tokens_por_modelo,

            # Métricas que dependem de Evolution API — null até implementar
            "tmr_segundos":    None,
            "tma_segundos":    None,
            "taxa_resolucao":  None,
        }

    except Exception as e:
        logger.error(f"Erro ao buscar métricas para usuario {uid}: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar métricas.")
    finally:
        cursor.close()
        conn.close()