import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
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
              ZAP<span style={{ color: 'var(--brand-green)' }}>CHAT</span>
            </h2>
          </Link>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>Entrar na plataforma</h3>
            <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>Insira seus dados para acessar o painel.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.3, textTransform: 'uppercase', marginLeft: '5px', display: 'block', marginBottom: '8px' }}>E-mail</label>
              <input 
                type="email" 
                placeholder="seu@email.com"
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
                placeholder="••••••••"
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
                background: 'var(--brand-green)', color: '#0d140d', fontWeight: '900',
                cursor: 'pointer', fontSize: '1rem', transition: '0.3s'
              }}
            >
              ACESSAR DASHBOARD
            </button>
          </form>

          <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '0.85rem', opacity: 0.4 }}>
              Ainda não tem acesso? <br/>
              <Link to="/sobre" style={{ color: 'var(--brand-green)', textDecoration: 'none', fontWeight: '700' }}>Conheça nossos planos</Link>
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

export default Login;