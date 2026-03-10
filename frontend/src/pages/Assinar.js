// src/pages/Assinar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ─── DADOS DOS PLANOS ─────────────────────────────────────────────────────────
const PLANOS = {
  starter: {
    nome: 'Starter',
    precoM: 127, precoA: 106,
    descricao: 'Para quem quer organizar o atendimento e nunca mais perder um cliente.',
    cor: 'rgba(255,255,255,0.6)',
    highlight: false,
    trial: true,
    badge: '7 dias grátis',
    publico: 'Ideal para autônomos e pequenos negócios',
    features: [
      { icon: '📱', titulo: '1 Conexão WhatsApp', desc: 'Conecte 1 número oficial via QR Code. Tudo rodando 24h sem precisar deixar o celular aberto.' },
      { icon: '🔀', titulo: 'Editor visual de fluxos', desc: 'Monte o caminho das conversas arrastando blocos. Sem código. Funciona como um mapa de decisões.' },
      { icon: '⏰', titulo: 'Atendimento 24/7 automático', desc: 'Seu bot responde clientes às 3h da manhã enquanto você dorme. Zero mensagem sem resposta.' },
      { icon: '📊', titulo: 'Dashboard de métricas', desc: 'Veja quantas sessões ativas você tem, quais fluxos estão rodando e o status de cada conexão.' },
      { icon: '📧', titulo: 'Suporte via e-mail', desc: 'Nossa equipe responde em até 24h úteis para dúvidas e configurações.' },
    ],
    nao_tem: ['IA com contexto', 'Disparos em massa', 'Múltiplas conexões', 'Treinamento com PDF'],
  },
  pro: {
    nome: 'Pro',
    precoM: 297, precoA: 248,
    descricao: 'Para operações que buscam escala, conversão e automação de verdade.',
    cor: '#25D366',
    highlight: true,
    trial: false,
    badge: 'Mais popular',
    publico: 'Ideal para e-commerces, clínicas e empresas em crescimento',
    features: [
      { icon: '📱', titulo: '3 Conexões simultâneas', desc: 'Separe atendimento, vendas e suporte em 3 números diferentes. Cada um com seu próprio fluxo.' },
      { icon: '🔀', titulo: 'Tudo do Starter', desc: 'Editor visual, dashboard, atendimento 24/7 — tudo incluído e sem limites de fluxos.' },
      { icon: '🤖', titulo: 'IA com memória de contexto', desc: 'Configure um prompt e a IA responde qualquer pergunta fora do fluxo com base no histórico da conversa. O cliente não percebe que é um bot.' },
      { icon: '📨', titulo: 'Disparos em massa', desc: 'Envie mensagens para centenas de contatos com delay automático (8–20s) para parecer humano. Limite: 200 disparos/dia.' },
      { icon: '💬', titulo: 'Suporte VIP via WhatsApp', desc: 'Atendimento prioritário direto no WhatsApp com nossa equipe. Resposta em até 2h.' },
    ],
    nao_tem: ['Treinamento com PDF', 'White label', 'Conexões ilimitadas'],
  },
  business: {
    nome: 'Business',
    precoM: 797, precoA: 664,
    descricao: 'A solução definitiva para agências, grandes empresas e revendedores.',
    cor: '#a78bfa',
    highlight: false,
    trial: false,
    badge: 'Máximo poder',
    publico: 'Ideal para agências e empresas com alto volume de atendimento',
    features: [
      { icon: '♾️', titulo: 'Conexões ilimitadas', desc: 'Sem teto. Crie uma conexão para cada departamento, filial ou cliente da sua agência.' },
      { icon: '🔀', titulo: 'Tudo do Pro', desc: 'IA, disparos, editor visual — tudo sem restrições. Disparos chegam a 1.000/dia.' },
      { icon: '📚', titulo: 'Treinamento de IA com PDF', desc: 'Suba um PDF de 50 páginas com preços, regras e produtos. A IA lê esse arquivo antes de responder. Seus clientes recebem respostas perfeitas, sempre.' },
      { icon: '🏷️', titulo: 'White Label', desc: 'Remova a marca ZapChat e use o seu próprio logo. Revenda para seus clientes como se fosse sua plataforma.' },
      { icon: '👤', titulo: 'Gerente de conta exclusivo', desc: 'Um profissional dedicado ao seu negócio. Onboarding completo, configuração assistida e suporte estratégico.' },
    ],
    nao_tem: [],
  },
};

