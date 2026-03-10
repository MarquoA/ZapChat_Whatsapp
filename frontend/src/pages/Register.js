import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // Se veio de um plano específico, guarda para redirecionar depois
  const plano    = searchParams.get('plano');
  const periodo  = searchParams.get('periodo');
  const redirectTo = plano && periodo
    ? `/assinar?plano=${plano}&periodo=${periodo}`
    : '/assinar';

  const handleRegister = async (e) => {
    e.preventDefault();
    setErro('');

    if (senha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.');
    if (senha !== confirmarSenha) return setErro('As senhas não coincidem.');

    setLoading(true);
    try {
      // 1. Cadastra o usuário
      await axios.post(`${API_URL}/register`, { nome, email, senha });

      // 2. Faz login automático
      const loginResp = await axios.post(`${API_URL}/login`, { email, senha });
      localStorage.setItem('token', loginResp.data.token);
      localStorage.setItem('usuario_id', loginResp.data.id);
      localStorage.setItem('usuario_nome', loginResp.data.user);

      // 3. Redireciona para /assinar (com plano se veio de um botão específico)
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErro(error.response?.data?.detail || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const forca = senha.length === 0 ? null : senha.length < 6 ? 'fraca' : senha.length < 10 ? 'media' : 'forte';
  const forcaCor   = { fraca: '#ff4b4b', media: '#f0a500', forte: '#25D366' };
  const forcaLabel = { fraca: 'Fraca', media: 'Média', forte: 'Forte' };

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
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>Criar conta</h3>
            <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>Cadastre-se para começar a usar o Zapchat.</p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.3, textTransform: 'uppercase', marginLeft: '5px', display: 'block', marginBottom: '8px' }}>Nome Completo</label>
              <input type="text" placeholder="Seu nome" value={nome}
                onChange={(e) => setNome(e.target.value)} required
                style={{ width: '100%', padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.3, textTransform: 'uppercase', marginLeft: '5px', display: 'block', marginBottom: '8px' }}>E-mail</label>
              <input type="email" placeholder="seu@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.3, textTransform: 'uppercase', marginLeft: '5px', display: 'block', marginBottom: '8px' }}>Senha</label>
              <input type="password" placeholder="Crie uma senha forte" value={senha}
                onChange={(e) => setSenha(e.target.value)} required
                style={{ width: '100%', padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              {forca && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ height: '100%', borderRadius: '2px', background: forcaCor[forca], width: forca === 'fraca' ? '33%' : forca === 'media' ? '66%' : '100%', transition: '0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: forcaCor[forca], fontWeight: '700' }}>{forcaLabel[forca]}</span>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.3, textTransform: 'uppercase', marginLeft: '5px', display: 'block', marginBottom: '8px' }}>Confirmar Senha</label>
              <input type="password" placeholder="Repita a senha" value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)} required
                style={{ width: '100%', padding: '18px', borderRadius: '15px', border: `1px solid ${confirmarSenha && senha !== confirmarSenha ? 'rgba(255,75,75,0.4)' : 'rgba(255,255,255,0.08)'}`, background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              {confirmarSenha && senha !== confirmarSenha && (
                <p style={{ fontSize: '0.72rem', color: '#ff4b4b', marginTop: '5px', marginLeft: '5px' }}>As senhas não coincidem</p>
              )}
            </div>

            {erro && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.3)', borderRadius: '10px', padding: '12px', fontSize: '0.82rem', color: '#ff4b4b', textAlign: 'left' }}>
                ❌ {erro}
              </motion.div>
            )}

            <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }}
              style={{ marginTop: '15px', padding: '20px', borderRadius: '15px', border: 'none', background: loading ? 'rgba(37,211,102,0.5)' : '#25D366', color: '#0d140d', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: '0.3s' }}>
              {loading ? 'CRIANDO CONTA...' : 'CRIAR CONTA AGORA'}
            </motion.button>
          </form>

          <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '0.85rem', opacity: 0.4 }}>
              Já possui uma conta? <br />
              <Link to="/login" style={{ color: '#25D366', textDecoration: 'none', fontWeight: '700' }}>Fazer login</Link>
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

export default Register;