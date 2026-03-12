import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ZapChatLogo from '../components/ZapChatLogo';

const Sobre = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', empresa: '', mensagem: '' });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.mensagem) return setErro('Preencha todos os campos obrigatórios.');
    setErro('');
    setEnviando(true);
    await new Promise(r => setTimeout(r, 1500));
    setEnviando(false);
    setEnviado(true);
    setForm({ nome: '', email: '', empresa: '', mensagem: '' });
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', padding: '13px 15px',
    borderRadius: '10px', color: 'white', outline: 'none', fontSize: '0.9rem',
    transition: '0.2s', boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.68rem', opacity: 0.4, marginBottom: '7px',
    textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px',
  };

  const canais = [
    { label: 'WhatsApp', value: '+55 (XX) XXXXX-XXXX', sub: 'Seg–Sex, 9h às 18h' },
    { label: 'E-mail',   value: 'contato@zapchat.com.br', sub: 'Resposta em até 4 horas' },
    { label: 'Localização', value: 'São Paulo, SP — Brasil', sub: 'Atendimento 100% remoto' },
  ];

  const valores = [
    { titulo: "Transparência", texto: "Comunicamos abertamente o que funciona, o que ainda estamos construindo e o que planejamos melhorar. Sem promessas vazias." },
    { titulo: "Simplicidade",  texto: "Acreditamos que uma ferramenta poderosa não precisa ser complicada. Cada decisão de produto é guiada por facilidade de uso." },
    { titulo: "Proximidade",   texto: "Somos uma equipe pequena e acessível. Cada mensagem enviada por um cliente é lida e respondida por alguém da equipe fundadora." },
  ];

  return (
    <div style={{ backgroundColor: '#0a0f0a', color: 'white', overflowX: 'hidden', minHeight: '100vh' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        input:focus, textarea:focus { border-color: rgba(37,211,102,0.35) !important; }
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .sobre-hero-inner { flex-direction: column !important; gap: 40px !important; }
          .logo-sobre { display: none !important; }
          .valores-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr !important; }
          .section-pad { padding-left: 6% !important; padding-right: 6% !important; }
          .form-inner { padding: 32px 22px !important; }
        }
      `}</style>

      <Navbar />

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(37,211,102,0.04) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />

      <main style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ── */}
        <section className="section-pad" style={{ padding: '180px 10% 80px' }}>
          <div className="sobre-hero-inner" style={{ display: 'flex', alignItems: 'center', gap: '80px' }}>
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ flex: 1 }}>
              <span style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: '18px' }}>Contato</span>
              <h1 style={{ fontSize: 'clamp(2.6rem, 6vw, 4.5rem)', fontWeight: '900', letterSpacing: '-3px', lineHeight: '0.95', margin: '0 0 26px' }}>
                Vamos conversar<br />
                <span style={{ color: '#25D366' }}>sobre o seu negócio.</span>
              </h1>
              <p style={{ fontSize: '1.02rem', opacity: 0.5, maxWidth: '480px', lineHeight: '1.75', margin: 0 }}>
                Tem dúvidas sobre o ZapChat, quer uma demonstração ou precisa de um plano personalizado? Nossa equipe responde em até 4 horas nos dias úteis.
              </p>
            </motion.div>

            <div className="logo-sobre" style={{ flex: '0 0 auto' }}>
              <ZapChatLogo size={240} />
            </div>
          </div>
        </section>

        {/* ── CONTATO PRINCIPAL ── */}
        <section className="section-pad" style={{ padding: '0 10% 100px' }}>
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '70px', alignItems: 'start' }}>

            {/* Canais */}
            <motion.div initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '28px', letterSpacing: '-0.5px' }}>
                Canais de atendimento
              </h2>

              {canais.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', padding: '18px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0, background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#25D366', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{item.label.slice(0, 2)}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.68rem', opacity: 0.38, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>{item.label}</p>
                    <p style={{ fontWeight: '700', marginBottom: '2px', fontSize: '0.9rem' }}>{item.value}</p>
                    <p style={{ fontSize: '0.78rem', opacity: 0.32 }}>{item.sub}</p>
                  </div>
                </motion.div>
              ))}

              <div style={{ marginTop: '28px', padding: '22px', background: 'rgba(37,211,102,0.04)', borderRadius: '16px', border: '1px solid rgba(37,211,102,0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25D366', animation: 'pulse-dot 2s infinite', flexShrink: 0 }} />
                  <p style={{ color: '#25D366', fontWeight: '800', fontSize: '0.85rem', margin: 0 }}>Estamos no Beta</p>
                </div>
                <p style={{ opacity: 0.45, fontSize: '0.83rem', lineHeight: '1.65', margin: 0 }}>
                  Somos uma equipe pequena e comprometida. Cada mensagem é lida e respondida pessoalmente por alguém da equipe fundadora.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => window.open('https://wa.me/5511999999999?text=Olá%2C%20gostaria%20de%20saber%20mais%20sobre%20o%20ZapChat!', '_blank')}
                style={{ marginTop: '24px', width: '100%', background: '#25D366', color: '#0a0f0a', padding: '14px', borderRadius: '10px', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '0.88rem' }}
              >
                FALAR PELO WHATSAPP
              </motion.button>
            </motion.div>

            {/* Formulário */}
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="form-inner"
              style={{ padding: '46px', background: 'rgba(255,255,255,0.02)', borderRadius: '26px', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {enviado ? (
                <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: '1.5rem' }}>✓</div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '12px' }}>Mensagem enviada!</h3>
                  <p style={{ opacity: 0.45, lineHeight: '1.65', marginBottom: '28px' }}>Recebemos seu contato e retornaremos em até 4 horas. Obrigado pelo interesse no ZapChat.</p>
                  <motion.button whileHover={{ scale: 1.03 }} onClick={() => setEnviado(false)}
                    style={{ background: '#25D366', color: '#0a0f0a', padding: '13px 28px', borderRadius: '10px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
                  >ENVIAR OUTRA MENSAGEM</motion.button>
                </motion.div>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>Envie uma mensagem</h3>
                  <p style={{ opacity: 0.38, fontSize: '0.82rem', marginBottom: '28px', lineHeight: '1.6' }}>Preencha o formulário e retornamos em até 4 horas nos dias úteis.</p>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={labelStyle}>Nome *</label>
                        <input name="nome" type="text" value={form.nome} onChange={handleChange} placeholder="Seu nome" style={inputStyle} required />
                      </div>
                      <div>
                        <label style={labelStyle}>E-mail *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" style={inputStyle} required />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Empresa</label>
                      <input name="empresa" type="text" value={form.empresa} onChange={handleChange} placeholder="Nome da empresa (opcional)" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Mensagem *</label>
                      <textarea name="mensagem" value={form.mensagem} onChange={handleChange}
                        placeholder="Conte um pouco sobre seu negócio e o que você precisa. Quanto mais detalhes, melhor podemos ajudar."
                        rows={5} required style={{ ...inputStyle, resize: 'vertical', minHeight: '120px', fontFamily: 'inherit' }}
                      />
                    </div>
                    {erro && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ color: '#ff4b4b', fontSize: '0.82rem', fontWeight: '600', margin: 0 }}
                      >{erro}</motion.p>
                    )}
                    <motion.button type="submit" disabled={enviando}
                      whileHover={{ scale: enviando ? 1 : 1.02, boxShadow: '0 0 28px rgba(37,211,102,0.2)' }}
                      whileTap={{ scale: 0.98 }}
                      style={{ background: enviando ? 'rgba(37,211,102,0.45)' : '#25D366', color: '#0a0f0a', padding: '15px', borderRadius: '10px', fontWeight: '900', border: 'none', cursor: enviando ? 'not-allowed' : 'pointer', fontSize: '0.88rem', marginTop: '4px', transition: '0.3s' }}
                    >{enviando ? 'ENVIANDO...' : 'ENVIAR MENSAGEM'}</motion.button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── SOBRE A EMPRESA ── */}
        <section className="section-pad" style={{ padding: '80px 10%', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <span style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: '16px', textAlign: 'center' }}>Sobre o ZapChat</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '900', letterSpacing: '-1px', marginBottom: '20px', lineHeight: '1.1', textAlign: 'center' }}>
              Nascemos para resolver um problema real.
            </h2>
            <p style={{ opacity: 0.5, lineHeight: '1.8', fontSize: '0.95rem', marginBottom: '16px' }}>
              O ZapChat nasceu da frustração de ver pequenas e médias empresas perdendo clientes por não conseguir responder rápido o suficiente no WhatsApp. Vimos donos de negócio respondendo mensagens às 23h, perdendo vendas por demora no retorno, e pagando caro por ferramentas que precisavam de um técnico para configurar.
            </p>
            <p style={{ opacity: 0.5, lineHeight: '1.8', fontSize: '0.95rem', marginBottom: '36px' }}>
              Criamos uma plataforma que qualquer pessoa consegue usar em minutos — sem código, sem técnico, sem complicação. Estamos no início da nossa jornada, construindo junto com nossos primeiros clientes. Cada feedback é levado a sério.
            </p>
          </div>

          {/* Valores */}
          <div className="valores-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '900px', margin: '0 auto 44px' }}>
            {valores.map((v, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <h4 style={{ color: '#25D366', marginBottom: '10px', fontSize: '0.92rem', fontWeight: '800' }}>{v.titulo}</h4>
                <p style={{ fontSize: '0.82rem', opacity: 0.42, lineHeight: '1.65', margin: 0 }}>{v.texto}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/cadastrar')}
              style={{ background: 'transparent', color: '#25D366', padding: '14px 36px', borderRadius: '10px', fontWeight: '700', border: '1px solid rgba(37,211,102,0.35)', cursor: 'pointer', fontSize: '0.88rem', transition: '0.3s' }}
            >FAZER PARTE DO BETA →</motion.button>
          </div>
        </section>
      </main>

      <footer className="section-pad" style={{ padding: '36px 10%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ opacity: 0.18, fontSize: '0.73rem', margin: 0 }}>© 2026 ZAPCHAT TECNOLOGIA LTDA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Sobre;