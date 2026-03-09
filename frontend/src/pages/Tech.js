import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardMockup from '../components/DashboardMockup';
import EditorMockup from '../components/EditorMockup';

const Tech = () => {
  const navigate = useNavigate();

  const steps = [
    { step: "01", icon: "📱", title: "Conecte seu número WhatsApp", description: "Escaneie o QR Code gerado pelo ZapChat com seu WhatsApp. A conexão é feita via API Cloud oficial da Meta — sem emuladores, sem gambiarras.", detail: "Leva menos de 2 minutos. Seu número é validado e protegido contra banimentos." },
    { step: "02", icon: "🗂️", title: "Crie seus fluxos no editor visual", description: "Use nosso editor de arrastar e soltar para montar o caminho que seu bot vai seguir. Defina mensagens, opções de resposta e delays para simular digitação humana.", detail: "Não precisa saber programar. Se você sabe usar um celular, sabe usar o ZapChat." },
    { step: "03", icon: "🤖", title: "Configure as respostas e a IA", description: "Adicione as informações da sua empresa, produtos e tom de voz. A IA aprende com o que você define e responde como se fosse um funcionário treinado.", detail: "A IA entra em ação quando o cliente faz uma pergunta fora do fluxo padrão. (Plano Pro)" },
    { step: "04", icon: "🚀", title: "Ative e monitore em tempo real", description: "Com tudo configurado, ative o bot e acompanhe os atendimentos pelo dashboard. Veja sessões ativas, fluxos criados e status da conexão.", detail: "Você pode pausar, editar ou trocar o fluxo a qualquer momento sem perder dados." },
  ];

  const techs = [
    { icon: "🔗", t: "API Cloud Meta", d: "Conexão direta e oficial. Zero risco de banimento." },
    { icon: "🔒", t: "Criptografia E2E", d: "Dados protegidos de ponta a ponta." },
    { icon: "⚡", t: "Uptime 99.9%", d: "Servidor dedicado. Sempre online." },
    { icon: "🧠", t: "IA Generativa", d: "Respostas humanizadas e contextuais." },
    { icon: "📲", t: "Multi-instância", d: "Vários números no mesmo painel." },
    { icon: "🔧", t: "Webhooks & API", d: "Integre com qualquer sistema externo." },
  ];

  return (
    <div style={{ backgroundColor: '#0a0f0a', color: 'white', overflowX: 'hidden', minHeight: '100vh' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @media (max-width: 900px) {
          .steps-layout { flex-direction: column !important; }
          .step-img { display: none !important; }
          .tech-security { flex-direction: column !important; }
          .security-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .tech-grid { grid-template-columns: 1fr 1fr !important; }
          .security-grid { grid-template-columns: 1fr !important; }
          .section-pad { padding-left: 6% !important; padding-right: 6% !important; }
          .cta-btns-tech { flex-direction: column !important; }
        }
      `}</style>
      <Navbar />

      <div style={{ position: 'fixed', top: 0, right: 0, width: '55%', height: '100vh', backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(37,211,102,0.05) 0%, transparent 55%)', pointerEvents: 'none', zIndex: 0 }} />

      <main style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ── */}
        <section className="section-pad" style={{ padding: '180px 10% 70px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: '18px' }}>Como Funciona</span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: '900', letterSpacing: '-3px', lineHeight: '1.05', margin: '0 0 20px' }}>
              De zero ao bot ativo<br /><span style={{ color: '#25D366' }}>em menos de 10 minutos.</span>
            </h1>
            <p style={{ fontSize: '1rem', opacity: 0.5, maxWidth: '520px', margin: '0 auto', lineHeight: '1.75' }}>
              Sem código. Sem técnicos. Sem complicação. Veja o passo a passo de como o ZapChat funciona na prática.
            </p>
          </motion.div>
        </section>

        {/* ── PASSO A PASSO + MOCKUPS ── */}
        <section className="section-pad" style={{ padding: '30px 10% 100px' }}>
          <div className="steps-layout" style={{ display: 'flex', gap: '80px', alignItems: 'flex-start' }}>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '27px', top: '56px', bottom: '20px', width: '2px', background: 'linear-gradient(to bottom, rgba(37,211,102,0.35), transparent)', zIndex: 0 }} />
              {steps.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  style={{ display: 'flex', gap: '26px', alignItems: 'flex-start', marginBottom: i < steps.length - 1 ? '44px' : 0, position: 'relative', zIndex: 1 }}
                >
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '9px' }}>
                      <span style={{ color: '#25D366', fontWeight: '900', fontSize: '0.7rem', letterSpacing: '1px' }}>PASSO {s.step}</span>
                      <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '9px' }}>{s.title}</h3>
                    <p style={{ opacity: 0.5, lineHeight: '1.7', marginBottom: '11px', fontSize: '0.9rem' }}>{s.description}</p>
                    <div style={{ padding: '12px 16px', background: 'rgba(37,211,102,0.04)', borderRadius: '10px', border: '1px solid rgba(37,211,102,0.1)', fontSize: '0.8rem', color: '#25D366', opacity: 0.85 }}>💡 {s.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Mockups empilhados substituindo as imagens ── */}
            <div className="step-img" style={{ flex: 1.1, position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <EditorMockup />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
                <DashboardMockup />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── TECNOLOGIA ── */}
        <section className="section-pad" style={{ padding: '80px 10%', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ marginBottom: '55px', textAlign: 'center' }}>
            <span style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Tecnologia</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)', fontWeight: '900', letterSpacing: '-1.5px', margin: '12px 0 0' }}>O que tem por baixo do capô.</h2>
          </div>
          <div className="tech-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '860px', margin: '0 auto' }}>
            {techs.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ borderColor: 'rgba(37,211,102,0.28)', y: -3 }}
                style={{ padding: '26px 22px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '11px' }}>{item.icon}</div>
                <h4 style={{ color: '#25D366', marginBottom: '5px', fontSize: '0.92rem', fontWeight: '800' }}>{item.t}</h4>
                <p style={{ fontSize: '0.8rem', opacity: 0.4, lineHeight: '1.5', margin: 0 }}>{item.d}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── ANTI-BAN ── */}
        <section className="section-pad" style={{ padding: '90px 10%' }}>
          <div className="tech-security" style={{ display: 'flex', gap: '55px', alignItems: 'center', padding: '55px', borderRadius: '32px', border: '1px solid rgba(37,211,102,0.14)', background: 'rgba(8,12,8,0.5)', backdropFilter: 'blur(10px)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '16px', textTransform: 'uppercase' }}>Segurança</div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '900', marginBottom: '16px', letterSpacing: '-1px', lineHeight: '1.1' }}>Risco zero<br />de banimento.</h2>
              <p style={{ opacity: 0.48, lineHeight: '1.75', fontSize: '0.92rem', margin: 0 }}>
                O ZapChat usa a <strong style={{ color: 'white' }}>API Cloud Oficial da Meta</strong>. Seu número opera dentro das regras, com estabilidade garantida e proteção total contra bloqueios.
              </p>
            </div>
            <div className="security-grid" style={{ flex: 1, minWidth: '260px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[{ t: "Conexão Direta", d: "Sem emuladores ou ferramentas não oficiais." }, { t: "Criptografia", d: "Seus dados e os dos clientes, protegidos." }, { t: "Aprovado pela Meta", d: "Operamos dentro das políticas oficiais." }, { t: "Uptime 99.9%", d: "Servidor dedicado, sempre disponível." }].map((item, i) => (
                <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ color: '#25D366', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '800' }}>{item.t}</h4>
                  <p style={{ fontSize: '0.75rem', opacity: 0.38, lineHeight: '1.5', margin: 0 }}>{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section-pad" style={{ padding: '60px 10% 110px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: '900', marginBottom: '16px', letterSpacing: '-1.5px' }}>Pronto para começar?</h2>
            <p style={{ opacity: 0.42, fontSize: '0.95rem', marginBottom: '36px' }}>Crie sua conta grátis e configure seu primeiro bot hoje.</p>
            <div className="cta-btns-tech" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(37,211,102,0.25)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/cadastrar')}
                style={{ background: '#25D366', color: '#0a0f0a', padding: '16px 44px', borderRadius: '11px', fontWeight: '900', fontSize: '0.92rem', border: 'none', cursor: 'pointer' }}
              >COMEÇAR — 7 DIAS GRÁTIS</motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/')}
                style={{ background: 'transparent', color: 'white', padding: '16px 44px', borderRadius: '11px', fontWeight: '600', fontSize: '0.92rem', border: '1px solid rgba(255,255,255,0.14)', cursor: 'pointer', transition: '0.3s' }}
              >Ver planos →</motion.button>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="section-pad" style={{ padding: '36px 10%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ opacity: 0.18, fontSize: '0.73rem', margin: 0 }}>© 2026 ZAPCHAT TECNOLOGIA LTDA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Tech;