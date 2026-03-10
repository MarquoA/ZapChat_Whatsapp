import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};

// Limites por plano
const PLANO_LIMITES = {
  starter:  { instancias: 1,   ia: false, disparos: false, treinamento: false, whitelabel: false },
  pro:      { instancias: 3,   ia: true,  disparos: true,  treinamento: false, whitelabel: false },
  business: { instancias: 999, ia: true,  disparos: true,  treinamento: true,  whitelabel: true  },
};

const PLANO_NOME = { starter: 'Starter', pro: 'Pro', business: 'Business' };
const PLANO_UPGRADE = { starter: 'Pro', pro: 'Business', business: null };

// ─── COMPONENTE: BANNER DE BLOQUEIO ─────────────────────────────────────────
const BloqueadoBanner = ({ recurso, planoAtual, navigate }) => {
  const upgrade = PLANO_UPGRADE[planoAtual] || 'Business';
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ marginTop: '40px', padding: '60px 40px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '10px' }}>{recurso} não disponível no seu plano</h3>
      <p style={{ opacity: 0.4, fontSize: '0.85rem', marginBottom: '28px', lineHeight: '1.7', maxWidth: '380px', margin: '0 auto 28px' }}>
        Faça upgrade para o plano <strong style={{ color: '#25D366' }}>{upgrade}</strong> e desbloqueie esta funcionalidade e muito mais.
      </p>
      <motion.button whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(37,211,102,0.2)' }}
        onClick={() => navigate('/assinar')}
        style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '14px 32px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>
        FAZER UPGRADE AGORA →
      </motion.button>
    </motion.div>
  );
};

// ─── COMPONENTE: MENU ITEM COM CADEADO ──────────────────────────────────────
const MenuItem = ({ item, activeTab, bloqueado, onClick }) => (
  <div onClick={onClick}
    style={{ padding: '12px 15px', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px', color: activeTab === item ? 'var(--brand-green)' : bloqueado ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)', background: activeTab === item ? 'rgba(37,211,102,0.05)' : 'transparent', fontWeight: activeTab === item ? '700' : '500', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: '0.2s' }}>
    <span>{item}</span>
    {bloqueado && <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>🔒</span>}
  </div>
);

