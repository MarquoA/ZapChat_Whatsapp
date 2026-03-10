// src/pages/RedefinirSenha.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const RedefinirSenha = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [validando, setValidando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState('');

  // Valida o token ao carregar a página
  useEffect(() => {
    if (!token) { setValidando(false); setTokenValido(false); return; }
    axios.get(`${API_URL}/redefinir-senha/validar?token=${token}`)
      .then(res => setTokenValido(res.data.valido))
      .catch(() => setTokenValido(false))
      .finally(() => setValidando(false));
  }, [token]);

  const forca = novaSenha.length === 0 ? null : novaSenha.length < 6 ? 'fraca' : novaSenha.length < 10 ? 'media' : 'forte';
  const forcaCor   = { fraca: '#ff4b4b', media: '#f0a500', forte: '#25D366' };
  const forcaLabel = { fraca: 'Fraca', media: 'Média', forte: 'Forte' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (novaSenha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.');
    if (novaSenha !== confirmarSenha) return setErro('As senhas não coincidem.');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/redefinir-senha`, { token, nova_senha: novaSenha });
      setConcluido(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setErro(error.response?.data?.detail || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderConteudo = () => {
    // Carregando validação
    if (validando) {
      return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid rgba(37,211,102,0.2)', borderTop: '3px solid #25D366', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>Verificando link...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    // Token inválido ou expirado
    if (!tokenValido) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '12px' }}>Link inválido ou expirado</h3>
          <p style={{ opacity: 0.4, fontSize: '0.88rem', lineHeight: '1.7', marginBottom: '28px' }}>
            Este link de redefinição não é mais válido.<br />Solicite um novo link para continuar.
          </p>
          <Link to="/esqueci-senha"
            style={{ display: 'block', background: '#25D366', color: '#0d140d', padding: '16px', borderRadius: '12px', fontWeight: '900', textDecoration: 'none', fontSize: '0.9rem' }}>
            SOLICITAR NOVO LINK
          </Link>
        </motion.div>
      );
    }

    // Concluído
    if (concluido) {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '1.8rem' }}>
            ✅
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '12px' }}>Senha redefinida!</h3>
          <p style={{ opacity: 0.45, fontSize: '0.88rem', lineHeight: '1.7' }}>
            Sua senha foi alterada com sucesso.<br />
            Redirecionando para o login em instantes...
          </p>
        </motion.div>
      );
    }

    // Formulário
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>Criar nova senha</h3>
          <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>Escolha uma senha forte para proteger sua conta.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.3, textTransform: 'uppercase', marginLeft: '5px', display: 'block', marginBottom: '8px' }}>Nova Senha</label>
            <input type="password" placeholder="Crie uma senha forte" value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)} required
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
              style={{ width: '100%', padding: '18px', borderRadius: '15px', border: `1px solid ${confirmarSenha && novaSenha !== confirmarSenha ? 'rgba(255,75,75,0.4)' : 'rgba(255,255,255,0.08)'}`, background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            {confirmarSenha && novaSenha !== confirmarSenha && (
              <p style={{ fontSize: '0.72rem', color: '#ff4b4b', marginTop: '5px', marginLeft: '5px' }}>As senhas não coincidem</p>
            )}
          </div>

          {erro && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.3)', borderRadius: '10px', padding: '12px', fontSize: '0.82rem', color: '#ff4b4b', textAlign: 'left' }}>
              {erro}
            </motion.div>
          )}

          <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }}
            style={{ marginTop: '10px', padding: '20px', borderRadius: '15px', border: 'none', background: loading ? 'rgba(37,211,102,0.5)' : '#25D366', color: '#0d140d', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: '0.3s' }}>
            {loading ? 'SALVANDO...' : 'SALVAR NOVA SENHA'}
          </motion.button>
        </form>
      </motion.div>
    );
  };

  return (
    <div style={{ backgroundColor: '#0d140d', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '20px' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37,211,102,0.05) 0%, transparent 70%)', zIndex: 0 }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '420px', padding: '60px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', zIndex: 1, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>

          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '40px', letterSpacing: '-1.5px' }}>
              ZAP<span style={{ color: '#25D366' }}>CHAT</span>
            </h2>
          </Link>

          <AnimatePresence mode="wait">
            <motion.div key={validando ? 'loading' : tokenValido ? (concluido ? 'ok' : 'form') : 'invalido'}>
              {renderConteudo()}
            </motion.div>
          </AnimatePresence>

          {!validando && tokenValido && !concluido && (
            <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Link to="/login" style={{ color: '#25D366', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}>
                ← Voltar para o login
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default RedefinirSenha;