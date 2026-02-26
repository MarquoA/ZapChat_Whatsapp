from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.database import get_db_connection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str

class UsuarioLogin(BaseModel):
    email: str
    senha: str

@app.post("/register")
async def register(usuario: UsuarioCreate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")
    
    cursor = conn.cursor()
    try:
        sql = "INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)"
        values = (usuario.nome, usuario.email, usuario.senha)
        cursor.execute(sql, values)
        conn.commit()
        return {"message": "Usuário cadastrado com sucesso!"}
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
        sql = "SELECT * FROM usuarios WHERE email = %s AND senha = %s"
        cursor.execute(sql, (usuario.email, usuario.senha))
        user = cursor.fetchone()
        
        if user:
            return {"message": "Login realizado com sucesso!", "user": user["nome"]}
        else:
            raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)