// ─── TABELA DE COMPARAÇÃO ─────────────────────────────────────────────────────
const COMPARACAO = [
  { recurso: 'Conexões WhatsApp',         starter: '1',         pro: '3',            business: 'Ilimitadas' },
  { recurso: 'Editor visual de fluxos',   starter: '✓',         pro: '✓',            business: '✓' },
  { recurso: 'Atendimento 24/7',          starter: '✓',         pro: '✓',            business: '✓' },
  { recurso: 'Dashboard de métricas',     starter: '✓',         pro: '✓',            business: '✓' },
  { recurso: 'Anexar imagens',            starter: '✗',         pro: '✓',            business: '✓' },
  { recurso: 'IA com contexto',           starter: '✗',         pro: '✓',            business: '✓' },
  { recurso: 'Disparos em massa',         starter: '✗',         pro: '200/dia',      business: '1.000/dia' },
  { recurso: 'Treinamento com PDF (RAG)', starter: '✗',         pro: '✗',            business: '✓' },
  { recurso: 'White Label',               starter: '✗',         pro: '✗',            business: '✓' },
  { recurso: 'Suporte',                   starter: 'E-mail',    pro: 'WhatsApp VIP', business: 'Gerente exclusivo' },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { p: 'Posso trocar de plano depois?', r: 'Sim. Você pode fazer upgrade a qualquer momento pelo Dashboard → Configurações → Assinatura. O valor é proporcional ao período restante.' },
  { p: 'Como funciona o trial de 7 dias do Starter?', r: 'Você ativa sem cartão de crédito. Após os 7 dias, é necessário inserir os dados de pagamento para continuar. Se não assinar, o acesso é suspenso automaticamente.' },
  { p: 'A IA do plano Pro realmente parece humana?', r: 'Sim. Você configura o prompt com a personalidade e o contexto da sua empresa. A IA responde com base no histórico da conversa — o cliente raramente percebe que é um bot.' },
  { p: 'O que é o Treinamento com PDF do Business?', r: 'Você sobe um arquivo com os dados da sua empresa (preços, regras, produtos). A IA lê esse arquivo antes de cada resposta. É a tecnologia RAG (Retrieval Augmented Generation) — a IA não inventa, ela consulta o seu documento.' },
  { p: 'Posso cancelar quando quiser?', r: 'Sim. Cancele pelo Dashboard a qualquer momento. Seu acesso continua ativo até o fim do período pago.' },
];

