from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.database import get_db_connection
from app.routes.fluxo_routes import router as fluxo_router
from app.routes.usuario_routes import router as usuario_router
from app.routes.instancia_routes import router as instancia_router
from app.routes.bot_routes import router as bot_router
from app.routes.pagamento_routes import router as pagamento_router
from app.routes.esqueci_senha_routes import router as esqueci_router
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import json

SECRET_KEY = "zapchat_senha_MmC"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fluxo_router)
app.include_router(usuario_router)
app.include_router(instancia_router)
app.include_router(bot_router)
app.include_router(pagamento_router)
app.include_router(esqueci_router)

class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str

class UsuarioLogin(BaseModel):
    email: str
    senha: str

@app.post("/register")
async def register(usuario: UsuarioCreate):
    if len(usuario.senha) < 6:
        raise HTTPException(status_code=400, detail="A senha deve ter pelo menos 6 caracteres.")
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")
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
        return {"message": "Usuário cadastrado com sucesso!"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Erro: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.post("/login")
async def login(usuario: UsuarioLogin):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuario.email,))
        user = cursor.fetchone()
        if not user or not verificar_senha(usuario.senha, user["senha"]):
            raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
        token = criar_token({"sub": str(user["id"]), "nome": user["nome"]})
        return {
            "message": "Login realizado com sucesso!",
            "token": token,
            "user": user["nome"],
            "id": user["id"]
        }
    finally:
        cursor.close()
        conn.close()

@app.get("/me")
async def me(usuario: dict = Depends(get_usuario_atual)):
    return {"usuario_id": usuario["sub"], "nome": usuario["nome"]}

class FluxoDados(BaseModel):
    usuario_id: int
    nome_fluxo: str
    fluxo: dict

@app.post("/salvar-fluxo")
async def salvar_fluxo(dados: FluxoDados):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")
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
        raise HTTPException(status_code=400, detail=f"Erro ao salvar: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.get("/carregar-fluxo/{usuario_id}")
async def carregar_fluxo(usuario_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")
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
        raise HTTPException(status_code=400, detail=f"Erro ao carregar: {str(e)}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)