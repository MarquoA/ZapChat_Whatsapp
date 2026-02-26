import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/register', {
        nome: nome,
        email: email,
        senha: senha
      });
      alert(response.data.message);
      navigate('/login');
    } catch (error) {
      alert("Erro no cadastro: " + (error.response?.data?.detail || "Erro desconhecido"));
    }
  };

  return (
    <div style={{ backgroundColor: '#0d140d', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '20px' }}>
        
        <div style={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px', 
          background: 'radial-gradient(circle, rgba(37, 211, 102, 0.05) 0%, transparent 70%)',
          zIndex: 0 
        }} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            width: '100%', maxWidth: '420px', padding: '60px 40px', 
            background: 'rgba(255,255,255,0.02)', borderRadius: '40px',
            border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
            zIndex: 1, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '40px', letterSpacing: '-1.5px' }}>
              ZAP<span style={{ color: '#25D366' }}>CHAT</span>
            </h2>
          </Link>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>Criar conta</h3>
            <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>Cadastre-se para começar a usar o chat.</p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.3, textTransform: 'uppercase', marginLeft: '5px', display: 'block', marginBottom: '8px' }}>Nome Completo</label>
              <input 
                type="text" 
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                style={{ 
                  width: '100%', padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', 
                  background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box'
                }} 
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.3, textTransform: 'uppercase', marginLeft: '5px', display: 'block', marginBottom: '8px' }}>E-mail</label>
              <input 
                type="email" 
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ 
                  width: '100%', padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', 
                  background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box'
                }} 
              />
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.3, textTransform: 'uppercase', marginLeft: '5px', display: 'block', marginBottom: '8px' }}>Senha</label>
              <input 
                type="password" 
                placeholder="Crie uma senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                style={{ 
                  width: '100%', padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', 
                  background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box'
                }} 
              />
            </div>

            <button 
              type="submit"
              style={{ 
                marginTop: '15px', padding: '20px', borderRadius: '15px', border: 'none',
                background: '#25D366', color: '#0d140d', fontWeight: '900',
                cursor: 'pointer', fontSize: '1rem', transition: '0.3s'
              }}
            >
              CRIAR CONTA AGORA
            </button>
          </form>

          <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '0.85rem', opacity: 0.4 }}>
              Já possui uma conta? <br/>
              <Link to="/login" style={{ color: '#25D366', textDecoration: 'none', fontWeight: '700' }}>Fazer login</Link>
            </p>
          </div>
        </motion.div>

        <Link to="/" style={{ 
          position: 'absolute', bottom: '40px', color: 'rgba(255,255,255,0.2)', 
          textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' 
        }}>
          ← Voltar para o site principal
        </Link>
      </main>
    </div>
  );
};

export default Register;