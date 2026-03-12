import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CookieBanner = () => {
  const [visivel, setVisivel] = useState(false);
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    const decisao = localStorage.getItem('zapchat_cookies');
    if (!decisao) {
      const timer = setTimeout(() => setVisivel(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const aceitar = () => {
    localStorage.setItem('zapchat_cookies', 'aceito');
    setVisivel(false);
  };

  const recusar = () => {
    localStorage.setItem('zapchat_cookies', 'recusado');
    setVisivel(false);
  };

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '600px',
            background: 'rgba(13, 20, 13, 0.98)',
            border: '1px solid rgba(37, 211, 102, 0.2)',
            borderRadius: '16px',
            padding: '16px 20px',
            zIndex: 9999,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            fontFamily: "'DM Sans', sans-serif",
          }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(37,211,102,0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <span style={{ fontSize: '1rem' }}>🍪</span>
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
                Privacidade
              </p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                Usamos cookies para melhorar sua experiência. 
                {' '}
                <button onClick={() => setExpandido(!expandido)}
                  style={{ background: 'none', border: 'none', color: '#25D366', cursor: 'pointer', padding: 0, fontSize: '0.78rem', textDecoration: 'underline' }}>
                  {expandido ? 'Ver menos' : 'Saiba mais'}
                </button>
              </p>

              <AnimatePresence>
                {expandido && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflowY: 'auto', maxHeight: '150px' }}>
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { emoji: '✅', nome: 'Essenciais', desc: 'Login e segurança.' },
                        { emoji: '📊', nome: 'Analíticos', desc: 'Melhorias de uso.' },
                      ].map(c => (
                        <div key={c.nome} style={{ display: 'flex', gap: '8px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.8rem' }}>{c.emoji}</span>
                          <div style={{ fontSize: '0.75rem' }}>
                            <span style={{ color: 'white', fontWeight: 700 }}>{c.nome}: </span>
                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{c.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginTop: '12px', 
            justifyContent: 'flex-end'
          }}>
            <button onClick={recusar}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 600
              }}>
              Recusar
            </button>
            <button onClick={aceitar}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: '#25D366', color: '#0d140d', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 800
              }}>
              Aceitar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;