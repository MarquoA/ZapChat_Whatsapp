import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// TROCAR em produção: process.env.REACT_APP_API_URL = 'https://api.seudominio.com.br'
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const TEMAS = {
  escuro: {
    bg: '#080c08', sidebar: '#060a06', card: 'rgba(255,255,255,0.02)',
    cardBorder: 'rgba(255,255,255,0.06)', text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.4)', textSub: 'rgba(255,255,255,0.25)',
    header: '#080c08', input: 'rgba(255,255,255,0.04)',
    inputBorder: 'rgba(255,255,255,0.1)', menuHover: 'rgba(255,255,255,0.04)',
    scrollbar: 'rgba(255,255,255,0.08)', waBg: '#0b1a0e',
    waBubbleBot: 'rgba(37,211,102,0.15)', waBubbleUser: 'rgba(255,255,255,0.06)',
    tag: 'rgba(255,255,255,0.05)',
  },
  claro: {
    bg: '#f5f7f5', sidebar: '#ffffff', card: '#ffffff',
    cardBorder: 'rgba(0,0,0,0.08)', text: '#0d140d',
    textMuted: 'rgba(0,0,0,0.45)', textSub: 'rgba(0,0,0,0.28)',
    header: '#f5f7f5', input: 'rgba(0,0,0,0.04)',
    inputBorder: 'rgba(0,0,0,0.12)', menuHover: 'rgba(37,211,102,0.07)',
    scrollbar: 'rgba(0,0,0,0.1)', waBg: '#e5ddd5',
    waBubbleBot: '#dcf8c6', waBubbleUser: '#ffffff',
    tag: 'rgba(0,0,0,0.04)',
  },
};

const PLANO_LIMITES = {
  starter:  { instancias: 1,   ia: false, disparos: false },
  pro:      { instancias: 3,   ia: true,  disparos: true  },
  business: { instancias: 999, ia: true,  disparos: true  },
};
const PLANO_NOME    = { starter: 'Starter', pro: 'Pro', business: 'Business' };
const PLANO_UPGRADE = { starter: 'Pro', pro: 'Business', business: null };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers },
  });
};

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } };
const fmtTempo = (seg) => seg < 60 ? `${seg}s` : `${Math.floor(seg / 60)}m ${seg % 60}s`;
const agora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────
const BloqueadoBanner = ({ recurso, planoAtual, navigate, tema }) => {
  const upgrade = PLANO_UPGRADE[planoAtual] || 'Business';
  const t = TEMAS[tema];
  return (
    <motion.div {...fadeUp} style={{ marginTop: 40, padding: '60px 40px', borderRadius: 20, border: `1px solid ${t.cardBorder}`, background: t.card, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontWeight: 900, color: '#25D366', fontSize: '0.9rem' }}>PRO</div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 10, color: t.text }}>{recurso} não disponível no seu plano</h3>
      <p style={{ color: t.textMuted, fontSize: '0.85rem', maxWidth: 380, margin: '0 auto 28px', lineHeight: 1.7 }}>
        Faça upgrade para <strong style={{ color: '#25D366' }}>{upgrade}</strong> e desbloqueie esta funcionalidade.
      </p>
      <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/assinar')}
        style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '14px 32px', borderRadius: 10, fontWeight: 900, cursor: 'pointer', fontSize: '0.85rem' }}>
        FAZER UPGRADE
      </motion.button>
    </motion.div>
  );
};

