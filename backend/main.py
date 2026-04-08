from dotenv import load_dotenv
load_dotenv()

import logging
import logging.config

# ─── LOGGING GLOBAL ───────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.database import get_db_connection
from app.routes.fluxo_routes import router as fluxo_router
from app.routes.instancia_routes import router as instancia_router
from app.routes.bot_routes import router as bot_router
from app.routes.pagamento_routes import router as pagamento_router
from app.routes.esqueci_senha_routes import router as esqueci_router
from app.routes.disparos_routes import router as disparos_router
from app.routes.metricas_routes import router as metricas_router
from app.routes.usuario_routes import router as usuario_router
from app.routes.template_routes import router as template_router
from app.routes.admin_routes import router as admin_router

from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from collections import defaultdict
import threading
import time
import json
import os

# ─── CONFIG ──────────────────────────────────────────────────────────────────

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY não definida no .env. "
        "Gere com: python -c \"import secrets; print(secrets.token_hex(32))\""
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─── RATE LIMITER ─────────────────────────────────────────────────────────────

_lock = threading.Lock()
_rate_data: dict = defaultdict(lambda: {"tentativas": 0, "bloqueado_ate": 0.0, "janela_inicio": time.time()})

JANELA_SEGUNDOS   = 60
MAX_TENTATIVAS    = 5
BLOQUEIO_SEGUNDOS = 300


def get_client_ip(request: Request) -> str:
    # Só confia no X-Forwarded-For se vier de um proxy configurado (nginx/cloudflare).
    # Em produção com nginx, o IP real sempre estará no último valor confiável.
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # Pega o primeiro IP da cadeia (cliente original)
        return forwarded.split(",")[0].strip()
    return request.client.host


def checar_rate_limit(ip: str):
    agora = time.time()
    with _lock:
        dados = _rate_data[ip]
        if agora < dados["bloqueado_ate"]:
            segundos_restantes = int(dados["bloqueado_ate"] - agora)
            raise HTTPException(
                status_code=429,
                detail=f"IP bloqueado por excesso de tentativas. Tente novamente em {segundos_restantes}s."
            )
        if agora - dados["janela_inicio"] > JANELA_SEGUNDOS:
            dados["tentativas"] = 0
            dados["janela_inicio"] = agora
        dados["tentativas"] += 1
        if dados["tentativas"] > MAX_TENTATIVAS:
            dados["bloqueado_ate"] = agora + BLOQUEIO_SEGUNDOS
            dados["tentativas"] = 0
            raise HTTPException(
                status_code=429,
                detail=f"Muitas tentativas. IP bloqueado por {BLOQUEIO_SEGUNDOS // 60} minutos."
            )


def liberar_ip(ip: str):
    with _lock:
        _rate_data[ip] = {"tentativas": 0, "bloqueado_ate": 0.0, "janela_inicio": time.time()}


# ─── AUTH HELPERS ─────────────────────────────────────────────────────────────

def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)

def verificar_senha(senha: str, hash: str) -> bool:
    return pwd_context.verify(senha, hash)

def criar_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado. Faça login novamente.")

security = HTTPBearer()

def get_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return verificar_token(credentials.credentials)


# ─── APP ──────────────────────────────────────────────────────────────────────

app = FastAPI()

# Em produção (AMBIENTE=producao), remove localhost da whitelist de CORS.
_ambiente = os.getenv("AMBIENTE", "dev")
_frontend_url = os.getenv("FRONTEND_URL", "")

if _ambiente == "producao":
    ALLOWED_ORIGINS = [url for url in [_frontend_url] if url]
else:
    ALLOWED_ORIGINS = list(filter(None, [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        _frontend_url or None,
    ]))

if not ALLOWED_ORIGINS:
    logger.warning("ALLOWED_ORIGINS está vazio — CORS bloqueará todas as requisições do frontend!")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(fluxo_router)