// ─── COMPONENTE FAQ ITEM ──────────────────────────────────────────────────────
const FaqItem = ({ p, r }) => {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)}
      style={{ padding: '20px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', marginBottom: '10px', transition: '0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: '700' }}>{p}</span>
        <span style={{ color: '#25D366', fontSize: '1.1rem', flexShrink: 0, transition: '0.3s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '12px', fontSize: '0.82rem', opacity: 0.55, lineHeight: '1.7', overflow: 'hidden' }}>
            {r}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
const Assinar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const planoParam   = searchParams.get('plano')  || 'pro';
  const periodoParam = searchParams.get('periodo') || 'mensal';

  const [planoSelecionado, setPlanoSelecionado] = useState(planoParam);
  const [periodo, setPeriodo]   = useState(periodoParam);
  const [loading, setLoading]   = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [erro, setErro]         = useState('');

  const token = localStorage.getItem('token');
  const plano = PLANOS[planoSelecionado] || PLANOS.pro;
  const preco = periodo === 'mensal' ? plano.precoM : plano.precoA;
  const economia = planoSelecionado === 'starter' ? 42 : planoSelecionado === 'pro' ? 98 : 266;

  useEffect(() => {
    if (!token) {
      navigate(`/login?redirect=/assinar?plano=${planoSelecionado}&periodo=${periodo}`);
      return;
    }
    const checar = async () => {
      try {
        const resp = await fetch(`${API}/pagamentos/minha-assinatura`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await resp.json();
        if (data.tem_assinatura && ['ativo', 'trial'].includes(data.status)) {
          navigate('/dashboard');
        }
      } catch {}
      finally { setVerificando(false); }
    };
    checar();
  }, [token, navigate, planoSelecionado, periodo]);

  const handleAssinar = async () => {
    setErro(''); setLoading(true);
    try {
      const resp = await fetch(`${API}/pagamentos/assinar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plano: planoSelecionado, periodo }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        if (resp.status === 400 && data.detail?.includes('ja possui')) { navigate('/dashboard'); return; }
        setErro(data.detail || 'Erro ao processar assinatura. Tente novamente.');
        return;
      }
      if (data.status === 'trial') { navigate('/dashboard?trial=ativado'); return; }
      if (data.checkout_url)       { window.location.href = data.checkout_url; return; }
      setErro('Não foi possível gerar o link de pagamento. Tente novamente.');
    } catch {
      setErro('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally { setLoading(false); }
  };

  if (verificando) return (
    <div style={{ backgroundColor: '#0a0f0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(37,211,102,0.2)', borderTop: '3px solid #25D366', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Verificando sua conta...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#0a0f0a', color: 'white', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .plano-card { transition: all 0.25s; cursor: pointer; }
        .plano-card:hover { transform: translateY(-3px); }
        @media (max-width: 900px) {
          .grid-planos { grid-template-columns: 1fr !important; }
          .checkout-grid { flex-direction: column !important; }
          .summary-box { position: static !important; width: 100% !important; }
          .comparacao-table { font-size: 0.75rem !important; }
        }
        @media (max-width: 600px) {
          .page-wrap { padding: 100px 5% 60px !important; }
        }
      `}</style>

      <Navbar />

      <div className="page-wrap" style={{ padding: '120px 8% 80px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Planos e Preços</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: '900', letterSpacing: '-2px', margin: '12px 0 16px', lineHeight: 1.1 }}>
            Escolha o plano certo<br /><span style={{ color: '#25D366' }}>para o seu negócio.</span>
          </h1>
          <p style={{ opacity: 0.45, fontSize: '1rem', maxWidth: '520px', margin: '0 auto 32px', lineHeight: '1.7' }}>
            Todos os planos incluem atendimento 24/7 e editor visual sem código. A diferença está na escala e nos recursos avançados.
          </p>

          {/* Toggle mensal/anual */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '4px' }}>
            {['mensal', 'anual'].map(p => (
              <button key={p} onClick={() => setPeriodo(p)}
                style={{ padding: '10px 24px', borderRadius: '9px', border: 'none', background: periodo === p ? '#25D366' : 'transparent', color: periodo === p ? '#0a0f0a' : 'rgba(255,255,255,0.5)', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {p === 'mensal' ? 'Mensal' : 'Anual'}
                {p === 'anual' && <span style={{ fontSize: '0.6rem', background: periodo === 'anual' ? 'rgba(0,0,0,0.15)' : 'rgba(37,211,102,0.15)', color: periodo === 'anual' ? '#0a0f0a' : '#25D366', padding: '2px 7px', borderRadius: '6px', fontWeight: '900' }}>-2 meses</span>}
              </button>
            ))}
          </div>
          {periodo === 'anual' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '0.78rem', color: '#25D366', marginTop: '10px', fontWeight: '700' }}>
              💰 Economize até R$ {economia * 12}/ano no plano anual
            </motion.p>
          )}
        </motion.div>

        {/* ── CARDS DOS PLANOS ── */}
        <div className="grid-planos" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '80px', alignItems: 'start' }}>
          {Object.entries(PLANOS).map(([key, p], idx) => {
            const selecionado = planoSelecionado === key;
            const precoAtual = periodo === 'mensal' ? p.precoM : p.precoA;
            return (
              <motion.div key={key} className="plano-card"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                onClick={() => setPlanoSelecionado(key)}
                style={{
                  borderRadius: '22px',
                  border: selecionado ? `2px solid ${p.cor}` : p.highlight ? '2px solid rgba(37,211,102,0.2)' : '1px solid rgba(255,255,255,0.07)',
                  background: p.highlight ? 'linear-gradient(145deg, #0c1f0f, #0a1a0d)' : 'rgba(255,255,255,0.02)',
                  padding: '32px 28px',
                  position: 'relative',
                  boxShadow: selecionado ? `0 0 40px ${p.cor}22` : p.highlight ? '0 0 60px rgba(37,211,102,0.06)' : 'none',
                }}>

                {/* Badge */}
                <div style={{ position: 'absolute', top: '-13px', left: '28px' }}>
                  <span style={{ background: p.highlight ? '#25D366' : key === 'business' ? '#a78bfa' : 'rgba(255,255,255,0.1)', color: p.highlight ? '#0a0f0a' : 'white', fontSize: '0.6rem', fontWeight: '900', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                    {p.badge}
                  </span>
                </div>

                {/* Nome e preço */}
                <div style={{ marginBottom: '24px', paddingTop: '8px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: p.cor, marginBottom: '4px' }}>{p.nome}</h3>
                  <p style={{ fontSize: '0.75rem', opacity: 0.4, marginBottom: '16px', lineHeight: '1.5' }}>{p.publico}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <AnimatePresence mode="wait">
                      <motion.span key={`${key}-${periodo}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-2px', color: 'white' }}>
                        R$ {precoAtual}
                      </motion.span>
                    </AnimatePresence>
                    <span style={{ fontSize: '0.75rem', opacity: 0.35 }}>/mês</span>
                  </div>
                  {periodo === 'anual' && (
                    <p style={{ fontSize: '0.7rem', color: '#25D366', marginTop: '4px', fontWeight: '700' }}>
                      Economize R$ {(p.precoM - p.precoA) * 12}/ano
                    </p>
                  )}
                </div>

                {/* Descrição */}
                <p style={{ fontSize: '0.78rem', opacity: 0.5, lineHeight: '1.6', marginBottom: '24px', minHeight: '48px' }}>{p.descricao}</p>

                {/* Features resumidas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {p.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '1px' }}>{f.icon}</span>
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '2px' }}>{f.titulo}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.4, lineHeight: '1.5' }}>{f.desc}</span>
                      </div>
                    </div>
                  ))}
                  {p.nao_tem.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', marginTop: '4px' }}>
                      {p.nao_tem.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px', opacity: 0.25 }}>
                          <span style={{ fontSize: '0.8rem' }}>✗</span>
                          <span style={{ fontSize: '0.75rem', textDecoration: 'line-through' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botão */}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={(e) => { e.stopPropagation(); setPlanoSelecionado(key); }}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '10px', border: selecionado ? 'none' : `1px solid ${p.cor}44`,
                    background: selecionado ? p.cor : 'transparent',
                    color: selecionado ? (p.highlight ? '#0a0f0a' : 'white') : p.cor,
                    fontWeight: '900', cursor: 'pointer', fontSize: '0.82rem', transition: '0.2s',
                  }}>
                  {selecionado ? '✓ Selecionado' : `Selecionar ${p.nome}`}
                </motion.button>

                {p.trial && (
                  <p style={{ textAlign: 'center', fontSize: '0.68rem', color: '#25D366', marginTop: '10px', fontWeight: '700', opacity: 0.8 }}>
                    ✓ Sem cartão para começar o trial
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── CHECKOUT ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="checkout-grid"
          style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', marginBottom: '100px' }}>

          {/* Detalhes do plano selecionado */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '6px' }}>
              O que você recebe no plano <span style={{ color: plano.cor }}>{plano.nome}</span>
            </h2>
            <p style={{ opacity: 0.4, fontSize: '0.82rem', marginBottom: '28px' }}>{plano.publico}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {plano.features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  style={{ display: 'flex', gap: '16px', padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${plano.cor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: '800', marginBottom: '6px' }}>{f.titulo}</h4>
                    <p style={{ fontSize: '0.78rem', opacity: 0.5, lineHeight: '1.6' }}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {plano.nao_tem.length > 0 && (
              <div style={{ marginTop: '20px', padding: '18px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: '0.7rem', opacity: 0.35, fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Disponível em planos superiores</p>
                {plano.nao_tem.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px', opacity: 0.3 }}>
                    <span style={{ fontSize: '0.8rem' }}>🔒</span>
                    <span style={{ fontSize: '0.78rem' }}>{item}</span>
                  </div>
                ))}
                {planoSelecionado !== 'business' && (
                  <button onClick={() => setPlanoSelecionado(planoSelecionado === 'starter' ? 'pro' : 'business')}
                    style={{ marginTop: '12px', background: 'none', border: 'none', color: '#25D366', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}>
                    Ver próximo plano →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Box de checkout */}
          <div className="summary-box" style={{ width: '340px', flexShrink: 0, position: 'sticky', top: '100px' }}>
            <div style={{ padding: '36px', borderRadius: '22px', background: plano.highlight ? '#0c1f0f' : 'rgba(255,255,255,0.03)', border: plano.highlight ? `1px solid ${plano.cor}44` : '1px solid rgba(255,255,255,0.07)', boxShadow: plano.highlight ? '0 0 50px rgba(37,211,102,0.06)' : 'none' }}>
              <p style={{ fontSize: '0.68rem', opacity: 0.35, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>Resumo da assinatura</p>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '4px' }}>ZapChat {plano.nome}</h3>
              <p style={{ fontSize: '0.78rem', opacity: 0.4, marginBottom: '24px' }}>{plano.publico}</p>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>{periodo === 'mensal' ? 'Cobrança mensal' : 'Cobrança anual'}</span>
                  <div style={{ textAlign: 'right' }}>
                    <AnimatePresence mode="wait">
                      <motion.span key={`sum-${planoSelecionado}-${periodo}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                        style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1.5px', display: 'block' }}>
                        R$ {preco}
                      </motion.span>
                    </AnimatePresence>
                    <span style={{ fontSize: '0.72rem', opacity: 0.3 }}>/ mês</span>
                  </div>
                </div>
                {periodo === 'anual' && (
                  <p style={{ fontSize: '0.72rem', color: '#25D366', marginTop: '8px', fontWeight: '700', textAlign: 'right' }}>
                    💰 R$ {(PLANOS[planoSelecionado].precoM - preco) * 12} economizados no ano
                  </p>
                )}
              </div>

              {/* Seletor de plano inline */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.68rem', opacity: 0.35, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Plano</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.entries(PLANOS).map(([key, p]) => (
                    <button key={key} onClick={() => setPlanoSelecionado(key)}
                      style={{ padding: '8px 14px', borderRadius: '8px', border: planoSelecionado === key ? `1px solid ${p.cor}66` : '1px solid rgba(255,255,255,0.07)', background: planoSelecionado === key ? `${p.cor}12` : 'transparent', color: planoSelecionado === key ? p.cor : 'rgba(255,255,255,0.4)', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', transition: '0.2s' }}>
                      {p.nome}
                    </button>
                  ))}
                </div>
              </div>

              {plano.trial && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(37,211,102,0.07)', border: '1px solid rgba(37,211,102,0.15)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25D366', animation: 'pulse-dot 2s infinite', flexShrink: 0 }} />
                    <span style={{ color: '#25D366', fontSize: '0.75rem', fontWeight: '800' }}>7 dias de acesso gratuito</span>
                  </div>
                  <p style={{ fontSize: '0.7rem', opacity: 0.45, lineHeight: '1.5' }}>Após o período, a cobrança é iniciada. Cancele antes se preferir.</p>
                </div>
              )}

              <AnimatePresence>
                {erro && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ padding: '12px 14px', background: 'rgba(255,75,75,0.08)', border: '1px solid rgba(255,75,75,0.25)', borderRadius: '10px', marginBottom: '14px' }}>
                    <p style={{ color: '#ff4b4b', fontSize: '0.8rem', fontWeight: '600', lineHeight: '1.5' }}>⚠️ {erro}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? 'none' : '0 0 30px rgba(37,211,102,0.25)' }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={handleAssinar} disabled={loading}
                style={{ width: '100%', padding: '17px', borderRadius: '12px', border: 'none', background: loading ? 'rgba(37,211,102,0.4)' : '#25D366', color: '#0a0f0a', fontWeight: '900', fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', transition: '0.25s' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #0a0f0a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    PROCESSANDO...
                  </span>
                ) : plano.trial ? 'ATIVAR 7 DIAS GRÁTIS →' : 'IR PARA O PAGAMENTO →'}
              </motion.button>

              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['🔒 Pagamento seguro', '✓ Cancele quando quiser', '🇧🇷 Suporte em português'].map((item, i) => (
                  <span key={i} style={{ fontSize: '0.65rem', opacity: 0.3, fontWeight: '600' }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── TABELA DE COMPARAÇÃO ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '100px' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '900', textAlign: 'center', marginBottom: '8px', letterSpacing: '-1px' }}>Compare os planos</h2>
          <p style={{ opacity: 0.4, textAlign: 'center', fontSize: '0.85rem', marginBottom: '36px' }}>Veja lado a lado o que cada plano oferece</p>

          <div style={{ overflowX: 'auto', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="comparacao-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '18px 24px', textAlign: 'left', fontWeight: '700', opacity: 0.5, fontSize: '0.75rem' }}>Recurso</th>
                  {Object.entries(PLANOS).map(([key, p]) => (
                    <th key={key} style={{ padding: '18px 24px', textAlign: 'center', color: p.cor, fontWeight: '900', fontSize: '0.88rem' }}>
                      {p.nome}
                      {p.highlight && <span style={{ display: 'block', fontSize: '0.6rem', background: 'rgba(37,211,102,0.15)', padding: '2px 8px', borderRadius: '8px', marginTop: '4px', color: '#25D366' }}>Popular</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARACAO.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '600', opacity: 0.7, fontSize: '0.82rem' }}>{row.recurso}</td>
                    {[row.starter, row.pro, row.business].map((val, j) => (
                      <td key={j} style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '700',
                        color: val === '✓' || val.includes('/') ? '#25D366' : val === '✗' ? 'rgba(255,255,255,0.2)' : 'white',
                        fontSize: val === '✓' || val === '✗' ? '1rem' : '0.82rem' }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: '720px', margin: '0 auto 80px' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: '900', textAlign: 'center', marginBottom: '8px', letterSpacing: '-1px' }}>Dúvidas frequentes</h2>
          <p style={{ opacity: 0.4, textAlign: 'center', fontSize: '0.85rem', marginBottom: '36px' }}>Clique para expandir</p>
          {FAQS.map((faq, i) => <FaqItem key={i} {...faq} />)}
        </motion.div>

      </div>

      <footer style={{ padding: '28px 10%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ opacity: 0.15, fontSize: '0.73rem', margin: 0 }}>© 2026 ZAPCHAT TECNOLOGIA LTDA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Assinar;