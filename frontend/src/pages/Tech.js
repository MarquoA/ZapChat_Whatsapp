import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardMockup from '../components/DashboardMockup';
import EditorMockup from '../components/EditorMockup';

const Tech = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: "01",
      title: "Conecte seu número WhatsApp",
      description: "Escaneie o QR Code gerado pelo ZapChat com seu WhatsApp. A conexão é feita via servidor dedicado. Seu número fica ativo 24 horas por dia sem precisar do celular ligado.",
      detail: "Leva menos de 2 minutos. E nunca mais você vai perder um cliente por falta de resposta.",
      badge: "Servidor Dedicado"
    },
    {
      step: "02",
      title: "Crie seus fluxos no editor visual",
      description: "Use o editor de arrastar e soltar para montar o caminho que seu bot vai seguir. Defina mensagens, opções de resposta e delays para simular digitação humana.",
      detail: "Não é necessário saber programar. Se você sabe usar um celular, você consegue criar seu primeiro fluxo.",
      badge: "Sem código"
    },
    {
      step: "03",
      title: "Ensine a IA sobre seu negócio",
      description: "Adicione as informações da sua empresa, produtos e tom de voz. A IA aprende com o que você define e responde fora do fluxo principal de forma contextual.",
      detail: "Configure uma vez. Ela atende por você para sempre, sem precisar repetir a mesma resposta manualmente. Disponível nos planos Pro e Business.",
      badge: "Plano Pro"
    },
    {
      step: "04",
      title: "Ative e acompanhe em tempo real",
      description: "Com tudo configurado, ative o bot e acompanhe os atendimentos pelo dashboard. Visualize sessões ativas, fluxos em uso e o status da conexão a qualquer momento.",
      detail: "Você pode pausar, editar ou trocar o fluxo ativo sem interromper os atendimentos em andamento.",
      badge: "Dashboard"
    },
  ];

  const techs = [
    { label: "Servidor Dedicado",    desc: "Seu bot roda em servidor próprio. Sem celular ligado, disponível 24/7 com reconexão automática." },
    { label: "Criptografia E2E",    desc: "Dados protegidos de ponta a ponta. JWT e Bcrypt no controle de autenticação." },
    { label: "Resposta em Segundos", desc: "O bot responde o cliente em menos de 3 segundos, sem delay humano, sem mensagem ignorada." },
    { label: "IA Generativa",       desc: "Respostas contextuais e humanizadas quando o cliente sai do fluxo configurado." },
    { label: "Multi-instância",     desc: "Vários números WhatsApp gerenciados em um único painel centralizado." },
    { label: "Webhooks e API",      desc: "Integração com sistemas externos via endpoints documentados e webhooks configuráveis." },
  ];

  const antiBanItems = [
    { title: "Servidor Dedicado",    desc: "Seu bot roda em servidor próprio, independente do seu celular. Disponível 24/7 sem interrupções." },
    { title: "Criptografia",         desc: "Todos os dados trafegam criptografados. Informações dos seus clientes protegidas por padrão." },
    { title: "Reconexão Automática", desc: "Se a conexão cair por qualquer motivo, o sistema reconecta sozinho sem precisar da sua intervenção." },
    { title: "Atende 24/7",           desc: "O bot nunca dorme, nunca está ocupado e nunca esquece de responder. Fim de semana, feriado, madrugada." },
  ];

  return (
    <div style={{ backgroundColor: '#0a0f0a', color: 'white', overflowX: 'hidden', minHeight: '100vh' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
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
              Sem código. Sem técnico. Sem complicação. Veja o passo a passo de como o ZapChat funciona, do cadastro ao primeiro atendimento automatizado.
            </p>
          </motion.div>
        </section>

        {/* ── PASSO A PASSO + MOCKUPS ── */}
        <section className="section-pad" style={{ padding: '30px 10% 100px' }}>
          <div className="steps-layout" style={{ display: 'flex', gap: '80px', alignItems: 'flex-start' }}>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '27px', top: '56px', bottom: '20px', width: '2px', background: 'linear-gradient(to bottom, rgba(37,211,102,0.35), transparent)', zIndex: 0 }} />
              {steps.map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  style={{ display: 'flex', gap: '26px', alignItems: 'flex-start', marginBottom: i < steps.length - 1 ? '44px' : 0, position: 'relative', zIndex: 1 }}
                >
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#25D366', fontWeight: '900', fontSize: '0.85rem', letterSpacing: '1px' }}>{s.step}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '9px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#25D366', fontWeight: '900', fontSize: '0.7rem', letterSpacing: '1px' }}>PASSO {s.step}</span>
                      <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)', minWidth: '20px' }} />
                      <span style={{ fontSize: '0.62rem', fontWeight: '700', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.18)', color: '#25D366', padding: '3px 9px', borderRadius: '20px', letterSpacing: '0.5px' }}>{s.badge}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '9px', lineHeight: '1.2' }}>{s.title}</h3>
                    <p style={{ opacity: 0.5, lineHeight: '1.7', marginBottom: '12px', fontSize: '0.9rem' }}>{s.description}</p>
                    <div style={{ padding: '12px 16px', background: 'rgba(37,211,102,0.03)', borderRadius: '10px', border: '1px solid rgba(37,211,102,0.09)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: '1.6' }}>
                      <span style={{ color: '#25D366', fontWeight: '700', marginRight: '6px' }}>Detalhe:</span>{s.detail}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mockups empilhados */}
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
          <div style={{ marginBottom: '55px' }}>
            <span style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Tecnologia</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)', fontWeight: '900', letterSpacing: '-1.5px', margin: '0 0 16px' }}>O que tem por baixo do capô.</h2>
            <p style={{ opacity: 0.45, fontSize: '0.92rem', maxWidth: '520px', lineHeight: '1.7', margin: 0 }}>
              Cada componente do ZapChat foi escolhido para garantir estabilidade, segurança e escalabilidade. Da conexão com o WhatsApp até o armazenamento dos dados.
            </p>
          </div>
          <div className="tech-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '900px' }}>
            {techs.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ borderColor: 'rgba(37,211,102,0.28)', y: -3 }}
                style={{ padding: '26px 22px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}
              >
                <h4 style={{ color: '#25D366', marginBottom: '8px', fontSize: '0.92rem', fontWeight: '800' }}>{item.label}</h4>
                <p style={{ fontSize: '0.8rem', opacity: 0.42, lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── ANTI-BAN / SEGURANÇA ── */}
        <section className="section-pad" style={{ padding: '90px 10%' }}>
          <div className="tech-security" style={{ display: 'flex', gap: '55px', alignItems: 'center', padding: '55px', borderRadius: '32px', border: '1px solid rgba(37,211,102,0.14)', background: 'rgba(8,12,8,0.5)', backdropFilter: 'blur(10px)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '16px', textTransform: 'uppercase' }}>Segurança</div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '900', marginBottom: '16px', letterSpacing: '-1px', lineHeight: '1.1' }}>
                Conexão estável,<br />24 horas por dia.
              </h2>
              <p style={{ opacity: 0.48, lineHeight: '1.75', fontSize: '0.92rem', margin: '0 0 20px' }}>
                O ZapChat roda em <strong style={{ color: 'white' }}>servidor dedicado</strong>. Seu número fica conectado 24 horas por dia, sem precisar do celular ligado, sem quedas manuais e com reconexão automática em caso de instabilidade.
              </p>
              <p style={{ opacity: 0.38, lineHeight: '1.7', fontSize: '0.85rem', margin: 0 }}>
                A configuração é feita uma vez. Depois disso, o bot atende sozinho: de madrugada, no fim de semana ou quando você estiver em reunião.
              </p>
            </div>
            <div className="security-grid" style={{ flex: 1, minWidth: '260px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {antiBanItems.map((item, i) => (
                <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ color: '#25D366', marginBottom: '7px', fontSize: '0.85rem', fontWeight: '800' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.75rem', opacity: 0.38, lineHeight: '1.55', margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPARAÇÃO: ZAPCHAT VS OUTROS ── */}
        <section className="section-pad" style={{ padding: '0 10% 90px' }}>
          <div style={{ marginBottom: '44px' }}>
            <span style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Comparação</span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)', fontWeight: '900', letterSpacing: '-1px', margin: '0' }}>ZapChat vs. alternativas do mercado.</h2>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', overflowX: 'auto' }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '740px', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th style={{ padding: '18px 20px', textAlign: 'left', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.35, borderBottom: '1px solid rgba(255,255,255,0.07)', width: '26%' }}>Critério</th>
                  <th style={{ padding: '18px 20px', textAlign: 'center', fontSize: '0.82rem', fontWeight: '900', borderBottom: '1px solid rgba(255,255,255,0.07)', color: '#25D366' }}>
                    ZapChat
                    <span style={{ display: 'block', fontSize: '0.55rem', opacity: 0.7, marginTop: '2px' }}>R$ 127/MÊS</span>
                  </th>
                  <th style={{ padding: '18px 20px', textAlign: 'center', fontSize: '0.82rem', fontWeight: '900', borderBottom: '1px solid rgba(255,255,255,0.07)', opacity: 0.5 }}>
                    Plataforma A
                    <span style={{ display: 'block', fontSize: '0.55rem', marginTop: '2px' }}>R$ 299/MÊS</span>
                  </th>
                  <th style={{ padding: '18px 20px', textAlign: 'center', fontSize: '0.82rem', fontWeight: '900', borderBottom: '1px solid rgba(255,255,255,0.07)', opacity: 0.5 }}>
                    Plataforma B
                    <span style={{ display: 'block', fontSize: '0.55rem', marginTop: '2px' }}>R$ 600/MÊS</span>
                  </th>
                  <th style={{ padding: '18px 20px', textAlign: 'center', fontSize: '0.82rem', fontWeight: '900', borderBottom: '1px solid rgba(255,255,255,0.07)', opacity: 0.5 }}>
                    Plataforma C
                    <span style={{ display: 'block', fontSize: '0.55rem', marginTop: '2px' }}>R$ 692/MÊS</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Preço inicial",          zapchat: "R$ 127/mês",     blip: "R$ 299/mês",   zenvia: "R$ 600/mês",    chatguru: "~R$ 692/mês" },
                  { feature: "Trial grátis",            zapchat: "7 dias",         blip: "Freemium",     zenvia: "Não",           chatguru: "Não" },
                  { feature: "Setup inicial",           zapchat: "< 10 minutos",   blip: "30-60 min",    zenvia: "Horas",         chatguru: "30-60 min" },
                  { feature: "Precisa de técnico",      zapchat: "Não",            blip: "Não",          zenvia: "Frequente",     chatguru: "Não" },
                  { feature: "IA sem custo extra",      zapchat: "Plano Pro",      blip: "Add-on pago",  zenvia: "Add-on caro",   chatguru: "Não" },
                  { feature: "Foco no WhatsApp",        zapchat: "Exclusivo",      blip: "Multi-canal",  zenvia: "Multi-canal",   chatguru: "WhatsApp" },
                  { feature: "Preços públicos no site", zapchat: "Sim",            blip: "Sim",          zenvia: "Parcial",       chatguru: "Não" },
                  { feature: "Suporte",                 zapchat: "WhatsApp + e-mail", blip: "Chat/e-mail", zenvia: "Ticket",     chatguru: "Ticket" },
                ].map((row, i, arr) => (
                  <tr key={i} style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td style={{ padding: '14px 20px', opacity: 0.6 }}>{row.feature}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', background: 'rgba(37,211,102,0.02)', color: '#25D366', fontWeight: '700' }}>{row.zapchat}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', opacity: 0.45 }}>{row.blip}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', opacity: 0.45 }}>{row.zenvia}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', opacity: 0.45 }}>{row.chatguru}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </section>

        {/* ── CTA ── */}
        <section className="section-pad" style={{ padding: '60px 10% 110px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: '900', marginBottom: '16px', letterSpacing: '-1.5px' }}>Pronto para começar?</h2>
            <p style={{ opacity: 0.42, fontSize: '0.95rem', marginBottom: '36px', maxWidth: '420px', margin: '0 auto 36px', lineHeight: '1.7' }}>Crie sua conta com 7 dias de acesso completo e veja o bot em funcionamento no seu número.</p>
            <div className="cta-btns-tech" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(37,211,102,0.25)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/cadastrar')}
                style={{ background: '#25D366', color: '#0a0f0a', padding: '16px 44px', borderRadius: '11px', fontWeight: '900', fontSize: '0.92rem', border: 'none', cursor: 'pointer' }}
              >COMEÇAR — 7 DIAS GRÁTIS</motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/assinar')}
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