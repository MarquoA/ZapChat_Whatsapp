// src/pages/Assinar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const PLANOS = {
  starter: {
    nome: 'Starter', precoM: 'R$ 127', precoA: 'R$ 106',
    descricao: 'Para quem quer organizar o atendimento e nao perder clientes.',
    features: ['1 Conexao Oficial Meta', 'Editor visual de fluxos', 'Atendimento 24h automatico', 'Dashboard de metricas', 'Suporte via e-mail'],
    trial: true, highlight: false,
  },
  pro: {
    nome: 'Pro', precoM: 'R$ 297', precoA: 'R$ 372',
    descricao: 'Para operacoes que buscam escala e conversao agressiva.',
    features: ['Tudo do Starter', '3 Conexoes simultaneas', 'IA com memoria de contexto', 'Disparos em massa', 'Suporte VIP via WhatsApp'],
    trial: false, highlight: true,
  },
  business: {
    nome: 'Business', precoM: 'R$ 797', precoA: 'R$ 664',
    descricao: 'A solucao definitiva para grandes empresas e agencias.',
    features: ['Tudo do Pro', 'Conexoes ilimitadas', 'Treinamento de IA customizado', 'White label', 'Gerente de conta exclusivo'],
    trial: false, highlight: false,
  },
};

const Assinar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const planoParam   = searchParams.get('plano')  || 'pro';
  const periodoParam = searchParams.get('periodo') || 'mensal';

  const [planoSelecionado, setPlanoSelecionado] = useState(planoParam);
  const [periodo, setPeriodo]                   = useState(periodoParam);
  const [loading, setLoading]                   = useState(false);
  const [verificando, setVerificando]           = useState(true);
  const [erro, setErro]                         = useState('');

  const token = localStorage.getItem('token');
  const plano = PLANOS[planoSelecionado] || PLANOS.pro;
  const preco = periodo === 'mensal' ? plano.precoM : plano.precoA;

  useEffect(() => {
    if (!token) {
      navigate(`/login?redirect=/assinar?plano=${planoSelecionado}&periodo=${periodo}`);
      return;
    }

    // Se ja tem assinatura ativa, vai direto pro dashboard
    const checarAssinatura = async () => {
      try {
        const resp = await fetch(`${API}/pagamentos/minha-assinatura`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await resp.json();
        if (data.tem_assinatura && ['ativo', 'trial'].includes(data.status)) {
          navigate('/dashboard');
          return;
        }
      } catch {
        // Erro de rede: deixa continuar na pagina
      } finally {
        setVerificando(false);
      }
    };

    checarAssinatura();
  }, [token, navigate, planoSelecionado, periodo]);

  const handleAssinar = async () => {
    setErro('');
    setLoading(true);
    try {
      const resp = await fetch(`${API}/pagamentos/assinar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plano: planoSelecionado, periodo }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        if (resp.status === 400 && data.detail?.includes('ja possui')) {
          navigate('/dashboard');
          return;
        }
        setErro(data.detail || 'Erro ao processar assinatura. Tente novamente.');
        return;
      }

      if (data.status === 'trial') { navigate('/dashboard?trial=ativado'); return; }
      if (data.checkout_url)       { window.location.href = data.checkout_url; return; }

      setErro('Nao foi possivel gerar o link de pagamento. Tente novamente.');
    } catch {
      setErro('Erro de conexao. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (verificando) {
    return (
      <div style={{ backgroundColor: '#0a0f0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(37,211,102,0.2)', borderTop: '3px solid #25D366', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Verificando sua conta...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0a0f0a', color: 'white', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .assinar-grid { flex-direction: column !important; }
          .assinar-summary { position: static !important; width: 100% !important; }
        }
        @media (max-width: 600px) {
          .assinar-wrap { padding: 100px 6% 60px !important; }
        }
        .plano-tab { transition: all 0.2s; cursor: pointer; }
        .plano-tab:hover { border-color: rgba(37,211,102,0.3) !important; }
      `}</style>

      <Navbar />

      <div className="assinar-wrap" style={{ padding: '120px 10% 80px', maxWidth: '1100px', margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '48px' }}>
          <span style={{ color: '#25D366', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Assinar</span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', letterSpacing: '-2px', margin: '10px 0 8px' }}>Escolha seu plano.</h1>
          <p style={{ opacity: 0.45, fontSize: '0.95rem' }}>Configure abaixo e finalize a assinatura com seguranca.</p>
        </motion.div>

        <div className="assinar-grid" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>

          {/* Coluna esquerda */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ flex: 1 }}>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.4, marginBottom: '12px' }}>Plano</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {Object.entries(PLANOS).map(([key, p]) => (
                  <button key={key} className="plano-tab" onClick={() => setPlanoSelecionado(key)}
                    style={{ padding: '12px 22px', borderRadius: '12px', border: planoSelecionado === key ? '1px solid rgba(37,211,102,0.5)' : '1px solid rgba(255,255,255,0.08)', background: planoSelecionado === key ? 'rgba(37,211,102,0.08)' : 'rgba(255,255,255,0.02)', color: planoSelecionado === key ? '#25D366' : 'rgba(255,255,255,0.55)', fontWeight: '700', fontSize: '0.85rem' }}>
                    {p.nome}
                    {p.trial && <span style={{ marginLeft: '8px', fontSize: '0.6rem', background: 'rgba(37,211,102,0.15)', color: '#25D366', padding: '2px 7px', borderRadius: '10px', fontWeight: '800' }}>7 dias gratis</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '36px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.4, marginBottom: '12px' }}>Periodo</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['mensal', 'anual'].map(p => (
                  <button key={p} onClick={() => setPeriodo(p)}
                    style={{ padding: '12px 22px', borderRadius: '12px', border: periodo === p ? '1px solid rgba(37,211,102,0.5)' : '1px solid rgba(255,255,255,0.08)', background: periodo === p ? 'rgba(37,211,102,0.08)' : 'rgba(255,255,255,0.02)', color: periodo === p ? '#25D366' : 'rgba(255,255,255,0.55)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                    {p === 'anual' && <span style={{ fontSize: '0.6rem', background: 'rgba(37,211,102,0.15)', color: '#25D366', padding: '2px 7px', borderRadius: '10px', fontWeight: '800' }}>-2 meses</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '28px', borderRadius: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '18px', color: '#25D366' }}>{plano.nome} inclui:</h3>
              {plano.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ color: '#25D366', fontWeight: '900', fontSize: '0.85rem', flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: '0.85rem', opacity: 0.65 }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {['Pagamento seguro via Mercado Pago', 'Cancele quando quiser', 'Suporte em portugues'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.75rem', opacity: 0.35 }}>
                  <span style={{ color: '#25D366' }}>✓</span><span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Resumo + botao */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="assinar-summary"
            style={{ width: '320px', flexShrink: 0, position: 'sticky', top: '100px' }}>
            <div style={{ padding: '36px', borderRadius: '22px', background: plano.highlight ? '#0c1f0f' : 'rgba(255,255,255,0.03)', border: plano.highlight ? '1px solid rgba(37,211,102,0.35)' : '1px solid rgba(255,255,255,0.07)', boxShadow: plano.highlight ? '0 0 50px rgba(37,211,102,0.06)' : 'none' }}>

              <p style={{ fontSize: '0.72rem', opacity: 0.38, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>Resumo</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '4px' }}>ZapChat {plano.nome}</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.4, marginBottom: '24px', lineHeight: '1.5' }}>{plano.descricao}</p>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 0', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.82rem', opacity: 0.45 }}>{periodo === 'mensal' ? 'Cobranca mensal' : 'Cobranca anual'}</span>
                  <div style={{ textAlign: 'right' }}>
                    <AnimatePresence mode="wait">
                      <motion.span key={`${planoSelecionado}-${periodo}`}
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }}
                        style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1.5px', display: 'block' }}>
                        {preco}
                      </motion.span>
                    </AnimatePresence>
                    <span style={{ fontSize: '0.75rem', opacity: 0.3 }}>/ mes</span>
                  </div>
                </div>
                {periodo === 'anual' && (
                  <p style={{ fontSize: '0.72rem', color: '#25D366', marginTop: '8px', fontWeight: '700', textAlign: 'right' }}>Equivale a 2 meses gratis</p>
                )}
              </div>

              {plano.trial && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(37,211,102,0.07)', border: '1px solid rgba(37,211,102,0.15)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25D366', animation: 'pulse-dot 2s infinite', flexShrink: 0 }} />
                    <span style={{ color: '#25D366', fontSize: '0.75rem', fontWeight: '800' }}>7 dias de acesso gratuito</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', opacity: 0.45, margin: 0, lineHeight: '1.5' }}>Apos o periodo, a cobranca e iniciada automaticamente.</p>
                </div>
              )}

              <AnimatePresence>
                {erro && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ color: '#ff4b4b', fontSize: '0.8rem', fontWeight: '600', marginBottom: '14px', lineHeight: '1.5' }}>
                    {erro}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? 'none' : '0 0 30px rgba(37,211,102,0.2)' }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={handleAssinar} disabled={loading}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: loading ? 'rgba(37,211,102,0.4)' : '#25D366', color: '#0a0f0a', fontWeight: '900', fontSize: '0.88rem', cursor: loading ? 'not-allowed' : 'pointer', transition: '0.25s' }}>
                {loading ? 'PROCESSANDO...' : plano.trial ? 'ATIVAR 7 DIAS GRATIS' : 'IR PARA O PAGAMENTO'}
              </motion.button>

              <p style={{ textAlign: 'center', fontSize: '0.7rem', opacity: 0.25, marginTop: '14px', lineHeight: '1.6' }}>
                Ao assinar voce concorda com os Termos de Uso.<br />Cancele quando quiser pelo dashboard.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <footer style={{ padding: '28px 10%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ opacity: 0.15, fontSize: '0.73rem', margin: 0 }}>2026 ZAPCHAT TECNOLOGIA LTDA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Assinar;