const MenuItem = ({ label, ativo, bloqueado, onClick, tema }) => {
  const t = TEMAS[tema];
  return (
    <div onClick={onClick} style={{ padding: '11px 14px', cursor: 'pointer', fontSize: '0.88rem', borderRadius: 8, color: ativo ? '#25D366' : t.textMuted, background: ativo ? 'rgba(37,211,102,0.07)' : 'transparent', fontWeight: ativo ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s', opacity: bloqueado ? 0.5 : 1, borderLeft: ativo ? '2px solid #25D366' : '2px solid transparent' }}
      onMouseEnter={e => { if (!ativo) e.currentTarget.style.background = t.menuHover; }}
      onMouseLeave={e => { if (!ativo) e.currentTarget.style.background = 'transparent'; }}>
      <span>{label}</span>
      {bloqueado && <span style={{ fontSize: '0.62rem', opacity: 0.6, letterSpacing: '0.5px' }}>PRO</span>}
    </div>
  );
};

const StatCard = ({ label, value, trend, trendPositive = true, tema, big = false }) => {
  const t = TEMAS[tema];
  return (
    <motion.div whileHover={{ y: -3 }} style={{ background: t.card, padding: big ? '28px' : '22px', borderRadius: 14, border: `1px solid ${t.cardBorder}` }}>
      <p style={{ color: t.textMuted, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>{label}</p>
      <h3 style={{ fontSize: big ? '2rem' : '1.7rem', fontWeight: 800, marginBottom: 6, color: t.text }}>{value}</h3>
      {trend && <span style={{ color: trendPositive ? '#25D366' : '#ff4b4b', fontSize: '0.72rem', fontWeight: 600 }}>{trend}</span>}
    </motion.div>
  );
};

const FluxoCard = ({ id, nome_fluxo, data_criacao, onExcluir, onEditar, tema }) => {
  const t = TEMAS[tema];
  return (
    <motion.div whileHover={{ x: 4 }} style={{ padding: '18px 22px', borderRadius: 12, border: `1px solid ${t.cardBorder}`, background: t.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#25D366', boxShadow: '0 0 6px rgba(37,211,102,0.6)', flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 3, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nome_fluxo}</h4>
          <p style={{ fontSize: '0.7rem', color: t.textMuted }}>Criado em {new Date(data_criacao).toLocaleString('pt-BR')}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={onEditar} style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '0.68rem', fontWeight: 800 }}>EDITAR</button>
        <button onClick={onExcluir} style={{ background: 'transparent', border: '1px solid #ff4b4b', color: '#ff4b4b', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700 }}>EXCLUIR</button>
      </div>
    </motion.div>
  );
};

const Input = ({ label, tema, ...props }) => {
  const t = TEMAS[tema];
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: 7, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>{label}</label>
      <input {...props} style={{ width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, padding: '11px 13px', borderRadius: 8, color: t.text, outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box', transition: 'border-color 0.2s', ...props.style }} />
    </div>
  );
};

const SaveButton = ({ onClick, loading, label = 'SALVAR ALTERAÇÕES', disabled }) => (
  <motion.button onClick={onClick} disabled={loading || disabled}
    whileHover={{ backgroundColor: '#25D366', color: '#0d140d' }}
    style={{ background: 'transparent', border: '1px solid #25D366', color: '#25D366', padding: '13px 24px', borderRadius: 10, fontWeight: 800, cursor: (loading || disabled) ? 'not-allowed' : 'pointer', fontSize: '0.8rem', transition: 'background 0.2s, color 0.2s', opacity: (loading || disabled) ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
    {loading && <span style={{ width: 13, height: 13, border: '2px solid rgba(37,211,102,0.3)', borderTop: '2px solid #25D366', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
    {loading ? 'SALVANDO...' : label}
  </motion.button>
);

// ─── CHAT WHATSAPP SIMULADO (reutilizável) ────────────────────────────────────
const WaChat = ({ mensagens, digitando, inputVal, onInput, onEnviar, placeholder = 'Digite uma mensagem...', tema, altura = 420, onReset }) => {
  const t = TEMAS[tema];
  const endRef = useRef(null);
  const isDark = tema === 'escuro';

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagens, digitando]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: altura, borderRadius: 16, overflow: 'hidden', border: `1px solid ${t.cardBorder}` }}>
      {/* Header do chat */}
      <div style={{ padding: '12px 18px', background: '#075e54', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#0d140d' }}>Z</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', marginBottom: 1 }}>ZapChat Bot</p>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>{digitando ? 'digitando...' : 'online'}</p>
          </div>
        </div>
        {onReset && (
          <button onClick={onReset} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.7)', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.68rem', fontWeight: 600 }}>
            Reiniciar
          </button>
        )}
      </div>

      {/* Área de mensagens */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', background: t.waBg, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {mensagens.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)', textAlign: 'center', lineHeight: 1.8 }}>
              Selecione um fluxo e clique em<br /><strong>Iniciar Simulação</strong>
            </p>
          </div>
        )}
        {mensagens.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.tipo === 'bot' ? 'flex-start' : 'flex-end' }}>
            <div style={{
              maxWidth: '78%', borderRadius: m.tipo === 'bot' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
              background: m.tipo === 'bot' ? (isDark ? 'rgba(37,211,102,0.12)' : '#dcf8c6') : (isDark ? 'rgba(255,255,255,0.07)' : '#ffffff'),
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)', overflow: 'hidden',
            }}>
              {/* Imagem (imageNode) */}
              {m.imageUrl && (
                <img
                  src={m.imageUrl}
                  alt="imagem do fluxo"
                  style={{ width: '100%', maxWidth: 260, display: 'block', borderRadius: m.texto ? '0' : 'inherit' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
              {/* Texto / legenda */}
              {m.texto && (
                <div style={{ padding: '9px 13px' }}>
                  <p style={{ fontSize: '0.83rem', color: isDark ? '#e8e8e8' : '#1a1a1a', whiteSpace: 'pre-wrap', lineHeight: 1.55, margin: 0 }}>{m.texto}</p>
                  <p style={{ fontSize: '0.6rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', textAlign: 'right', marginTop: 4, marginBottom: 0 }}>{m.hora}</p>
                </div>
              )}
              {/* Hora quando só tem imagem (sem texto) */}
              {m.imageUrl && !m.texto && (
                <p style={{ fontSize: '0.6rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', textAlign: 'right', margin: '2px 8px 5px', }}>{m.hora}</p>
              )}
            </div>
          </div>
        ))}
        {digitando && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '10px 16px', borderRadius: '4px 14px 14px 14px', background: isDark ? 'rgba(37,211,102,0.1)' : '#dcf8c6', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#25D366', animation: `dotBounce 1s ${d}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', background: isDark ? '#1a2a1a' : '#f0f0f0', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input value={inputVal} onChange={e => onInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onEnviar()}
          placeholder={placeholder}
          style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.06)' : '#fff', border: 'none', outline: 'none', borderRadius: 22, padding: '10px 16px', color: isDark ? '#fff' : '#1a1a1a', fontSize: '0.85rem', boxSizing: 'border-box' }} />
        <button onClick={onEnviar}
          style={{ width: 40, height: 40, borderRadius: '50%', background: '#25D366', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>
        </button>
      </div>
    </div>
  );
};


const montarTextoComOpcoes = (mensagem, opcoes) => {
  if (!opcoes || opcoes.length === 0) return mensagem;
  const lista = opcoes.map((op, i) => {
    const partes = op.split(' - ');
    const texto = partes.length > 1 ? partes.slice(1).join(' - ').trim() : op.trim();
    return `${i + 1} - ${texto}`;
  }).join('\n');
  return (mensagem ? mensagem + '\n\n' : '') + lista;
};

// ─── ABA: TESTES & IA ─────────────────────────────────────────────────────────
const TestesIA = ({ fluxos, plano, usuarioId, navigate, tema }) => {
  const t = TEMAS[tema];
  const [subTab, setSubTab] = useState('Fluxo');

  // ── Estado: Testar Fluxo ──
  const [fluxoId, setFluxoId]           = useState('');
  const [iniciado, setIniciado]         = useState(false);
  const [nodeAtual, setNodeAtual]       = useState('');
  const [mensagens, setMensagens]       = useState([]);
  const [inputFluxo, setInputFluxo]     = useState('');
  const [digitandoBot, setDigitandoBot] = useState(false);
  const [iniciando, setIniciando]       = useState(false);
  // Métricas da sessão
  const [metricas, setMetricas] = useState({ total: 0, botMsg: 0, userMsg: 0, nos: [], inicio: null, tempos: [] });

  const resetFluxo = () => {
    setIniciado(false); setNodeAtual(''); setMensagens([]);
    setMetricas({ total: 0, botMsg: 0, userMsg: 0, nos: [], inicio: null, tempos: [] });
  };

  const iniciarSimulacao = async () => {
    if (!fluxoId) return;
    setIniciando(true);
    resetFluxo();
    try {
      const res = await authFetch(`${API_URL}/bot/simular/inicio`, {
        method: 'POST',
        body: JSON.stringify({ fluxo_id: parseInt(fluxoId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao iniciar fluxo.');
      setNodeAtual(data.node_id_atual);
      setIniciado(true);
      const t0 = Date.now();
      setMetricas({ total: 1, botMsg: 1, userMsg: 0, nos: [data.node_id_atual], inicio: t0, tempos: [] });
      // Suporte a imageNode: passa imageUrl se for imagem
      setMensagens([{
        tipo: 'bot',
        texto: montarTextoComOpcoes(data.mensagem || '', data.opcoes || []),
        imageUrl: data.image_url || '',
        hora: agora(),
      }]);
    } catch (e) {
      setMensagens([{ tipo: 'bot', texto: `Erro ao carregar fluxo: ${e.message}`, hora: agora() }]);
    } finally { setIniciando(false); }
  };

  const enviarMsgFluxo = async () => {
    if (!inputFluxo.trim() || !iniciado) return;
    const txt = inputFluxo.trim();
    const t0 = Date.now();
    setInputFluxo('');
    setMensagens(prev => [...prev, { tipo: 'user', texto: txt, hora: agora() }]);
    setMetricas(prev => ({ ...prev, total: prev.total + 1, userMsg: prev.userMsg + 1 }));
    setDigitandoBot(true);
    try {
      const res = await authFetch(`${API_URL}/bot/simular`, {
        method: 'POST',
        body: JSON.stringify({ fluxo_id: parseInt(fluxoId), node_id_atual: nodeAtual, mensagem: txt }),
      });
      const data = await res.json();
      const tempo = Math.round((Date.now() - t0) / 1000);
      await new Promise(r => setTimeout(r, 600));
      setDigitandoBot(false);
      setNodeAtual(data.proximo_node_id || data.node_id_atual);
      // Suporte a imageNode
      setMensagens(prev => [...prev, {
        tipo: 'bot',
        texto: montarTextoComOpcoes(data.mensagem || '', data.opcoes || []),
        imageUrl: data.image_url || '',
        hora: agora(),
      }]);
      setMetricas(prev => ({
        ...prev, total: prev.total + 1, botMsg: prev.botMsg + 1,
        nos: [...new Set([...prev.nos, data.proximo_node_id || data.node_id_atual])],
        tempos: [...prev.tempos, tempo],
      }));
      if (data.fim_fluxo) {
        setIniciado(false);
        setMensagens(prev => [...prev, { tipo: 'bot', texto: '— Fim do fluxo. Clique em Reiniciar para testar novamente. —', hora: agora() }]);
      }
    } catch (e) {
      setDigitandoBot(false);
      setMensagens(prev => [...prev, { tipo: 'bot', texto: `Erro: ${e.message}`, hora: agora() }]);
    }
  };

  const tmr = metricas.tempos.length > 0 ? Math.round(metricas.tempos.reduce((a, b) => a + b, 0) / metricas.tempos.length) : 0;
  const duracao = metricas.inicio ? Math.round((Date.now() - metricas.inicio) / 1000) : 0;

  // ── Estado: Agente IA ──
  const [agente, setAgente] = useState({ nome: '', tom: 'equilibrado', modelo: 'gemini-pro', tokens: 1000, prompt: '', finalizacao: '' });
  const [agenteMsgs, setAgenteMsgs]       = useState([]);
  const [agenteInput, setAgenteInput]     = useState('');
  const [agenteDigitando, setAgenteDigitando] = useState(false);
  const [salvandoAgente, setSalvandoAgente]   = useState(false);
  const [agenteErro, setAgenteErro]       = useState('');

  const enviarMsgAgente = async () => {
    if (!agenteInput.trim() || !agente.prompt.trim()) {
      setAgenteErro('Preencha o Prompt/Instruções do agente antes de testar.');
      return;
    }
    setAgenteErro('');
    const txt = agenteInput.trim();
    setAgenteInput('');
    setAgenteMsgs(prev => [...prev, { tipo: 'user', texto: txt, hora: agora() }]);
    setAgenteDigitando(true);

    // ── TROCAR: quando tiver chave da IA real, descomentar o bloco abaixo e remover o simulado ──
    /*
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: agente.tokens,
          system: agente.prompt,
          messages: [{ role: 'user', content: txt }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Erro na API de IA.');
      const resposta = data.content?.[0]?.text || 'Sem resposta.';
      setAgenteDigitando(false);
      setAgenteMsgs(prev => [...prev, { tipo: 'bot', texto: resposta, hora: agora() }]);
    } catch (e) {
      setAgenteDigitando(false);
      setAgenteErro(`Erro ao chamar a IA: ${e.message}`);
    }
    */

    // ── Simulado (remover quando tiver IA real) ──
    await new Promise(r => setTimeout(r, 1200));
    setAgenteDigitando(false);
    setAgenteMsgs(prev => [...prev, {
      tipo: 'bot',
      texto: `[Simulação — IA não configurada]\n\nQuando a API estiver conectada, o agente "${agente.nome || 'sem nome'}" responderia aqui com base no seu prompt.\n\nSua mensagem foi: "${txt}"`,
      hora: agora(),
    }]);
  };

  const salvarAgente = async () => {
    if (!agente.nome.trim()) return setAgenteErro('Informe o nome do agente.');
    if (!agente.prompt.trim()) return setAgenteErro('O prompt/instruções é obrigatório.');
    setSalvandoAgente(true);
    setAgenteErro('');
    // TROCAR: implementar POST /agentes/salvar no backend
    await new Promise(r => setTimeout(r, 900));
    setSalvandoAgente(false);
    setAgenteErro('');
    // Mostra mensagem de sucesso breve
    setAgenteErro('__ok__');
    setTimeout(() => setAgenteErro(''), 3000);
  };

  const selectStyle = { width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, padding: '11px 13px', borderRadius: 8, color: t.text, outline: 'none', fontSize: '0.88rem' };

  return (
    <motion.div {...fadeUp} style={{ paddingTop: 36 }}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 28, borderBottom: `1px solid ${t.cardBorder}`, marginBottom: 28 }}>
        {[['Fluxo', 'Testar Fluxo'], ['IA', 'Criar Agente IA']].map(([key, lbl]) => (
          <div key={key} onClick={() => setSubTab(key)}
            style={{ padding: '9px 0', fontSize: '0.88rem', fontWeight: 600, color: subTab === key ? '#25D366' : t.textMuted, borderBottom: subTab === key ? '2px solid #25D366' : '2px solid transparent', cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s', whiteSpace: 'nowrap' }}>
            {lbl}
          </div>
        ))}
      </div>

      {/* ── SUB-ABA: TESTAR FLUXO ── */}
      {subTab === 'Fluxo' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Coluna esquerda: seleção + métricas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Seleção do fluxo */}
            <div style={{ padding: '22px', background: t.card, borderRadius: 14, border: `1px solid ${t.cardBorder}` }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: t.text }}>Configurar Simulação</h4>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: 7, textTransform: 'uppercase', fontWeight: 700 }}>Fluxo para testar</label>
                {fluxos.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: '#f0a500' }}>Nenhum fluxo criado. Crie um fluxo primeiro.</p>
                ) : (
                  <select value={fluxoId} onChange={e => { setFluxoId(e.target.value); resetFluxo(); }} style={selectStyle}>
                    <option value="">Selecione um fluxo...</option>
                    {fluxos.map(f => <option key={f.id} value={f.id}>{f.nome_fluxo}</option>)}
                  </select>
                )}
              </div>
              <button onClick={iniciarSimulacao} disabled={!fluxoId || iniciando}
                style={{ width: '100%', padding: '12px', background: !fluxoId ? 'rgba(37,211,102,0.2)' : '#25D366', color: !fluxoId ? '#25D366' : '#0d140d', border: 'none', borderRadius: 9, fontWeight: 800, cursor: !fluxoId ? 'not-allowed' : 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: '0.2s' }}>
                {iniciando && <span style={{ width: 13, height: 13, border: '2px solid rgba(13,20,13,0.3)', borderTop: '2px solid #0d140d', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
                {iniciando ? 'Carregando...' : iniciado ? 'Reiniciar Simulação' : 'Iniciar Simulação'}
              </button>
            </div>

            {/* Métricas da sessão */}
            <div style={{ padding: '22px', background: t.card, borderRadius: 14, border: `1px solid ${t.cardBorder}` }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 16, color: t.text }}>Métricas da Sessão</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Mensagens', value: metricas.total },
                  { label: 'Nós percorridos', value: metricas.nos.length },
                  { label: 'TMR', value: tmr > 0 ? fmtTempo(tmr) : '—', sub: 'Tempo médio de resposta' },
                  { label: 'Duração', value: metricas.inicio ? fmtTempo(duracao) : '—', sub: 'Total da conversa' },
                  { label: 'Bot enviou', value: metricas.botMsg },
                  { label: 'Você enviou', value: metricas.userMsg },
                ].map((m, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: t.tag, borderRadius: 10, border: `1px solid ${t.cardBorder}` }}>
                    <p style={{ fontSize: '0.62rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{m.label}</p>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: t.text, lineHeight: 1 }}>{m.value}</p>
                    {m.sub && <p style={{ fontSize: '0.6rem', color: t.textMuted, marginTop: 3 }}>{m.sub}</p>}
                  </div>
                ))}
              </div>

              {/* IDs dos nós percorridos */}
              {metricas.nos.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: '0.62rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Caminho percorrido</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {metricas.nos.map((n, i) => (
                      <span key={i} style={{ padding: '3px 9px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 20, fontSize: '0.65rem', color: '#25D366', fontFamily: 'monospace' }}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coluna direita: chat */}
          <WaChat
            mensagens={mensagens} digitando={digitandoBot}
            inputVal={inputFluxo} onInput={setInputFluxo} onEnviar={enviarMsgFluxo}
            placeholder={iniciado ? 'Digite sua resposta...' : 'Inicie a simulação primeiro'}
            tema={tema} altura={520} onReset={iniciado ? resetFluxo : null}
          />
        </div>
      )}

      {/* ── SUB-ABA: CRIAR AGENTE IA ── */}
      {subTab === 'IA' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Formulário */}
          <div style={{ padding: '24px', background: t.card, borderRadius: 14, border: `1px solid ${t.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Sub-tabs do agente */}
            <div style={{ display: 'flex', gap: 18, borderBottom: `1px solid ${t.cardBorder}`, paddingBottom: 14 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: t.text, margin: 0 }}>Personalidade</h4>
              <span style={{ fontSize: '0.82rem', color: t.textMuted, paddingTop: 2 }}>Base de conhecimento</span>
              <span style={{ fontSize: '0.82rem', color: t.textMuted, paddingTop: 2 }}>Ferramentas</span>
            </div>

            {/* Nome do agente */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(37,211,102,0.12)', border: '2px dashed rgba(37,211,102,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem', cursor: 'pointer' }}>
                {agente.nome ? agente.nome[0].toUpperCase() : '+'}
              </div>
              <Input tema={tema} label="Nome do agente" type="text"
                value={agente.nome} onChange={e => setAgente(a => ({ ...a, nome: e.target.value }))}
                placeholder="Ex: Assistente de Vendas" style={{ flex: 1 }} />
            </div>

            {/* Tom e Modelo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: 7, textTransform: 'uppercase', fontWeight: 700 }}>Tom</label>
                <select value={agente.tom} onChange={e => setAgente(a => ({ ...a, tom: e.target.value }))} style={selectStyle}>
                  <option value="formal">Formal</option>
                  <option value="equilibrado">Equilibrado — Recomendado</option>
                  <option value="criativo">Criativo</option>
                  <option value="direto">Direto</option>
                </select>
                <p style={{ fontSize: '0.62rem', color: t.textMuted, marginTop: 5 }}>
                  {{ formal: 'Respostas profissionais e objetivas.', equilibrado: 'Equilíbrio entre desempenho e custo.', criativo: 'Respostas criativas e envolventes.', direto: 'Respostas curtas e diretas.' }[agente.tom]}
                </p>
              </div>
              <div>
                {/* TROCAR: descomentar quando tiver a API de IA conectada */}
                <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: 7, textTransform: 'uppercase', fontWeight: 700 }}>Modelo de IA</label>
                <select value={agente.modelo} onChange={e => setAgente(a => ({ ...a, modelo: e.target.value }))} style={selectStyle}>
                  <option value="gemini-pro">Gemini Pro — Padrão</option>
                  {/* <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option> */}
                  {/* <option value="gpt-4">GPT-4</option> */}
                </select>
                <p style={{ fontSize: '0.62rem', color: '#f0a500', marginTop: 5 }}>API de IA será conectada na VPS.</p>
              </div>
            </div>

            {/* Máx. tokens */}
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: 7, textTransform: 'uppercase', fontWeight: 700 }}>Máximo de tokens</label>
              <input type="number" min={100} max={4000} value={agente.tokens}
                onChange={e => setAgente(a => ({ ...a, tokens: parseInt(e.target.value) || 1000 }))}
                style={{ width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, padding: '11px 13px', borderRadius: 8, color: t.text, outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }} />
              <p style={{ fontSize: '0.62rem', color: t.textMuted, marginTop: 5 }}>Quanto maior, mais detalhada a resposta — e maior o custo.</p>
            </div>

            {/* Prompt principal */}
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: 7, textTransform: 'uppercase', fontWeight: 700 }}>Instruções / Prompt</label>
              <textarea value={agente.prompt} onChange={e => setAgente(a => ({ ...a, prompt: e.target.value }))} rows={5}
                placeholder="Ex: Você é um assistente de vendas da empresa X. Seu objetivo é apresentar nossos produtos de forma clara, entender a necessidade do cliente e guiá-lo até a compra. Seja sempre educado e objetivo."
                style={{ width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, padding: '11px 13px', borderRadius: 8, color: t.text, outline: 'none', fontSize: '0.82rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }} />
              <p style={{ fontSize: '0.62rem', color: t.textMuted, marginTop: 4 }}>As instruções são utilizadas para treinar o comportamento da IA.</p>
            </div>

            {/* Mensagem de finalização */}
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: 7, textTransform: 'uppercase', fontWeight: 700 }}>Mensagem de finalização (opcional)</label>
              <textarea value={agente.finalizacao} onChange={e => setAgente(a => ({ ...a, finalizacao: e.target.value }))} rows={2}
                placeholder="Mensagem enviada após o agente encerrar o atendimento."
                style={{ width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, padding: '11px 13px', borderRadius: 8, color: t.text, outline: 'none', fontSize: '0.82rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>

            {/* Feedback */}
            {agenteErro === '__ok__' && (
              <p style={{ fontSize: '0.78rem', color: '#25D366', fontWeight: 700 }}>Agente salvo com sucesso!</p>
            )}
            {agenteErro && agenteErro !== '__ok__' && (
              <p style={{ fontSize: '0.78rem', color: '#ff4b4b', fontWeight: 600 }}>{agenteErro}</p>
            )}

            {/* Botões */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setAgenteMsgs([]); setAgenteErro(''); }}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${t.cardBorder}`, color: t.textMuted, borderRadius: 9, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                Voltar
              </button>
              <SaveButton onClick={salvarAgente} loading={salvandoAgente} label="Salvar e publicar" />
            </div>
          </div>

          {/* Chat de preview da IA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '10px 14px', background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#0d140d', flexShrink: 0 }}>
                {agente.nome ? agente.nome[0].toUpperCase() : 'A'}
              </div>
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: t.text }}>{agente.nome || 'Agente sem nome'}</p>
                <p style={{ fontSize: '0.62rem', color: t.textMuted }}>Preview — {agente.modelo}</p>
              </div>
            </div>
            <WaChat
              mensagens={agenteMsgs} digitando={agenteDigitando}
              inputVal={agenteInput} onInput={setAgenteInput} onEnviar={enviarMsgAgente}
              placeholder="Teste seu agente aqui..."
              tema={tema} altura={460} onReset={() => setAgenteMsgs([])}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ─── ABA: WHATSAPP ────────────────────────────────────────────────────────────
const WhatsAppTab = ({ fluxos, usuarioId, plano, tema }) => {
  const navigate = useNavigate();
  const t = TEMAS[tema];
  const limite = PLANO_LIMITES[plano]?.instancias || 1;
  const [instancias, setInstancias]     = useState([]);
  const [carregando, setCarregando]     = useState(true);
  const [criando, setCriando]           = useState(false);
  const [nomeInstancia, setNomeInstancia] = useState('');
  const [fluxoVinculado, setFluxoVinculado] = useState('');
  const [mostrarForm, setMostrarForm]   = useState(false);
  const [aguardandoQR, setAguardandoQR] = useState(false);
  const [instanciaAtiva, setInstanciaAtiva] = useState(null);
  const [erroLimite, setErroLimite]     = useState('');
  const atingiuLimite = instancias.length >= limite;

  const carregarInstancias = useCallback(async () => {
    if (!usuarioId) return;
    setCarregando(true);
    try {
      const res = await authFetch(`${API_URL}/instancias/listar/${usuarioId}`);
      if (res.status === 401) { navigate('/login'); return; }
      const data = await res.json();
      setInstancias(data.instancias || []);
    } catch {}
    finally { setCarregando(false); }
  }, [usuarioId]);

  useEffect(() => { carregarInstancias(); }, [carregarInstancias]);

  const criarInstancia = async () => {
    if (!nomeInstancia.trim() || !fluxoVinculado) return;
    setCriando(true); setErroLimite('');
    try {
      const res  = await authFetch(`${API_URL}/instancias/criar`, { method: 'POST', body: JSON.stringify({ usuario_id: usuarioId, nome: nomeInstancia, fluxo_id: parseInt(fluxoVinculado) }) });
      const data = await res.json();
      if (!res.ok) { setErroLimite(data.detail || 'Erro ao criar instância.'); return; }
      await carregarInstancias();
      setNomeInstancia(''); setFluxoVinculado(''); setMostrarForm(false);
    } catch { setErroLimite('Erro de conexão.'); }
    finally { setCriando(false); }
  };

  const excluirInstancia = async (id) => {
    if (!window.confirm('Excluir esta instância?')) return;
    try {
      await authFetch(`${API_URL}/instancias/${id}/${usuarioId}`, { method: 'DELETE' });
      setInstancias(prev => prev.filter(i => i.id !== id));
      if (instanciaAtiva?.id === id) setInstanciaAtiva(null);
    } catch { alert('Erro ao excluir.'); }
  };

  const statusColor = s => s === 'conectado' ? '#25D366' : s === 'aguardando' ? '#f0a500' : '#ff4b4b';
  const statusLabel = s => s === 'conectado' ? 'Conectado' : s === 'aguardando' ? 'Aguardando QR' : 'Desconectado';
  const sel = { width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, padding: '11px 13px', borderRadius: 8, color: t.text, outline: 'none', fontSize: '0.88rem' };

  return (
    <motion.div {...fadeUp} style={{ paddingTop: 36 }}>
      <div style={{ background: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.22)', borderRadius: 10, padding: '13px 17px', marginBottom: 18 }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f0a500', marginBottom: 2 }}>Conexão com VPS necessária</p>
        <p style={{ fontSize: '0.7rem', color: t.textMuted }}>O QR Code real estará disponível após configurar a Evolution API na sua VPS.</p>
      </div>
      <div style={{ background: 'rgba(37,211,102,0.04)', border: '1px solid rgba(37,211,102,0.14)', borderRadius: 10, padding: '13px 18px', marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontSize: '0.8rem', color: t.textMuted }}>
          <strong style={{ color: '#25D366' }}>{instancias.length}</strong> de <strong style={{ color: t.text }}>{limite === 999 ? 'ilimitadas' : limite}</strong> instâncias — Plano <strong style={{ color: '#25D366' }}>{PLANO_NOME[plano]}</strong>
        </span>
        {atingiuLimite && plano !== 'business' && (
          <button onClick={() => navigate('/assinar')} style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '7px 16px', borderRadius: 7, fontWeight: 800, cursor: 'pointer', fontSize: '0.7rem' }}>FAZER UPGRADE</button>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <p style={{ fontSize: '0.72rem', color: t.textMuted }}>{instancias.length} instância(s)</p>
        <button onClick={() => { if (atingiuLimite) { setErroLimite(`Limite de ${limite} instância(s) atingido.`); return; } setMostrarForm(v => !v); setErroLimite(''); }}
          style={{ background: 'transparent', color: atingiuLimite ? '#ff4b4b' : '#25D366', border: `1px solid ${atingiuLimite ? '#ff4b4b' : '#25D366'}`, padding: '9px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}>
          {atingiuLimite ? 'LIMITE ATINGIDO' : mostrarForm ? 'CANCELAR' : '+ NOVA INSTÂNCIA'}
        </button>
      </div>
      <AnimatePresence>
        {erroLimite && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '12px 16px', background: 'rgba(255,75,75,0.07)', border: '1px solid rgba(255,75,75,0.22)', borderRadius: 9, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: '0.8rem', color: '#ff4b4b' }}>{erroLimite}</span>
            <button onClick={() => navigate('/assinar')} style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '7px 14px', borderRadius: 7, fontWeight: 800, cursor: 'pointer', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>VER PLANOS</button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mostrarForm && !atingiuLimite && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '22px', background: t.card, borderRadius: 14, border: `1px solid ${t.cardBorder}`, marginBottom: 22 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 18, color: t.text }}>Nova Instância WhatsApp</h4>
            <div style={{ display: 'grid', gap: 13, marginBottom: 18 }}>
              <Input tema={tema} label="Nome da instância" type="text" value={nomeInstancia} onChange={e => setNomeInstancia(e.target.value)} placeholder="Ex: Atendimento Principal" />
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: 7, textTransform: 'uppercase', fontWeight: 700 }}>Fluxo vinculado</label>
                <select value={fluxoVinculado} onChange={e => setFluxoVinculado(e.target.value)} style={sel}>
                  <option value="">Selecione um fluxo...</option>
                  {fluxos.map(f => <option key={f.id} value={f.id}>{f.nome_fluxo}</option>)}
                </select>
              </div>
            </div>
            <button onClick={criarInstancia} disabled={criando} style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '11px 22px', borderRadius: 8, fontWeight: 800, cursor: criando ? 'not-allowed' : 'pointer', fontSize: '0.78rem', opacity: criando ? 0.6 : 1 }}>
              {criando ? 'CRIANDO...' : 'CRIAR INSTÂNCIA'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {carregando ? <p style={{ color: t.textMuted }}>Carregando...</p>
        : instancias.length === 0 ? (
          <div style={{ padding: 50, textAlign: 'center', border: `1px dashed ${t.cardBorder}`, borderRadius: 14 }}>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: t.text, marginBottom: 6 }}>Nenhuma instância criada</p>
            <p style={{ color: t.textMuted, fontSize: '0.82rem' }}>Clique em "+ NOVA INSTÂNCIA" para conectar um número.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {instancias.map(inst => (
              <div key={inst.id} style={{ padding: '18px 22px', borderRadius: 12, border: `1px solid ${t.cardBorder}`, background: t.card }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(37,211,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#25D366', fontSize: '0.85rem', flexShrink: 0 }}>W</div>
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: t.text, marginBottom: 2 }}>{inst.nome}</h4>
                      <p style={{ fontSize: '0.7rem', color: t.textMuted }}>Fluxo: {inst.fluxo_nome}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor(inst.status), display: 'inline-block' }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: statusColor(inst.status) }}>{statusLabel(inst.status)}</span>
                    </div>
                    <button onClick={() => { setInstanciaAtiva(inst); setAguardandoQR(true); setTimeout(() => setAguardandoQR(false), 1500); }}
                      style={{ background: inst.status === 'conectado' ? 'transparent' : '#25D366', color: inst.status === 'conectado' ? '#25D366' : '#0d140d', border: inst.status === 'conectado' ? '1px solid #25D366' : 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700 }}>
                      {inst.status === 'conectado' ? 'RECONECTAR' : 'CONECTAR'}
                    </button>
                    <button onClick={() => excluirInstancia(inst.id)} style={{ background: 'transparent', border: '1px solid #ff4b4b', color: '#ff4b4b', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700 }}>EXCLUIR</button>
                  </div>
                </div>
                <AnimatePresence>
                  {instanciaAtiva?.id === inst.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 18, padding: '22px', background: 'rgba(0,0,0,0.15)', borderRadius: 10, textAlign: 'center' }}>
                      {aguardandoQR ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <span style={{ width: 32, height: 32, border: '3px solid rgba(37,211,102,0.2)', borderTop: '3px solid #25D366', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                          <p style={{ color: t.textMuted, fontSize: '0.82rem' }}>Gerando QR Code...</p>
                        </div>
                      ) : (
                        <>
                          {/* TROCAR: aqui virá o <img src={qrCodeBase64} /> da Evolution API */}
                          <div style={{ width: 180, height: 180, margin: '0 auto 14px', background: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
                            <p style={{ color: '#0d140d', fontSize: '0.65rem', fontWeight: 700, textAlign: 'center', padding: '0 8px' }}>QR Code disponível após configurar a VPS</p>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: t.textMuted }}>WhatsApp → Dispositivos conectados → Conectar dispositivo</p>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
    </motion.div>
  );
};

// ─── ABA: CHATBOT IA ──────────────────────────────────────────────────────────
const ChatbotIA = ({ fluxos, plano, navigate, tema }) => {
  const t = TEMAS[tema];
  const [fluxoSelecionado, setFluxoSelecionado] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  if (!PLANO_LIMITES[plano]?.ia) return <BloqueadoBanner recurso="Chatbot IA" planoAtual={plano} navigate={navigate} tema={tema} />;

  const salvar = async () => {
    if (!fluxoSelecionado || !prompt.trim()) return;
    setLoading(true);
    // TROCAR: POST /chatbot-ia/salvar
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setMsg('Configurações salvas.');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <motion.div {...fadeUp} style={{ paddingTop: 36, maxWidth: 680 }}>
      <div style={{ padding: '28px', background: t.card, borderRadius: 14, border: `1px solid ${t.cardBorder}`, marginBottom: 18 }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6, color: t.text }}>Instruções do Bot de IA</h4>
        <p style={{ fontSize: '0.76rem', color: t.textMuted, marginBottom: 22, lineHeight: 1.6 }}>Configure como a IA deve responder quando o cliente enviar algo fora do fluxo.</p>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: 7, textTransform: 'uppercase', fontWeight: 700 }}>Fluxo vinculado</label>
            <select value={fluxoSelecionado} onChange={e => setFluxoSelecionado(e.target.value)} style={{ width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, padding: '11px 13px', borderRadius: 8, color: t.text, outline: 'none', fontSize: '0.88rem' }}>
              <option value="">Selecione um fluxo...</option>
              {fluxos.map(f => <option key={f.id} value={f.id}>{f.nome_fluxo}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: 7, textTransform: 'uppercase', fontWeight: 700 }}>Prompt de fallback</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
              placeholder="Ex: Você é um assistente da empresa X. Quando o cliente enviar algo fora do menu, responda de forma educada..."
              style={{ width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, padding: '11px 13px', borderRadius: 8, color: t.text, outline: 'none', fontSize: '0.83rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        </div>
      </div>
      {msg && <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#25D366', marginBottom: 12 }}>{msg}</p>}
      <SaveButton onClick={salvar} loading={loading} label="SALVAR CONFIGURAÇÕES" />
    </motion.div>
  );
};

// ─── ABA: DISPAROS ────────────────────────────────────────────────────────────
const DisparosTab = ({ plano, navigate, tema }) => {
  const t = TEMAS[tema];
  const usuarioId = localStorage.getItem('usuario_id');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [instancias, setInstancias]     = useState([]);
  const [instanciaId, setInstanciaId]   = useState('');
  const [mensagem, setMensagem]         = useState('');
  const [contatosRaw, setContatosRaw]   = useState('');
  const [enviando, setEnviando]         = useState(false);
  const [resultado, setResultado]       = useState(null);
  const [historico, setHistorico]       = useState([]);
  const [loadingH, setLoadingH]         = useState(false);
  const [statusHoje, setStatusHoje]     = useState(null);

  useEffect(() => { carregarInstancias(); carregarHistorico(); carregarStatusHoje(); }, []);

  const carregarInstancias = async () => {
    try { const res = await axios.get(`${API_URL}/instancias/listar/${usuarioId}`, { headers }); const l = res.data.instancias || []; setInstancias(l); if (l.length) setInstanciaId(String(l[0].id)); } catch { setInstancias([]); }
  };
  const carregarHistorico = async () => {
    setLoadingH(true);
    try { const res = await axios.get(`${API_URL}/disparos/historico/${usuarioId}`, { headers }); setHistorico(res.data.historico || []); } catch { setHistorico([]); } finally { setLoadingH(false); }
  };
  const carregarStatusHoje = async () => {
    try { const res = await axios.get(`${API_URL}/disparos/status-hoje/${usuarioId}`, { headers }); setStatusHoje(res.data); } catch { setStatusHoje(null); }
  };

  const parsearContatos = () => contatosRaw.split('\n').map(l => l.trim().replace(/\D/g, '')).filter(l => l.length >= 10);
  const contatosParsados = parsearContatos();

  const handleEnviar = async () => {
    setResultado(null);
    if (!instanciaId) return setResultado({ tipo: 'erro', texto: 'Selecione uma instância WhatsApp.' });
    if (!mensagem.trim()) return setResultado({ tipo: 'erro', texto: 'Digite a mensagem antes de enviar.' });
    if (!contatosParsados.length) return setResultado({ tipo: 'erro', texto: 'Adicione pelo menos um contato válido.' });
    setEnviando(true);
    try {
      const res = await axios.post(`${API_URL}/disparos/enviar`, { usuario_id: parseInt(usuarioId), contatos: contatosParsados, mensagem: mensagem.trim(), instancia_id: parseInt(instanciaId) || 0 }, { headers });
      let texto = res.data.mensagem;
      if (res.data.aviso) texto += `\nAtenção: ${res.data.aviso}`;
      setResultado({ tipo: 'sucesso', texto });
      setContatosRaw(''); setMensagem('');
      setTimeout(() => { carregarHistorico(); carregarStatusHoje(); }, 2000);
    } catch (err) {
      setResultado({ tipo: 'erro', texto: err.response?.data?.detail || 'Erro ao iniciar disparo.' });
    } finally { setEnviando(false); }
  };

  const corStatus = s => ({ enviado: '#25D366', erro: '#ff4444', pendente: '#f0a500' }[s] || '#888');
  const sel = { width: '100%', padding: '10px 13px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, color: t.text, fontSize: '0.86rem', outline: 'none' };

  if (!PLANO_LIMITES[plano]?.disparos) return <BloqueadoBanner recurso="Disparos em Massa" planoAtual={plano} navigate={navigate} tema={tema} />;

  return (
    <motion.div {...fadeUp} style={{ paddingTop: 36, display: 'flex', flexDirection: 'column', gap: 22 }}>
      {statusHoje && (
        <div style={{ padding: '18px 22px', background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.14)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: t.textMuted, marginBottom: 3, textTransform: 'uppercase' }}>Disparados hoje</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#25D366', lineHeight: 1 }}>{statusHoje.enviados_hoje}<span style={{ fontSize: '0.85rem', color: t.textMuted, fontWeight: 400, marginLeft: 5 }}>/ {statusHoje.limite_diario}</span></p>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ height: 5, background: t.cardBorder, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((statusHoje.enviados_hoje / statusHoje.limite_diario) * 100, 100)}%`, background: '#25D366', borderRadius: 99, transition: 'width 0.6s ease' }} />
            </div>
            <p style={{ fontSize: '0.7rem', color: t.textMuted, marginTop: 5 }}>{statusHoje.limite_diario - statusHoje.enviados_hoje} restantes hoje</p>
          </div>
        </div>
      )}
      <div style={{ padding: '26px', background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: t.text }}>Novo Disparo</h4>
        <div><label style={{ fontSize: '0.7rem', color: t.textMuted, display: 'block', marginBottom: 7, textTransform: 'uppercase', fontWeight: 700 }}>Instância WhatsApp</label>{instancias.length === 0 ? <p style={{ fontSize: '0.82rem', color: '#ff4444' }}>Nenhuma instância encontrada.</p> : <select value={instanciaId} onChange={e => setInstanciaId(e.target.value)} style={sel}>{instancias.map(i => <option key={i.id} value={String(i.id)}>{i.nome} — {i.numero || 'sem número'}</option>)}</select>}</div>
        <div><label style={{ fontSize: '0.7rem', color: t.textMuted, display: 'block', marginBottom: 7, textTransform: 'uppercase', fontWeight: 700 }}>Mensagem</label><textarea value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Mensagem que será enviada..." rows={4} style={{ width: '100%', padding: '11px 13px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, color: t.text, fontSize: '0.86rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} /><p style={{ fontSize: '0.7rem', color: t.textMuted, marginTop: 3 }}>{mensagem.length} caracteres</p></div>
        <div><label style={{ fontSize: '0.7rem', color: t.textMuted, display: 'block', marginBottom: 7, textTransform: 'uppercase', fontWeight: 700 }}>Contatos — um por linha</label><textarea value={contatosRaw} onChange={e => setContatosRaw(e.target.value)} placeholder={'5511999999999\n5521888888888'} rows={5} style={{ width: '100%', padding: '11px 13px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, color: t.text, fontSize: '0.83rem', resize: 'vertical', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />{contatosParsados.length > 0 && <p style={{ fontSize: '0.7rem', color: '#25D366', marginTop: 3 }}>{contatosParsados.length} contato(s) válido(s)</p>}</div>
        {resultado && <div style={{ padding: '11px 14px', borderRadius: 8, fontSize: '0.83rem', whiteSpace: 'pre-line', background: resultado.tipo === 'sucesso' ? 'rgba(37,211,102,0.09)' : 'rgba(255,68,68,0.09)', border: `1px solid ${resultado.tipo === 'sucesso' ? 'rgba(37,211,102,0.28)' : 'rgba(255,68,68,0.28)'}`, color: resultado.tipo === 'sucesso' ? '#25D366' : '#ff6666' }}>{resultado.texto}</div>}
        <button onClick={handleEnviar} disabled={enviando} style={{ padding: '12px 24px', background: enviando ? 'rgba(37,211,102,0.3)' : '#25D366', border: 'none', borderRadius: 10, color: enviando ? '#25D366' : '#0d140d', fontWeight: 800, fontSize: '0.88rem', cursor: enviando ? 'not-allowed' : 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8 }}>
          {enviando && <span style={{ width: 13, height: 13, border: '2px solid rgba(13,20,13,0.3)', borderTopColor: '#0d140d', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
          {enviando ? 'Enviando...' : `Disparar para ${contatosParsados.length || 0} contato(s)`}
        </button>
      </div>
      <div style={{ padding: '26px', background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: t.text }}>Histórico</h4>
          <button onClick={carregarHistorico} style={{ padding: '5px 12px', background: 'transparent', border: `1px solid ${t.cardBorder}`, borderRadius: 6, color: t.textMuted, fontSize: '0.75rem', cursor: 'pointer' }}>Atualizar</button>
        </div>
        {loadingH ? <p style={{ color: t.textMuted, fontSize: '0.82rem' }}>Carregando...</p>
          : historico.length === 0 ? <p style={{ color: t.textMuted, fontSize: '0.82rem' }}>Nenhum disparo realizado ainda.</p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto' }}>
              {historico.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 130px', gap: 10, alignItems: 'center', padding: '9px 12px', background: t.tag, borderRadius: 7, fontSize: '0.8rem', border: `1px solid ${t.cardBorder}` }}>
                  <span style={{ fontFamily: 'monospace', color: t.textMuted }}>{item.contato}</span>
                  <span style={{ color: t.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.mensagem}</span>
                  <span style={{ padding: '2px 7px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, background: `${corStatus(item.status)}22`, color: corStatus(item.status), textAlign: 'center', textTransform: 'capitalize' }}>{item.status}</span>
                  <span style={{ color: t.textMuted, fontSize: '0.72rem', textAlign: 'right' }}>{new Date(item.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>}
      </div>
    </motion.div>
  );
};

// ─── ABA: CONFIGURAÇÕES ───────────────────────────────────────────────────────
const ConfigSettings = ({ usuarioId, tema, setTema }) => {
  const navigate = useNavigate();
  const t = TEMAS[tema];
  const [subTab, setSubTab] = useState('Perfil');
  const [nome, setNome] = useState(localStorage.getItem('usuario_nome') || '');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgTipo, setMsgTipo] = useState('ok');
  const [assinatura, setAssinatura] = useState(null);
  const [loadingAss, setLoadingAss] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const mostrarMsg = (texto, tipo = 'ok') => { setMsg(texto); setMsgTipo(tipo); setTimeout(() => setMsg(''), 4500); };

  useEffect(() => {
    if (!usuarioId) return;
    authFetch(`${API_URL}/usuarios/${usuarioId}`).then(r => r.json()).then(d => { setNome(d.nome || ''); setEmail(d.email || ''); }).catch(() => {});
  }, [usuarioId]);

  useEffect(() => {
    if (subTab !== 'Assinatura') return;
    setLoadingAss(true);
    authFetch(`${API_URL}/pagamentos/minha-assinatura`).then(r => r.json()).then(d => setAssinatura(d)).catch(() => setAssinatura(null)).finally(() => setLoadingAss(false));
  }, [subTab]);

  const salvarPerfil = async () => {
    if (!nome.trim()) return mostrarMsg('O nome não pode estar vazio.', 'erro');
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/usuarios/${usuarioId}/nome`, { method: 'PUT', body: JSON.stringify({ nome }) });
      if (!res.ok) throw new Error();
      localStorage.setItem('usuario_nome', nome);
      mostrarMsg('Nome atualizado com sucesso.');
    } catch { mostrarMsg('Erro ao salvar.', 'erro'); }
    finally { setLoading(false); }
  };

  const alterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) return mostrarMsg('Preencha todos os campos.', 'erro');
    if (novaSenha !== confirmarSenha) return mostrarMsg('As senhas não coincidem.', 'erro');
    if (novaSenha.length < 6) return mostrarMsg('Mínimo 6 caracteres.', 'erro');
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/usuarios/${usuarioId}/senha`, { method: 'PUT', body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao alterar senha.');
      mostrarMsg('Senha alterada com sucesso.');
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
    } catch (e) { mostrarMsg(e.message, 'erro'); }
    finally { setLoading(false); }
  };

  const cancelarAssinatura = async () => {
    if (!window.confirm('Tem certeza? O acesso continua até o fim do período pago.')) return;
    setCancelando(true);
    try {
      const res = await authFetch(`${API_URL}/pagamentos/cancelar`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao cancelar.');
      setAssinatura(prev => ({ ...prev, status: 'cancelado' }));
      mostrarMsg('Assinatura cancelada. Acesso mantido até o fim do período.');
    } catch (e) { mostrarMsg(e.message || 'Erro ao cancelar.', 'erro'); }
    finally { setCancelando(false); }
  };

  const statusLabel = { ativo: 'Ativo', trial: 'Trial', pausado: 'Pausado', cancelado: 'Cancelado', pendente: 'Pendente' };
  const statusColor = { ativo: '#25D366', trial: '#f0a500', pausado: '#f0a500', cancelado: '#ff4b4b', pendente: '#888' };
  const card = { padding: '28px', background: t.card, borderRadius: 14, border: `1px solid ${t.cardBorder}` };

  return (
    <div style={{ paddingTop: 36 }}>
      <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${t.cardBorder}`, marginBottom: 26, flexWrap: 'wrap' }}>
        {['Perfil', 'Seguranca', 'Assinatura', 'Visual'].map(item => (
          <div key={item} onClick={() => setSubTab(item)}
            style={{ padding: '9px 0', fontSize: '0.86rem', fontWeight: 600, color: subTab === item ? '#25D366' : t.textMuted, borderBottom: subTab === item ? '2px solid #25D366' : '2px solid transparent', cursor: 'pointer', transition: 'color 0.2s', whiteSpace: 'nowrap' }}>
            {item === 'Seguranca' ? 'Segurança' : item}
          </div>
        ))}
      </div>

      {subTab === 'Perfil' && (
        <motion.div {...fadeUp} style={{ display: 'grid', gap: 18, maxWidth: 560 }}>
          <div style={card}><h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 22, color: t.text }}>Dados Pessoais</h4><div style={{ display: 'grid', gap: 13 }}><Input tema={tema} label="Nome de Exibição" type="text" value={nome} onChange={e => setNome(e.target.value)} /><Input tema={tema} label="E-mail (somente leitura)" type="email" value={email} disabled style={{ opacity: 0.5 }} /></div></div>
          {msg && <p style={{ fontSize: '0.78rem', fontWeight: 700, color: msgTipo === 'ok' ? '#25D366' : '#ff4b4b' }}>{msg}</p>}
          <SaveButton onClick={salvarPerfil} loading={loading} />
        </motion.div>
      )}

      {subTab === 'Seguranca' && (
        <motion.div {...fadeUp} style={{ display: 'grid', gap: 18, maxWidth: 560 }}>
          <div style={card}><h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 22, color: t.text }}>Alterar Senha</h4><div style={{ display: 'grid', gap: 13 }}><Input tema={tema} label="Senha Atual" type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} placeholder="••••••••" /><Input tema={tema} label="Nova Senha" type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="••••••••" /><Input tema={tema} label="Confirmar Nova Senha" type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} placeholder="••••••••" /></div></div>
          {msg && <p style={{ fontSize: '0.78rem', fontWeight: 700, color: msgTipo === 'ok' ? '#25D366' : '#ff4b4b' }}>{msg}</p>}
          <SaveButton onClick={alterarSenha} loading={loading} label="ALTERAR SENHA" />
        </motion.div>
      )}

      {subTab === 'Assinatura' && (
        <motion.div {...fadeUp} style={{ maxWidth: 560 }}>
          {loadingAss ? <div style={{ paddingTop: 50, textAlign: 'center' }}><span style={{ width: 30, height: 30, border: '3px solid rgba(37,211,102,0.2)', borderTop: '3px solid #25D366', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} /></div>
            : !assinatura?.tem_assinatura ? (
              <div style={{ ...card, textAlign: 'center', padding: '40px 28px' }}>
                <h4 style={{ fontWeight: 700, marginBottom: 10, color: t.text }}>Nenhum plano ativo</h4>
                <p style={{ color: t.textMuted, fontSize: '0.82rem', marginBottom: 24, lineHeight: 1.6 }}>Você ainda não possui uma assinatura ativa.</p>
                <button onClick={() => navigate('/assinar')} style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '13px 28px', borderRadius: 10, fontWeight: 900, cursor: 'pointer', fontSize: '0.83rem' }}>VER PLANOS</button>
              </div>
            ) : (
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
                  <h4 style={{ fontWeight: 700, color: t.text }}>Plano Atual</h4>
                  <div style={{ display: 'flex', gap: 7 }}>
                    <span style={{ background: 'rgba(37,211,102,0.1)', color: '#25D366', padding: '3px 11px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 800 }}>{PLANO_NOME[assinatura.plano] || assinatura.plano}</span>
                    <span style={{ background: `${statusColor[assinatura.status]}18`, color: statusColor[assinatura.status], padding: '3px 11px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 800 }}>{statusLabel[assinatura.status]}</span>
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  {[{ label: 'Plano', valor: PLANO_NOME[assinatura.plano] || assinatura.plano }, { label: 'Período', valor: assinatura.periodo === 'mensal' ? 'Mensal' : 'Anual' }, { label: 'Status', valor: statusLabel[assinatura.status] }, assinatura.periodo_fim ? { label: assinatura.status === 'cancelado' ? 'Acesso até' : 'Próxima cobrança', valor: new Date(assinatura.periodo_fim).toLocaleDateString('pt-BR') } : null].filter(Boolean).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${t.cardBorder}` }}>
                      <span style={{ fontSize: '0.83rem', color: t.textMuted }}>{item.label}</span>
                      <span style={{ fontSize: '0.83rem', fontWeight: 700, color: t.text }}>{item.valor}</span>
                    </div>
                  ))}
                </div>
                {/* Nota sobre recobrança automática */}
                <div style={{ padding: '11px 13px', background: t.tag, borderRadius: 8, marginBottom: 20, border: `1px solid ${t.cardBorder}` }}>
                  <p style={{ fontSize: '0.72rem', color: t.textMuted, lineHeight: 1.6 }}>
                    {assinatura.status === 'ativo' ? 'Renovação automática pelo Mercado Pago. Ao cancelar, o acesso continua até o fim do período já pago.' : assinatura.status === 'cancelado' ? 'Assinatura cancelada. Após o vencimento seu plano retorna para Starter automaticamente.' : 'Trial ativo. Após o vencimento seu plano retorna para Starter.'}
                  </p>
                </div>
                {msg && <p style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 14, color: msgTipo === 'ok' ? '#25D366' : '#ff4b4b' }}>{msg}</p>}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['ativo', 'trial'].includes(assinatura.status) && assinatura.plano !== 'business' && (
                    <button onClick={() => navigate('/assinar')} style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '12px 22px', borderRadius: 9, fontWeight: 800, cursor: 'pointer', fontSize: '0.78rem' }}>FAZER UPGRADE</button>
                  )}
                  {['ativo', 'trial'].includes(assinatura.status) && (
                    <button onClick={cancelarAssinatura} disabled={cancelando} style={{ background: 'transparent', color: '#ff4b4b', border: '1px solid #ff4b4b', padding: '12px 22px', borderRadius: 9, fontWeight: 700, cursor: cancelando ? 'not-allowed' : 'pointer', fontSize: '0.78rem', opacity: cancelando ? 0.6 : 1 }}>
                      {cancelando ? 'CANCELANDO...' : 'CANCELAR ASSINATURA'}
                    </button>
                  )}
                  {assinatura.status === 'cancelado' && (
                    <button onClick={() => navigate('/assinar')} style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '12px 22px', borderRadius: 9, fontWeight: 800, cursor: 'pointer', fontSize: '0.78rem' }}>REATIVAR ASSINATURA</button>
                  )}
                </div>
              </div>
            )}
        </motion.div>
      )}

      {subTab === 'Visual' && (
        <motion.div {...fadeUp} style={{ maxWidth: 560 }}>
          <div style={card}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6, color: t.text }}>Aparência</h4>
            <p style={{ fontSize: '0.78rem', color: t.textMuted, marginBottom: 24, lineHeight: 1.6 }}>Escolha o tema visual do painel. A preferência é salva localmente.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {Object.keys(TEMAS).map(chave => {
                const ativo = tema === chave; const prev = TEMAS[chave];
                return (
                  <motion.div key={chave} whileHover={{ scale: 1.02 }} onClick={() => { setTema(chave); localStorage.setItem('zapchat_tema', chave); }}
                    style={{ padding: 18, borderRadius: 12, border: `2px solid ${ativo ? '#25D366' : prev.cardBorder}`, background: prev.bg, cursor: 'pointer', transition: 'border 0.2s' }}>
                    <div style={{ height: 48, borderRadius: 8, background: prev.sidebar, border: `1px solid ${prev.cardBorder}`, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: prev.text }}>ZAP<span style={{ color: '#25D366' }}>CHAT</span></span>
                    </div>
                    <p style={{ fontSize: '0.78rem', fontWeight: 700, color: prev.text, marginBottom: 2 }}>{chave === 'escuro' ? 'Tema Escuro' : 'Tema Claro'}</p>
                    {ativo && <p style={{ fontSize: '0.65rem', color: '#25D366', fontWeight: 600 }}>Ativo</p>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ZAPCHAT — TemplatesTab
// Arquivo: frontend/src/pages/Dashboard.js  (trecho para adicionar)
//
// INSTRUÇÕES DE INTEGRAÇÃO:
//
// 1. Cole o componente TemplatesTab em algum lugar antes do componente Dashboard
//    (por exemplo, logo após o componente ChatbotIA)
//
// 2. Em menuItems, adicione uma entrada entre 'Chatbot IA' e 'Testes':
//    { key: 'Templates', label: 'Templates', bloqueado: false },
//
// 3. Em renderContent(), adicione um case no switch:
//    case 'Templates': return <TemplatesTab plano={plano} usuarioId={usuarioId} navigate={navigate} tema={tema} />;
//
// 4. No main.py do backend, registre o router:
//    from app.routes.template_routes import router as template_router
//    app.include_router(template_router)
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── ABA: TEMPLATES ───────────────────────────────────────────────────────────
const TemplatesTab = ({ plano, usuarioId, navigate, tema }) => {
  const t = TEMAS[tema];

  const [templates, setTemplates]           = useState([]);
  const [carregando, setCarregando]         = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const [preview, setPreview]               = useState(null);   // template selecionado para modal
  const [nomeFluxo, setNomeFluxo]           = useState('');
  const [criando, setCriando]               = useState(false);
  const [erroModal, setErroModal]           = useState('');
  const [successId, setSuccessId]           = useState(null);

  // ── Carregar templates da API ──
  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        // 1. A URL deve ser EXATAMENTE a que funcionou no Docs
        const res = await authFetch(`${API_URL}/templates`); 
        
        if (res.status === 401) { navigate('/login'); return; }
        
        const data = await res.json();

        // Compatível tanto com a resposta antiga (array direto) quanto com a resposta atual do backend
        // (objeto com a chave "templates").
        const novaLista = Array.isArray(data) ? data : (Array.isArray(data.templates) ? data.templates : []);
        setTemplates(novaLista);

      } catch (error) {
        console.error("Erro ao carregar templates:", error);
        setTemplates([]);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [navigate]);

  // ── Categorias únicas extraídas dos templates ──
  const categorias = ['todas', ...new Set(templates.map(t => t.categoria))];

  const templatesFiltrados = categoriaAtiva === 'todas'
    ? templates
    : templates.filter(t => t.categoria === categoriaAtiva);

  // ── Labels de categoria legíveis ──
  const labelCategoria = {
    todas:       'Todos',
    saude:       'Saúde',
    ecommerce:   'E-commerce',
    alimentacao: 'Alimentação',
    servicos:    'Serviços',
  };

  // ── Abrir modal de preview ──
  const abrirPreview = (template) => {
    if (!template.disponivel) {
      navigate('/assinar');
      return;
    }
    setPreview(template);
    setNomeFluxo(template.nome);
    setErroModal('');
  };

  const fecharPreview = () => {
    setPreview(null);
    setNomeFluxo('');
    setErroModal('');
  };

  // ── Usar template → criar fluxo ──
  const usarTemplate = async () => {
    if (!nomeFluxo.trim()) {
      setErroModal('Dê um nome para o fluxo antes de continuar.');
      return;
    }
    setCriando(true);
    setErroModal('');
    try {
      const res = await authFetch(`${API_URL}/templates/usar`, {
        method: 'POST',
        body: JSON.stringify({
          template_id: preview.id,
          usuario_id: usuarioId,
          nome_fluxo: nomeFluxo.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErroModal(data.detail || 'Erro ao criar fluxo.');
        return;
      }
      setSuccessId(data.id);
      fecharPreview();
      // Redireciona direto ao editor com o novo fluxo
      setTimeout(() => navigate(`/editor/${data.id}`), 400);
    } catch {
      setErroModal('Erro de conexão. Tente novamente.');
    } finally {
      setCriando(false);
    }
  };

  // ── Nós do preview (parse do fluxo_json, se disponível) ──
  const nosPreview = preview?.fluxo_json
    ? (() => {
        try {
          const parsed = typeof preview.fluxo_json === 'string'
            ? JSON.parse(preview.fluxo_json)
            : preview.fluxo_json;
          return parsed.nodes || [];
        } catch { return []; }
      })()
    : [];

  // ─── ESTILOS INTERNOS ─────────────────────────────────────
  const cardStyle = (disponivel) => ({
    background: t.card,
    border: `1px solid ${t.cardBorder}`,
    borderRadius: 16,
    padding: '24px',
    cursor: 'pointer',
    transition: 'transform 0.18s, border-color 0.18s, box-shadow 0.18s',
    opacity: disponivel ? 1 : 0.6,
    position: 'relative',
    overflow: 'hidden',
  });

  const tagStyle = (cor) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: '0.62rem',
    fontWeight: 800,
    background: `${cor}18`,
    color: cor,
    border: `1px solid ${cor}40`,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  });

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const getTemplateIcon = (icone, nome) => {
    if (!icone) return nome ? nome[0].toUpperCase() : 'T';
    if (/^[a-zA-Z0-9]$/.test(icone)) return icone;
    // Emojis/professionl: usa primeira letra do nome
    return nome ? nome[0].toUpperCase() : 'T';
  };

  const modalStyle = {
    background: t.sidebar,
    border: `1px solid ${t.cardBorder}`,
    borderRadius: 20,
    width: '100%',
    maxWidth: 620,
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '32px',
    position: 'relative',
  };

  // ─────────────────────────────────────────────────────────
  return (
    <motion.div {...fadeUp} style={{ paddingTop: 36 }}>

      {/* Cabeçalho */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: '0.78rem', color: t.textMuted, lineHeight: 1.7, maxWidth: 560 }}>
          Escolha um template pronto e comece a atender seus clientes em minutos.
          O fluxo será criado automaticamente no editor para você personalizar.
        </p>
      </div>

      {/* Filtros de categoria */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              border: `1px solid ${categoriaAtiva === cat ? '#25D366' : t.cardBorder}`,
              background: categoriaAtiva === cat ? 'rgba(37,211,102,0.1)' : 'transparent',
              color: categoriaAtiva === cat ? '#25D366' : t.textMuted,
              fontWeight: categoriaAtiva === cat ? 700 : 500,
              cursor: 'pointer',
              fontSize: '0.78rem',
              transition: 'all 0.15s',
            }}
          >
            {labelCategoria[cat] || cat}
          </button>
        ))}
      </div>

      {/* Grid de cards */}
      {carregando ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: t.textMuted, fontSize: '0.85rem' }}>
          Carregando templates...
        </div>
      ) : templatesFiltrados.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: t.textMuted }}>
          Nenhum template nesta categoria.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 18,
        }}>
          {templatesFiltrados.map(tmpl => (
            <motion.div
              key={tmpl.id}
              style={cardStyle(tmpl.disponivel)}
              whileHover={tmpl.disponivel ? { y: -4, borderColor: tmpl.cor_destaque, boxShadow: `0 8px 28px ${tmpl.cor_destaque}22` } : {}}
              onClick={() => abrirPreview(tmpl)}
            >
              {/* Barra de cor no topo */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 3, background: tmpl.cor_destaque, borderRadius: '16px 16px 0 0',
              }} />

              {/* Badge de plano (se não for starter) */}
              {tmpl.plano_minimo !== 'starter' && (
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)',
                  borderRadius: 20, padding: '2px 9px',
                  fontSize: '0.58rem', fontWeight: 800, color: '#25D366', textTransform: 'uppercase',
                }}>
                  {tmpl.plano_minimo.toUpperCase()}
                </div>
              )}

              {/* Badge bloqueado */}
              {!tmpl.disponivel && (
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  background: 'rgba(255,75,75,0.12)', border: '1px solid rgba(255,75,75,0.3)',
                  borderRadius: 20, padding: '2px 9px',
                  fontSize: '0.58rem', fontWeight: 800, color: '#ff4b4b',
                }}>
                  BLOQUEADO
                </div>
              )}

              {/* Imagem do template (se disponível) */}
              {tmpl.imagem_url && (
                <div style={{
                  width: '100%', height: 140, borderRadius: 10,
                  background: `linear-gradient(135deg, ${tmpl.cor_destaque}15 0%, ${tmpl.cor_destaque}08 100%)`,
                  border: `1px solid ${tmpl.cor_destaque}30`,
                  marginBottom: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img 
                    src={tmpl.imagem_url} 
                    alt={tmpl.imagem_descricao || tmpl.nome}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      filter: !tmpl.disponivel ? 'brightness(0.5) grayscale(0.3)' : 'brightness(1)',
                    }}
                  />
                </div>
              )}

              {/* Ícone (fallback se não tiver imagem) */}
              {!tmpl.imagem_url && (
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${tmpl.cor_destaque}18`,
                  border: `1px solid ${tmpl.cor_destaque}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.05rem', marginBottom: 16, color: tmpl.cor_destaque,
                  fontWeight: 700,
                }}>
                  {getTemplateIcon(tmpl.icone, tmpl.nome)}
                </div>
              )}

              {/* Nome */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: t.text, marginBottom: 8 }}>
                {tmpl.nome}
              </h4>

              {/* Descrição */}
              <p style={{ fontSize: '0.76rem', color: t.textMuted, lineHeight: 1.6, marginBottom: 16, minHeight: 48 }}>
                {tmpl.descricao}
              </p>

              {/* Rodapé */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={tagStyle(tmpl.cor_destaque)}>
                  {labelCategoria[tmpl.categoria] || tmpl.categoria}
                </span>
                <span style={{ fontSize: '0.72rem', color: tmpl.disponivel ? '#25D366' : t.textMuted, fontWeight: 600 }}>
                  {tmpl.disponivel ? 'Ver preview →' : 'Fazer upgrade'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── MODAL DE PREVIEW ── */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={overlayStyle}
            onClick={(e) => { if (e.target === e.currentTarget) fecharPreview(); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={modalStyle}
            >
              {/* Barra de cor */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 4, background: preview.cor_destaque, borderRadius: '20px 20px 0 0',
              }} />

              {/* Header do modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `${preview.cor_destaque}18`,
                    border: `1px solid ${preview.cor_destaque}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', flexShrink: 0,
                  }}>
                    {preview.icone}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: t.text, marginBottom: 4 }}>
                      {preview.nome}
                    </h3>
                    <span style={tagStyle(preview.cor_destaque)}>
                      {labelCategoria[preview.categoria] || preview.categoria}
                    </span>
                  </div>
                </div>
                <button
                  onClick={fecharPreview}
                  style={{ background: 'transparent', border: `1px solid ${t.cardBorder}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: t.textMuted, fontSize: '0.8rem' }}
                >
                  Fechar
                </button>
              </div>

              {/* Descrição */}
              <p style={{ fontSize: '0.83rem', color: t.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
                {preview.descricao}
              </p>

              {/* Imagem do template no modal */}
              {preview.imagem_url && (
                <div style={{
                  width: '100%', height: 200, borderRadius: 12,
                  background: `linear-gradient(135deg, ${preview.cor_destaque}15 0%, ${preview.cor_destaque}08 100%)`,
                  border: `1px solid ${preview.cor_destaque}30`,
                  marginBottom: 24, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img 
                    src={preview.imagem_url} 
                    alt={preview.imagem_descricao || preview.nome}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                    }}
                  />
                </div>
              )}

              {/* Preview dos nós do fluxo */}
              {nosPreview.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: '0.68rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
                    Estrutura do fluxo ({nosPreview.length} etapas)
                  </p>
                  <div style={{
                    background: t.input, borderRadius: 12, border: `1px solid ${t.cardBorder}`,
                    padding: '16px', maxHeight: 260, overflowY: 'auto',
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    {nosPreview.map((no, idx) => (
                      <div key={no.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        {/* Número do nó */}
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: idx === 0 ? '#25D366' : `${preview.cor_destaque}28`,
                          border: `1px solid ${idx === 0 ? '#25D366' : preview.cor_destaque}50`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6rem', fontWeight: 800,
                          color: idx === 0 ? '#0d140d' : preview.cor_destaque,
                        }}>
                          {idx + 1}
                        </div>
                        {/* Texto da mensagem (truncado) */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: '0.74rem', color: t.text, lineHeight: 1.5,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {no.data?.label?.replace(/\n/g, ' ') || '(sem texto)'}
                          </p>
                          {no.data?.options?.length > 0 && (
                            <p style={{ fontSize: '0.62rem', color: t.textMuted, marginTop: 2 }}>
                              {no.data.options.length} opção(ões) de resposta
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Campo de nome do fluxo */}
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: 'block', fontSize: '0.68rem', color: t.textMuted,
                  marginBottom: 7, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px',
                }}>
                  Nome do fluxo
                </label>
                <input
                  type="text"
                  value={nomeFluxo}
                  onChange={e => setNomeFluxo(e.target.value)}
                  placeholder="Ex: Atendimento Clínica"
                  style={{
                    width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`,
                    padding: '11px 13px', borderRadius: 8, color: t.text, outline: 'none',
                    fontSize: '0.88rem', boxSizing: 'border-box',
                  }}
                />
                <p style={{ fontSize: '0.65rem', color: t.textMuted, marginTop: 5 }}>
                  Você poderá renomear o fluxo a qualquer momento no editor.
                </p>
              </div>

              {/* Erro */}
              {erroModal && (
                <p style={{ fontSize: '0.78rem', color: '#ff4b4b', fontWeight: 600, marginBottom: 14 }}>
                  {erroModal}
                </p>
              )}

              {/* Botões */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={fecharPreview}
                  style={{
                    flex: 1, padding: '12px', background: 'transparent',
                    border: `1px solid ${t.cardBorder}`, color: t.textMuted,
                    borderRadius: 10, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
                <motion.button
                  onClick={usarTemplate}
                  disabled={criando}
                  whileHover={{ scale: criando ? 1 : 1.02 }}
                  style={{
                    flex: 2, padding: '12px',
                    background: criando ? 'rgba(37,211,102,0.3)' : '#25D366',
                    color: criando ? '#25D366' : '#0d140d',
                    border: 'none', borderRadius: 10,
                    fontWeight: 800, cursor: criando ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8, transition: 'background 0.2s',
                  }}
                >
                  {criando && (
                    <span style={{
                      width: 13, height: 13,
                      border: '2px solid rgba(13,20,13,0.3)', borderTop: '2px solid #0d140d',
                      borderRadius: '50%', display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  )}
                  {criando ? 'Criando fluxo...' : 'Usar este template'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DIFF: Alterações no componente Dashboard
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Dentro do array menuItems, ADICIONE (entre 'Chatbot IA' e 'Testes'):
//
//   { key: 'Templates', label: 'Templates', bloqueado: false },
//
// Ficará assim:
//
//   const menuItems = [
//     { key: 'Dashboard',     label: 'Dashboard',    bloqueado: false },
//     { key: 'Instancias',    label: 'Fluxos',        bloqueado: false },
//     { key: 'WhatsApp',      label: 'WhatsApp',      bloqueado: false },
//     { key: 'Disparos',      label: 'Disparos',      bloqueado: !PLANO_LIMITES[plano]?.disparos },
//     { key: 'Chatbot IA',    label: 'Chatbot IA',    bloqueado: !PLANO_LIMITES[plano]?.ia },
//     { key: 'Templates',     label: 'Templates',     bloqueado: false },   // <-- ADICIONAR
//     { key: 'Testes',        label: 'Testes & IA',   bloqueado: false },
//     { key: 'Configuracoes', label: 'Configurações', bloqueado: false },
//   ];
//
// ─────────────────────────────────────────────────────────────────────────────
// 2. Dentro do switch em renderContent(), ADICIONE (antes do default):
//
//   case 'Templates': return <TemplatesTab plano={plano} usuarioId={usuarioId} navigate={navigate} tema={tema} />;
//
// ─────────────────────────────────────────────────────────────────────────────
// 3. No main.py, ADICIONE:
//
//   from app.routes.template_routes import router as template_router
//   app.include_router(template_router)
//
// ─────────────────────────────────────────────────────────────────────────────


// ─── ABA: INSTÂNCIAS (FLUXOS) ─────────────────────────────────────────────────
const Instancias = ({ fluxos, carregando, onEditar, onExcluir, tema }) => {
  const t = TEMAS[tema];
  return (
    <motion.div {...fadeUp} style={{ paddingTop: 36 }}>
      <p style={{ fontSize: '0.72rem', color: t.textMuted, marginBottom: 22, fontWeight: 600 }}>{fluxos.length} fluxo(s) no banco de dados</p>
      {carregando ? <p style={{ color: t.textMuted }}>Carregando...</p>
        : fluxos.length > 0 ? fluxos.map(f => <FluxoCard key={f.id} {...f} tema={tema} onEditar={() => onEditar(f.id)} onExcluir={() => onExcluir(f.id)} />)
        : <div style={{ padding: 50, textAlign: 'center', border: `1px dashed ${t.cardBorder}`, borderRadius: 14 }}><p style={{ color: t.textMuted }}>Nenhum fluxo criado ainda.</p></div>}
    </motion.div>
  );
};

// ─── MÉTRICAS DETALHADAS ──────────────────────────────────────────────────────
const MetricasDetalhadas = ({ fluxos, plano, tema }) => {
  const t = TEMAS[tema];
  const isDark = tema === 'escuro';

  const [dados, setDados]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState('');

  useEffect(() => {
    const buscar = async () => {
      setLoading(true);
      setErro('');
      try {
        const res = await authFetch(`${API_URL}/metricas/dashboard`);
        if (!res.ok) throw new Error('Falha ao carregar métricas.');
        const json = await res.json();
        setDados(json);
      } catch (e) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    };
    buscar();
    // Atualiza a cada 60 segundos
    const interval = setInterval(buscar, 60000);
    return () => clearInterval(interval);
  }, []);

  const secao = (titulo, sub) => (
    <div style={{ marginBottom: 8 }}>
      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: t.text, marginBottom: 2 }}>{titulo}</h4>
      {sub && <p style={{ fontSize: '0.72rem', color: t.textMuted }}>{sub}</p>}
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: t.textMuted, fontSize: '0.82rem' }}>
      Carregando métricas...
    </div>
  );

  if (erro) return (
    <div style={{ padding: '20px', background: t.card, borderRadius: 14, border: `1px solid ${t.cardBorder}`, color: t.textMuted, fontSize: '0.82rem', marginTop: 36, textAlign: 'center' }}>
      {erro}
    </div>
  );

  if (!dados) return null;

  // Gráfico de barras — 24 horas
  const horas24 = dados.disparos_por_hora || [];
  const maxVol = Math.max(...horas24.map(h => h.total), 1);

  // Fluxos mais usados vindos da API (já com percentual calculado no backend)
  const fluxosMaisUsados = dados.fluxos_mais_usados || [];

  // IA
  const tokensUsados  = dados.tokens_usados;
  const tokensLimite  = dados.tokens_limite;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 36 }}>
      {/* Separador */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, height: 1, background: t.cardBorder }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Métricas Detalhadas</span>
        <div style={{ flex: 1, height: 1, background: t.cardBorder }} />
      </div>

      {/* Contadores gerais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
        {[
          { l: 'Disparos hoje',     v: dados.disparos_hoje,     cor: '#25D366' },
          { l: 'Total disparos',    v: dados.total_disparos,    cor: t.text    },
          { l: 'Sessões ativas',    v: dados.sessoes_ativas,    cor: '#25D366' },
          { l: 'Fluxos criados',    v: dados.total_fluxos,      cor: t.text    },
          { l: 'Instâncias',        v: `${dados.instancias_conectadas}/${dados.instancias_total}`, cor: '#25D366' },
          { l: 'Erros disparos',    v: dados.disparos_erros,    cor: dados.disparos_erros > 0 ? '#e05252' : t.textMuted },
        ].map((m, i) => (
          <div key={i} style={{ padding: '16px', background: t.card, borderRadius: 12, border: `1px solid ${t.cardBorder}`, textAlign: 'center' }}>
            <p style={{ fontSize: '0.6rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.5px' }}>{m.l}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: m.cor, lineHeight: 1 }}>{m.v}</p>
          </div>
        ))}
      </div>

      {/* Gráfico volume por hora */}
      <div style={{ padding: '24px', background: t.card, borderRadius: 14, border: `1px solid ${t.cardBorder}` }}>
        {secao('Disparos por Hora', 'Volume das últimas 24 horas — dados reais do banco')}
        {horas24.every(h => h.total === 0) ? (
          <p style={{ color: t.textMuted, fontSize: '0.8rem', marginTop: 14 }}>Nenhum disparo nas últimas 24h.</p>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100, marginTop: 18, overflowX: 'auto' }}>
              {horas24.map((h, i) => (
                <div key={i} style={{ flex: 1, minWidth: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <div title={`${h.hora}: ${h.total}`} style={{ width: '100%', background: h.total === maxVol && maxVol > 0 ? '#25D366' : isDark ? 'rgba(37,211,102,0.2)' : 'rgba(37,211,102,0.25)', borderRadius: '4px 4px 0 0', height: `${(h.total / maxVol) * 80}%`, transition: 'height 0.3s', minHeight: h.total > 0 ? 4 : 1 }} />
                  <p style={{ fontSize: '0.48rem', color: t.textMuted, transform: 'rotate(-45deg)', transformOrigin: 'center', whiteSpace: 'nowrap' }}>{h.hora}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 12 }}>
              {(() => {
                const picoHora = horas24.find(h => h.total === maxVol);
                const totalHoje = horas24.reduce((a, b) => a + b.total, 0);
                const media = Math.round(totalHoje / 24);
                return [
                  { l: 'Pico', v: picoHora ? `${picoHora.hora} (${maxVol})` : '—' },
                  { l: 'Total 24h', v: totalHoje },
                  { l: 'Média/hora', v: media },
                ].map((m, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.62rem', color: t.textMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 3 }}>{m.l}</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: t.text }}>{m.v}</p>
                  </div>
                ));
              })()}
            </div>
          </>
        )}
      </div>

      {/* Fluxos mais usados + Velocidade */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Fluxos mais usados */}
        <div style={{ padding: '24px', background: t.card, borderRadius: 14, border: `1px solid ${t.cardBorder}` }}>
          {secao('Fluxos Mais Usados', 'Ranking por sessões de bot ativas')}
          {fluxosMaisUsados.length === 0 ? (
            <p style={{ color: t.textMuted, fontSize: '0.82rem', marginTop: 14 }}>Nenhum dado disponível ainda.</p>
          ) : (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fluxosMaisUsados.map((f, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.78rem', color: t.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: 8 }}>{f.nome_fluxo}</span>
                    <span style={{ fontSize: '0.72rem', color: '#25D366', fontWeight: 700, flexShrink: 0 }}>{f.usos} sessões</span>
                  </div>
                  <div style={{ height: 5, background: t.cardBorder, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${f.percentual}%`, background: i === 0 ? '#25D366' : isDark ? 'rgba(37,211,102,0.35)' : 'rgba(37,211,102,0.5)', borderRadius: 99, transition: 'width 0.4s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TMR / TMA — null até ter Evolution API */}
        <div style={{ padding: '24px', background: t.card, borderRadius: 14, border: `1px solid ${t.cardBorder}` }}>
          {secao('Velocidade de Atendimento', dados.tmr_segundos != null ? 'Dados reais' : 'Disponível após conectar WhatsApp')}
          <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
            {[
              { label: 'TMR — Tempo Médio de Resposta',     value: dados.tmr_segundos != null ? fmtTempo(dados.tmr_segundos) : '—', desc: 'Da mensagem até o bot responder', cor: '#25D366' },
              { label: 'TMA — Tempo Médio de Atendimento',  value: dados.tma_segundos != null ? fmtTempo(dados.tma_segundos) : '—', desc: 'Do início ao fim da conversa',    cor: '#25D366' },
              { label: 'Taxa de resolução',                  value: dados.taxa_resolucao != null ? `${dados.taxa_resolucao}%` : '—', desc: 'Conversas encerradas pelo bot',  cor: '#f0a500' },
            ].map((m, i) => (
              <div key={i} style={{ padding: '12px 14px', background: t.tag, borderRadius: 10, border: `1px solid ${t.cardBorder}` }}>
                <p style={{ fontSize: '0.62rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{m.label}</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: m.value === '—' ? t.textMuted : m.cor, lineHeight: 1, marginBottom: 3 }}>{m.value}</p>
                <p style={{ fontSize: '0.62rem', color: t.textMuted }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas de IA */}
      {PLANO_LIMITES[plano]?.ia ? (
        <div style={{ padding: '24px', background: t.card, borderRadius: 14, border: `1px solid ${t.cardBorder}` }}>
          {secao('Métricas de IA', tokensUsados != null ? 'Dados reais de consumo' : 'Disponível após configurar agente IA')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 18 }}>
            {/* Tokens */}
            <div style={{ padding: '16px', background: t.tag, borderRadius: 12, border: `1px solid ${t.cardBorder}` }}>
              <p style={{ fontSize: '0.62rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Uso de Tokens</p>
              {tokensUsados != null && tokensLimite != null ? (
                <>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: t.text, lineHeight: 1, marginBottom: 3 }}>
                    {tokensUsados.toLocaleString('pt-BR')}
                    <span style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 400, marginLeft: 4 }}>/ {(tokensLimite / 1000).toFixed(0)}k</span>
                  </p>
                  <div style={{ height: 5, background: t.cardBorder, borderRadius: 99, overflow: 'hidden', marginTop: 8 }}>
                    <div style={{ height: '100%', width: `${Math.min((tokensUsados / tokensLimite) * 100, 100)}%`, background: 'linear-gradient(90deg, #25D366, #1aad5e)', borderRadius: 99 }} />
                  </div>
                  <p style={{ fontSize: '0.62rem', color: t.textMuted, marginTop: 5 }}>{((tokensUsados / tokensLimite) * 100).toFixed(1)}% da franquia usada</p>
                </>
              ) : (
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: t.textMuted, lineHeight: 1 }}>—</p>
              )}
            </div>
            {/* Sessões totais */}
            <div style={{ padding: '16px', background: t.tag, borderRadius: 12, border: `1px solid ${t.cardBorder}` }}>
              <p style={{ fontSize: '0.62rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Sessões de Bot</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#25D366', lineHeight: 1, marginBottom: 3 }}>{dados.sessoes_ativas}</p>
              <p style={{ fontSize: '0.7rem', color: t.textMuted }}>ativas nos últimos 30min</p>
            </div>
            {/* Disparos com erro */}
            <div style={{ padding: '16px', background: t.tag, borderRadius: 12, border: `1px solid ${t.cardBorder}` }}>
              <p style={{ fontSize: '0.62rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Disparos com Erro</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: dados.disparos_erros > 0 ? '#e05252' : '#25D366', lineHeight: 1, marginBottom: 3 }}>{dados.disparos_erros}</p>
              <p style={{ fontSize: '0.7rem', color: t.textMuted }}>{dados.disparos_erros === 0 ? 'Nenhum erro registrado' : 'Verifique o histórico de disparos'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px 24px', background: t.card, borderRadius: 14, border: `1px dashed ${t.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: t.text, marginBottom: 3 }}>Métricas de IA disponíveis no plano Pro</p>
            <p style={{ fontSize: '0.75rem', color: t.textMuted }}>Veja uso de tokens, sessões ativas e taxa de erros.</p>
          </div>
          <span style={{ fontSize: '0.68rem', background: 'rgba(37,211,102,0.1)', color: '#25D366', padding: '4px 12px', borderRadius: 20, fontWeight: 800 }}>PRO</span>
        </div>
      )}
    </div>
  );
};

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const [tema, setTema]           = useState(() => localStorage.getItem('zapchat_tema') || 'escuro');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [fluxos, setFluxos]       = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [criando, setCriando]     = useState(false);
  const [trialBanner, setTrialBanner] = useState(false);
  const [plano, setPlano]         = useState('starter');
  const [menuAberto, setMenuAberto] = useState(false);

  const t           = TEMAS[tema];
  const usuarioId   = parseInt(localStorage.getItem('usuario_id'));
  const usuarioNome = localStorage.getItem('usuario_nome') || 'Usuário';

  const menuItems = [
    { key: 'Dashboard',     label: 'Dashboard',      bloqueado: false },
    { key: 'Instancias',    label: 'Fluxos',          bloqueado: false },
    { key: 'WhatsApp',      label: 'WhatsApp',        bloqueado: false },
    { key: 'Disparos',      label: 'Disparos',        bloqueado: !PLANO_LIMITES[plano]?.disparos },
    { key: 'Chatbot IA',    label: 'Chatbot IA',      bloqueado: !PLANO_LIMITES[plano]?.ia },
    { key: 'Templates',     label: 'Templates',       bloqueado: false },
    { key: 'Testes',        label: 'Testes & IA',     bloqueado: false },
    { key: 'Configuracoes', label: 'Configurações',   bloqueado: false },
  ];

  useEffect(() => {
    authFetch(`${API_URL}/pagamentos/minha-assinatura`).then(r => r.json()).then(d => { if (d.tem_assinatura && d.plano) setPlano(d.plano); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get('trial') === 'ativado') { setTrialBanner(true); setTimeout(() => setTrialBanner(false), 6000); }
  }, [searchParams]);

  const carregarFluxos = useCallback(async () => {
    if (!usuarioId) return;
    setCarregando(true);
    try {
      const res = await authFetch(`${API_URL}/fluxos/listar/${usuarioId}`);
      if (res.status === 401) { navigate('/login'); return; }
      const data = await res.json();
      setFluxos(data.fluxos || []);
    } catch {}
    finally { setCarregando(false); }
  }, [usuarioId]);

  useEffect(() => { carregarFluxos(); }, [carregarFluxos]);

  const criarNovoFluxo = async () => {
    if (!usuarioId) return;
    setCriando(true);
    try {
      const res = await authFetch(`${API_URL}/fluxos/salvar`, {
        method: 'POST',
        body: JSON.stringify({ id: 0, usuario_id: usuarioId, nome_fluxo: `Fluxo #${fluxos.length + 1}`, nodes: [{ id: '1', type: 'botNode', data: { label: 'Olá! Como posso ajudar?', options: [], delay: 2 }, position: { x: 400, y: 100 } }], edges: [] }),
      });
      if (res.status === 401) { navigate('/login'); return; }
      const data = await res.json();
      if (data.id) navigate(`/editor/${data.id}`);
    } catch {}
    finally { setCriando(false); }
  };

  const excluirFluxo = async (id) => {
    if (!window.confirm('Excluir este fluxo? Esta ação não pode ser desfeita.')) return;
    try {
      await authFetch(`${API_URL}/fluxos/${id}/${usuarioId}`, { method: 'DELETE' });
      setFluxos(prev => prev.filter(f => f.id !== id));
    } catch { alert('Erro ao excluir.'); }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <motion.div {...fadeUp} style={{ paddingTop: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.18)', borderRadius: 20, padding: '5px 13px', marginBottom: 26 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#25D366', boxShadow: '0 0 5px #25D366' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#25D366', textTransform: 'uppercase', letterSpacing: '1px' }}>Plano {PLANO_NOME[plano] || plano}</span>
              {plano !== 'business' && <span onClick={() => navigate('/assinar')} style={{ fontSize: '0.63rem', color: t.textMuted, cursor: 'pointer', marginLeft: 3, textDecoration: 'underline' }}>fazer upgrade</span>}
            </div>

            {/* Cards resumo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
              <StatCard tema={tema} label="Fluxos Criados" value={fluxos.length} trend={fluxos.length > 0 ? `${fluxos.length} fluxo(s) no banco` : 'Nenhum fluxo ainda'} />
              <StatCard tema={tema} label="Último Fluxo" value={fluxos[0]?.nome_fluxo || '—'} trend={fluxos[0] ? new Date(fluxos[0].data_criacao).toLocaleDateString('pt-BR') : 'Sem registros'} />
              <StatCard tema={tema} label="Sessões Ativas" value="0" trend="Disponível após VPS" />
              <StatCard tema={tema} label="Status" value={fluxos.length > 0 ? 'Online' : 'Aguardando'} trend={fluxos.length > 0 ? 'Fluxos prontos' : 'Crie um fluxo'} trendPositive={fluxos.length > 0} />
            </div>

            {carregando ? <p style={{ textAlign: 'center', padding: '60px 0', color: t.textMuted }}>Carregando fluxos...</p>
              : fluxos.length > 0 ? (
                <>
                  <p style={{ fontSize: '0.68rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 13 }}>Seus Fluxos</p>
                  {fluxos.map(f => <FluxoCard key={f.id} tema={tema} {...f} onExcluir={() => excluirFluxo(f.id)} onEditar={() => navigate(`/editor/${f.id}`)} />)}
                </>
              ) : (
                <div style={{ padding: '70px 40px', borderRadius: 18, border: `1px dashed ${t.cardBorder}`, textAlign: 'center', background: t.card }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: t.text }}>Nenhum fluxo disponível</h3>
                  <p style={{ color: t.textMuted, fontSize: '0.88rem' }}>Clique em "+ Novo Fluxo" para começar.</p>
                </div>
              )}

            {/* Métricas detalhadas logo abaixo */}
            <MetricasDetalhadas fluxos={fluxos} plano={plano} tema={tema} />
          </motion.div>
        );

      case 'Instancias':    return <Instancias fluxos={fluxos} carregando={carregando} tema={tema} onEditar={id => navigate(`/editor/${id}`)} onExcluir={excluirFluxo} />;
      case 'WhatsApp':      return <WhatsAppTab fluxos={fluxos} usuarioId={usuarioId} plano={plano} tema={tema} />;
      case 'Disparos':      return <DisparosTab plano={plano} navigate={navigate} tema={tema} />;
      case 'Chatbot IA':    return <ChatbotIA fluxos={fluxos} plano={plano} navigate={navigate} tema={tema} />;
      case 'Templates': return <TemplatesTab plano={plano} usuarioId={usuarioId} navigate={navigate} tema={tema} />;
      case 'Testes':        return <TestesIA fluxos={fluxos} plano={plano} usuarioId={usuarioId} navigate={navigate} tema={tema} />;
      case 'Configuracoes': return <ConfigSettings usuarioId={usuarioId} tema={tema} setTema={setTema} />;
      default:              return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: t.bg, color: t.text, overflow: 'hidden', transition: 'background 0.3s, color 0.3s' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dotBounce { 0%,80%,100% { transform: scale(0.7); opacity:0.5; } 40% { transform: scale(1); opacity:1; } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollbar}; border-radius: 99px; }
        input:focus, textarea:focus, select:focus { border-color: rgba(37,211,102,0.45) !important; box-shadow: 0 0 0 3px rgba(37,211,102,0.07) !important; }
        @media (max-width: 768px) {
          .dash-sidebar { display: none !important; }
          .dash-sidebar.open { display: flex !important; position: fixed !important; inset: 0 auto 0 0 !important; width: 82vw !important; max-width: 270px !important; z-index: 100 !important; box-shadow: 4px 0 30px rgba(0,0,0,0.45) !important; }
          .dash-main { padding: 0 18px !important; }
          .dash-header { padding: 18px 0 !important; }
          .mobile-btn { display: flex !important; }
          .desk-only { display: none !important; }
        }
        @media (min-width: 769px) {
          .dash-sidebar { display: flex !important; }
          .mobile-btn { display: none !important; }
        }
        /* Grid de testes responsivo */
        @media (max-width: 900px) {
          .testes-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Trial banner */}
      <AnimatePresence>
        {trialBanner && (
          <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 18, right: 18, zIndex: 999, background: '#0c1f0f', border: '1px solid rgba(37,211,102,0.4)', borderRadius: 12, padding: '14px 20px', boxShadow: '0 8px 28px rgba(0,0,0,0.35)' }}>
            <p style={{ fontWeight: 800, fontSize: '0.83rem', color: '#25D366', marginBottom: 1 }}>Trial ativado com sucesso!</p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>7 dias de acesso completo ao Starter.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay mobile */}
      {menuAberto && <div onClick={() => setMenuAberto(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />}

      {/* ── SIDEBAR ── */}
      <aside className={`dash-sidebar${menuAberto ? ' open' : ''}`}
        style={{ width: 240, minWidth: 240, background: t.sidebar, borderRight: `1px solid ${t.cardBorder}`, padding: '34px 20px', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', marginBottom: 42, display: 'block' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-1px', color: t.text }}>ZAP<span style={{ color: '#25D366' }}>CHAT</span></h2>
        </Link>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
          {menuItems.map(({ key, label, bloqueado }) => (
            <MenuItem key={key} label={label} ativo={activeTab === key} bloqueado={bloqueado} tema={tema} onClick={() => { setActiveTab(key); setMenuAberto(false); }} />
          ))}
        </nav>
        <div style={{ padding: '11px 13px', background: 'rgba(37,211,102,0.06)', borderRadius: 10, border: '1px solid rgba(37,211,102,0.12)', marginBottom: 10, textAlign: 'center' }}>
          <p style={{ fontSize: '0.58rem', color: t.textMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>Plano atual</p>
          <p style={{ fontSize: '0.82rem', fontWeight: 900, color: '#25D366' }}>{PLANO_NOME[plano] || plano}</p>
          {plano !== 'business' && <p onClick={() => navigate('/assinar')} style={{ fontSize: '0.6rem', color: t.textMuted, cursor: 'pointer', marginTop: 3, textDecoration: 'underline' }}>fazer upgrade</p>}
        </div>
        <div style={{ padding: 13, background: t.card, borderRadius: 10, border: `1px solid ${t.cardBorder}` }}>
          <p style={{ fontSize: '0.6rem', color: t.textMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Logado como</p>
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#25D366', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usuarioNome}</p>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="dash-main" style={{ flexGrow: 1, padding: '0 48px', overflowY: 'auto', minWidth: 0 }}>
        <header className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '34px 0', borderBottom: `1px solid ${t.cardBorder}`, position: 'sticky', top: 0, background: t.header, zIndex: 10, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <button className="mobile-btn" onClick={() => setMenuAberto(v => !v)}
              style={{ display: 'none', background: 'transparent', border: `1px solid ${t.cardBorder}`, borderRadius: 8, padding: '8px 11px', cursor: 'pointer', color: t.text, fontSize: '1rem', alignItems: 'center', justifyContent: 'center' }}>
              ☰
            </button>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: t.text }}>{menuItems.find(m => m.key === activeTab)?.label || activeTab}</h1>
              <p style={{ color: t.textMuted, fontSize: '0.8rem' }}>ZapChat / {menuItems.find(m => m.key === activeTab)?.label || activeTab}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <button className="desk-only" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              style={{ background: 'transparent', color: t.textMuted, border: `1px solid ${t.cardBorder}`, padding: '10px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.7rem' }}>
              SAIR
            </button>
            <motion.button onClick={criarNovoFluxo} disabled={criando}
              whileHover={{ scale: 1.02, backgroundColor: '#25D366', color: '#0d140d' }}
              style={{ background: 'transparent', color: '#25D366', border: '1px solid #25D366', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: criando ? 'not-allowed' : 'pointer', opacity: criando ? 0.6 : 1, transition: 'background 0.2s, color 0.2s', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
              {criando ? 'Criando...' : '+ Novo Fluxo'}
            </motion.button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;