// src/pages/NotFound.js
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Animação de partículas no fundo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    Math.random() * 1.5 + 0.3,
      dx:   (Math.random() - 0.5) * 0.4,
      dy:   (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37,211,102,${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0f0a', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Partículas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* Brilho verde atrás do 404 */}
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,211,102,0.08) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px' }}>

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', marginBottom: '60px', display: 'inline-block' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '-1px', fontFamily: "'Syne', sans-serif" }}>
            ZAP<span style={{ color: '#25D366' }}>CHAT</span>
          </span>
        </motion.div>

        {/* 404 gigante */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ position: 'relative', marginBottom: '8px' }}>
          <h1 style={{ fontSize: 'clamp(120px, 20vw, 220px)', fontWeight: '900', letterSpacing: '-8px', lineHeight: 1, fontFamily: "'Syne', sans-serif", background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.15) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, userSelect: 'none' }}>
            404
          </h1>
          {/* Linha verde embaixo do 404 */}
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
            style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #25D366, transparent)', marginTop: '-10px' }} />
        </motion.div>

        {/* Mensagem */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', fontWeight: '700', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Página não encontrada
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.35, maxWidth: '380px', margin: '0 auto 48px', lineHeight: '1.7' }}>
            O link que você acessou não existe ou foi removido. Verifique o endereço ou volte para o início.
          </p>
        </motion.div>

        {/* Botões */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}
          style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(37,211,102,0.25)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            style={{ background: '#25D366', color: '#0a0f0a', border: 'none', padding: '14px 32px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem', letterSpacing: '0.5px', fontFamily: "'DM Sans', sans-serif" }}>
            VOLTAR PARA O INÍCIO
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, borderColor: 'rgba(37,211,102,0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 32px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', transition: '0.2s', fontFamily: "'DM Sans', sans-serif" }}>
            PÁGINA ANTERIOR
          </motion.button>
        </motion.div>

        {/* Rodapé discreto */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ marginTop: '80px', fontSize: '0.7rem', opacity: 0.15, letterSpacing: '1px' }}>
          © 2026 ZAPCHAT — TODOS OS DIREITOS RESERVADOS
        </motion.p>
      </div>
    </div>
  );
};

export default NotFound;