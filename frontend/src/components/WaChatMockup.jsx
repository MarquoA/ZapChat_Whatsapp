import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── CONVERSA DA VETERINÁRIA ──────────────────────────────────────────────────
const CONVERSA = [
  { de: 'bot', texto: 'Bem-vindo a *Clinica Vet Vida*!\n\nComo posso te ajudar hoje?\n\n1 - Agendar consulta\n2 - Resultado de exames\n3 - Vacinas e prevencao\n4 - Falar com atendente', delay: 600 },
  { de: 'user', texto: '1', delay: 1800 },
  { de: 'bot', texto: 'Otimo! Vamos agendar sua consulta.\n\nQual e o nome do seu pet?', delay: 1200 },
  { de: 'user', texto: 'Meu cachorro se chama Thor', delay: 2000 },
  { de: 'bot', texto: 'Que nome incrivel para um pet!\n\nQual especialidade voce precisa?\n\n1 - Clinico Geral\n2 - Dermatologia\n3 - Cardiologia\n4 - Ortopedia', delay: 1400 },
  { de: 'user', texto: '1', delay: 1800 },
  { de: 'bot', texto: 'Perfeito! Horarios disponiveis para *Clinico Geral*:\n\n1 - Hoje as 15h00\n2 - Amanha as 09h30\n3 - Amanha as 14h00', delay: 1300 },
  { de: 'user', texto: '2', delay: 2100 },
  { de: 'bot', texto: '*Consulta confirmada!*\n\nAmanha as 09h30\nPet: Thor\nDr. Rodrigo Alves\nRua das Flores, 142\n\nVoce recebera um lembrete 1h antes. Ate amanha!', delay: 1500 },
];

