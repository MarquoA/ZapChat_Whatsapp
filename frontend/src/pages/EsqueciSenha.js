// src/pages/EsqueciSenha.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const EsqueciSenha = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/esqueci-senha`, { email });
      setEnviado(true);
    } catch (error) {
      setErro(error.response?.data?.detail || 'Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
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
            {!enviado ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>Esqueci minha senha</h3>
                  <p style={{ opacity: 0.4, fontSize: '0.9rem', lineHeight: '1.6' }}>
                    Digite seu e-mail e enviaremos um link para você criar uma nova senha.
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.3, textTransform: 'uppercase', marginLeft: '5px', display: 'block', marginBottom: '8px' }}>E-mail</label>
                    <input type="email" placeholder="seu@email.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} required
                      style={{ width: '100%', padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>

                  {erro && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.3)', borderRadius: '10px', padding: '12px', fontSize: '0.82rem', color: '#ff4b4b', textAlign: 'left' }}>
                      {erro}
                    </motion.div>
                  )}

                  <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }}
                    style={{ marginTop: '10px', padding: '20px', borderRadius: '15px', border: 'none', background: loading ? 'rgba(37,211,102,0.5)' : '#25D366', color: '#0d140d', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: '0.3s' }}>
                    {loading ? 'ENVIANDO...' : 'ENVIAR LINK DE REDEFINIÇÃO'}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="sucesso" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '1.8rem' }}>
                    ✉️
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '12px' }}>Verifique seu e-mail</h3>
                  <p style={{ opacity: 0.45, fontSize: '0.88rem', lineHeight: '1.7' }}>
                    Se <strong style={{ color: 'white', opacity: 1 }}>{email}</strong> estiver cadastrado, você receberá um link em instantes.<br /><br />
                    Verifique também a pasta de spam.
                  </p>
                </div>
                <div style={{ padding: '16px', background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '12px', marginBottom: '28px' }}>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: '1.6' }}>
                    O link expira em <strong style={{ color: '#25D366' }}>2 horas</strong>. Se não receber, tente novamente.
                  </p>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} onClick={() => { setEnviado(false); setEmail(''); }}
                  style={{ width: '100%', padding: '16px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', transition: '0.2s' }}>
                  Reenviar para outro e-mail
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Link to="/login" style={{ color: '#25D366', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}>
              ← Voltar para o login
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default EsqueciSenha;