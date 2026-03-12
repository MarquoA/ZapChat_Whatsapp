import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// TROCAR: substitua pela URL real da sua VPS em produção
// Ex: 'https://api.seudominio.com.br'
// ─────────────────────────────────────────────────────────────────────────────
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// TEMAS — claro e escuro
// Para adicionar novos temas, adicione uma entrada aqui
// ─────────────────────────────────────────────────────────────────────────────
const TEMAS = {
  escuro: {
    bg:          '#080c08',
    sidebar:     '#060a06',
    card:        'rgba(255,255,255,0.02)',
    cardBorder:  'rgba(255,255,255,0.06)',
    text:        '#ffffff',
    textMuted:   'rgba(255,255,255,0.4)',
    header:      '#080c08',
    input:       'rgba(255,255,255,0.04)',
    inputBorder: 'rgba(255,255,255,0.1)',
    menuHover:   'rgba(255,255,255,0.04)',
    scrollbar:   'rgba(255,255,255,0.08)',
  },
  claro: {
    bg:          '#f5f7f5',
    sidebar:     '#ffffff',
    card:        '#ffffff',
    cardBorder:  'rgba(0,0,0,0.08)',
    text:        '#0d140d',
    textMuted:   'rgba(0,0,0,0.45)',
    header:      '#f5f7f5',
    input:       'rgba(0,0,0,0.04)',
    inputBorder: 'rgba(0,0,0,0.12)',
    menuHover:   'rgba(37,211,102,0.07)',
    scrollbar:   'rgba(0,0,0,0.1)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LIMITES POR PLANO
// Se criar um novo plano, adicione-o aqui
// ─────────────────────────────────────────────────────────────────────────────
const PLANO_LIMITES = {
  starter:  { instancias: 1,   ia: false, disparos: false },
  pro:      { instancias: 3,   ia: true,  disparos: true  },
  business: { instancias: 999, ia: true,  disparos: true  },
};

const PLANO_NOME    = { starter: 'Starter', pro: 'Pro', business: 'Business' };
const PLANO_UPGRADE = { starter: 'Pro', pro: 'Business', business: null };

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: fetch autenticado — injeta o token JWT em toda requisição
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// ANIMAÇÃO DE ENTRADA padrão para as abas
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.28 } };

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Banner de recurso bloqueado pelo plano
// ─────────────────────────────────────────────────────────────────────────────
const BloqueadoBanner = ({ recurso, planoAtual, navigate, tema }) => {
  const upgrade = PLANO_UPGRADE[planoAtual] || 'Business';
  const t = TEMAS[tema];
  return (
    <motion.div {...fadeUp}
      style={{ marginTop: '40px', padding: '60px 40px', borderRadius: '20px', border: `1px solid ${t.cardBorder}`, background: t.card, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.4rem' }}>
        🔒
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '10px', color: t.text }}>{recurso} não disponível no seu plano</h3>
      <p style={{ color: t.textMuted, fontSize: '0.85rem', marginBottom: '28px', lineHeight: '1.7', maxWidth: '380px', margin: '0 auto 28px' }}>
        Faça upgrade para o plano <strong style={{ color: '#25D366' }}>{upgrade}</strong> e desbloqueie esta funcionalidade.
      </p>
      <motion.button whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(37,211,102,0.25)' }}
        onClick={() => navigate('/assinar')}
        style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '14px 32px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>
        FAZER UPGRADE
      </motion.button>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Item de menu lateral
// ─────────────────────────────────────────────────────────────────────────────
const MenuItem = ({ label, ativo, bloqueado, onClick, tema }) => {
  const t = TEMAS[tema];
  return (
    <div onClick={onClick}
      style={{
        padding: '11px 14px', cursor: 'pointer', fontSize: '0.88rem', borderRadius: '8px',
        color: ativo ? '#25D366' : bloqueado ? t.textMuted : t.textMuted,
        background: ativo ? 'rgba(37,211,102,0.07)' : 'transparent',
        fontWeight: ativo ? '700' : '500',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'background 0.15s, color 0.15s',
        opacity: bloqueado ? 0.5 : 1,
      }}
      onMouseEnter={e => { if (!ativo) e.currentTarget.style.background = t.menuHover; }}
      onMouseLeave={e => { if (!ativo) e.currentTarget.style.background = 'transparent'; }}
    >
      <span>{label}</span>
      {bloqueado && <span style={{ fontSize: '0.65rem', opacity: 0.6, letterSpacing: '0.5px' }}>PRO</span>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Card de estatística
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, trend, trendPositive = true, tema }) => {
  const t = TEMAS[tema];
  return (
    <motion.div whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      style={{ background: t.card, padding: '26px', borderRadius: '14px', border: `1px solid ${t.cardBorder}`, transition: 'box-shadow 0.2s, transform 0.2s' }}>
      <p style={{ color: t.textMuted, fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>{label}</p>
      <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', color: t.text }}>{value}</h3>
      <span style={{ color: trendPositive ? '#25D366' : '#ff4b4b', fontSize: '0.73rem', fontWeight: '600' }}>{trend}</span>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Card de fluxo na listagem
// ─────────────────────────────────────────────────────────────────────────────
const FluxoCard = ({ id, nome_fluxo, data_criacao, onExcluir, onEditar, tema }) => {
  const t = TEMAS[tema];
  return (
    <motion.div whileHover={{ x: 4 }}
      style={{ padding: '18px 22px', borderRadius: '12px', border: `1px solid ${t.cardBorder}`, background: t.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', transition: 'background 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#25D366', boxShadow: '0 0 6px rgba(37,211,102,0.6)', flexShrink: 0 }} />
        <div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '3px', color: t.text }}>{nome_fluxo}</h4>
          <p style={{ fontSize: '0.7rem', color: t.textMuted }}>Criado em: {new Date(data_criacao).toLocaleString('pt-BR')}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button onClick={onEditar} style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.68rem', fontWeight: '800' }}>EDITAR</button>
        <button onClick={onExcluir} style={{ background: 'transparent', border: '1px solid #ff4b4b', color: '#ff4b4b', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.68rem', fontWeight: '700' }}>EXCLUIR</button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Campo de input reutilizável
// ─────────────────────────────────────────────────────────────────────────────
const Input = ({ label, tema, ...props }) => {
  const t = TEMAS[tema];
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: '7px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>{label}</label>
      <input {...props} style={{ width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, padding: '11px 13px', borderRadius: '8px', color: t.text, outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box', transition: 'border-color 0.2s', ...props.style }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Botão de salvar padrão
// ─────────────────────────────────────────────────────────────────────────────
const SaveButton = ({ onClick, loading, label = 'SALVAR ALTERAÇÕES' }) => (
  <motion.button onClick={onClick} disabled={loading}
    whileHover={{ backgroundColor: '#25D366', color: '#0d140d' }}
    style={{ background: 'transparent', border: '1px solid #25D366', color: '#25D366', padding: '13px 24px', borderRadius: '10px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.8rem', transition: 'background 0.2s, color 0.2s', opacity: loading ? 0.6 : 1 }}>
    {loading ? 'SALVANDO...' : label}
  </motion.button>
);

// ─────────────────────────────────────────────────────────────────────────────
// ABA: WHATSAPP — gerenciamento de instâncias
// ─────────────────────────────────────────────────────────────────────────────
const WhatsAppTab = ({ fluxos, usuarioId, plano, tema }) => {
  const navigate  = useNavigate();
  const t         = TEMAS[tema];
  const limite    = PLANO_LIMITES[plano]?.instancias || 1;

  const [instancias,     setInstancias]     = useState([]);
  const [carregando,     setCarregando]     = useState(true);
  const [criando,        setCriando]        = useState(false);
  const [nomeInstancia,  setNomeInstancia]  = useState('');
  const [fluxoVinculado, setFluxoVinculado] = useState('');
  const [mostrarForm,    setMostrarForm]    = useState(false);
  const [aguardandoQR,   setAguardandoQR]  = useState(false);
  const [instanciaAtiva, setInstanciaAtiva] = useState(null);
  const [erroLimite,     setErroLimite]    = useState('');

  const atingiuLimite = instancias.length >= limite;

  const carregarInstancias = useCallback(async () => {
    if (!usuarioId) return;
    setCarregando(true);
    try {
      const res = await authFetch(`${API_URL}/instancias/listar/${usuarioId}`);
      if (res.status === 401) { navigate('/login'); return; }
      const data = await res.json();
      setInstancias(data.instancias || []);
    } catch { /* silencioso — rede pode estar indisponível */ }
    finally { setCarregando(false); }
  }, [usuarioId]);

  useEffect(() => { carregarInstancias(); }, [carregarInstancias]);

  const criarInstancia = async () => {
    if (!nomeInstancia.trim() || !fluxoVinculado) return;
    setCriando(true);
    setErroLimite('');
    try {
      const res  = await authFetch(`${API_URL}/instancias/criar`, {
        method: 'POST',
        body: JSON.stringify({ usuario_id: usuarioId, nome: nomeInstancia, fluxo_id: parseInt(fluxoVinculado) }),
      });
      const data = await res.json();
      if (!res.ok) { setErroLimite(data.detail || 'Erro ao criar instância.'); return; }
      await carregarInstancias();
      setNomeInstancia('');
      setFluxoVinculado('');
      setMostrarForm(false);
    } catch { setErroLimite('Erro ao criar instância. Verifique sua conexão.'); }
    finally { setCriando(false); }
  };

  const excluirInstancia = async (id) => {
    if (!window.confirm('Excluir esta instância? Esta ação não pode ser desfeita.')) return;
    try {
      await authFetch(`${API_URL}/instancias/${id}/${usuarioId}`, { method: 'DELETE' });
      setInstancias(prev => prev.filter(i => i.id !== id));
      if (instanciaAtiva?.id === id) setInstanciaAtiva(null);
    } catch { alert('Erro ao excluir instância.'); }
  };

  const conectar = (instancia) => {
    setInstanciaAtiva(instancia);
    setAguardandoQR(true);
    // Simula loading do QR — o QR real virá da Evolution API na VPS
    setTimeout(() => setAguardandoQR(false), 1500);
  };

  const statusColor = s => s === 'conectado' ? '#25D366' : s === 'aguardando' ? '#f0a500' : '#ff4b4b';
  const statusLabel = s => s === 'conectado' ? 'Conectado' : s === 'aguardando' ? 'Aguardando QR' : 'Desconectado';

  const selectStyle = { width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, padding: '11px 13px', borderRadius: '8px', color: t.text, outline: 'none', fontSize: '0.88rem' };

  return (
    <motion.div {...fadeUp} style={{ paddingTop: '36px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Aviso sobre VPS — necessário para o QR Code real */}
      <div style={{ background: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.22)', borderRadius: '10px', padding: '14px 18px', marginBottom: '18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>!</span>
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: '700', color: '#f0a500', marginBottom: '2px' }}>Conexão com VPS necessária</p>
          {/* TROCAR: substitua pelo endereço real da sua Evolution API */}
          <p style={{ fontSize: '0.7rem', color: t.textMuted }}>O QR Code real estará disponível após configurar a Evolution API em <strong>sua-vps.com</strong>.</p>
        </div>
      </div>

      {/* Barra de uso do plano */}
      <div style={{ background: 'rgba(37,211,102,0.04)', border: '1px solid rgba(37,211,102,0.14)', borderRadius: '10px', padding: '13px 18px', marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '0.8rem', color: t.textMuted }}>
          <strong style={{ color: '#25D366' }}>{instancias.length}</strong> de <strong style={{ color: t.text }}>{limite === 999 ? 'ilimitadas' : limite}</strong> instâncias — Plano <strong style={{ color: '#25D366' }}>{PLANO_NOME[plano]}</strong>
        </span>
        {atingiuLimite && plano !== 'business' && (
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/assinar')}
            style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '7px 16px', borderRadius: '7px', fontWeight: '800', cursor: 'pointer', fontSize: '0.7rem' }}>
            FAZER UPGRADE
          </motion.button>
        )}
      </div>

      {/* Botão nova instância */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <p style={{ fontSize: '0.72rem', color: t.textMuted, fontWeight: '600' }}>{instancias.length} instância(s) registrada(s)</p>
        <motion.button
          onClick={() => {
            if (atingiuLimite) { setErroLimite(`Limite de ${limite} instância(s) atingido. Faça upgrade para adicionar mais.`); return; }
            setMostrarForm(v => !v);
            setErroLimite('');
          }}
          whileHover={{ scale: 1.02 }}
          style={{ background: 'transparent', color: atingiuLimite ? '#ff4b4b' : '#25D366', border: `1px solid ${atingiuLimite ? '#ff4b4b' : '#25D366'}`, padding: '9px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' }}>
          {atingiuLimite ? 'LIMITE ATINGIDO' : mostrarForm ? 'CANCELAR' : '+ NOVA INSTÂNCIA'}
        </motion.button>
      </div>

      {/* Mensagem de erro de limite */}
      <AnimatePresence>
        {erroLimite && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: '12px 16px', background: 'rgba(255,75,75,0.07)', border: '1px solid rgba(255,75,75,0.22)', borderRadius: '9px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#ff4b4b' }}>{erroLimite}</span>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate('/assinar')}
              style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '7px 14px', borderRadius: '7px', fontWeight: '800', cursor: 'pointer', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
              VER PLANOS
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulário nova instância */}
      <AnimatePresence>
        {mostrarForm && !atingiuLimite && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ padding: '22px', background: t.card, borderRadius: '14px', border: `1px solid ${t.cardBorder}`, marginBottom: '22px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '18px', color: t.text }}>Nova Instância WhatsApp</h4>
            <div style={{ display: 'grid', gap: '13px', marginBottom: '18px' }}>
              <Input tema={tema} label="Nome da instância" type="text" value={nomeInstancia} onChange={e => setNomeInstancia(e.target.value)} placeholder="Ex: Atendimento Principal" />
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: '7px', textTransform: 'uppercase', fontWeight: '700' }}>Fluxo vinculado</label>
                <select value={fluxoVinculado} onChange={e => setFluxoVinculado(e.target.value)} style={selectStyle}>
                  <option value="">Selecione um fluxo...</option>
                  {fluxos.map(f => <option key={f.id} value={f.id}>{f.nome_fluxo}</option>)}
                </select>
              </div>
            </div>
            <motion.button onClick={criarInstancia} disabled={criando} whileHover={{ scale: 1.02 }}
              style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '11px 22px', borderRadius: '8px', fontWeight: '800', cursor: criando ? 'not-allowed' : 'pointer', fontSize: '0.78rem', opacity: criando ? 0.6 : 1 }}>
              {criando ? 'CRIANDO...' : 'CRIAR INSTÂNCIA'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de instâncias */}
      {carregando ? (
        <p style={{ color: t.textMuted, fontSize: '0.85rem' }}>Carregando instâncias...</p>
      ) : instancias.length === 0 ? (
        <div style={{ padding: '50px', textAlign: 'center', border: `1px dashed ${t.cardBorder}`, borderRadius: '14px' }}>
          <p style={{ fontSize: '1.8rem', marginBottom: '12px' }}>📱</p>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '6px', color: t.text }}>Nenhuma instância criada</h3>
          <p style={{ color: t.textMuted, fontSize: '0.82rem' }}>Clique em "+ NOVA INSTÂNCIA" para conectar um número de WhatsApp.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {instancias.map(inst => (
            <motion.div key={inst.id} whileHover={{ x: 3 }}
              style={{ padding: '18px 22px', borderRadius: '12px', border: `1px solid ${t.cardBorder}`, background: t.card }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(37,211,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>W</div>
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '2px', color: t.text }}>{inst.nome}</h4>
                    <p style={{ fontSize: '0.7rem', color: t.textMuted }}>Fluxo: {inst.fluxo_nome}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Indicador de status com bolinha colorida */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor(inst.status), display: 'inline-block' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: statusColor(inst.status) }}>{statusLabel(inst.status)}</span>
                  </div>
                  <motion.button onClick={() => conectar(inst)} whileHover={{ scale: 1.04 }}
                    style={{ background: inst.status === 'conectado' ? 'transparent' : '#25D366', color: inst.status === 'conectado' ? '#25D366' : '#0d140d', border: inst.status === 'conectado' ? '1px solid #25D366' : 'none', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.68rem', fontWeight: '700' }}>
                    {inst.status === 'conectado' ? 'RECONECTAR' : 'CONECTAR'}
                  </motion.button>
                  <button onClick={() => excluirInstancia(inst.id)}
                    style={{ background: 'transparent', border: '1px solid #ff4b4b', color: '#ff4b4b', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.68rem', fontWeight: '700' }}>EXCLUIR</button>
                </div>
              </div>

              {/* Painel do QR Code */}
              {instanciaAtiva?.id === inst.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  style={{ marginTop: '18px', padding: '22px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', textAlign: 'center' }}>
                  {aguardandoQR ? (
                    <>
                      <div style={{ width: '36px', height: '36px', border: '3px solid rgba(37,211,102,0.25)', borderTop: '3px solid #25D366', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                      <p style={{ color: t.textMuted, fontSize: '0.82rem' }}>Gerando QR Code...</p>
                    </>
                  ) : (
                    <>
                      {/* TROCAR: aqui virá o QR Code real gerado pela Evolution API */}
                      <div style={{ width: '180px', height: '180px', margin: '0 auto 16px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '2.4rem' }}>QR</span>
                        <p style={{ color: '#0d140d', fontSize: '0.65rem', fontWeight: '700', textAlign: 'center', padding: '0 8px' }}>QR Code disponível após configurar a VPS</p>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: t.textMuted }}>WhatsApp → Dispositivos conectados → Conectar dispositivo</p>
                    </>
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

// ─────────────────────────────────────────────────────────────────────────────
// ABA: CHATBOT IA — configuração do fallback de inteligência artificial
// ─────────────────────────────────────────────────────────────────────────────
const ChatbotIA = ({ fluxos, plano, navigate, tema }) => {
  const t = TEMAS[tema];
  const [fluxoSelecionado, setFluxoSelecionado] = useState('');
  const [prompt,           setPrompt]           = useState('');
  const [salvo,            setSalvo]            = useState(false);
  const [loading,          setLoading]          = useState(false);

  if (!PLANO_LIMITES[plano]?.ia) return <BloqueadoBanner recurso="Chatbot IA" planoAtual={plano} navigate={navigate} tema={tema} />;

  const salvar = async () => {
    if (!fluxoSelecionado || !prompt.trim()) return;
    setLoading(true);
    // TROCAR: implemente a rota POST /chatbot-ia/salvar no backend para persistir o prompt
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  return (
    <motion.div {...fadeUp} style={{ paddingTop: '36px', maxWidth: '680px' }}>
      <div style={{ padding: '28px', background: t.card, borderRadius: '14px', border: `1px solid ${t.cardBorder}`, marginBottom: '18px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '6px', color: t.text }}>Instruções do Bot de IA</h4>
        <p style={{ fontSize: '0.76rem', color: t.textMuted, marginBottom: '22px', lineHeight: '1.6' }}>
          Configure como a IA deve responder quando o cliente enviar algo fora do fluxo definido.
        </p>
        <div style={{ display: 'grid', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: '7px', textTransform: 'uppercase', fontWeight: '700' }}>Fluxo vinculado</label>
            <select value={fluxoSelecionado} onChange={e => setFluxoSelecionado(e.target.value)}
              style={{ width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, padding: '11px 13px', borderRadius: '8px', color: t.text, outline: 'none', fontSize: '0.88rem' }}>
              <option value="">Selecione um fluxo...</option>
              {fluxos.map(f => <option key={f.id} value={f.id}>{f.nome_fluxo}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', color: t.textMuted, marginBottom: '7px', textTransform: 'uppercase', fontWeight: '700' }}>Prompt de fallback</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
              placeholder="Ex: Você é um assistente da empresa X. Quando o cliente enviar algo fora do menu, responda de forma educada e profissional..."
              style={{ width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, padding: '11px 13px', borderRadius: '8px', color: t.text, outline: 'none', fontSize: '0.83rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        </div>
      </div>
      {salvo && <p style={{ color: '#25D366', fontSize: '0.78rem', fontWeight: '700', marginBottom: '10px' }}>Configurações salvas com sucesso.</p>}
      <SaveButton onClick={salvar} loading={loading} label="SALVAR CONFIGURAÇÕES" />
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ABA: DISPAROS EM MASSA
// ─────────────────────────────────────────────────────────────────────────────
const DisparosTab = ({ plano, navigate, tema }) => {
  const t          = TEMAS[tema];
  const usuarioId  = localStorage.getItem('usuario_id');
  const token      = localStorage.getItem('token');
  const headers    = { Authorization: `Bearer ${token}` };

  const [instancias,       setInstancias]       = useState([]);
  const [instanciaId,      setInstanciaId]      = useState('');
  const [mensagem,         setMensagem]         = useState('');
  const [contatosRaw,      setContatosRaw]      = useState('');
  const [enviando,         setEnviando]         = useState(false);
  const [resultado,        setResultado]        = useState(null);
  const [historico,        setHistorico]        = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [statusHoje,       setStatusHoje]       = useState(null);

  useEffect(() => {
    carregarInstancias();
    carregarHistorico();
    carregarStatusHoje();
  }, []);

  const carregarInstancias = async () => {
    try {
      const res = await axios.get(`${API_URL}/instancias/listar/${usuarioId}`, { headers });
      const lista = res.data.instancias || [];
      setInstancias(lista);
      if (lista.length > 0) setInstanciaId(String(lista[0].id));
    } catch { setInstancias([]); }
  };

  const carregarHistorico = async () => {
    setLoadingHistorico(true);
    try {
      const res = await axios.get(`${API_URL}/disparos/historico/${usuarioId}`, { headers });
      setHistorico(res.data.historico || []);
    } catch { setHistorico([]); }
    finally { setLoadingHistorico(false); }
  };

  const carregarStatusHoje = async () => {
    try {
      const res = await axios.get(`${API_URL}/disparos/status-hoje/${usuarioId}`, { headers });
      setStatusHoje(res.data);
    } catch { setStatusHoje(null); }
  };

  // Extrai números válidos do textarea (mínimo 10 dígitos)
  const parsearContatos = () =>
    contatosRaw.split('\n').map(l => l.trim().replace(/\D/g, '')).filter(l => l.length >= 10);

  const contatosParsados = parsearContatos();

  const handleEnviar = async () => {
    setResultado(null);
    if (!instanciaId)           return setResultado({ tipo: 'erro', texto: 'Selecione uma instância WhatsApp.' });
    if (!mensagem.trim())       return setResultado({ tipo: 'erro', texto: 'Digite a mensagem antes de enviar.' });
    if (!contatosParsados.length) return setResultado({ tipo: 'erro', texto: 'Adicione pelo menos um contato válido.' });

    setEnviando(true);
    try {
      const res = await axios.post(`${API_URL}/disparos/enviar`, {
        usuario_id:   parseInt(usuarioId),
        contatos:     contatosParsados,
        mensagem:     mensagem.trim(),
        instancia_id: parseInt(instanciaId) || 0,
      }, { headers });

      let texto = res.data.mensagem;
      if (res.data.aviso) texto += `\nAtencao: ${res.data.aviso}`;
      setResultado({ tipo: 'sucesso', texto });
      setContatosRaw('');
      setMensagem('');
      setTimeout(() => { carregarHistorico(); carregarStatusHoje(); }, 2000);
    } catch (err) {
      setResultado({ tipo: 'erro', texto: err.response?.data?.detail || 'Erro ao iniciar disparo.' });
    } finally { setEnviando(false); }
  };

  const corStatus = s => ({ enviado: '#25D366', erro: '#ff4444', pendente: '#f0a500' }[s] || '#888');

  if (!PLANO_LIMITES[plano]?.disparos) return <BloqueadoBanner recurso="Disparos em Massa" planoAtual={plano} navigate={navigate} tema={tema} />;

  const selectStyle = { width: '100%', padding: '10px 13px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: '8px', color: t.text, fontSize: '0.86rem', outline: 'none', cursor: 'pointer' };

  return (
    <motion.div {...fadeUp} style={{ paddingTop: '36px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Barra de uso diário */}
      {statusHoje && (
        <div style={{ padding: '18px 22px', background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.14)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: t.textMuted, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Disparados hoje</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#25D366', lineHeight: 1 }}>
              {statusHoje.enviados_hoje}<span style={{ fontSize: '0.85rem', color: t.textMuted, fontWeight: '400', marginLeft: '5px' }}>/ {statusHoje.limite_diario}</span>
            </p>
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <div style={{ height: '5px', background: t.cardBorder, borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((statusHoje.enviados_hoje / statusHoje.limite_diario) * 100, 100)}%`, background: 'linear-gradient(90deg, #25D366, #1aad5e)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
            </div>
            <p style={{ fontSize: '0.7rem', color: t.textMuted, marginTop: '5px' }}>{statusHoje.limite_diario - statusHoje.enviados_hoje} restantes hoje</p>
          </div>
          <span style={{ padding: '5px 12px', background: 'rgba(37,211,102,0.1)', borderRadius: '20px', fontSize: '0.72rem', color: '#25D366', fontWeight: '600', textTransform: 'capitalize' }}>Plano {statusHoje.plano}</span>
        </div>
      )}

      {/* Formulário */}
      <div style={{ padding: '26px', background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, color: t.text }}>Novo Disparo</h4>

        {/* Seleção de instância */}
        <div>
          <label style={{ fontSize: '0.7rem', color: t.textMuted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '700' }}>Instância WhatsApp</label>
          {instancias.length === 0
            ? <p style={{ fontSize: '0.82rem', color: '#ff4444' }}>Nenhuma instância encontrada. Crie uma na aba WhatsApp primeiro.</p>
            : <select value={instanciaId} onChange={e => setInstanciaId(e.target.value)} style={selectStyle}>
                {instancias.map(inst => <option key={inst.id} value={String(inst.id)}>{inst.nome} — {inst.numero || 'sem número'}</option>)}
              </select>
          }
        </div>

        {/* Mensagem */}
        <div>
          <label style={{ fontSize: '0.7rem', color: t.textMuted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '700' }}>Mensagem</label>
          <textarea value={mensagem} onChange={e => setMensagem(e.target.value)}
            placeholder="Digite a mensagem que será enviada para todos os contatos..."
            rows={4} style={{ width: '100%', padding: '11px 13px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: '8px', color: t.text, fontSize: '0.86rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          <p style={{ fontSize: '0.7rem', color: t.textMuted, marginTop: '3px' }}>{mensagem.length} caracteres</p>
        </div>

        {/* Contatos */}
        <div>
          <label style={{ fontSize: '0.7rem', color: t.textMuted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '700' }}>Contatos — um número por linha (com DDD + código do país)</label>
          <textarea value={contatosRaw} onChange={e => setContatosRaw(e.target.value)}
            placeholder={'5511999999999\n5521888888888\n5531777777777'} rows={6}
            style={{ width: '100%', padding: '11px 13px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: '8px', color: t.text, fontSize: '0.83rem', resize: 'vertical', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
          {contatosParsados.length > 0 && (
            <p style={{ fontSize: '0.7rem', color: '#25D366', marginTop: '3px' }}>
              {contatosParsados.length} contato{contatosParsados.length > 1 ? 's' : ''} válido{contatosParsados.length > 1 ? 's' : ''} detectado{contatosParsados.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Feedback */}
        {resultado && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '11px 14px', borderRadius: '8px', fontSize: '0.83rem', whiteSpace: 'pre-line', background: resultado.tipo === 'sucesso' ? 'rgba(37,211,102,0.09)' : 'rgba(255,68,68,0.09)', border: `1px solid ${resultado.tipo === 'sucesso' ? 'rgba(37,211,102,0.28)' : 'rgba(255,68,68,0.28)'}`, color: resultado.tipo === 'sucesso' ? '#25D366' : '#ff6666' }}>
            {resultado.texto}
          </motion.div>
        )}

        {/* Botão de disparo */}
        <button onClick={handleEnviar} disabled={enviando}
          style={{ padding: '12px 24px', background: enviando ? 'rgba(37,211,102,0.3)' : 'linear-gradient(135deg, #25D366, #1aad5e)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', fontSize: '0.88rem', cursor: enviando ? 'not-allowed' : 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
          {enviando ? (
            <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Enviando...</>
          ) : `Disparar para ${contatosParsados.length || 0} contato${contatosParsados.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Histórico */}
      <div style={{ padding: '26px', background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, color: t.text }}>Histórico de Disparos</h4>
          <button onClick={carregarHistorico}
            style={{ padding: '5px 12px', background: 'transparent', border: `1px solid ${t.cardBorder}`, borderRadius: '6px', color: t.textMuted, fontSize: '0.75rem', cursor: 'pointer' }}>
            Atualizar
          </button>
        </div>
        {loadingHistorico ? (
          <p style={{ color: t.textMuted, fontSize: '0.82rem' }}>Carregando...</p>
        ) : historico.length === 0 ? (
          <p style={{ color: t.textMuted, fontSize: '0.82rem' }}>Nenhum disparo realizado ainda.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '360px', overflowY: 'auto' }}>
            {historico.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 130px', gap: '10px', alignItems: 'center', padding: '9px 12px', background: t.card, borderRadius: '7px', fontSize: '0.8rem', border: `1px solid ${t.cardBorder}` }}>
                <span style={{ fontFamily: 'monospace', color: t.textMuted }}>{item.contato}</span>
                <span style={{ color: t.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.mensagem}</span>
                <span style={{ padding: '2px 7px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600', background: `${corStatus(item.status)}22`, color: corStatus(item.status), textAlign: 'center', textTransform: 'capitalize' }}>{item.status}</span>
                <span style={{ color: t.textMuted, fontSize: '0.72rem', textAlign: 'right' }}>{new Date(item.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ABA: CONFIGURAÇÕES — Perfil, Segurança, Assinatura e Visual (novo)
// ─────────────────────────────────────────────────────────────────────────────
const ConfigSettings = ({ usuarioId, tema, setTema }) => {
  const navigate  = useNavigate();
  const t         = TEMAS[tema];
  const [subTab,          setSubTab]          = useState('Perfil');
  const [nome,            setNome]            = useState(localStorage.getItem('usuario_nome') || '');
  const [email,           setEmail]           = useState('');
  const [senhaAtual,      setSenhaAtual]      = useState('');
  const [novaSenha,       setNovaSenha]       = useState('');
  const [confirmarSenha,  setConfirmarSenha]  = useState('');
  const [loading,         setLoading]         = useState(false);
  const [msg,             setMsg]             = useState('');
  const [msgTipo,         setMsgTipo]         = useState('ok');
  const [assinatura,      setAssinatura]      = useState(null);
  const [loadingAss,      setLoadingAss]      = useState(false);
  const [cancelando,      setCancelando]      = useState(false);

  const mostrarMsg = (texto, tipo = 'ok') => {
    setMsg(texto);
    setMsgTipo(tipo);
    setTimeout(() => setMsg(''), 4500);
  };

  // Carrega dados do perfil
  useEffect(() => {
    if (!usuarioId) return;
    authFetch(`${API_URL}/usuarios/${usuarioId}`)
      .then(r => r.json())
      .then(d => { setNome(d.nome || ''); setEmail(d.email || ''); })
      .catch(() => {});
  }, [usuarioId]);

  // Carrega assinatura ao abrir a sub-aba
  useEffect(() => {
    if (subTab !== 'Assinatura') return;
    setLoadingAss(true);
    authFetch(`${API_URL}/pagamentos/minha-assinatura`)
      .then(r => r.json())
      .then(d => setAssinatura(d))
      .catch(() => setAssinatura(null))
      .finally(() => setLoadingAss(false));
  }, [subTab]);

  // Salva nome — atualiza no backend E no localStorage para refletir imediatamente
  const salvarPerfil = async () => {
    if (!nome.trim()) return mostrarMsg('O nome não pode estar vazio.', 'erro');
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/usuarios/${usuarioId}/nome`, {
        method: 'PUT',
        body: JSON.stringify({ nome }),
      });
      if (!res.ok) throw new Error();
      // Atualiza localStorage para o header refletir sem recarregar
      localStorage.setItem('usuario_nome', nome);
      mostrarMsg('Nome atualizado com sucesso.');
    } catch { mostrarMsg('Erro ao salvar. Tente novamente.', 'erro'); }
    finally { setLoading(false); }
  };

  // Altera senha — valida campos e envia para o backend com bcrypt
  const alterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) return mostrarMsg('Preencha todos os campos.', 'erro');
    if (novaSenha !== confirmarSenha) return mostrarMsg('As senhas não coincidem.', 'erro');
    if (novaSenha.length < 6)        return mostrarMsg('A nova senha precisa ter ao menos 6 caracteres.', 'erro');
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/usuarios/${usuarioId}/senha`, {
        method: 'PUT',
        body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao alterar senha.');
      mostrarMsg('Senha alterada com sucesso.');
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
    } catch (e) { mostrarMsg(e.message, 'erro'); }
    finally { setLoading(false); }
  };

  // Cancela assinatura no Mercado Pago via backend
  // O acesso continua ativo até o fim do período pago
  const cancelarAssinatura = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar? O acesso continua até o fim do período pago.')) return;
    setCancelando(true);
    try {
      const res  = await authFetch(`${API_URL}/pagamentos/cancelar`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao cancelar.');
      // Atualiza o estado local para refletir o cancelamento sem recarregar
      setAssinatura(prev => ({ ...prev, status: 'cancelado' }));
      mostrarMsg('Assinatura cancelada. Seu acesso segue ativo até o fim do período.');
    } catch (e) { mostrarMsg(e.message || 'Erro ao cancelar assinatura.', 'erro'); }
    finally { setCancelando(false); }
  };

  const statusLabel = { ativo: 'Ativo', trial: 'Trial', pausado: 'Pausado', cancelado: 'Cancelado', pendente: 'Pendente' };
  const statusColor = { ativo: '#25D366', trial: '#f0a500', pausado: '#f0a500', cancelado: '#ff4b4b', pendente: '#888' };
  const planoLabel  = { starter: 'Starter', pro: 'Pro', business: 'Business' };

  const subTabs = ['Perfil', 'Seguranca', 'Assinatura', 'Visual'];

  const cardStyle = { padding: '28px', background: t.card, borderRadius: '14px', border: `1px solid ${t.cardBorder}` };

  const renderSubContent = () => {
    switch (subTab) {

      // ── Perfil: atualiza nome (email é somente leitura) ──
      case 'Perfil':
        return (
          <motion.div {...fadeUp} style={{ display: 'grid', gap: '18px', maxWidth: '560px' }}>
            <div style={cardStyle}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '22px', color: t.text }}>Dados Pessoais</h4>
              <div style={{ display: 'grid', gap: '13px' }}>
                <Input tema={tema} label="Nome de Exibição" type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" />
                {/* E-mail é somente leitura — para alterar, o usuário precisa contatar o suporte */}
                <Input tema={tema} label="E-mail (somente leitura)" type="email" value={email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
            </div>
            {msg && <p style={{ fontSize: '0.78rem', fontWeight: '700', color: msgTipo === 'ok' ? '#25D366' : '#ff4b4b' }}>{msg}</p>}
            <SaveButton onClick={salvarPerfil} loading={loading} />
          </motion.div>
        );

      // ── Segurança: altera senha via backend com validação bcrypt ──
      case 'Seguranca':
        return (
          <motion.div {...fadeUp} style={{ display: 'grid', gap: '18px', maxWidth: '560px' }}>
            <div style={cardStyle}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '22px', color: t.text }}>Alterar Senha</h4>
              <div style={{ display: 'grid', gap: '13px' }}>
                <Input tema={tema} label="Senha Atual"           type="password" value={senhaAtual}     onChange={e => setSenhaAtual(e.target.value)}    placeholder="••••••••" />
                <Input tema={tema} label="Nova Senha"            type="password" value={novaSenha}      onChange={e => setNovaSenha(e.target.value)}      placeholder="••••••••" />
                <Input tema={tema} label="Confirmar Nova Senha"  type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
            {msg && <p style={{ fontSize: '0.78rem', fontWeight: '700', color: msgTipo === 'ok' ? '#25D366' : '#ff4b4b' }}>{msg}</p>}
            <SaveButton onClick={alterarSenha} loading={loading} label="ALTERAR SENHA" />
          </motion.div>
        );

      // ── Assinatura: exibe plano, status e permite cancelar/fazer upgrade ──
      case 'Assinatura':
        if (loadingAss) return (
          <div style={{ paddingTop: '50px', textAlign: 'center' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid rgba(37,211,102,0.2)', borderTop: '3px solid #25D366', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
          </div>
        );
        if (!assinatura?.tem_assinatura) return (
          <motion.div {...fadeUp} style={{ maxWidth: '560px' }}>
            <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 28px' }}>
              <p style={{ fontSize: '2rem', marginBottom: '12px' }}>📦</p>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '10px', color: t.text }}>Nenhum plano ativo</h4>
              <p style={{ color: t.textMuted, fontSize: '0.82rem', marginBottom: '24px', lineHeight: '1.6' }}>Você ainda não possui uma assinatura ativa. Escolha um plano para começar.</p>
              <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/assinar')}
                style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '13px 28px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.83rem' }}>VER PLANOS</motion.button>
            </div>
          </motion.div>
        );
        return (
          <motion.div {...fadeUp} style={{ maxWidth: '560px' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: t.text }}>Plano Atual</h4>
                <div style={{ display: 'flex', gap: '7px' }}>
                  <span style={{ background: 'rgba(37,211,102,0.1)', color: '#25D366', padding: '3px 11px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: '800' }}>{planoLabel[assinatura.plano] || assinatura.plano}</span>
                  <span style={{ background: `${statusColor[assinatura.status]}18`, color: statusColor[assinatura.status], padding: '3px 11px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: '800' }}>{statusLabel[assinatura.status] || assinatura.status}</span>
                </div>
              </div>

              {/* Detalhes da assinatura */}
              <div style={{ marginBottom: '24px' }}>
                {[
                  { label: 'Plano',   valor: planoLabel[assinatura.plano] || assinatura.plano },
                  { label: 'Período', valor: assinatura.periodo === 'mensal' ? 'Mensal' : 'Anual' },
                  { label: 'Status',  valor: statusLabel[assinatura.status] || assinatura.status },
                  assinatura.status === 'trial' && assinatura.trial_fim
                    ? { label: 'Trial até',       valor: new Date(assinatura.trial_fim).toLocaleDateString('pt-BR') }
                    : assinatura.periodo_fim
                    ? { label: 'Próxima cobrança', valor: new Date(assinatura.periodo_fim).toLocaleDateString('pt-BR') }
                    : null,
                ].filter(Boolean).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${t.cardBorder}` }}>
                    <span style={{ fontSize: '0.83rem', color: t.textMuted }}>{item.label}</span>
                    <span style={{ fontSize: '0.83rem', fontWeight: '700', color: t.text }}>{item.valor}</span>
                  </div>
                ))}
              </div>

              {msg && <p style={{ fontSize: '0.78rem', fontWeight: '700', marginBottom: '14px', color: msgTipo === 'ok' ? '#25D366' : '#ff4b4b' }}>{msg}</p>}

              {/* Ações conforme status da assinatura */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {/* Upgrade disponível para planos ativo e trial */}
                {['ativo', 'trial'].includes(assinatura.status) && assinatura.plano !== 'business' && (
                  <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate('/assinar')}
                    style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '12px 22px', borderRadius: '9px', fontWeight: '800', cursor: 'pointer', fontSize: '0.78rem' }}>FAZER UPGRADE</motion.button>
                )}
                {/* Cancelamento disponível para ativo e trial */}
                {['ativo', 'trial'].includes(assinatura.status) && (
                  <motion.button whileHover={{ scale: 1.02 }} onClick={cancelarAssinatura} disabled={cancelando}
                    style={{ background: 'transparent', color: '#ff4b4b', border: '1px solid #ff4b4b', padding: '12px 22px', borderRadius: '9px', fontWeight: '700', cursor: cancelando ? 'not-allowed' : 'pointer', fontSize: '0.78rem', opacity: cancelando ? 0.6 : 1 }}>
                    {cancelando ? 'CANCELANDO...' : 'CANCELAR ASSINATURA'}
                  </motion.button>
                )}
                {/* Reativação disponível para cancelados */}
                {assinatura.status === 'cancelado' && (
                  <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate('/assinar')}
                    style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '12px 22px', borderRadius: '9px', fontWeight: '800', cursor: 'pointer', fontSize: '0.78rem' }}>REATIVAR ASSINATURA</motion.button>
                )}
              </div>
            </div>
          </motion.div>
        );

      // ── Visual: troca entre tema escuro e claro ──
      case 'Visual':
        return (
          <motion.div {...fadeUp} style={{ maxWidth: '560px' }}>
            <div style={cardStyle}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '6px', color: t.text }}>Aparência</h4>
              <p style={{ fontSize: '0.78rem', color: t.textMuted, marginBottom: '24px', lineHeight: '1.6' }}>Escolha o tema visual do painel. A preferência é salva localmente no seu navegador.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {Object.keys(TEMAS).map(chave => {
                  const ativo   = tema === chave;
                  const preview = TEMAS[chave];
                  return (
                    <motion.div key={chave} whileHover={{ scale: 1.02 }} onClick={() => {
                      setTema(chave);
                      // Persiste a preferência de tema no localStorage
                      localStorage.setItem('zapchat_tema', chave);
                    }}
                      style={{ padding: '18px', borderRadius: '12px', border: `2px solid ${ativo ? '#25D366' : preview.cardBorder}`, background: preview.bg, cursor: 'pointer', transition: 'border 0.2s' }}>
                      {/* Preview miniatura do tema */}
                      <div style={{ height: '50px', borderRadius: '8px', background: preview.sidebar, border: `1px solid ${preview.cardBorder}`, marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: '800', color: preview.text }}>ZAP<span style={{ color: '#25D366' }}>CHAT</span></span>
                      </div>
                      <p style={{ fontSize: '0.78rem', fontWeight: '700', color: preview.text, marginBottom: '2px', textTransform: 'capitalize' }}>{chave === 'escuro' ? 'Tema Escuro' : 'Tema Claro'}</p>
                      {ativo && <p style={{ fontSize: '0.65rem', color: '#25D366', fontWeight: '600' }}>Ativo</p>}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );

      default: return null;
    }
  };

  return (
    <div style={{ paddingTop: '36px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {/* Sub-abas de configurações */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: `1px solid ${t.cardBorder}`, marginBottom: '26px', flexWrap: 'wrap' }}>
        {subTabs.map(item => (
          <div key={item} onClick={() => setSubTab(item)}
            style={{ padding: '9px 0', fontSize: '0.86rem', fontWeight: '600', color: subTab === item ? '#25D366' : t.textMuted, borderBottom: subTab === item ? '2px solid #25D366' : '2px solid transparent', cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s' }}>
            {item === 'Seguranca' ? 'Segurança' : item}
          </div>
        ))}
      </div>
      {renderSubContent()}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ABA: INSTÂNCIAS (fluxos) — lista e edição dos fluxos do usuário
// ─────────────────────────────────────────────────────────────────────────────
const Instancias = ({ fluxos, carregando, onEditar, onExcluir, tema }) => {
  const t = TEMAS[tema];
  return (
    <motion.div {...fadeUp} style={{ paddingTop: '36px' }}>
      <p style={{ fontSize: '0.72rem', color: t.textMuted, marginBottom: '22px', fontWeight: '600' }}>
        {fluxos.length} fluxo{fluxos.length !== 1 ? 's' : ''} ativo{fluxos.length !== 1 ? 's' : ''} no banco de dados
      </p>
      {carregando
        ? <p style={{ color: t.textMuted, fontSize: '0.85rem' }}>Carregando...</p>
        : fluxos.length > 0
          ? fluxos.map(fluxo => <FluxoCard key={fluxo.id} {...fluxo} tema={tema} onEditar={() => onEditar(fluxo.id)} onExcluir={() => onExcluir(fluxo.id)} />)
          : (
            <div style={{ padding: '50px', textAlign: 'center', border: `1px dashed ${t.cardBorder}`, borderRadius: '14px' }}>
              <p style={{ color: t.textMuted, fontSize: '0.85rem' }}>Nenhum fluxo criado ainda.</p>
            </div>
          )
      }
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: Dashboard
// Responsável por: autenticação, roteamento interno, carregamento de dados
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();

  // Tema — lê a preferência salva, padrão: escuro
  const [tema,        setTema]        = useState(() => localStorage.getItem('zapchat_tema') || 'escuro');
  const [activeTab,   setActiveTab]   = useState('Dashboard');
  const [fluxos,      setFluxos]      = useState([]);
  const [carregando,  setCarregando]  = useState(true);
  const [criando,     setCriando]     = useState(false);
  const [trialBanner, setTrialBanner] = useState(false);
  const [plano,       setPlano]       = useState('starter');
  const [menuAberto,  setMenuAberto]  = useState(false); // controle do menu mobile

  const t           = TEMAS[tema];
  const usuarioId   = parseInt(localStorage.getItem('usuario_id'));
  const usuarioNome = localStorage.getItem('usuario_nome') || 'Usuário';

  // Itens do menu lateral — bloqueio por plano aplicado dinamicamente
  const menuItems = [
    { label: 'Dashboard',     bloqueado: false },
    { label: 'Instancias',    bloqueado: false },
    { label: 'WhatsApp',      bloqueado: false },
    { label: 'Disparos',      bloqueado: !PLANO_LIMITES[plano]?.disparos },
    { label: 'Chatbot IA',    bloqueado: !PLANO_LIMITES[plano]?.ia },
    { label: 'Configuracoes', bloqueado: false },
  ];

  // Busca o plano ativo do usuário ao montar
  useEffect(() => {
    authFetch(`${API_URL}/pagamentos/minha-assinatura`)
      .then(r => r.json())
      .then(d => { if (d.tem_assinatura && d.plano) setPlano(d.plano); })
      .catch(() => {});
  }, []);

  // Exibe banner de trial ao retornar do checkout
  useEffect(() => {
    if (searchParams.get('trial') === 'ativado') {
      setTrialBanner(true);
      setTimeout(() => setTrialBanner(false), 6000);
    }
  }, [searchParams]);

  // Carrega fluxos do usuário
  const carregarFluxos = useCallback(async () => {
    if (!usuarioId) return;
    setCarregando(true);
    try {
      const res = await authFetch(`${API_URL}/fluxos/listar/${usuarioId}`);
      // Token inválido ou expirado — redireciona para login
      if (res.status === 401) { navigate('/login'); return; }
      const data = await res.json();
      setFluxos(data.fluxos || []);
    } catch { /* rede indisponível — mantém lista anterior */ }
    finally { setCarregando(false); }
  }, [usuarioId]);

  useEffect(() => { carregarFluxos(); }, [carregarFluxos]);

  // Cria novo fluxo com nó inicial padrão e abre o editor
  const criarNovoFluxo = async () => {
    if (!usuarioId) return;
    setCriando(true);
    try {
      const res = await authFetch(`${API_URL}/fluxos/salvar`, {
        method: 'POST',
        body: JSON.stringify({
          id: 0,
          usuario_id: usuarioId,
          nome_fluxo: `Fluxo #${fluxos.length + 1}`,
          nodes: [{ id: '1', type: 'botNode', data: { label: 'Olá!', options: [], delay: 2 }, position: { x: 400, y: 100 } }],
          edges: [],
        }),
      });
      if (res.status === 401) { navigate('/login'); return; }
      const data = await res.json();
      if (data.id) navigate(`/editor/${data.id}`);
    } catch { /* erro de rede — não navega */ }
    finally { setCriando(false); }
  };

  const excluirFluxo = async (id) => {
    if (!window.confirm('Excluir este fluxo? Esta ação não pode ser desfeita.')) return;
    try {
      await authFetch(`${API_URL}/fluxos/${id}/${usuarioId}`, { method: 'DELETE' });
      setFluxos(prev => prev.filter(f => f.id !== id));
    } catch { alert('Erro ao excluir. Tente novamente.'); }
  };

  const renderContent = () => {
    switch (activeTab) {

      // ── Aba principal: resumo e lista de fluxos ──
      case 'Dashboard':
        return (
          <motion.div {...fadeUp} style={{ paddingTop: '36px' }}>
            {/* Badge do plano com link para upgrade */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.18)', borderRadius: '20px', padding: '5px 13px', marginBottom: '26px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25D366' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#25D366', textTransform: 'uppercase', letterSpacing: '1px' }}>Plano {PLANO_NOME[plano] || plano}</span>
              {plano !== 'business' && (
                <span onClick={() => navigate('/assinar')} style={{ fontSize: '0.63rem', color: t.textMuted, cursor: 'pointer', marginLeft: '3px', textDecoration: 'underline' }}>fazer upgrade</span>
              )}
            </div>

            {/* Cards de estatísticas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px' }}>
              <StatCard tema={tema} label="Fluxos Criados"  value={fluxos.length}
                trend={fluxos.length > 0 ? `${fluxos.length} fluxo${fluxos.length > 1 ? 's' : ''} no banco` : 'Nenhum fluxo ainda'} />
              <StatCard tema={tema} label="Último Fluxo"    value={fluxos[0]?.nome_fluxo || '—'}
                trend={fluxos[0] ? new Date(fluxos[0].data_criacao).toLocaleDateString('pt-BR') : 'Sem registros'} />
              <StatCard tema={tema} label="Sessões Ativas"  value="0" trend="Aguardando bot" />
              <StatCard tema={tema} label="Status"          value={fluxos.length > 0 ? 'Online' : 'Offline'}
                trend={fluxos.length > 0 ? 'Fluxos prontos' : 'Crie um fluxo'} trendPositive={fluxos.length > 0} />
            </div>

            {/* Lista de fluxos */}
            {carregando ? (
              <p style={{ textAlign: 'center', padding: '60px 0', color: t.textMuted }}>Carregando fluxos...</p>
            ) : fluxos.length > 0 ? (
              <>
                <p style={{ fontSize: '0.68rem', color: t.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '13px' }}>Seus Fluxos</p>
                {fluxos.map(fluxo => (
                  <FluxoCard key={fluxo.id} tema={tema} {...fluxo}
                    onExcluir={() => excluirFluxo(fluxo.id)}
                    onEditar={() => navigate(`/editor/${fluxo.id}`)} />
                ))}
              </>
            ) : (
              <div style={{ padding: '70px 40px', borderRadius: '18px', border: `1px dashed ${t.cardBorder}`, textAlign: 'center', background: t.card }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: t.text }}>Nenhum fluxo disponível</h3>
                <p style={{ color: t.textMuted, fontSize: '0.88rem' }}>Clique em "+ NOVO FLUXOGRAMA" para começar.</p>
              </div>
            )}
          </motion.div>
        );

      case 'Instancias':   return <Instancias fluxos={fluxos} carregando={carregando} tema={tema} onEditar={id => navigate(`/editor/${id}`)} onExcluir={excluirFluxo} />;
      case 'WhatsApp':     return <WhatsAppTab fluxos={fluxos} usuarioId={usuarioId} plano={plano} tema={tema} />;
      case 'Disparos':     return <DisparosTab plano={plano} navigate={navigate} tema={tema} />;
      case 'Chatbot IA':   return <ChatbotIA fluxos={fluxos} plano={plano} navigate={navigate} tema={tema} />;
      case 'Configuracoes':return <ConfigSettings usuarioId={usuarioId} tema={tema} setTema={setTema} />;
      default:             return null;
    }
  };

  // ── Estilos globais do dashboard ──
  const sidebarStyle = {
    width: '240px',
    borderRight: `1px solid ${t.cardBorder}`,
    padding: '36px 22px',
    display: 'flex',
    flexDirection: 'column',
    background: t.sidebar,
    flexShrink: 0,
    // Mobile: sidebar some e vira menu deslizante
    position: 'relative',
    zIndex: 20,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: t.bg, color: t.text, overflow: 'hidden' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        /* Scrollbar discreta para o tema */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollbar}; border-radius: 99px; }

        /* Responsividade mobile */
        @media (max-width: 768px) {
          .dashboard-sidebar { display: none !important; }
          .dashboard-sidebar.aberto { display: flex !important; position: fixed !important; inset: 0 !important; width: 80vw !important; max-width: 280px !important; z-index: 100 !important; box-shadow: 4px 0 30px rgba(0,0,0,0.4) !important; }
          .dashboard-main { padding: 0 20px !important; }
          .dashboard-header { padding: 20px 0 !important; }
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
          .mobile-menu-btn { display: flex !important; }
          .historico-grid { grid-template-columns: 1fr 80px !important; }
        }
        @media (min-width: 769px) {
          .dashboard-sidebar { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        /* Input focus */
        input:focus, textarea:focus, select:focus {
          border-color: rgba(37,211,102,0.5) !important;
          box-shadow: 0 0 0 3px rgba(37,211,102,0.08) !important;
        }
      `}</style>

      {/* Overlay mobile quando sidebar está aberta */}
      {menuAberto && (
        <div onClick={() => setMenuAberto(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'none' }}
          className="mobile-overlay" />
      )}

      {/* ── Sidebar ── */}
      <aside className={`dashboard-sidebar${menuAberto ? ' aberto' : ''}`} style={sidebarStyle}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', marginBottom: '44px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '900', letterSpacing: '-1px' }}>
            ZAP<span style={{ color: '#25D366' }}>CHAT</span>
          </h2>
        </Link>

        {/* Itens de navegação */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flexGrow: 1 }}>
          {menuItems.map(({ label, bloqueado }) => (
            <MenuItem key={label} label={label === 'Configuracoes' ? 'Configurações' : label === 'Instancias' ? 'Instâncias' : label}
              ativo={activeTab === label} bloqueado={bloqueado} tema={tema}
              onClick={() => { setActiveTab(label); setMenuAberto(false); }} />
          ))}
        </nav>

        {/* Badge do plano */}
        <div style={{ padding: '11px 13px', background: 'rgba(37,211,102,0.06)', borderRadius: '10px', border: '1px solid rgba(37,211,102,0.12)', marginBottom: '10px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.58rem', color: t.textMuted, textTransform: 'uppercase', fontWeight: '700', marginBottom: '2px' }}>Plano atual</p>
          <p style={{ fontSize: '0.82rem', fontWeight: '900', color: '#25D366' }}>{PLANO_NOME[plano] || plano}</p>
          {plano !== 'business' && (
            <p onClick={() => navigate('/assinar')} style={{ fontSize: '0.6rem', color: t.textMuted, cursor: 'pointer', marginTop: '3px', textDecoration: 'underline' }}>fazer upgrade</p>
          )}
        </div>

        {/* Info do usuário logado */}
        <div style={{ padding: '13px', background: t.card, borderRadius: '10px', border: `1px solid ${t.cardBorder}` }}>
          <p style={{ fontSize: '0.6rem', color: t.textMuted, textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Logado como</p>
          <p style={{ fontSize: '0.82rem', fontWeight: '700', color: '#25D366' }}>{usuarioNome}</p>
        </div>
      </aside>

      {/* ── Conteúdo principal ── */}
      <main className="dashboard-main" style={{ flexGrow: 1, padding: '0 50px', overflowY: 'auto', minWidth: 0 }}>

        {/* Banner de trial ativado */}
        <AnimatePresence>
          {trialBanner && (
            <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}
              style={{ position: 'fixed', top: '18px', right: '18px', zIndex: 999, background: '#0c1f0f', border: '1px solid rgba(37,211,102,0.4)', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 28px rgba(0,0,0,0.35)' }}>
              <div>
                <p style={{ fontWeight: '800', fontSize: '0.83rem', color: '#25D366', marginBottom: '1px' }}>Trial ativado com sucesso!</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>Você tem 7 dias de acesso completo ao Starter.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header fixo */}
        <header className="dashboard-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '36px 0', borderBottom: `1px solid ${t.cardBorder}`, position: 'sticky', top: 0, background: t.header, zIndex: 10, gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            {/* Botão hamburguer — visível apenas no mobile */}
            <button className="mobile-menu-btn" onClick={() => setMenuAberto(v => !v)}
              style={{ background: 'transparent', border: `1px solid ${t.cardBorder}`, borderRadius: '8px', padding: '8px 11px', cursor: 'pointer', color: t.text, fontSize: '1rem', display: 'none' }}>
              ☰
            </button>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: t.text }}>{activeTab === 'Configuracoes' ? 'Configurações' : activeTab === 'Instancias' ? 'Instâncias' : activeTab}</h1>
              <p style={{ color: t.textMuted, fontSize: '0.82rem' }}>Plataforma / {activeTab === 'Configuracoes' ? 'Configurações' : activeTab}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
            {/* Sair: limpa localStorage e redireciona para login */}
            <motion.button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} whileHover={{ scale: 1.02 }}
              style={{ background: 'transparent', color: t.textMuted, border: `1px solid ${t.cardBorder}`, padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.7rem' }}>
              SAIR
            </motion.button>
            {/* Cria novo fluxo e abre o editor imediatamente */}
            <motion.button onClick={criarNovoFluxo} disabled={criando}
              whileHover={{ scale: 1.02, backgroundColor: '#25D366', color: '#0d140d' }}
              style={{ background: 'transparent', color: '#25D366', border: '1px solid #25D366', padding: '10px 22px', borderRadius: '8px', fontWeight: '700', cursor: criando ? 'not-allowed' : 'pointer', opacity: criando ? 0.6 : 1, transition: 'background 0.2s, color 0.2s', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
              {criando ? 'CRIANDO...' : '+ NOVO FLUXOGRAMA'}
            </motion.button>
          </div>
        </header>

        {/* Renderiza a aba ativa com animação de transição */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}>{renderContent()}</motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;