const formatarTexto = (texto) => {
  const partes = texto.split(/(\*[^*]+\*)/g);
  return partes.map((parte, i) => {
    if (parte.startsWith('*') && parte.endsWith('*')) {
      return <strong key={i}>{parte.slice(1, -1)}</strong>;
    }
    return parte.split('\n').map((linha, j, arr) => (
      <React.Fragment key={`${i}-${j}`}>
        {linha}{j < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  });
};

const horaFmt = (offset = 0) => {
  const d = new Date(Date.now() - offset);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const Bolha = ({ msg, index }) => {
  const isBot = msg.de === 'bot';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end',
        marginBottom: 4,
        paddingLeft: isBot ? 0 : 40,
        paddingRight: isBot ? 40 : 0,
      }}
    >
      {isBot && (
        <div style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', fontWeight: 900, color: '#fff',
          marginRight: 6, marginTop: 2, alignSelf: 'flex-end',
        }}>V</div>
      )}
      <div style={{
        maxWidth: '82%',
        background: isBot ? '#ffffff' : '#dcf8c6',
        borderRadius: isBot ? '0px 12px 12px 12px' : '12px 0px 12px 12px',
        padding: '8px 10px 5px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.13)',
      }}>
        <p style={{ fontSize: '0.78rem', color: '#111', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
          {formatarTexto(msg.texto)}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 3 }}>
          <span style={{ fontSize: '0.58rem', color: 'rgba(0,0,0,0.38)' }}>
            {horaFmt((CONVERSA.length - index) * 90000)}
          </span>
          {!isBot && (
            <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
              <path d="M1 4.5L4 7.5L9 1.5" stroke="#4FC3F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 4.5L8 7.5L13 1.5" stroke="#4FC3F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Digitando = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
    style={{ display: 'flex', alignItems: 'flex-end', gap: 6, paddingBottom: 4 }}
  >
    <div style={{
      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #25D366, #128C7E)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.7rem', fontWeight: 900, color: '#fff',
    }}>V</div>
    <div style={{
      background: '#fff', borderRadius: '0px 12px 12px 12px',
      padding: '10px 14px', boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
      display: 'flex', gap: 4, alignItems: 'center',
    }}>
      {[0, 0.18, 0.36].map((d, i) => (
        <motion.span key={i}
          style={{ width: 6, height: 6, borderRadius: '50%', background: '#aaa', display: 'block' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.7, delay: d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  </motion.div>
);

export default function WaChatMockup() {
  const [visiveis, setVisiveis]   = useState([]);
  const [digitando, setDigitando] = useState(false);
  const [rodando, setRodando]     = useState(false);
  const endRef                    = useRef(null);
  const containerRef              = useRef(null);
  const timerRef                  = useRef([]);

  // Rola APENAS o container interno — nunca a página
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visiveis, digitando]);

  const iniciar = () => {
    if (rodando) return;
    setRodando(true);
    setVisiveis([]);
    setDigitando(false);
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    let acumulado = 400;
    CONVERSA.forEach((msg, idx) => {
      if (msg.de === 'bot') {
        const t1 = setTimeout(() => setDigitando(true), acumulado);
        timerRef.current.push(t1);
        acumulado += msg.delay;
      } else {
        acumulado += msg.delay;
      }
      const t2 = setTimeout(() => {
        setDigitando(false);
        setVisiveis(prev => [...prev, { ...msg, idx }]);
      }, acumulado);
      timerRef.current.push(t2);
      acumulado += 200;
    });

    const tFim = setTimeout(() => setRodando(false), acumulado + 500);
    timerRef.current.push(tFim);
  };

  useEffect(() => {
    iniciar();
    return () => timerRef.current.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 340, margin: '0 auto', userSelect: 'none' }}>
      <div style={{ position: 'absolute', inset: -1, borderRadius: 22, boxShadow: '0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 1, borderRadius: 22, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#e5ddd5', fontFamily: "'Segoe UI', system-ui, sans-serif" }}
      >
        {/* Header */}
        <div style={{ background: '#075e54', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" style={{ flexShrink: 0 }}>
            <path d="M9 1L2 8L9 15" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900, color: '#fff', border: '2px solid rgba(255,255,255,0.2)' }}>V</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem', margin: 0, lineHeight: 1.2 }}>Clinica Vet Vida</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#25D366', flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}>
                {digitando ? 'digitando...' : 'online'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, opacity: 0.7 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
          </div>
        </div>

        {/* Data */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <span style={{ background: 'rgba(255,255,255,0.75)', borderRadius: 8, padding: '2px 10px', fontSize: '0.62rem', color: '#555' }}>HOJE</span>
        </div>

        {/* Mensagens — containerRef aqui, não endRef */}
        <div
          ref={containerRef}
          style={{ height: 420, overflowY: 'auto', padding: '4px 12px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', scrollbarWidth: 'none' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatePresence>
              {visiveis.map((msg, i) => (
                <Bolha key={`${msg.idx}-${i}`} msg={msg} index={i} />
              ))}
            </AnimatePresence>
            <AnimatePresence>
              {digitando && <Digitando key="digitando" />}
            </AnimatePresence>
            <div ref={endRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{ background: '#f0f0f0', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 22, padding: '8px 14px', fontSize: '0.78rem', color: '#aaa', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
            Mensagem
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#075e54', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
          </div>
        </div>
      </motion.div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4, type: 'spring', stiffness: 200 }}
        style={{ position: 'absolute', top: -12, right: -12, background: '#25D366', color: '#064e3b', padding: '4px 12px', borderRadius: 20, fontSize: '0.5rem', fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', zIndex: 20, boxShadow: '0 4px 14px rgba(37,211,102,0.5)', whiteSpace: 'nowrap' }}
      >
        Automatizado pelo ZapChat
      </motion.div>

      {/* Replay */}
      {!rodando && visiveis.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          onClick={iniciar}
          style={{ position: 'absolute', bottom: -44, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', padding: '6px 18px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: 0.5 }}
        >
          Repetir demonstracao
        </motion.button>
      )}
    </div>
  );
}