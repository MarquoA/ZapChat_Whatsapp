import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // 2FA
  const [etapa, setEtapa] = useState('login'); // login | 2fa
  const [tempToken, setTempToken] = useState('');
  const [codigo2fa, setCodigo2fa] = useState('');

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, senha });
      if (response.data.requer_2fa) {
        setTempToken(response.data.temp_token);
        setEtapa('2fa');
        return;
      }
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario_id', response.data.id);
      localStorage.setItem('usuario_nome', response.data.user);
      localStorage.setItem('usuario_plano', response.data.plano);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErro(error.response?.data?.detail || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificar2fa = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login/verificar-2fa`, { temp_token: tempToken, codigo: codigo2fa });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario_id', response.data.id);
      localStorage.setItem('usuario_nome', response.data.user);
      localStorage.setItem('usuario_plano', response.data.plano);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErro(error.response?.data?.detail || 'Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0d140d', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '20px' }}>

        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37, 211, 102, 0.05) 0%, transparent 70%)', zIndex: 0 }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '420px', padding: '60px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', zIndex: 1, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>

          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '40px', letterSpacing: '-1.5px' }}>
              ZAP<span style={{ color: '#25D366' }}>CHAT</span>
            </h2>
          </Link>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>Entrar na plataforma</h3>
            <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>Insira seus dados para acessar o painel.</p>
          </div>

          {etapa === '2fa' ? (
            <form onSubmit={handleVerificar2fa} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔐</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>Verificação em duas etapas</h3>
                <p style={{ opacity: 0.45, fontSize: '0.85rem', lineHeight: 1.6 }}>
                  Enviamos um código de 6 dígitos para o seu e-mail. Insira-o abaixo.
                </p>
              </div>
              <input
                type="text" maxLength={6} placeholder="000000" value={codigo2fa}
                onChange={(e) => setCodigo2fa(e.target.value.replace(/\D/g, ''))} required
                style={{ width: '100%', padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '12px', textAlign: 'center', boxSizing: 'border-box' }}
              />
              {erro && (
                <div style={{ background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.3)', borderRadius: '10px', padding: '12px', fontSize: '0.82rem', color: '#ff4b4b' }}>{erro}</div>
              )}
              <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }}
                style={{ marginTop: '8px', padding: '20px', borderRadius: '15px', border: 'none', background: loading ? 'rgba(37,211,102,0.5)' : '#25D366', color: '#0d140d', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>
                {loading ? 'VERIFICANDO...' : 'CONFIRMAR CÓDIGO'}
              </motion.button>
              <button type="button" onClick={() => { setEtapa('login'); setCodigo2fa(''); setErro(''); }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', marginTop: 4 }}>
                Voltar ao login
              </button>
            </form>
          ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.3, textTransform: 'uppercase', marginLeft: '5px', display: 'block', marginBottom: '8px' }}>E-mail</label>
              <input type="email" placeholder="seu@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.3, textTransform: 'uppercase', marginLeft: '5px' }}>Senha</label>
                <Link to="/esqueci-senha" style={{ fontSize: '0.72rem', color: '#25D366', textDecoration: 'none', fontWeight: '600', opacity: 0.7 }}>
                  Esqueci minha senha
                </Link>
              </div>
              <input type="password" placeholder="••••••••" value={senha}
                onChange={(e) => setSenha(e.target.value)} required
                style={{ width: '100%', padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>

            {erro && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.3)', borderRadius: '10px', padding: '12px', fontSize: '0.82rem', color: '#ff4b4b', textAlign: 'left' }}>
                {erro}
              </motion.div>
            )}

            <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }}
              style={{ marginTop: '15px', padding: '20px', borderRadius: '15px', border: 'none', background: loading ? 'rgba(37,211,102,0.5)' : '#25D366', color: '#0d140d', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: '0.3s' }}>
              {loading ? 'ENTRANDO...' : 'ACESSAR DASHBOARD'}
            </motion.button>
          </form>
          )}

          <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '0.85rem', opacity: 0.4 }}>
              Ainda não tem acesso? <br />
              <Link to="/cadastrar" style={{ color: '#25D366', textDecoration: 'none', fontWeight: '700' }}>Crie sua conta agora</Link>
            </p>
          </div>
        </motion.div>

        <Link to="/" style={{ position: 'absolute', bottom: '40px', color: 'rgba(255,255,255,0.2)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}>
          ← Voltar para o site principal
        </Link>
      </main>
    </div>
  );
};

export default Login;