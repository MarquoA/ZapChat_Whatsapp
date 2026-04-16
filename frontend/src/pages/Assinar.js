// src/pages/Assinar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const PLANOS = {
  starter: {
    nome: 'Starter', precoM: 127, precoA: 106,
    descricao: 'Para quem quer organizar o atendimento e nunca mais perder um cliente.',
    cor: 'rgba(255,255,255,0.7)', highlight: false, trial: true, badge: '7 dias grátis',
    features: ['1 Conexão WhatsApp oficial', 'Editor visual de fluxos', 'Atendimento automático 24/7', 'Dashboard de métricas', 'Suporte via e-mail'],
    nao_tem: ['IA com contexto', 'Disparos em massa', 'Múltiplas conexões'],
  },
  pro: {
    nome: 'Pro', precoM: 297, precoA: 248,
    descricao: 'Para quem quer escalar vendas e parar de responder manualmente.',
    cor: '#25D366', highlight: true, trial: false, badge: 'Mais popular',
    features: ['Tudo do Starter', '3 Conexões simultâneas', 'IA com memória de contexto', '2.000.000 créditos de IA/mês', 'Disparos em massa (200/dia)', 'Suporte VIP via WhatsApp'],
    nao_tem: ['Treinamento com PDF', 'White label'],
  },
  business: {
    nome: 'Business', precoM: 597, precoA: 497,
    descricao: 'Para agências e empresas com múltiplos atendentes e números.',
    cor: '#a78bfa', highlight: false, trial: false, badge: 'Máximo poder',
    features: ['Tudo do Pro', 'Conexões ilimitadas', '3.000.000 créditos de IA/mês', 'Treinamento de IA com PDF', 'Relatórios avançados exportáveis', 'White Label (sem marca ZapChat)', 'Até 5 operadores no painel', 'Gerente de conta exclusivo'],
    nao_tem: [],
  },
};

const COMPARACAO = [
  { recurso: 'Conexões WhatsApp',       starter: '1',      pro: '3',            business: 'Ilimitadas' },
  { recurso: 'Editor visual de fluxos', starter: true,     pro: true,           business: true },
  { recurso: 'Atendimento 24/7',        starter: true,     pro: true,           business: true },
  { recurso: 'Dashboard de métricas',   starter: true,     pro: true,           business: true },
  { recurso: 'Blocos de imagem',        starter: false,    pro: true,           business: true },
  { recurso: 'IA com contexto',          starter: false,    pro: true,           business: true },
  { recurso: 'Créditos de IA/mês',      starter: false,    pro: '2.000.000',    business: '3.000.000' },
  { recurso: 'Disparos em massa',       starter: false,    pro: '200/dia',      business: '1.000/dia' },
  { recurso: 'Treinamento com PDF',     starter: false,    pro: false,          business: true },
  { recurso: 'Relatórios exportáveis',  starter: false,    pro: false,          business: true },
  { recurso: 'White Label',             starter: false,    pro: false,          business: true },
  { recurso: 'Operadores no painel',    starter: '1',      pro: '1',            business: 'Até 5' },
  { recurso: 'Suporte',                 starter: 'E-mail', pro: 'WhatsApp VIP', business: 'Gerente exclusivo' },
];

const FAQS = [
  { p: 'Posso trocar de plano depois?',               r: 'Sim. Faça upgrade a qualquer momento pelo Dashboard → Configurações → Assinatura. O valor é proporcional ao período restante.' },
  { p: 'Como funciona o trial de 7 dias do Starter?', r: 'Você ativa sem cartão. Após os 7 dias, insira os dados de pagamento para continuar. Se não assinar, o acesso é suspenso automaticamente.' },
  { p: 'A IA do plano Pro parece humana?',             r: 'Sim. Você configura o prompt com a personalidade da sua empresa. A IA responde com base no histórico — o cliente raramente percebe que é um bot.' },
  { p: 'O que é o Treinamento com PDF do Business?',  r: 'Você sobe um arquivo com dados da sua empresa. A IA consulta esse documento antes de responder — ela não inventa, ela lê.' },
  { p: 'Posso cancelar quando quiser?',               r: 'Sim. Cancele pelo Dashboard a qualquer momento. Seu acesso continua ativo até o fim do período pago.' },
];