// ─── COMPONENTES UTILITÁRIOS ─────────────────────────────────────────────────
const StatCard = ({ label, value, trend, trendPositive = true }) => (
  <motion.div whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.03)' }}
    style={{ background: 'rgba(255,255,255,0.01)', padding: '30px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}>
    <p style={{ opacity: 0.4, fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{label}</p>
    <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>{value}</h3>
    <span style={{ color: trendPositive ? '#25D366' : '#ff4b4b', fontSize: '0.75rem', fontWeight: '600' }}>{trend}</span>
  </motion.div>
);

const FluxoCard = ({ id, nome_fluxo, data_criacao, onExcluir, onEditar }) => (
  <motion.div whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.02)' }}
    style={{ padding: '20px 25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25D366' }} />
      <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>{nome_fluxo}</h4>
        <p style={{ fontSize: '0.72rem', opacity: 0.4 }}>Criado em: {new Date(data_criacao).toLocaleString('pt-BR')}</p>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '10px' }}>
      <button onClick={onEditar} style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700' }}>EDITAR</button>
      <button onClick={onExcluir} style={{ background: 'transparent', border: '1px solid #ff4b4b', color: '#ff4b4b', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700' }}>EXCLUIR</button>
    </div>
  </motion.div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.4, marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700' }}>{label}</label>
    <input {...props} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box', ...props.style }} />
  </div>
);

const SaveButton = ({ onClick, loading, label = 'SALVAR ALTERAÇÕES' }) => (
  <motion.button onClick={onClick} disabled={loading}
    whileHover={{ backgroundColor: '#25D366', color: '#0d140d' }}
    style={{ background: 'transparent', border: '1px solid #25D366', color: '#25D366', padding: '15px', borderRadius: '10px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.8rem', transition: '0.3s', opacity: loading ? 0.6 : 1 }}>
    {loading ? 'SALVANDO...' : label}
  </motion.button>
);

// ─── ABA: WHATSAPP ───────────────────────────────────────────────────────────
const WhatsAppTab = ({ fluxos, usuarioId, plano }) => {
  const navigate = useNavigate();
  const [instancias, setInstancias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [criando, setCriando] = useState(false);
  const [nomeInstancia, setNomeInstancia] = useState('');
  const [fluxoVinculado, setFluxoVinculado] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [aguardandoQR, setAguardandoQR] = useState(false);
  const [instanciaAtiva, setInstanciaAtiva] = useState(null);
  const [erroLimite, setErroLimite] = useState('');

  const limite = PLANO_LIMITES[plano]?.instancias || 1;
  const atingiuLimite = instancias.length >= limite;

  const carregarInstancias = async () => {
    if (!usuarioId) return;
    setCarregando(true);
    try {
      const res = await authFetch(`${API_URL}/instancias/listar/${usuarioId}`);
      if (res.status === 401) return;
      const data = await res.json();
      setInstancias(data.instancias || []);
    } catch (err) { console.error(err); }
    finally { setCarregando(false); }
  };

  useEffect(() => { carregarInstancias(); }, [usuarioId]);

  const criarInstancia = async () => {
    if (!nomeInstancia.trim() || !fluxoVinculado) return;
    setCriando(true);
    setErroLimite('');
    try {
      const res = await authFetch(`${API_URL}/instancias/criar`, {
        method: 'POST',
        body: JSON.stringify({ usuario_id: usuarioId, nome: nomeInstancia, fluxo_id: parseInt(fluxoVinculado) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErroLimite(data.detail || 'Erro ao criar instância.');
        return;
      }
      await carregarInstancias();
      setNomeInstancia(''); setFluxoVinculado(''); setMostrarForm(false);
    } catch { setErroLimite('Erro ao criar instância.'); }
    finally { setCriando(false); }
  };

  const excluirInstancia = async (id) => {
    if (!window.confirm('Excluir esta instância?')) return;
    try {
      await authFetch(`${API_URL}/instancias/${id}/${usuarioId}`, { method: 'DELETE' });
      setInstancias(instancias.filter(i => i.id !== id));
      if (instanciaAtiva?.id === id) setInstanciaAtiva(null);
    } catch { alert('Erro ao excluir instância.'); }
  };

  const conectar = (instancia) => {
    setInstanciaAtiva(instancia); setAguardandoQR(true);
    setTimeout(() => setAguardandoQR(false), 1500);
  };

  const statusColor = (s) => s === 'conectado' ? '#25D366' : s === 'aguardando' ? '#f0a500' : '#ff4b4b';
  const statusLabel = (s) => s === 'conectado' ? '🟢 Conectado' : s === 'aguardando' ? '🟡 Aguardando QR' : '🔴 Desconectado';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '40px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Banner de aviso VPS */}
      <div style={{ background: 'rgba(240,165,0,0.05)', border: '1px solid rgba(240,165,0,0.2)', borderRadius: '12px', padding: '15px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.2rem' }}>⚠️</span>
        <div>
          <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f0a500', marginBottom: '3px' }}>Conexão com VPS necessária</p>
          <p style={{ fontSize: '0.72rem', opacity: 0.5 }}>O QR Code real estará disponível após configurar a Evolution API na sua VPS.</p>
        </div>
      </div>

      {/* Banner de limite do plano */}
      <div style={{ background: 'rgba(37,211,102,0.04)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '12px', padding: '14px 20px', marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1rem' }}>📱</span>
          <span style={{ fontSize: '0.82rem', opacity: 0.7 }}>
            <strong style={{ color: '#25D366' }}>{instancias.length}</strong> de <strong style={{ color: 'white' }}>{limite === 999 ? '∞' : limite}</strong> instâncias usadas — Plano <strong style={{ color: '#25D366' }}>{PLANO_NOME[plano] || plano}</strong>
          </span>
        </div>
        {atingiuLimite && plano !== 'business' && (
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/assinar')}
            style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.72rem' }}>
            FAZER UPGRADE →
          </motion.button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <p style={{ fontSize: '0.75rem', opacity: 0.4, fontWeight: '600' }}>{instancias.length} instância(s) no banco de dados</p>
        <motion.button
          onClick={() => { if (atingiuLimite) { setErroLimite(`Limite de ${limite} instância(s) atingido. Faça upgrade para adicionar mais.`); return; } setMostrarForm(!mostrarForm); setErroLimite(''); }}
          whileHover={{ scale: 1.02, backgroundColor: atingiuLimite ? 'transparent' : '#25D366', color: atingiuLimite ? '#ff4b4b' : '#0d140d' }}
          style={{ background: 'transparent', color: atingiuLimite ? '#ff4b4b' : '#25D366', border: `1px solid ${atingiuLimite ? '#ff4b4b' : '#25D366'}`, padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.75px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
          {atingiuLimite ? '🔒 LIMITE ATINGIDO' : (mostrarForm ? '✕ CANCELAR' : '+ NOVA INSTÂNCIA')}
        </motion.button>
      </div>

      {/* Erro de limite */}
      <AnimatePresence>
        {erroLimite && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: '14px 18px', background: 'rgba(255,75,75,0.08)', border: '1px solid rgba(255,75,75,0.25)', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ fontSize: '0.82rem', color: '#ff4b4b' }}>🔒 {erroLimite}</span>
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/assinar')}
              style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
              VER PLANOS
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulário de nova instância */}
      <AnimatePresence>
        {mostrarForm && !atingiuLimite && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '25px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '20px' }}>Nova Instância WhatsApp</h4>
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <Input label="Nome da instância" type="text" value={nomeInstancia} onChange={e => setNomeInstancia(e.target.value)} placeholder="Ex: Atendimento Principal" />
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.4, marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700' }}>Fluxo vinculado</label>
                <select value={fluxoVinculado} onChange={e => setFluxoVinculado(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '0.9rem' }}>
                  <option value="" style={{ background: '#0d140d' }}>Selecione um fluxo...</option>
                  {fluxos.map(f => <option key={f.id} value={f.id} style={{ background: '#0d140d' }}>{f.nome_fluxo}</option>)}
                </select>
              </div>
            </div>
            <motion.button onClick={criarInstancia} disabled={criando} whileHover={{ scale: 1.02 }}
              style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: '800', cursor: criando ? 'not-allowed' : 'pointer', fontSize: '0.8rem', opacity: criando ? 0.6 : 1 }}>
              {criando ? 'CRIANDO...' : 'CRIAR INSTÂNCIA'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de instâncias */}
      {carregando ? <p style={{ opacity: 0.4 }}>Carregando instâncias...</p>
        : instancias.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '15px' }}>
            <p style={{ fontSize: '2rem', marginBottom: '15px' }}>📱</p>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px' }}>Nenhuma instância criada</h3>
            <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>Clique em "+ NOVA INSTÂNCIA" para conectar um número de WhatsApp.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {instancias.map(inst => (
              <motion.div key={inst.id} whileHover={{ x: 3 }}
                style={{ padding: '20px 25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(37,211,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📱</div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '3px' }}>{inst.nome}</h4>
                      <p style={{ fontSize: '0.72rem', opacity: 0.4 }}>Fluxo: {inst.fluxo_nome}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: statusColor(inst.status) }}>{statusLabel(inst.status)}</span>
                    <motion.button onClick={() => conectar(inst)} whileHover={{ scale: 1.05 }}
                      style={{ background: inst.status === 'conectado' ? 'transparent' : '#25D366', color: inst.status === 'conectado' ? '#25D366' : '#0d140d', border: inst.status === 'conectado' ? '1px solid #25D366' : 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700' }}>
                      {inst.status === 'conectado' ? 'RECONECTAR' : 'CONECTAR'}
                    </motion.button>
                    <button onClick={() => excluirInstancia(inst.id)}
                      style={{ background: 'transparent', border: '1px solid #ff4b4b', color: '#ff4b4b', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700' }}>EXCLUIR</button>
                  </div>
                </div>
                {instanciaAtiva?.id === inst.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginTop: '20px', padding: '25px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    {aguardandoQR ? (
                      <div>
                        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(37,211,102,0.3)', borderTop: '3px solid #25D366', borderRadius: '50%', margin: '0 auto 15px', animation: 'spin 1s linear infinite' }} />
                        <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>Gerando QR Code...</p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ width: '200px', height: '200px', margin: '0 auto 20px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px' }}>
                          <span style={{ fontSize: '3rem' }}>📷</span>
                          <p style={{ color: '#0d140d', fontSize: '0.7rem', fontWeight: '700', textAlign: 'center', padding: '0 10px' }}>QR Code disponível após configurar a VPS</p>
                        </div>
                        <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Abra o WhatsApp → Dispositivos conectados → Conectar dispositivo</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
    </motion.div>
  );
};

// ─── ABA: CHATBOT IA ─────────────────────────────────────────────────────────
const ChatbotIA = ({ fluxos, plano, navigate }) => {
  const [fluxoSelecionado, setFluxoSelecionado] = useState('');
  const [prompt, setPrompt] = useState('');
  const [salvo, setSalvo] = useState(false);

  if (!PLANO_LIMITES[plano]?.ia) {
    return <BloqueadoBanner recurso="Chatbot IA" planoAtual={plano} navigate={navigate} />;
  }

  const salvar = () => {
    if (!fluxoSelecionado || !prompt.trim()) return;
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '40px', maxWidth: '700px' }}>
      <div style={{ padding: '30px', background: 'rgba(255,255,255,0.01)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px' }}>Instruções do Bot</h4>
        <p style={{ fontSize: '0.78rem', opacity: 0.4, marginBottom: '25px' }}>Configure como o bot deve se comportar quando não encontrar uma opção no fluxo.</p>
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.4, marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700' }}>Fluxo vinculado</label>
            <select value={fluxoSelecionado} onChange={e => setFluxoSelecionado(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '0.9rem' }}>
              <option value="" style={{ background: '#0d140d' }}>Selecione um fluxo...</option>
              {fluxos.map(f => <option key={f.id} value={f.id} style={{ background: '#0d140d' }}>{f.nome_fluxo}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.4, marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700' }}>Prompt de fallback</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
              placeholder="Ex: Você é um assistente da empresa X. Quando o cliente digitar algo fora do menu, responda de forma educada..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>
      {salvo && <p style={{ color: '#25D366', fontSize: '0.8rem', fontWeight: '700', marginBottom: '10px' }}>Configurações salvas!</p>}
      <SaveButton onClick={salvar} label="SALVAR CONFIGURAÇÕES" />
    </motion.div>
  );
};

// ─── ABA: DISPAROS ───────────────────────────────────────────────────────────
const DisparosTab = ({ plano, navigate }) => {
  if (!PLANO_LIMITES[plano]?.disparos) {
    return <BloqueadoBanner recurso="Disparos em Massa" planoAtual={plano} navigate={navigate} />;
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '40px' }}>
      <div style={{ padding: '30px', background: 'rgba(255,255,255,0.01)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px' }}>Disparos em Massa</h4>
        <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>Funcionalidade disponível — em breve você poderá enviar mensagens em massa aqui.</p>
      </div>
    </motion.div>
  );
};

// ─── ABA: CONFIGURAÇÕES ──────────────────────────────────────────────────────
const ConfigSettings = ({ usuarioId }) => {
  const navigate = useNavigate();
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
  const [loadingAssinatura, setLoadingAssinatura] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const mostrarMsg = (texto, tipo = 'ok') => { setMsg(texto); setMsgTipo(tipo); setTimeout(() => setMsg(''), 4000); };

  useEffect(() => {
    if (!usuarioId) return;
    authFetch(`${API_URL}/usuarios/${usuarioId}`).then(r => r.json()).then(d => { setNome(d.nome || ''); setEmail(d.email || ''); }).catch(() => {});
  }, [usuarioId]);

  useEffect(() => {
    if (subTab !== 'Assinatura') return;
    setLoadingAssinatura(true);
    authFetch(`${API_URL}/pagamentos/minha-assinatura`).then(r => r.json()).then(d => setAssinatura(d)).catch(() => setAssinatura(null)).finally(() => setLoadingAssinatura(false));
  }, [subTab]);

  const salvarPerfil = async () => {
    if (!nome.trim()) return mostrarMsg('Nome não pode ser vazio.', 'erro');
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/usuarios/${usuarioId}/nome`, { method: 'PUT', body: JSON.stringify({ nome }) });
      if (!res.ok) throw new Error();
      localStorage.setItem('usuario_nome', nome);
      mostrarMsg('Nome atualizado com sucesso!');
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
      if (!res.ok) throw new Error(data.detail || 'Erro');
      mostrarMsg('Senha alterada com sucesso!');
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
    } catch (e) { mostrarMsg(e.message, 'erro'); }
    finally { setLoading(false); }
  };

  const cancelarAssinatura = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar sua assinatura?')) return;
    setCancelando(true);
    try {
      const res = await authFetch(`${API_URL}/pagamentos/cancelar`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro');
      setAssinatura(prev => ({ ...prev, status: 'cancelado' }));
      mostrarMsg('Assinatura cancelada. Seu acesso continua até o fim do período.');
    } catch (e) { mostrarMsg(e.message || 'Erro ao cancelar.', 'erro'); }
    finally { setCancelando(false); }
  };

  const statusLabel = { ativo: 'Ativo', trial: 'Trial', pausado: 'Pausado', cancelado: 'Cancelado', pendente: 'Pendente' };
  const statusColor = { ativo: '#25D366', trial: '#f0a500', pausado: '#f0a500', cancelado: '#ff4b4b', pendente: '#888' };
  const planoLabel  = { starter: 'Starter', pro: 'Pro', business: 'Business' };

  const renderSubContent = () => {
    switch (subTab) {
      case 'Perfil':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.01)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '25px', fontWeight: '700' }}>Dados Pessoais</h4>
              <div style={{ display: 'grid', gap: '15px' }}>
                <Input label="Nome de Exibição" type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" />
                <Input label="E-mail" type="email" value={email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
            </div>
            {msg && <p style={{ fontSize: '0.8rem', fontWeight: '700', color: msgTipo === 'ok' ? '#25D366' : '#ff4b4b' }}>{msg}</p>}
            <SaveButton onClick={salvarPerfil} loading={loading} />
          </motion.div>
        );
      case 'Seguranca':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.01)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '25px', fontWeight: '700' }}>Alterar Senha</h4>
              <div style={{ display: 'grid', gap: '15px' }}>
                <Input label="Senha Atual" type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} placeholder="••••••••" />
                <Input label="Nova Senha" type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="••••••••" />
                <Input label="Confirmar Nova Senha" type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
            {msg && <p style={{ fontSize: '0.8rem', fontWeight: '700', color: msgTipo === 'ok' ? '#25D366' : '#ff4b4b' }}>{msg}</p>}
            <SaveButton onClick={alterarSenha} loading={loading} label="ALTERAR SENHA" />
          </motion.div>
        );
      case 'Assinatura':
        if (loadingAssinatura) return (
          <div style={{ paddingTop: '60px', textAlign: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid rgba(37,211,102,0.2)', borderTop: '3px solid #25D366', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
          </div>
        );
        if (!assinatura?.tem_assinatura) return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '600px' }}>
            <div style={{ padding: '40px 30px', background: 'rgba(255,255,255,0.01)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📦</p>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>Nenhum plano ativo</h4>
              <p style={{ opacity: 0.45, fontSize: '0.85rem', marginBottom: '28px', lineHeight: '1.6' }}>Você ainda não possui uma assinatura ativa.</p>
              <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/assinar')}
                style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '14px 32px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>VER PLANOS</motion.button>
            </div>
          </motion.div>
        );
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '600px' }}>
            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.01)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Plano Atual</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ background: 'rgba(37,211,102,0.1)', color: '#25D366', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }}>{planoLabel[assinatura.plano] || assinatura.plano}</span>
                  <span style={{ background: `${statusColor[assinatura.status]}18`, color: statusColor[assinatura.status], padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }}>{statusLabel[assinatura.status] || assinatura.status}</span>
                </div>
              </div>
              <div style={{ marginBottom: '28px' }}>
                {[
                  { label: 'Plano', valor: planoLabel[assinatura.plano] || assinatura.plano },
                  { label: 'Período', valor: assinatura.periodo === 'mensal' ? 'Mensal' : 'Anual' },
                  { label: 'Status', valor: statusLabel[assinatura.status] || assinatura.status },
                  assinatura.status === 'trial' && assinatura.trial_fim
                    ? { label: 'Trial até', valor: new Date(assinatura.trial_fim).toLocaleDateString('pt-BR') }
                    : assinatura.periodo_fim
                    ? { label: 'Próxima cobrança', valor: new Date(assinatura.periodo_fim).toLocaleDateString('pt-BR') }
                    : null,
                ].filter(Boolean).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.85rem', opacity: 0.5 }}>{item.label}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{item.valor}</span>
                  </div>
                ))}
              </div>
              {msg && <p style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '16px', color: msgTipo === 'ok' ? '#25D366' : '#ff4b4b' }}>{msg}</p>}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {assinatura.status === 'ativo' && (
                  <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate('/assinar')}
                    style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '13px 24px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}>FAZER UPGRADE</motion.button>
                )}
                {['ativo', 'trial'].includes(assinatura.status) && (
                  <motion.button whileHover={{ scale: 1.02 }} onClick={cancelarAssinatura} disabled={cancelando}
                    style={{ background: 'transparent', color: '#ff4b4b', border: '1px solid #ff4b4b', padding: '13px 24px', borderRadius: '10px', fontWeight: '700', cursor: cancelando ? 'not-allowed' : 'pointer', fontSize: '0.8rem', opacity: cancelando ? 0.6 : 1 }}>
                    {cancelando ? 'CANCELANDO...' : 'CANCELAR ASSINATURA'}
                  </motion.button>
                )}
                {assinatura.status === 'cancelado' && (
                  <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate('/assinar')}
                    style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '13px 24px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}>REATIVAR ASSINATURA</motion.button>
                )}
              </div>
            </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div style={{ paddingTop: '40px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
        {['Perfil', 'Assinatura', 'Seguranca'].map(item => (
          <div key={item} onClick={() => setSubTab(item)}
            style={{ padding: '10px 0', fontSize: '0.9rem', fontWeight: '600', color: subTab === item ? '#25D366' : 'rgba(255,255,255,0.4)', borderBottom: subTab === item ? '2px solid #25D366' : '2px solid transparent', cursor: 'pointer', transition: '0.3s' }}>
            {item}
          </div>
        ))}
      </div>
      {renderSubContent()}
    </div>
  );
};

// ─── ABA: INSTÂNCIAS (fluxos) ────────────────────────────────────────────────
const Instancias = ({ fluxos, carregando, onEditar, onExcluir }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '40px' }}>
    <p style={{ fontSize: '0.75rem', opacity: 0.4, marginBottom: '25px', fontWeight: '600' }}>{fluxos.length} fluxo(s) ativo(s) no banco de dados</p>
    {carregando ? <p style={{ opacity: 0.4 }}>Carregando...</p>
      : fluxos.length > 0 ? fluxos.map(fluxo => (
        <FluxoCard key={fluxo.id} {...fluxo} onEditar={() => onEditar(fluxo.id)} onExcluir={() => onExcluir(fluxo.id)} />
      )) : (
        <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '15px' }}>
          <p style={{ opacity: 0.4 }}>Nenhuma instância criada ainda.</p>
        </div>
      )}
  </motion.div>
);

// ─── DASHBOARD PRINCIPAL ─────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [fluxos, setFluxos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [criando, setCriando] = useState(false);
  const [trialBanner, setTrialBanner] = useState(false);
  const [plano, setPlano] = useState('starter'); // plano do usuário

  const usuarioId = parseInt(localStorage.getItem('usuario_id'));
  const usuarioNome = localStorage.getItem('usuario_nome') || 'Usuário';

  // Itens do menu com informação de bloqueio
  const menuItems = [
    { label: 'Dashboard',      bloqueado: false },
    { label: 'Instancias',     bloqueado: false },
    { label: 'WhatsApp',       bloqueado: false },
    { label: 'Disparos',       bloqueado: !PLANO_LIMITES[plano]?.disparos },
    { label: 'Chatbot IA',     bloqueado: !PLANO_LIMITES[plano]?.ia },
    { label: 'Configuracoes',  bloqueado: false },
  ];

  // Busca plano do usuário
  useEffect(() => {
    authFetch(`${API_URL}/pagamentos/minha-assinatura`)
      .then(r => r.json())
      .then(d => { if (d.tem_assinatura && d.plano) setPlano(d.plano); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get('trial') === 'ativado') {
      setTrialBanner(true);
      setTimeout(() => setTrialBanner(false), 6000);
    }
  }, [searchParams]);

  const carregarFluxos = async () => {
    if (!usuarioId) return;
    setCarregando(true);
    try {
      const res = await authFetch(`${API_URL}/fluxos/listar/${usuarioId}`);
      if (res.status === 401) return;
      const data = await res.json();
      setFluxos(data.fluxos || []);
    } catch (err) { console.error(err); }
    finally { setCarregando(false); }
  };

  useEffect(() => { carregarFluxos(); }, []);

  const criarNovoFluxo = async () => {
    if (!usuarioId) return;
    setCriando(true);
    try {
      const res = await authFetch(`${API_URL}/fluxos/salvar`, {
        method: 'POST',
        body: JSON.stringify({
          id: 0, usuario_id: usuarioId,
          nome_fluxo: `Fluxo #${fluxos.length + 1}`,
          nodes: [{ id: '1', type: 'botNode', data: { label: 'Olá!', options: [], delay: 2 }, position: { x: 400, y: 100 } }],
          edges: [],
        }),
      });
      if (res.status === 401) return;
      const data = await res.json();
      if (data.id) navigate(`/editor/${data.id}`);
    } catch (err) { console.error(err); }
    finally { setCriando(false); }
  };

  const excluirFluxo = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este fluxo?')) return;
    try {
      await authFetch(`${API_URL}/fluxos/${id}/${usuarioId}`, { method: 'DELETE' });
      setFluxos(fluxos.filter(f => f.id !== id));
    } catch (err) { console.error(err); }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '40px' }}>
            {/* Badge do plano */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '20px', padding: '6px 14px', marginBottom: '28px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25D366' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#25D366', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Plano {PLANO_NOME[plano] || plano}
              </span>
              {plano !== 'business' && (
                <span onClick={() => navigate('/assinar')} style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', marginLeft: '4px', textDecoration: 'underline' }}>
                  fazer upgrade
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <StatCard label="Fluxos Criados" value={fluxos.length} trend={fluxos.length > 0 ? `${fluxos.length} fluxo(s) no banco` : 'Nenhum fluxo ainda'} />
              <StatCard label="Último Fluxo" value={fluxos.length > 0 ? fluxos[0].nome_fluxo : '—'} trend={fluxos.length > 0 ? new Date(fluxos[0].data_criacao).toLocaleDateString('pt-BR') : 'Sem registros'} />
              <StatCard label="Sessões Ativas" value="0" trend="Aguardando bot" />
              <StatCard label="Status" value={fluxos.length > 0 ? '🟢 Online' : '🔴 Offline'} trend={fluxos.length > 0 ? 'Fluxos prontos' : 'Crie um fluxo'} trendPositive={fluxos.length > 0} />
            </div>
            {carregando ? (
              <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.4 }}><p>Carregando fluxos...</p></div>
            ) : fluxos.length > 0 ? (
              <>
                <p style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Seus Fluxos</p>
                {fluxos.map(fluxo => (
                  <FluxoCard key={fluxo.id} {...fluxo} onExcluir={() => excluirFluxo(fluxo.id)} onEditar={() => navigate(`/editor/${fluxo.id}`)} />
                ))}
              </>
            ) : (
              <div style={{ padding: '80px 40px', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>Nenhum fluxo disponível</h3>
                <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>Clique em "+ NOVO FLUXOGRAMA" para começar.</p>
              </div>
            )}
          </motion.div>
        );
      case 'Instancias': return <Instancias fluxos={fluxos} carregando={carregando} onEditar={id => navigate(`/editor/${id}`)} onExcluir={excluirFluxo} />;
      case 'WhatsApp':   return <WhatsAppTab fluxos={fluxos} usuarioId={usuarioId} plano={plano} />;
      case 'Disparos':   return <DisparosTab plano={plano} navigate={navigate} />;
      case 'Chatbot IA': return <ChatbotIA fluxos={fluxos} plano={plano} navigate={navigate} />;
      case 'Configuracoes': return <ConfigSettings usuarioId={usuarioId} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080c08', color: 'white', overflow: 'hidden', '--brand-green': '#25D366' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Sidebar */}
      <aside style={{ width: '260px', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '40px 25px', display: 'flex', flexDirection: 'column' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-1px' }}>ZAP<span style={{ color: '#25D366' }}>CHAT</span></h2>
        </Link>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexGrow: 1 }}>
          {menuItems.map(({ label, bloqueado }) => (
            <MenuItem key={label} item={label} activeTab={activeTab} bloqueado={bloqueado} onClick={() => setActiveTab(label)} />
          ))}
        </nav>

        {/* Badge plano na sidebar */}
        <div style={{ padding: '12px 15px', background: 'rgba(37,211,102,0.05)', borderRadius: '10px', border: '1px solid rgba(37,211,102,0.12)', marginBottom: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.6rem', opacity: 0.4, textTransform: 'uppercase', fontWeight: '700', marginBottom: '3px' }}>Plano atual</p>
          <p style={{ fontSize: '0.85rem', fontWeight: '900', color: '#25D366' }}>{PLANO_NOME[plano] || plano}</p>
          {plano !== 'business' && (
            <p onClick={() => navigate('/assinar')} style={{ fontSize: '0.62rem', opacity: 0.35, cursor: 'pointer', marginTop: '4px', textDecoration: 'underline' }}>fazer upgrade</p>
          )}
        </div>

        <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '0.65rem', opacity: 0.3, textTransform: 'uppercase', fontWeight: '700', marginBottom: '5px' }}>Logado como</p>
          <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#25D366' }}>{usuarioNome}</p>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main style={{ flexGrow: 1, padding: '0 60px', overflowY: 'auto' }}>
        <AnimatePresence>
          {trialBanner && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 999, background: '#0c1f0f', border: '1px solid rgba(37,211,102,0.4)', borderRadius: '14px', padding: '16px 22px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <span>🎉</span>
              <div>
                <p style={{ fontWeight: '800', fontSize: '0.85rem', color: '#25D366', marginBottom: '2px' }}>Trial ativado com sucesso!</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Você tem 7 dias de acesso completo ao Starter.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '40px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: '#080c08', zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{activeTab}</h1>
            <p style={{ opacity: 0.3, fontSize: '0.9rem' }}>Plataforma / {activeTab}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <motion.button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} whileHover={{ scale: 1.02 }}
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.7rem' }}>
              SAIR
            </motion.button>
            <motion.button onClick={criarNovoFluxo} disabled={criando}
              whileHover={{ scale: 1.02, backgroundColor: '#25D366', color: '#0d140d' }}
              style={{ background: 'transparent', color: '#25D366', border: '1px solid #25D366', padding: '12px 25px', borderRadius: '8px', fontWeight: '700', cursor: criando ? 'not-allowed' : 'pointer', opacity: criando ? 0.6 : 1, transition: '0.3s' }}>
              {criando ? 'CRIANDO...' : '+ NOVO FLUXOGRAMA'}
            </motion.button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab}>{renderContent()}</motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;