app.include_router(instancia_router)
app.include_router(bot_router)
app.include_router(pagamento_router)
app.include_router(esqueci_router)
app.include_router(disparos_router)
app.include_router(metricas_router)
app.include_router(usuario_router)
app.include_router(template_router, prefix="/templates", tags=["Templates"])
app.include_router(admin_router)


# ─── MODELS ───────────────────────────────────────────────────────────────────

class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str

class UsuarioLogin(BaseModel):
    email: str
    senha: str

class FluxoDados(BaseModel):
    usuario_id: int
    nome_fluxo: str
    fluxo: dict


# ─── ROTAS PÚBLICAS ───────────────────────────────────────────────────────────

@app.post("/register")
async def register(usuario: UsuarioCreate, request: Request):
    ip = get_client_ip(request)
    checar_rate_limit(ip)

    if len(usuario.senha) < 6:
        raise HTTPException(status_code=400, detail="A senha deve ter pelo menos 6 caracteres.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (usuario.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")
        senha_hash = hash_senha(usuario.senha)
        cursor.execute(
            "INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)",
            (usuario.nome, usuario.email, senha_hash)
        )
        conn.commit()
        liberar_ip(ip)
        return {"message": "Usuário cadastrado com sucesso!"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Erro ao registrar usuário: {e}")
        raise HTTPException(status_code=400, detail="Erro ao cadastrar usuário. Tente novamente.")
    finally:
        cursor.close()
        conn.close()


@app.post("/login")
async def login(usuario: UsuarioLogin, request: Request):
    ip = get_client_ip(request)
    checar_rate_limit(ip)

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT u.*, COALESCE(a.plano, 'starter') AS plano
            FROM usuarios u
            LEFT JOIN assinaturas a
                ON a.usuario_id = u.id
                AND a.status IN ('ativo', 'trial')
            WHERE u.email = %s
            ORDER BY a.id DESC
            LIMIT 1
        """, (usuario.email,))
        user = cursor.fetchone()

        if not user or not verificar_senha(usuario.senha, user["senha"]):
            raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

        liberar_ip(ip)
        token = criar_token({"sub": str(user["id"]), "nome": user["nome"]})
        return {
            "message": "Login realizado com sucesso!",
            "token": token,
            "user": user["nome"],
            "id": user["id"],
            "plano": user["plano"],
        }
    finally:
        cursor.close()
        conn.close()


# ─── ROTAS PROTEGIDAS ─────────────────────────────────────────────────────────

@app.get("/me")
async def me(usuario: dict = Depends(get_usuario_atual)):
    return {"usuario_id": usuario["sub"], "nome": usuario["nome"]}


@app.post("/salvar-fluxo")
async def salvar_fluxo(dados: FluxoDados, usuario: dict = Depends(get_usuario_atual)):
    if str(dados.usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor()
    try:
        fluxo_json = json.dumps(dados.fluxo)
        cursor.execute(
            "INSERT INTO fluxos (usuario_id, nome_fluxo, dados_json) VALUES (%s, %s, %s)",
            (dados.usuario_id, dados.nome_fluxo, fluxo_json)
        )
        conn.commit()
        return {"message": "Fluxograma salvo com sucesso!"}
    except Exception as e:
        conn.rollback()
        logger.error(f"Erro ao salvar fluxo: {e}")
        raise HTTPException(status_code=400, detail="Erro ao salvar fluxo. Tente novamente.")
    finally:
        cursor.close()
        conn.close()


@app.get("/carregar-fluxo/{usuario_id}")
async def carregar_fluxo(usuario_id: int, usuario: dict = Depends(get_usuario_atual)):
    if str(usuario_id) != str(usuario["sub"]):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT dados_json FROM fluxos WHERE usuario_id = %s ORDER BY data_criacao DESC LIMIT 1",
            (usuario_id,)
        )
        resultado = cursor.fetchone()
        if resultado:
            return json.loads(resultado['dados_json'])
        return {"nodes": [], "edges": []}
    except Exception as e:
        logger.error(f"Erro ao carregar fluxo: {e}")
        raise HTTPException(status_code=400, detail="Erro ao carregar fluxo.")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
