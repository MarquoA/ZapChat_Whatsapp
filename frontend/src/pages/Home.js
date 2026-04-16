import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Typewriter from 'typewriter-effect';
import DashboardMockup from '../components/DashboardMockup';
import EditorMockup from '../components/EditorMockup';
import WaChatMockup from '../components/WaChatMockup';

const AnimatedCounter = ({ target, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (2000 / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{prefix}{count.toLocaleString('pt-BR')}{suffix}</span>;
};

const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <button onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: 'white', textAlign: 'left', fontSize: '0.97rem', fontWeight: '600', padding: '20px 0', gap: '20px' }}
      >
        <span>{question}</span>
        <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }} style={{ color: '#25D366', fontSize: '1.3rem', flexShrink: 0 }}>+</motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
            <p style={{ paddingBottom: '20px', fontSize: '0.9rem', opacity: 0.52, lineHeight: '1.75' }}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [billingAnual, setBillingAnual] = useState(false);

  const faqs = [
    { q: "Meu número corre risco de ser bloqueado?", a: "O ZapChat opera em servidor dedicado com boas práticas de automação: delays entre mensagens, simulação de digitação humana e limites de disparo. Seguindo as orientações da plataforma, a conta fica estável. Recomendamos não usar disparos agressivos em massa para manter a saúde do número." },
    { q: "Preciso deixar o celular ligado?",       a: "Não. A conexão é realizada via servidor dedicado. Seu celular pode estar desligado que o bot continua atendendo 24 horas por dia, 7 dias por semana." },
    { q: "Quanto tempo leva para configurar?",     a: "Em menos de 10 minutos você conecta seu número, cria seu primeiro fluxo e ativa o bot. Nossa interface foi desenhada para ser intuitiva, sem necessidade de conhecimento técnico." },
    { q: "Posso cancelar quando quiser?",          a: "Sim, sem fidelidade e sem multas. Você pode cancelar a qualquer momento direto pelo dashboard. Oferecemos também 7 dias de garantia incondicional." },
    { q: "A IA fala em nome da minha empresa?",    a: "Exatamente. Você configura o nome, tom de voz e as informações do seu negócio. A IA se apresenta como parte da sua equipe e responde com base no que você definir." },
    { q: "Funciona para qual tipo de negócio?",    a: "Para qualquer negócio que usa WhatsApp para atender clientes: lojas, clínicas, imobiliárias, academias, prestadores de serviço, e-commerce e muito mais." },
    { q: "Preciso de conhecimento técnico?",       a: "Nenhum. O editor de fluxos é visual: você arrasta e conecta blocos como montar um fluxograma. Se você sabe usar um celular, você sabe usar o ZapChat." },
    { q: "Como funciona o trial de 7 dias?",       a: "O plano Starter inclui 7 dias grátis para você testar a plataforma sem cartão de crédito. Após o período, basta assinar para continuar, sem interrupção no atendimento dos seus clientes." },
    { q: "Posso trocar de plano depois?",          a: "Sim. Você pode fazer upgrade ou downgrade do seu plano a qualquer momento direto pelo dashboard. A cobrança é ajustada proporcionalmente ao período restante." },
    { q: "Quais formas de pagamento são aceitas?", a: "Aceitamos cartão de crédito, boleto bancário e Pix. Os pagamentos são processados com segurança pelo Mercado Pago." },
    { q: "O plano anual tem desconto?",            a: "Sim. Ao escolher o plano anual você economiza 2 meses, pagando apenas 10 parcelas pelo preço de 12. O desconto é aplicado automaticamente no checkout." },
    { q: "O que acontece se eu cancelar?",         a: "Você mantém o acesso até o fim do período pago. Após o vencimento, sua conta é desativada e seus dados ficam armazenados por 30 dias caso queira reativar." },
    { q: "Meu cliente vai saber que é um bot?",    a: "Só se você quiser. O bot simula delays de digitação realistas e usa o nome e tom de voz que você definiu. Na prática, a maioria dos clientes não percebe a diferença, especialmente com a IA respondendo perguntas abertas no plano Pro." },
    { q: "E se eu não souber configurar?",         a: "O setup leva menos de 10 minutos e não exige nenhum conhecimento técnico. O editor é visual: você arrasta blocos como montar um fluxograma. Se tiver dúvidas, nossa equipe atende pelo WhatsApp e te acompanha até o primeiro bot estar no ar." },
    { q: "Funciona para negócio pequeno que recebe poucas mensagens?", a: "É exatamente onde mais faz diferença. Com volume baixo, cada mensagem sem resposta representa uma venda perdida. O ZapChat garante que nenhum cliente fique sem retorno, mesmo quando você está ocupado, dormindo ou no fim de semana." },
  ];

  const planos = [
    { name: "Starter",  priceM: "127", priceA: "106", description: "Para autônomos e pequenos negócios que recebem até 200 mensagens por dia.",        features: ["1 Conexão Oficial Meta","Editor visual de fluxos","Atendimento 24h automático","Dashboard de métricas","Suporte via e-mail"],                                                              highlight: false, cta: "COMEÇAR — 7 DIAS GRÁTIS" },
    { name: "Pro",      priceM: "297", priceA: "248", description: "Para quem quer escalar vendas e parar de responder manualmente.",             features: ["Tudo do Starter, mais:","3 Conexões simultâneas","IA com memória de contexto","2.000.000 créditos de IA/mês","Disparos em massa","Suporte VIP via WhatsApp"],          highlight: true,  cta: "COMEÇAR AGORA" },
    { name: "Business", priceM: "597", priceA: "497", description: "Para agências e empresas com múltiplos atendentes e números.",              features: ["Tudo do Pro, mais:","Conexões ilimitadas","3.000.000 créditos de IA/mês","Treinamento de IA com PDF","Relatórios exportáveis","White Label e até 5 operadores","Gerente de conta exclusivo"], highlight: false, cta: "FALAR COM A EQUIPE" },
  ];

  const compareRows = [
    { feature: "Conexões WhatsApp",        starter: "1",      pro: "3",            business: "Ilimitadas" },
    { feature: "Editor visual de fluxos",  starter: true,     pro: true,           business: true },
    { feature: "Atendimento 24h",          starter: true,     pro: true,           business: true },
    { feature: "Dashboard de métricas",    starter: true,     pro: true,           business: true },
    { feature: "Disparos em massa",        starter: false,    pro: true,           business: true },
    { feature: "IA com memória",           starter: false,    pro: true,           business: true },
    { feature: "Blocos de imagem / IA",    starter: false,    pro: true,           business: true },
    { feature: "Treinamento de IA custom", starter: false,    pro: false,          business: true },
    { feature: "White label (sem marca)",  starter: false,    pro: false,          business: true },
    { feature: "Gerente de conta",         starter: false,    pro: false,          business: true },
    { feature: "Suporte",                  starter: "E-mail", pro: "WhatsApp VIP", business: "Dedicado" },
    { feature: "Trial grátis",             starter: "7 dias", pro: false,           business: false },
  ];

  const renderCell = (val) => {
    if (val === true)  return <span style={{ color: '#25D366', fontSize: '1.1rem', fontWeight: '900' }}>✓</span>;
    if (val === false) return <span style={{ opacity: 0.2, fontSize: '1rem' }}>—</span>;
    return <span style={{ fontSize: '0.82rem', opacity: 0.7, fontWeight: '600' }}>{val}</span>;
  };

  return (
    <div style={{ backgroundColor: '#0a0f0a', color: 'white', overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 20px rgba(37,211,102,0.15)} 50%{box-shadow:0 0 45px rgba(37,211,102,0.35)} }
        @media (max-width: 900px) {
          .hero-flex { flex-direction: column !important; }
          .hero-img-wrap { display: none !important; }
          .showcase-flex { flex-direction: column !important; }
          .showcase-text { max-width: 100% !important; }
          .dash-showcase { flex-direction: column !important; }
          .plans-flex { flex-direction: column !important; align-items: center !important; }
          .plan-card { min-width: unset !important; width: 100% !important; max-width: 420px !important; }
          .beta-flex { flex-direction: column !important; gap: 32px !important; align-items: flex-start !important; }
          .cta-btns { flex-direction: column !important; }
          .cta-btns button { width: 100% !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .compare-table { font-size: 0.75rem !important; }
          .compare-table th, .compare-table td { padding: 12px 8px !important; }
          .guarantee-flex { flex-direction: column !important; gap: 28px !important; }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .feat-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .section-pad { padding-left: 6% !important; padding-right: 6% !important; }
          .faq-inner { padding-left: 20px !important; padding-right: 20px !important; }
          .beta-inner { padding: 36px 24px !important; }
          .compare-wrap { overflow-x: auto !important; }
        }
        .toggle-pill { transition: all 0.25s; }
        .compare-table tr:hover td { background: rgba(37,211,102,0.03) !important; }
        .guarantee-card { transition: all 0.25s; }
        .guarantee-card:hover { border-color: rgba(37,211,102,0.25) !important; transform: translateY(-2px); }
      `}</style>

      <Navbar />

      {/* ══ HERO ════════════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '130px 10% 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 65% 40%, rgba(37,211,102,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 5% 90%, rgba(37,211,102,0.04) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.025, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '55px 55px' }} />

        <div className="hero-flex" style={{ display: 'flex', alignItems: 'center', gap: '60px', width: '100%', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ flex: '0 0 auto', maxWidth: '560px' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 13px', borderRadius: '20px', marginBottom: '28px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.22)', color: '#25D366', fontSize: '0.62rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25D366', animation: 'pulse-dot 2s infinite' }} />
              Servidor Dedicado · Sem Celular Ligado · Beta Aberto
            </motion.div>

            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: '1.05', fontWeight: '900', margin: '0 0 22px', letterSpacing: '-2.5px' }}>
              Seu WhatsApp trabalhando,<br />
              <span style={{ color: '#25D366' }}>
                convertendo vendas que você perderia.
              </span>
            </h1>

            <p style={{ fontSize: '1.02rem', opacity: 0.58, lineHeight: '1.75', maxWidth: '450px', margin: '0 0 36px' }}>
              Monte seu atendimento automático em minutos. Sem código, sem técnico. Seu bot responde enquanto você faz outra coisa.
            </p>

            <div className="cta-btns" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' }}>
              <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(37,211,102,0.35)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/cadastrar')}
                style={{ background: '#25D366', color: '#0a0f0a', padding: '15px 30px', borderRadius: '10px', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '0.88rem' }}
              >COMEÇAR — 7 DIAS GRÁTIS</motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/tecnologia')}
                style={{ background: 'transparent', color: 'white', padding: '15px 30px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.88rem', border: '1px solid rgba(255,255,255,0.14)', transition: '0.3s' }}
              >Ver como funciona →</motion.button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: 0.4, fontSize: '0.78rem', flexWrap: 'wrap' }}>
              <span>Cancele quando quiser</span><span>·</span>
              <span>Setup em 10 min</span><span>·</span>
              <span>7 dias de garantia</span>
            </div>
          </motion.div>

          {/* Chat mockup direita — sem switcher */}
          <motion.div className="hero-img-wrap" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.3 }}
            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
          >
            <WaChatMockup />
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
              style={{ position: 'absolute', bottom: '-18px', left: '-18px', zIndex: 40, background: '#0d1a0d', border: '1px solid rgba(37,211,102,0.28)', borderRadius: '12px', padding: '11px 16px', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#25D366', animation: 'pulse-dot 2s infinite' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#25D366' }}>Bot Online</span>
              </div>
              <p style={{ fontSize: '0.7rem', opacity: 0.45, margin: '3px 0 0' }}>Atendendo agora</p>
            </motion.div>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
          style={{ position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)', opacity: 0.18, textAlign: 'center' }}
        >
          <div style={{ fontSize: '0.58rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '5px' }}>scroll</div>
          <div>↓</div>
        </motion.div>
      </section>

      {/* ══ ESTATÍSTICAS ════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding: '50px 10%' }}>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', overflow: 'hidden' }}>
          {[
            { value: 10, suffix: ' min', label: 'Para ativar o bot', prefix: '<' },
            { value: 3,  suffix: 's',     label: 'Para o bot responder o cliente', prefix: '<' },
            { value: 24, suffix: '/7',   label: 'Horas de operação', prefix: '' },
            { value: 7,  suffix: ' dias',label: 'De teste grátis',   prefix: '' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ padding: '36px 24px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: i % 2 === 0 ? 'rgba(37,211,102,0.02)' : 'transparent' }}
            >
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#25D366', marginBottom: '5px', letterSpacing: '-1px' }}>
                {stat.prefix}<AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p style={{ opacity: 0.4, fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ DEGRADÊ + SHOWCASE: EDITOR ══════════════════════════════════ */}
      <div style={{ height: 70, background: 'linear-gradient(to bottom, #0a0f0a, rgba(37,211,102,0.03))' }} />
      <section className="section-pad" style={{ padding: '0 10% 100px', background: 'rgba(37,211,102,0.02)' }}>
        <div className="showcase-flex" style={{ display: 'flex', gap: '70px', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ flex: 1.3, position: 'relative' }}>
            <EditorMockup />
          </motion.div>
          <motion.div className="showcase-text" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }} style={{ flex: 1, maxWidth: '440px' }}>
            <span style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Editor de Fluxos</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)', fontWeight: '900', letterSpacing: '-1.5px', margin: '14px 0 18px', lineHeight: '1.1' }}>
              Monte seu bot como um fluxograma.
            </h2>
            <p style={{ opacity: 0.52, lineHeight: '1.75', marginBottom: '28px', fontSize: '0.93rem' }}>
              Arraste blocos, conecte respostas e defina o caminho que cada cliente vai percorrer. Teste em tempo real sem precisar publicar.
            </p>
            {["Blocos de texto com delay de digitação", "Opções de resposta com conexões visuais", "Teste instantâneo no próprio painel", "Salva automaticamente no banco de dados"].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.08 }}
                style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '12px' }}
              >
                <span style={{ color: '#25D366', fontWeight: '900', fontSize: '0.88rem', flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: '0.88rem', opacity: 0.65 }}>{item}</span>
              </motion.div>
            ))}
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/tecnologia')}
              style={{ marginTop: '22px', background: 'transparent', color: '#25D366', padding: '13px 26px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', border: '1px solid rgba(37,211,102,0.32)', fontSize: '0.85rem', transition: '0.3s' }}
            >Ver passo a passo completo →</motion.button>
          </motion.div>
        </div>
      </section>
      <div style={{ height: 70, background: 'linear-gradient(to bottom, rgba(37,211,102,0.03), #0a0f0a)' }} />

      {/* ══ DEGRADÊ + SHOWCASE: DASHBOARD ═══════════════════════════════ */}
      <div style={{ height: 70, background: 'linear-gradient(to bottom, #0a0f0a, rgba(37,211,102,0.04))' }} />
      <section className="section-pad" style={{ padding: '60px 10% 80px', background: 'rgba(37,211,102,0.025)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Dashboard</span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)', fontWeight: '900', letterSpacing: '-1.5px', margin: '12px 0 14px', lineHeight: '1.1' }}>
            Tudo sob controle em um só painel.
          </h2>
          <p style={{ opacity: 0.48, lineHeight: '1.75', fontSize: '0.93rem', maxWidth: 520, margin: '0 auto' }}>
            Veja em tempo real sessões ativas, fluxos performando e status de cada conexão WhatsApp. Sem precisar perguntar para ninguém.
          </p>
          <p style={{ marginTop: 14, fontSize: '0.88rem', color: '#25D366', fontWeight: 600, minHeight: 24 }}>
            <Typewriter
              options={{ autoStart: true, loop: true, cursor: '|', delay: 40, deleteSpeed: 20 }}
              onInit={(tw) => {
                tw
                  .typeString('Veja quantas conversas estão acontecendo agora.')
                  .pauseFor(2000).deleteAll(25)
                  .typeString('Acompanhe cada atendimento em tempo real.')
                  .pauseFor(2000).deleteAll(25)
                  .typeString('Saiba exatamente o que seu bot está fazendo.')
                  .pauseFor(2000).deleteAll(25)
                  .start();
              }}
            />
          </p>
        </motion.div>

        <div className="dash-showcase" style={{ display: 'flex', gap: '60px', alignItems: 'center', flexDirection: 'row-reverse', flexWrap: 'wrap' }}>
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ flex: '1 1 420px', position: 'relative' }}>
            <DashboardMockup />
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
              style={{ position: 'absolute', top: 20, right: -14, zIndex: 40, background: '#0d1a0d', border: '1px solid rgba(37,211,102,0.28)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#25D366', animation: 'pulse-dot 2s infinite' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#25D366' }}>Tempo real</span>
              </div>
              <p style={{ fontSize: '0.62rem', opacity: 0.4, margin: '2px 0 0' }}>Métricas atualizadas</p>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }} style={{ flex: '1 1 340px', maxWidth: 420 }}>
            {[
              { num: '01', titulo: 'Métricas de disparos', desc: 'Total enviado, erros e taxa de entrega por hora. Tudo em gráficos claros.' },
              { num: '02', titulo: 'Sessões ativas',       desc: 'Veja quantos clientes estão em atendimento agora, por fluxo e instância.' },
              { num: '03', titulo: 'Status da conexão',    desc: 'Saiba em tempo real se seu WhatsApp está conectado e operando.' },
              { num: '04', titulo: 'Controle de plano',    desc: 'Gerencie instâncias, histórico de pagamentos e assinatura em um lugar.' },
            ].map((card, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }}
                style={{ display: 'flex', gap: 16, marginBottom: 20, padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: '0.25s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,211,102,0.2)'; e.currentTarget.style.background = 'rgba(37,211,102,0.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <div style={{ fontSize: '0.58rem', fontWeight: 900, color: '#25D366', opacity: 0.55, letterSpacing: 2, marginTop: 3, flexShrink: 0 }}>{card.num}</div>
                <div>
                  <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{card.titulo}</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.45, margin: 0, lineHeight: 1.6 }}>{card.desc}</p>
                </div>
              </motion.div>
            ))}
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/cadastrar')}
              style={{ marginTop: 8, background: '#25D366', color: '#0a0f0a', padding: '13px 26px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', border: 'none', fontSize: '0.85rem' }}
            >Criar minha conta grátis →</motion.button>
          </motion.div>
        </div>
      </section>
      <div style={{ height: 70, background: 'linear-gradient(to bottom, rgba(37,211,102,0.04), #0a0f0a)' }} />

      {/* ══ FEATURES ════════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding: '80px 10% 100px' }}>
        <div style={{ marginBottom: '55px' }}>
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Por que o ZapChat</motion.span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)', fontWeight: '900', letterSpacing: '-2px', margin: '12px 0 0' }}>Construído para não cair.</h2>
        </div>
        <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
          {[
            { accent: '01', t: "Servidor Dedicado",        d: "Seu bot roda em servidor 24/7, sem celular ligado, sem quedas, sem você precisar fazer nada." },
            { accent: '02', t: "Delay de Digitação",      d: "O bot simula digitação humana com delays configuráveis. Seus clientes não percebem a diferença." },
            { accent: '03', t: "Fluxos Ilimitados",       d: "Crie quantos fluxos quiser. Atendimento, vendas e suporte no mesmo painel." },
            { accent: '04', t: "Dashboard em Tempo Real", d: "Sessões ativas, fluxos criados e status da conexão sempre visíveis." },
            { accent: '05', t: "Dados Criptografados",    d: "JWT + Bcrypt. Suas senhas e tokens protegidos com padrão bancário." },
            { accent: '06', t: "IA Generativa (Pro)",     d: "Quando o cliente sai do fluxo, a IA entra respondendo com contexto do seu negócio." },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.09 }}
              whileHover={{ y: -4, borderColor: 'rgba(37,211,102,0.2)' }}
              style={{ padding: '30px 26px', borderRadius: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s', cursor: 'default' }}
            >
              <div style={{ fontSize: '0.65rem', fontWeight: '900', color: '#25D366', letterSpacing: '2px', marginBottom: '14px', opacity: 0.6 }}>{f.accent}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '9px' }}>{f.t}</h3>
              <p style={{ opacity: 0.43, fontSize: '0.86rem', lineHeight: '1.65', margin: 0 }}>{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ DEGRADÊ + PLANOS ════════════════════════════════════════════ */}
      <div style={{ height: 60, background: 'linear-gradient(to bottom, #0a0f0a, rgba(37,211,102,0.03))' }} />
      <section id="plans" className="section-pad" style={{ padding: '60px 10% 60px', background: 'rgba(37,211,102,0.015)' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Planos</motion.span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)', fontWeight: '900', letterSpacing: '-1.5px', margin: '12px 0 10px' }}>Escolha sua escala.</h2>
          <p style={{ opacity: 0.4, fontSize: '0.92rem', margin: '0 0 32px' }}>Sem taxas escondidas. Cancele quando quiser. 7 dias de garantia.</p>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50px', padding: '6px 8px' }}
          >
            <button onClick={() => setBillingAnual(false)} className="toggle-pill"
              style={{ padding: '8px 22px', borderRadius: '40px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem', background: !billingAnual ? '#25D366' : 'transparent', color: !billingAnual ? '#0a0f0a' : 'rgba(255,255,255,0.45)' }}
            >Mensal</button>
            <button onClick={() => setBillingAnual(true)} className="toggle-pill"
              style={{ padding: '8px 22px', borderRadius: '40px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', background: billingAnual ? '#25D366' : 'transparent', color: billingAnual ? '#0a0f0a' : 'rgba(255,255,255,0.45)' }}
            >
              Anual
              <span style={{ background: billingAnual ? 'rgba(0,0,0,0.15)' : 'rgba(37,211,102,0.15)', color: billingAnual ? '#0a0f0a' : '#25D366', padding: '2px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '900' }}>-2 meses</span>
            </button>
          </motion.div>
        </div>

        <div className="plans-flex" style={{ display: 'flex', gap: '18px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {planos.map((p, i) => (
            <motion.div key={i} className="plan-card"
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} whileHover={{ y: -10 }}
              style={{ background: p.highlight ? '#0c1f0f' : 'rgba(255,255,255,0.02)', padding: '42px 34px', borderRadius: '22px', border: p.highlight ? '1px solid rgba(37,211,102,0.42)' : '1px solid rgba(255,255,255,0.07)', minWidth: '285px', maxWidth: '310px', flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: p.highlight ? '0 0 55px rgba(37,211,102,0.07)' : 'none', transition: '0.3s' }}
            >
              {p.highlight && <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#25D366', color: '#0a0f0a', padding: '4px 15px', borderRadius: '20px', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1px', whiteSpace: 'nowrap' }}>MAIS POPULAR</span>}
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '6px' }}>{p.name}</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.38, marginBottom: '22px', lineHeight: '1.5', minHeight: '34px' }}>{p.description}</p>
              <div style={{ marginBottom: '26px' }}>
                <AnimatePresence mode="wait">
                  <motion.div key={billingAnual ? 'anual' : 'mensal'} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-2px', lineHeight: 1 }}>R$ {billingAnual ? p.priceA : p.priceM}</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.32, fontWeight: '400', marginLeft: '10px' }}>/mês</span>
                    </div>
                    {billingAnual && <p style={{ fontSize: '0.72rem', color: '#25D366', marginTop: '5px', fontWeight: '700', opacity: 0.85 }}>Cobrado anualmente · 2 meses grátis</p>}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div style={{ flexGrow: 1 }}>
                {p.features.map((f, j) => (
                  <div key={j} style={{ marginBottom: '11px', display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                    <span style={{ color: '#25D366', fontWeight: '800', flexShrink: 0, fontSize: '0.82rem' }}>✓</span>
                    <span style={{ fontSize: '0.83rem', opacity: 0.62 }}>{f}</span>
                  </div>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => p.name === 'Business'
                  ? window.open('https://wa.me/5511999999999?text=Olá%2C%20tenho%20interesse%20no%20plano%20Business%20do%20ZapChat!', '_blank')
                  : navigate(`/cadastrar?plano=${p.name.toLowerCase()}&periodo=${billingAnual ? 'anual' : 'mensal'}`)}
                style={{ marginTop: '28px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: p.highlight ? '#25D366' : 'rgba(255,255,255,0.06)', color: p.highlight ? '#0a0f0a' : 'white', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', transition: '0.3s' }}
              >{p.cta}</motion.button>
            </motion.div>
          ))}
        </div>
      </section>
      <div style={{ height: 60, background: 'linear-gradient(to bottom, rgba(37,211,102,0.03), #0a0f0a)' }} />

      {/* ══ GARANTIA ════════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding: '40px 10% 80px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ padding: '52px 60px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(37,211,102,0.05) 0%, rgba(37,211,102,0.01) 100%)', border: '1px solid rgba(37,211,102,0.14)', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(37,211,102,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="guarantee-flex" style={{ display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ rotate: [0, -3, 3, 0] }} transition={{ duration: 0.4 }} style={{ flexShrink: 0, textAlign: 'center', width: '130px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '3px solid rgba(37,211,102,0.4)', background: 'rgba(37,211,102,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#25D366', lineHeight: 1 }}>7</div>
                <div style={{ fontSize: '0.55rem', fontWeight: '800', color: '#25D366', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8, marginTop: '2px' }}>dias</div>
                <div style={{ fontSize: '0.48rem', fontWeight: '700', color: 'white', letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.35, marginTop: '1px' }}>garantia</div>
              </div>
            </motion.div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <h3 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: '900', letterSpacing: '-1px', marginBottom: '12px' }}>Garantia incondicional de 7 dias.</h3>
              <p style={{ opacity: 0.5, lineHeight: '1.75', fontSize: '0.93rem', margin: 0, maxWidth: '520px' }}>
                Se por qualquer motivo o ZapChat não funcionar para o seu negócio nos primeiros 7 dias, devolvemos 100% do valor pago. Sem perguntas, sem burocracia. Basta mandar uma mensagem.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
              {['Reembolso integral em 24h', 'Sem fidelidade ou multa', 'Cancelamento imediato'].map((item, i) => (
                <div key={i} className="guarantee-card"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.82rem', fontWeight: '600', whiteSpace: 'nowrap' }}
                >
                  <span style={{ color: '#25D366', fontWeight: '900' }}>✓</span>
                  <span style={{ opacity: 0.7 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══ TABELA COMPARATIVA ══════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding: '20px 10% 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Comparativo</motion.span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)', fontWeight: '900', letterSpacing: '-1.5px', margin: '12px 0 0' }}>O que está em cada plano.</h2>
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="compare-wrap"
          style={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', overflowX: 'auto' }}
        >
          <table className="compare-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.35, borderBottom: '1px solid rgba(255,255,255,0.07)', width: '38%' }}>Recurso</th>
                {['Starter', 'Pro', 'Business'].map((name, i) => (
                  <th key={i} style={{ padding: '18px 24px', textAlign: 'center', fontSize: '0.82rem', fontWeight: '900', borderBottom: '1px solid rgba(255,255,255,0.07)', color: name === 'Pro' ? '#25D366' : 'white' }}>
                    {name}
                    {name === 'Pro' && <span style={{ display: 'block', fontSize: '0.55rem', fontWeight: '700', letterSpacing: '1px', color: '#25D366', opacity: 0.7, marginTop: '2px' }}>POPULAR</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: i < compareRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                >
                  <td style={{ padding: '15px 24px', fontSize: '0.85rem', opacity: 0.6, fontWeight: '500' }}>{row.feature}</td>
                  <td style={{ padding: '15px 24px', textAlign: 'center' }}>{renderCell(row.starter)}</td>
                  <td style={{ padding: '15px 24px', textAlign: 'center', background: 'rgba(37,211,102,0.02)' }}>{renderCell(row.pro)}</td>
                  <td style={{ padding: '15px 24px', textAlign: 'center' }}>{renderCell(row.business)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>

      {/* ══ BETA ════════════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding: '0 10% 80px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="beta-inner"
          style={{ padding: '55px 65px', borderRadius: '30px', background: 'linear-gradient(135deg, rgba(37,211,102,0.07) 0%, rgba(37,211,102,0.02) 100%)', border: '1px solid rgba(37,211,102,0.16)' }}
        >
          <div className="beta-flex" style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.18)', borderRadius: '20px', padding: '4px 12px', marginBottom: '18px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25D366', animation: 'pulse-dot 2s infinite' }} />
                <span style={{ color: '#25D366', fontSize: '0.62rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>Acesso Beta</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: '900', letterSpacing: '-1px', marginBottom: '14px', lineHeight: '1.15' }}>Preço de lançamento. Não vai durar.</h2>
              <p style={{ opacity: 0.48, lineHeight: '1.72', fontSize: '0.92rem', margin: 0 }}>
                Estamos em beta e os preços atuais são de lançamento. Quando sairmos do beta, os valores sobem. Quem assinar agora trava o preço pelo tempo que ficar, com acesso direto à equipe fundadora para influenciar as próximas features.
              </p>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(37,211,102,0.18)', borderRadius: '18px', padding: '28px 38px', marginBottom: '18px', animation: 'glow-pulse 3s infinite' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#25D366', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7, marginBottom: '8px' }}>A PARTIR DE</div>
                <div style={{ fontSize: '2.6rem', fontWeight: '900', color: '#25D366', lineHeight: 1 }}>R$ 127<span style={{ fontSize: '1rem', fontWeight: '400', opacity: 0.55 }}>/mês</span></div>
                <div style={{ opacity: 0.42, fontSize: '0.72rem', marginTop: '8px' }}>Preço travado enquanto estiver no beta</div>
              </div>
              <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(37,211,102,0.28)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/cadastrar')}
                style={{ background: '#25D366', color: '#0a0f0a', padding: '15px 34px', borderRadius: '11px', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '0.88rem' }}
              >TRAVAR MEU PREÇO AGORA</motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══ FAQ ÚNICO (geral + pagamentos mesclados) ════════════════════ */}
      <section className="section-pad" style={{ padding: '60px 10% 100px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Dúvidas</motion.span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)', fontWeight: '900', letterSpacing: '-1px', margin: '12px 0 0' }}>Perguntas frequentes.</h2>
          </div>
          <div className="faq-inner" style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {faqs.map((f, i) => <FAQItem key={i} question={f.q} answer={f.a} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ═══════════════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding: '0 10% 110px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', padding: '75px 50px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(37,211,102,0.07) 0%, rgba(37,211,102,0.02) 100%)', border: '1px solid rgba(37,211,102,0.14)', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(37,211,102,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '900', marginBottom: '14px', letterSpacing: '-2px' }}>Pronto para automatizar seu WhatsApp?</h2>
          <p style={{ opacity: 0.45, fontSize: '0.97rem', margin: '0 auto 36px', maxWidth: '460px', lineHeight: '1.7' }}>Comece hoje com 7 dias de garantia incondicional. Sem compromisso.</p>
          <div className="cta-btns" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(37,211,102,0.28)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/cadastrar')}
              style={{ background: '#25D366', color: '#0a0f0a', padding: '17px 46px', borderRadius: '11px', fontWeight: '900', fontSize: '0.92rem', border: 'none', cursor: 'pointer' }}
            >CRIAR CONTA GRÁTIS</motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => window.open('https://wa.me/5511999999999?text=Olá%2C%20gostaria%20de%20saber%20mais%20sobre%20o%20ZapChat!', '_blank')}
              style={{ background: 'transparent', color: 'white', padding: '17px 46px', borderRadius: '11px', fontWeight: '700', fontSize: '0.92rem', border: '1px solid rgba(255,255,255,0.14)', cursor: 'pointer', transition: '0.3s' }}
            >FALAR COM A EQUIPE</motion.button>
          </div>
        </motion.div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════ */}
      <footer className="section-pad" style={{ padding: '65px 10% 36px', background: '#060b06', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: '36px', marginBottom: '44px' }}>
          <div>
            <h3 style={{ color: '#25D366', marginBottom: '12px', fontWeight: '900', fontSize: '1.05rem', letterSpacing: '-0.5px' }}>ZAPCHAT</h3>
            <p style={{ opacity: 0.32, fontSize: '0.82rem', lineHeight: '1.75', maxWidth: '210px', margin: 0 }}>Automação de WhatsApp com servidor dedicado. Sem celular ligado, sem código, pronto em 10 minutos.</p>
          </div>
          {[
            { title: 'Produto',  items: [{ label: 'Como Funciona', action: () => navigate('/tecnologia') }, { label: 'Planos', action: () => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }) }, { label: 'Criar Conta', action: () => navigate('/cadastrar') }, { label: 'Fazer Login', action: () => navigate('/login') }] },
            { title: 'Empresa',  items: [{ label: 'Contato', action: () => navigate('/sobre') }, { label: 'Termos de Uso', action: () => navigate('/termos') }, { label: 'Privacidade (LGPD)', action: () => navigate('/privacidade') }] },
            { title: 'Social',   items: [{ label: 'Instagram', action: null }, { label: 'LinkedIn', action: null }, { label: 'YouTube', action: null }] },
          ].map((col, ci) => (
            <div key={ci}>
              <h4 style={{ marginBottom: '14px', fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.45 }}>{col.title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.83rem', lineHeight: '2.4', opacity: 0.38 }}>
                {col.items.map((item, ii) => <li key={ii} style={{ cursor: item.action ? 'pointer' : 'default' }} onClick={item.action || undefined}>{item.label}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '28px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ opacity: 0.18, fontSize: '0.73rem', margin: 0 }}>© 2026 ZAPCHAT TECNOLOGIA LTDA.</p>
          <p style={{ opacity: 0.18, fontSize: '0.73rem', margin: 0 }}>Feito no Brasil</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;