const renderCell = (val) => {
  if (val === true)  return <span style={{ color: '#25D366', fontSize: '1rem', fontWeight: 900 }}>✓</span>;
  if (val === false) return <span style={{ opacity: 0.18 }}>—</span>;
  return <span style={{ fontSize: '0.8rem', opacity: 0.68, fontWeight: 600 }}>{val}</span>;
};

const FaqItem = ({ p, r, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}
      onClick={() => setOpen(!open)}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '20px 0' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{p}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} style={{ color: '#25D366', fontSize: '1.2rem', flexShrink: 0 }}>+</motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
            style={{ paddingBottom: 20, fontSize: '0.85rem', opacity: 0.48, lineHeight: 1.75, overflow: 'hidden', margin: 0 }}>
            {r}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Assinar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [planoSelecionado, setPlanoSelecionado] = useState(searchParams.get('plano') || 'pro');
  const [periodo, setPeriodo]         = useState(searchParams.get('periodo') || 'mensal');
  const [loading, setLoading]         = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [erro, setErro]               = useState('');

  const token  = localStorage.getItem('token');
  const plano  = PLANOS[planoSelecionado] || PLANOS.pro;
  const preco  = periodo === 'mensal' ? plano.precoM : plano.precoA;

  useEffect(() => {
    setVerificando(false);
    // Página pública — qualquer usuário (logado ou não) pode ver e selecionar planos.
    // O handleAssinar cuida de redirecionar para login se necessário.
  }, []);

  const handleAssinar = async () => {
    if (!token) {
      const destino = `/assinar?plano=${planoSelecionado}&periodo=${periodo}`;
      navigate(`/login?redirect=${encodeURIComponent(destino)}`);
      return;
    }
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
        setErro(data.detail || 'Erro ao processar. Tente novamente.');
        return;
      }
      if (data.status === 'trial') { navigate('/dashboard?trial=ativado'); return; }
      if (data.checkout_url)       { window.location.href = data.checkout_url; return; }
      setErro('Não foi possível gerar o link de pagamento.');
    } catch {
      setErro('Erro de conexão. Verifique sua internet.');
    } finally { setLoading(false); }
  };

  if (verificando) return (
    <div style={{ backgroundColor: '#0a0f0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(37,211,102,0.15)', borderTop: '3px solid #25D366', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.82rem' }}>Verificando sua conta...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#0a0f0a', color: 'white', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .plano-card { transition: all 0.22s; cursor: pointer; }
        .plano-card:hover { transform: translateY(-3px); }
        @media (max-width: 900px) {
          .grid-planos   { grid-template-columns: 1fr !important; max-width: 460px; margin-left: auto; margin-right: auto; }
          .checkout-grid { flex-direction: column !important; }
          .summary-box   { position: static !important; width: 100% !important; }
          .comp-table    { font-size: 0.72rem !important; }
          .comp-table th, .comp-table td { padding: 12px 10px !important; }
        }
        @media (max-width: 600px) {
          .page-wrap { padding: 100px 5% 60px !important; }
        }
      `}</style>

      <Navbar />

      <div className="page-wrap" style={{ padding: '120px 8% 80px', maxWidth: 1200, margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ color: '#25D366', fontWeight: 800, fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Planos e Preços</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 900, letterSpacing: '-2px', margin: '12px 0 16px', lineHeight: 1.08 }}>
            Escolha o plano certo<br /><span style={{ color: '#25D366' }}>para o seu negócio.</span>
          </h1>
          <p style={{ opacity: 0.4, fontSize: '0.95rem', maxWidth: 460, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Todos os planos incluem atendimento 24/7 e editor visual sem código.
          </p>

          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 4 }}>
            {['mensal', 'anual'].map(p => (
              <button key={p} onClick={() => setPeriodo(p)}
                style={{ padding: '10px 26px', borderRadius: 9, border: 'none', background: periodo === p ? '#25D366' : 'transparent', color: periodo === p ? '#0a0f0a' : 'rgba(255,255,255,0.45)', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                {p === 'mensal' ? 'Mensal' : 'Anual'}
                {p === 'anual' && (
                  <span style={{ fontSize: '0.58rem', background: periodo === 'anual' ? 'rgba(0,0,0,0.15)' : 'rgba(37,211,102,0.15)', color: periodo === 'anual' ? '#0a0f0a' : '#25D366', padding: '2px 7px', borderRadius: 6, fontWeight: 900 }}>
                    -2 meses
                  </span>
                )}
              </button>
            ))}
          </div>

          {periodo === 'anual' && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '0.73rem', color: '#25D366', marginTop: 10, fontWeight: 700, opacity: 0.82 }}>
              Economize até 2 meses por ano — cobrado uma vez anualmente
            </motion.p>
          )}
        </motion.div>

        {/* ── CARDS ── */}
        <div className="grid-planos" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 80 }}>
          {Object.entries(PLANOS).map(([key, p], idx) => {
            const sel        = planoSelecionado === key;
            const precoAtual = periodo === 'mensal' ? p.precoM : p.precoA;
            return (
              <motion.div key={key} className="plano-card"
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                onClick={() => setPlanoSelecionado(key)}
                style={{
                  borderRadius: 20, padding: '32px 28px', position: 'relative',
                  background: p.highlight ? 'linear-gradient(145deg, #0c1f0f, #091508)' : 'rgba(255,255,255,0.02)',
                  border: sel ? `2px solid ${p.cor}` : p.highlight ? '1px solid rgba(37,211,102,0.2)' : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: sel ? `0 0 32px ${p.cor}15` : p.highlight ? '0 0 50px rgba(37,211,102,0.05)' : 'none',
                }}>

                <div style={{ position: 'absolute', top: -12, left: 24 }}>
                  <span style={{ background: p.highlight ? '#25D366' : key === 'business' ? '#a78bfa' : 'rgba(255,255,255,0.07)', color: p.highlight ? '#0a0f0a' : '#fff', fontSize: '0.57rem', fontWeight: 900, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    {p.badge}
                  </span>
                </div>

                <div style={{ marginBottom: 22, paddingTop: 10 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, color: p.cor, marginBottom: 4, letterSpacing: '-0.3px' }}>{p.nome}</h3>
                  <p style={{ fontSize: '0.72rem', opacity: 0.36, marginBottom: 16, lineHeight: 1.5 }}>{p.descricao}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <AnimatePresence mode="wait">
                      <motion.span key={`${key}-${periodo}`}
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }}
                        style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-2px', color: '#fff' }}>
                        R$ {precoAtual}
                      </motion.span>
                    </AnimatePresence>
                    <span style={{ fontSize: '0.7rem', opacity: 0.28 }}>/mês</span>
                  </div>
                  {periodo === 'anual' && (
                    <p style={{ fontSize: '0.66rem', color: '#25D366', marginTop: 4, fontWeight: 700 }}>
                      Economia de R$ {(p.precoM - p.precoA) * 12}/ano
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                  {p.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                      <span style={{ color: '#25D366', fontWeight: 900, fontSize: '0.76rem', flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: '0.79rem', opacity: 0.65, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                  {p.nao_tem.length > 0 && (
                    <>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '4px 0' }} />
                      {p.nao_tem.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'center', opacity: 0.18 }}>
                          <span style={{ fontSize: '0.76rem', flexShrink: 0 }}>—</span>
                          <span style={{ fontSize: '0.76rem', textDecoration: 'line-through' }}>{item}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <button
                  onClick={e => { e.stopPropagation(); setPlanoSelecionado(key); }}
                  style={{ width: '100%', padding: 13, borderRadius: 10, border: sel ? 'none' : `1px solid ${p.cor}38`, background: sel ? p.cor : 'transparent', color: sel ? (p.highlight ? '#0a0f0a' : '#fff') : p.cor, fontWeight: 900, fontSize: '0.79rem', cursor: 'pointer', transition: '0.2s' }}>
                  {sel ? 'Selecionado' : `Selecionar ${p.nome}`}
                </button>

                {p.trial && (
                  <p style={{ textAlign: 'center', fontSize: '0.63rem', color: '#25D366', marginTop: 10, fontWeight: 700, opacity: 0.72 }}>
                    Sem cartão para começar o trial
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── CHECKOUT ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="checkout-grid" style={{ display: 'flex', gap: 40, alignItems: 'flex-start', marginBottom: 100 }}>

          {/* Detalhes */}
          <div style={{ flex: 1 }}>
            <span style={{ color: '#25D366', fontWeight: 800, fontSize: '0.62rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Plano selecionado</span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', fontWeight: 900, letterSpacing: '-1px', margin: '10px 0 6px' }}>
              ZapChat <span style={{ color: plano.cor }}>{plano.nome}</span>
            </h2>
            <p style={{ opacity: 0.35, fontSize: '0.82rem', marginBottom: 32 }}>{plano.descricao}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {plano.features.map((f, i) => (
                <motion.div key={`${planoSelecionado}-${i}`}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  style={{ display: 'flex', gap: 14, padding: '14px 18px', borderRadius: 13, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: `${plano.cor}0e`, border: `1px solid ${plano.cor}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: plano.cor, fontWeight: 900, fontSize: '0.72rem' }}>✓</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, opacity: 0.72 }}>{f}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {plano.nao_tem.length > 0 && (
              <div style={{ marginTop: 18, padding: '14px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: '0.6rem', opacity: 0.28, fontWeight: 800, marginBottom: 9, textTransform: 'uppercase', letterSpacing: '1px' }}>Disponível em planos superiores</p>
                {plano.nao_tem.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 5, opacity: 0.22 }}>
                    <span style={{ fontSize: '0.73rem' }}>—</span>
                    <span style={{ fontSize: '0.73rem' }}>{item}</span>
                  </div>
                ))}
                {planoSelecionado !== 'business' && (
                  <button onClick={() => setPlanoSelecionado(planoSelecionado === 'starter' ? 'pro' : 'business')}
                    style={{ marginTop: 9, background: 'none', border: 'none', color: '#25D366', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                    Ver próximo plano →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Box checkout */}
          <div className="summary-box" style={{ width: 340, flexShrink: 0, position: 'sticky', top: 100 }}>
            <div style={{ padding: 32, borderRadius: 22, background: plano.highlight ? '#0c1f0f' : 'rgba(255,255,255,0.03)', border: plano.highlight ? `1px solid ${plano.cor}38` : '1px solid rgba(255,255,255,0.08)', boxShadow: plano.highlight ? '0 0 48px rgba(37,211,102,0.06)' : 'none' }}>
              <p style={{ fontSize: '0.6rem', opacity: 0.28, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Resumo</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 4 }}>ZapChat {plano.nome}</h3>
              <p style={{ fontSize: '0.73rem', opacity: 0.32, marginBottom: 24 }}>{periodo === 'mensal' ? 'Cobrança mensal' : 'Cobrança anual'}</p>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '18px 0', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.35 }}>Total</span>
                  <div style={{ textAlign: 'right' }}>
                    <AnimatePresence mode="wait">
                      <motion.span key={`sum-${planoSelecionado}-${periodo}`}
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.18 }}
                        style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-1.5px', display: 'block' }}>
                        R$ {preco}
                      </motion.span>
                    </AnimatePresence>
                    <span style={{ fontSize: '0.65rem', opacity: 0.26 }}>/mês</span>
                  </div>
                </div>
                {periodo === 'anual' && (
                  <p style={{ fontSize: '0.68rem', color: '#25D366', marginTop: 7, fontWeight: 700, textAlign: 'right' }}>
                    R$ {(PLANOS[planoSelecionado].precoM - preco) * 12} economizados no ano
                  </p>
                )}
              </div>

              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: '0.6rem', opacity: 0.28, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 9 }}>Plano</p>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {Object.entries(PLANOS).map(([key, p]) => (
                    <button key={key} onClick={() => setPlanoSelecionado(key)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: planoSelecionado === key ? `1px solid ${p.cor}55` : '1px solid rgba(255,255,255,0.06)', background: planoSelecionado === key ? `${p.cor}10` : 'transparent', color: planoSelecionado === key ? p.cor : 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', transition: '0.2s' }}>
                      {p.nome}
                    </button>
                  ))}
                </div>
              </div>

              {plano.trial && (
                <div style={{ padding: '11px 14px', borderRadius: 10, background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.13)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#25D366', animation: 'pulse-dot 2s infinite', flexShrink: 0 }} />
                    <span style={{ color: '#25D366', fontSize: '0.71rem', fontWeight: 800 }}>7 dias de acesso gratuito</span>
                  </div>
                  <p style={{ fontSize: '0.66rem', opacity: 0.38, lineHeight: 1.55, margin: 0 }}>Sem cartão. Cancele antes do fim do trial sem cobranças.</p>
                </div>
              )}

              <AnimatePresence>
                {erro && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ padding: '11px 14px', background: 'rgba(255,75,75,0.06)', border: '1px solid rgba(255,75,75,0.2)', borderRadius: 10, marginBottom: 14 }}>
                    <p style={{ color: '#ff4b4b', fontSize: '0.76rem', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{erro}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? 'none' : '0 0 26px rgba(37,211,102,0.2)' }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={handleAssinar} disabled={loading}
                style={{ width: '100%', padding: 15, borderRadius: 12, border: 'none', background: loading ? 'rgba(37,211,102,0.32)' : '#25D366', color: '#0a0f0a', fontWeight: 900, fontSize: '0.86rem', cursor: loading ? 'not-allowed' : 'pointer', transition: '0.22s' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.18)', borderTop: '2px solid #0a0f0a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    PROCESSANDO...
                  </span>
                ) : plano.trial ? 'ATIVAR 7 DIAS GRÁTIS' : 'IR PARA O PAGAMENTO'}
              </motion.button>

              <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {['Pagamento seguro', 'Cancele quando quiser', 'Suporte em português'].map((item, i) => (
                  <span key={i} style={{ fontSize: '0.6rem', opacity: 0.22, fontWeight: 600 }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── TABELA COMPARATIVA ── */}
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 100 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ color: '#25D366', fontWeight: 800, fontSize: '0.62rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Comparativo</span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', fontWeight: 900, letterSpacing: '-1px', margin: '10px 0 0' }}>O que está em cada plano.</h2>
          </div>

          <div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', overflowX: 'auto' }}>
            <table className="comp-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '15px 22px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.28, width: '36%' }}>Recurso</th>
                  {Object.entries(PLANOS).map(([key, p]) => (
                    <th key={key} style={{ padding: '15px 22px', textAlign: 'center', color: p.cor, fontWeight: 900, fontSize: '0.83rem' }}>
                      {p.nome}
                      {p.highlight && <span style={{ display: 'block', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '1px', color: '#25D366', opacity: 0.6, marginTop: 3 }}>POPULAR</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARACAO.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < COMPARACAO.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.008)' }}>
                    <td style={{ padding: '13px 22px', fontSize: '0.81rem', opacity: 0.58, fontWeight: 500 }}>{row.recurso}</td>
                    <td style={{ padding: '13px 22px', textAlign: 'center' }}>{renderCell(row.starter)}</td>
                    <td style={{ padding: '13px 22px', textAlign: 'center', background: 'rgba(37,211,102,0.012)' }}>{renderCell(row.pro)}</td>
                    <td style={{ padding: '13px 22px', textAlign: 'center' }}>{renderCell(row.business)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: 700, margin: '0 auto 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 38 }}>
            <span style={{ color: '#25D366', fontWeight: 800, fontSize: '0.62rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Dúvidas</span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', fontWeight: 900, letterSpacing: '-1px', margin: '10px 0 0' }}>Perguntas frequentes.</h2>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 28px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)' }}>
            {FAQS.map((faq, i) => <FaqItem key={i} p={faq.p} r={faq.r} index={i} />)}
          </div>
        </motion.div>

      </div>

      <footer style={{ padding: '28px 10%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ opacity: 0.13, fontSize: '0.7rem', margin: 0 }}>© 2026 ZAPCHAT TECNOLOGIA LTDA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Assinar;