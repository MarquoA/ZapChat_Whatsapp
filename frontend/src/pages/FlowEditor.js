import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge, Background, Controls, MiniMap,
  applyEdgeChanges, applyNodeChanges,
  Handle, Position, MarkerType,
  useReactFlow, ReactFlowProvider
} from 'reactflow';
import { useNavigate, useParams } from 'react-router-dom';
import 'reactflow/dist/style.css';

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

// ─── TEMA DO EDITOR ───────────────────────────────────────────────────────────
const FE_TEMAS = {
  escuro: {
    nodeBg: 'rgba(8,12,8,0.97)',
    nodeShadow: '0 20px 40px rgba(0,0,0,0.5)',
    canvasBg: '#0d1117',
    bgDotColor: '#25D366',
    navBg: 'rgba(6,10,6,0.98)',
    navText: 'rgba(255,255,255,0.85)',
    navBorder: 'rgba(255,255,255,0.06)',
    sidebarBg: 'rgba(8,12,8,0.97)',
    sidebarBorder: 'rgba(255,255,255,0.05)',
    sidebarLabel: 'rgba(255,255,255,0.25)',
    sidebarText: 'rgba(255,255,255,0.3)',
    inputBg: 'rgba(255,255,255,0.03)',
    inputBorder: 'rgba(255,255,255,0.08)',
    inputText: '#ffffff',
    textMuted: 'rgba(255,255,255,0.35)',
    textSub: 'rgba(255,255,255,0.2)',
    green: '#25D366',
    greenDim: 'rgba(37,211,102,0.04)',
    blue: '#63b3ed',
    blueDim: 'rgba(99,179,237,0.04)',
    purple: '#a78bfa',
    purpleDim: 'rgba(167,139,250,0.04)',
    cyan: '#34b7f1',
    danger: '#ff4d4d',
    warning: '#f0a500',
    handleBorder: '#080c08',
    overlay: 'rgba(8,12,8,0.85)',
    minimapBg: 'rgba(8,12,8,0.9)',
    minimapBorder: 'rgba(255,255,255,0.08)',
    minimapMask: 'rgba(8,12,8,0.85)',
    shortcutBg: 'rgba(255,255,255,0.05)',
    shortcutText: 'rgba(255,255,255,0.2)',
  },
  claro: {
    nodeBg: '#f5f8f4',
    nodeShadow: '0 4px 18px rgba(0,0,0,0.13)',
    canvasBg: '#e5ddd5',
    bgDotColor: '#a09080',
    navBg: '#eaede9',
    navText: '#1a2a1a',
    navBorder: 'rgba(45,75,45,0.15)',
    sidebarBg: '#e2e6e1',
    sidebarBorder: 'rgba(45,75,45,0.14)',
    sidebarLabel: '#3a5a3a',
    sidebarText: '#4d6b4d',
    inputBg: 'rgba(22,55,22,0.08)',
    inputBorder: 'rgba(22,55,22,0.22)',
    inputText: '#1a2a1a',
    textMuted: 'rgba(22,42,22,0.62)',
    textSub: 'rgba(22,42,22,0.52)',
    green: '#2e7a50',
    greenDim: 'rgba(46,122,80,0.14)',
    blue: '#3a6fa0',
    blueDim: 'rgba(58,111,160,0.12)',
    purple: '#6b4fa0',
    purpleDim: 'rgba(107,79,160,0.12)',
    cyan: '#2b7fa8',
    danger: '#b53535',
    warning: '#9a6a08',
    handleBorder: '#e5ddd5',
    overlay: 'rgba(229,221,213,0.88)',
    minimapBg: 'rgba(226,230,225,0.97)',
    minimapBorder: 'rgba(45,75,45,0.18)',
    minimapMask: 'rgba(229,221,213,0.82)',
    shortcutBg: 'rgba(22,55,22,0.09)',
    shortcutText: 'rgba(22,42,22,0.58)',
  },
};

// Atualizado em FlowContent a cada render com base no tema salvo
let FE_T = FE_TEMAS.escuro;
// Compartilhado com IANode para acesso ao usuário e navegação
let FE_USUARIO_ID = 0;
let FE_NAVIGATE = null;
let FE_PUSH_HISTORY = () => {};

// ─── SPINNER ─────────────────────────────────────────────────────────────────
const Spinner = ({ size = 16, color = '#25D366' }) => (
  <span style={{ width: size, height: size, flexShrink: 0, border: `2px solid ${color}33`, borderTop: `2px solid ${color}`, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
);

// ─── NODE: TEXTO ─────────────────────────────────────────────────────────────
const BotNode = ({ id, data }) => {
  const { setNodes, setEdges } = useReactFlow();
  const [label, setLabel] = useState(data.label || '');
  const [options, setOptions] = useState(data.options || []);
  const [delay, setDelay] = useState(data.delay ?? 2);

  useEffect(() => {
    setLabel(data.label || '');
    setOptions(data.options || []);
    setDelay(data.delay ?? 2);
  }, [data.label, data.delay]);

  const updateNodeData = useCallback((newLabel, newOptions, newDelay) => {
    setNodes(nds => nds.map(n => n.id === id
      ? { ...n, data: { ...n.data, label: newLabel, options: newOptions, delay: newDelay } }
      : n
    ));
  }, [id, setNodes]);

  const handleLabelChange = (e) => { setLabel(e.target.value); updateNodeData(e.target.value, options, delay); };
  const handleDelayChange = (e) => { const v = e.target.value.replace(/\D/g,''); setDelay(v); updateNodeData(label, options, v); };

  const addOption = () => {
    const newOpts = [...options, 'Nova Opção'];
    setOptions(newOpts);
    updateNodeData(label, newOpts, delay);
  };

  const removeOption = (index) => {
    const newOpts = options.filter((_, i) => i !== index);
    setOptions(newOpts);
    updateNodeData(label, newOpts, delay);
    setEdges(eds => eds.filter(e => !(e.source === id && e.sourceHandle === `opt${index}`)));
  };

  const updateOption = (index, value) => {
    const newOpts = [...options];
    newOpts[index] = value;
    setOptions(newOpts);
    updateNodeData(label, newOpts, delay);
  };

  const deleteNode = () => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
    FE_PUSH_HISTORY();
  };

  const charCount = label.length;
  const charColor = charCount > 1000 ? FE_T.danger : charCount > 700 ? FE_T.warning : FE_T.textMuted;

  return (
    <div style={{ background: FE_T.nodeBg, border: `1px solid ${FE_T.green}33`, borderRadius: '15px', minWidth: '280px', maxWidth: '320px', boxShadow: FE_T.nodeShadow }}>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${FE_T.green}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: FE_T.greenDim, borderRadius: '15px 15px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', background: FE_T.green, borderRadius: '50%' }} />
          <span style={{ fontSize: '9px', color: FE_T.green, fontWeight: '800', letterSpacing: '1px' }}>MENSAGEM DE TEXTO</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: `${FE_T.green}12`, padding: '3px 7px', borderRadius: '6px', border: `1px solid ${FE_T.green}22` }}>
            <input type="text" value={delay} onChange={handleDelayChange}
              style={{ background: 'none', border: 'none', color: FE_T.green, fontSize: '11px', width: '18px', fontWeight: '800', outline: 'none', textAlign: 'center' }} />
            <span style={{ fontSize: '8px', color: FE_T.textMuted, fontWeight: '700' }}>S</span>
          </div>
        </div>
        <button onClick={deleteNode} title="Apagar node"
          style={{ background: `${FE_T.danger}12`, border: `1px solid ${FE_T.danger}33`, color: FE_T.danger, cursor: 'pointer', fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: '5px', transition: '0.2s' }}>
          APAGAR
        </button>
      </div>
      <div style={{ padding: '14px' }}>
        <Handle type="target" position={Position.Top} style={{ background: FE_T.green, width: '10px', height: '10px', border: `2px solid ${FE_T.handleBorder}`, top: '-6px' }} />
        <textarea value={label} onChange={handleLabelChange}
          style={{ width: '100%', background: FE_T.inputBg, border: `1px solid ${FE_T.inputBorder}`, borderRadius: '8px', color: FE_T.inputText, fontSize: '0.83rem', padding: '10px 12px', minHeight: '80px', outline: 'none', resize: 'none', marginBottom: '4px', boxSizing: 'border-box', lineHeight: '1.5' }}
          placeholder="Digite o texto da mensagem..." />
        <p style={{ fontSize: '0.55rem', color: charColor, textAlign: 'right', marginBottom: '12px', fontWeight: '600' }}>{charCount} caracteres</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.58rem', color: FE_T.textMuted, fontWeight: '800', letterSpacing: '1px' }}>OPCOES DE RESPOSTA</span>
            <button onClick={addOption}
              style={{ background: `${FE_T.green}14`, border: `1px solid ${FE_T.green}33`, color: FE_T.green, fontSize: '0.6rem', cursor: 'pointer', fontWeight: '900', padding: '3px 8px', borderRadius: '5px' }}>
              + ADD
            </button>
          </div>
          {options.map((opt, i) => (
            <div key={i} style={{ position: 'relative', background: `${FE_T.green}08`, padding: '9px 10px', borderRadius: '8px', border: `1px solid ${FE_T.green}18`, display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', color: FE_T.textMuted, fontWeight: '800', marginRight: '6px', flexShrink: 0 }}>{i+1}.</span>
              <input value={opt} onChange={e => updateOption(i, e.target.value)}
                style={{ background: 'none', border: 'none', color: FE_T.inputText, fontSize: '0.75rem', outline: 'none', flex: 1, minWidth: 0 }} />
              <button onClick={() => removeOption(i)}
                style={{ background: 'none', border: 'none', color: FE_T.danger, cursor: 'pointer', fontSize: '14px', marginLeft: '6px', flexShrink: 0, lineHeight: 1 }}>x</button>
              <Handle type="source" position={Position.Right} id={`opt${i}`}
                style={{ right: '-6px', background: FE_T.green, width: '11px', height: '11px', border: `2px solid ${FE_T.handleBorder}` }} />
            </div>
          ))}
          {options.length === 0 && (
            <div style={{ fontSize: '0.58rem', color: FE_T.textSub, textAlign: 'center', padding: '6px 0', fontStyle: 'italic' }}>
              Sem opções — saída única pelo fundo
            </div>
          )}
          {options.length === 0 && (
            <Handle type="source" position={Position.Bottom} id="default"
              style={{ bottom: '-6px', background: FE_T.cyan, width: '11px', height: '11px', border: `2px solid ${FE_T.handleBorder}` }} />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── NODE: IMAGEM ─────────────────────────────────────────────────────────────
const ImageNode = ({ id, data }) => {
  const { setNodes, setEdges } = useReactFlow();
  const [caption, setCaption] = useState(data.caption || '');
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');
  const [delay, setDelay] = useState(data.delay ?? 2);
  const fileRef = useRef();

  useEffect(() => {
    setCaption(data.caption || '');
    setImageUrl(data.imageUrl || '');
    setDelay(data.delay ?? 2);
  }, [data.caption, data.imageUrl, data.delay]);

  const update = useCallback((newCaption, newUrl, newDelay) => {
    setNodes(nds => nds.map(n => n.id === id
      ? { ...n, data: { ...n.data, caption: newCaption, imageUrl: newUrl, delay: newDelay } }
      : n
    ));
  }, [id, setNodes]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setImageUrl(ev.target.result); update(caption, ev.target.result, delay); };
    reader.readAsDataURL(file);
  };

  const deleteNode = () => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
    FE_PUSH_HISTORY();
  };

  return (
    <div style={{ background: FE_T.nodeBg, border: `1px solid ${FE_T.blue}33`, borderRadius: '15px', minWidth: '280px', maxWidth: '320px', boxShadow: FE_T.nodeShadow }}>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${FE_T.blue}18`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: FE_T.blueDim, borderRadius: '15px 15px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', background: FE_T.blue, borderRadius: '50%' }} />
          <span style={{ fontSize: '9px', color: FE_T.blue, fontWeight: '800', letterSpacing: '1px' }}>IMAGEM</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: `${FE_T.blue}12`, padding: '3px 7px', borderRadius: '6px', border: `1px solid ${FE_T.blue}22` }}>
            <input type="text" value={delay} onChange={e => { const v = e.target.value.replace(/\D/g,''); setDelay(v); update(caption, imageUrl, v); }}
              style={{ background: 'none', border: 'none', color: FE_T.blue, fontSize: '11px', width: '18px', fontWeight: '800', outline: 'none', textAlign: 'center' }} />
            <span style={{ fontSize: '8px', color: FE_T.textMuted, fontWeight: '700' }}>S</span>
          </div>
        </div>
        <button onClick={deleteNode}
          style={{ background: `${FE_T.danger}12`, border: `1px solid ${FE_T.danger}33`, color: FE_T.danger, cursor: 'pointer', fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: '5px' }}>
          APAGAR
        </button>
      </div>
      <div style={{ padding: '14px' }}>
        <Handle type="target" position={Position.Top} style={{ background: FE_T.blue, width: '10px', height: '10px', border: `2px solid ${FE_T.handleBorder}`, top: '-6px' }} />
        <div onClick={() => fileRef.current?.click()}
          style={{ width: '100%', height: '130px', background: FE_T.blueDim, border: `2px dashed ${imageUrl ? FE_T.blue + '66' : FE_T.blue + '33'}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '10px', overflow: 'hidden', transition: '0.2s' }}>
          {imageUrl
            ? <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            : <div style={{ textAlign: 'center' }}>
                <p style={{ color: FE_T.blue + 'aa', fontSize: '0.6rem', fontWeight: '700', margin: 0 }}>CLIQUE PARA ENVIAR</p>
                <p style={{ color: FE_T.textSub, fontSize: '0.55rem', margin: '4px 0 0' }}>PNG, JPG, GIF</p>
              </div>
          }
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </div>
        {imageUrl && (
          <button onClick={() => { setImageUrl(''); update(caption, '', delay); }}
            style={{ background: 'none', border: 'none', color: FE_T.danger + 'aa', fontSize: '0.6rem', cursor: 'pointer', marginBottom: '8px', padding: 0 }}>
            remover imagem
          </button>
        )}
        <input value={caption} onChange={e => { setCaption(e.target.value); update(e.target.value, imageUrl, delay); }}
          placeholder="Legenda (opcional)..."
          style={{ width: '100%', background: FE_T.inputBg, border: `1px solid ${FE_T.inputBorder}`, borderRadius: '8px', color: FE_T.inputText, fontSize: '0.78rem', padding: '9px 11px', outline: 'none', boxSizing: 'border-box' }} />
        <Handle type="source" position={Position.Bottom} id="default"
          style={{ bottom: '-6px', background: FE_T.blue, width: '11px', height: '11px', border: `2px solid ${FE_T.handleBorder}` }} />
      </div>
    </div>
  );
};

// ─── NODE: IA COM CONTEXTO ────────────────────────────────────────────────────
const IANode = ({ id, data }) => {
  const { setNodes, setEdges } = useReactFlow();
  const [delay, setDelay] = useState(data.delay ?? 3);
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalhe, setDetalhe] = useState(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);
  const [agenteAtivo, setAgenteAtivo] = useState(
    data.agenteId ? { id: data.agenteId, nome: data.agenteName || '', modelo: data.modelo || 'gpt-4o-mini' } : null
  );
  const [trocando, setTrocando] = useState(false);

  useEffect(() => { setDelay(data.delay ?? 3); }, [data.delay]);

  useEffect(() => {
    if (!FE_USUARIO_ID) { setLoading(false); return; }
    authFetch(`${API_URL}/ia/agentes/listar/${FE_USUARIO_ID}`)
      .then(r => r.json())
      .then(d => setAgentes(d.agentes || []))
      .catch(() => setAgentes([]))
      .finally(() => setLoading(false));
  }, []);

  const updateNodeData = useCallback((agenteId, agenteName, modelo, prompt, d) => {
    setNodes(nds => nds.map(n => n.id === id
      ? { ...n, data: { ...n.data, agenteId, agenteName, modelo, prompt, delay: d } }
      : n
    ));
  }, [id, setNodes]);

  const deleteNode = () => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
    FE_PUSH_HISTORY();
  };

  const verDetalhes = (ag) => {
    if (!FE_USUARIO_ID) return;
    setLoadingDetalhe(true);
    setDetalhe(null);
    authFetch(`${API_URL}/ia/agentes/${ag.id}/${FE_USUARIO_ID}`)
      .then(r => r.json())
      .then(d => setDetalhe(d))
      .catch(() => setDetalhe(null))
      .finally(() => setLoadingDetalhe(false));
  };

  const confirmarAgente = () => {
    if (!detalhe) return;
    const novo = { id: detalhe.id, nome: detalhe.nome, modelo: detalhe.modelo };
    setAgenteAtivo(novo);
    setDetalhe(null);
    setTrocando(false);
    updateNodeData(detalhe.id, detalhe.nome, detalhe.modelo, detalhe.prompt || '', delay);
  };

  const handleDelay = (v) => {
    setDelay(v);
    if (agenteAtivo) updateNodeData(agenteAtivo.id, agenteAtivo.nome, agenteAtivo.modelo, data.prompt || '', v);
  };

  const nodeHeader = (
    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${FE_T.purple}18`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: FE_T.purpleDim, borderRadius: '15px 15px 0 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '7px', height: '7px', background: FE_T.purple, borderRadius: '50%' }} />
        <span style={{ fontSize: '9px', color: FE_T.purple, fontWeight: '800', letterSpacing: '1px' }}>IA COM CONTEXTO</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: `${FE_T.purple}12`, padding: '3px 7px', borderRadius: '6px', border: `1px solid ${FE_T.purple}22` }}>
          <input type="text" value={delay} onChange={e => handleDelay(e.target.value.replace(/\D/g,''))}
            style={{ background: 'none', border: 'none', color: FE_T.purple, fontSize: '11px', width: '18px', fontWeight: '800', outline: 'none', textAlign: 'center' }} />
          <span style={{ fontSize: '8px', color: FE_T.textMuted, fontWeight: '700' }}>S</span>
        </div>
      </div>
      <button onClick={deleteNode}
        style={{ background: `${FE_T.danger}12`, border: `1px solid ${FE_T.danger}33`, color: FE_T.danger, cursor: 'pointer', fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: '5px' }}>
        APAGAR
      </button>
    </div>
  );

  const topHandle = <Handle type="target" position={Position.Top} style={{ background: FE_T.purple, width: '10px', height: '10px', border: `2px solid ${FE_T.handleBorder}`, top: '-6px' }} />;
  const botHandle = <Handle type="source" position={Position.Bottom} id="default" style={{ bottom: '-6px', background: FE_T.purple, width: '11px', height: '11px', border: `2px solid ${FE_T.handleBorder}` }} />;

  // ── Estado: agente já configurado ──
  if (agenteAtivo && !trocando) {
    return (
      <div style={{ background: FE_T.nodeBg, border: `1px solid ${FE_T.purple}44`, borderRadius: '15px', minWidth: '280px', maxWidth: '320px', boxShadow: FE_T.nodeShadow }}>
        {nodeHeader}
        <div style={{ padding: '14px' }}>
          {topHandle}
          <div style={{ background: FE_T.purpleDim, border: `1px solid ${FE_T.purple}33`, borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
            <p style={{ fontSize: '0.58rem', color: FE_T.purple, fontWeight: '800', marginBottom: '5px', letterSpacing: '0.5px' }}>AGENTE ATIVO</p>
            <p style={{ fontSize: '0.88rem', color: FE_T.inputText, fontWeight: '700', marginBottom: '3px' }}>{agenteAtivo.nome}</p>
            <p style={{ fontSize: '0.65rem', color: FE_T.textMuted, fontWeight: '600' }}>{agenteAtivo.modelo}</p>
          </div>
          <button onClick={() => { setTrocando(true); setDetalhe(null); }}
            style={{ width: '100%', background: 'transparent', border: `1px solid ${FE_T.purple}44`, color: FE_T.purple, fontSize: '0.68rem', fontWeight: '800', padding: '8px', borderRadius: '8px', cursor: 'pointer', letterSpacing: '0.5px' }}>
            TROCAR AGENTE
          </button>
          {botHandle}
        </div>
      </div>
    );
  }

  // ── Estado: visualizando detalhes de um agente ──
  if (detalhe) {
    const resumoPrompt = (detalhe.prompt || '').length > 140
      ? (detalhe.prompt || '').substring(0, 140) + '...'
      : (detalhe.prompt || '—');
    return (
      <div style={{ background: FE_T.nodeBg, border: `1px solid ${FE_T.purple}44`, borderRadius: '15px', minWidth: '300px', maxWidth: '340px', boxShadow: FE_T.nodeShadow }}>
        {nodeHeader}
        <div style={{ padding: '14px' }}>
          {topHandle}
          <p style={{ fontSize: '0.58rem', color: FE_T.purple, fontWeight: '800', letterSpacing: '0.5px', marginBottom: '8px' }}>DETALHES DO AGENTE</p>
          <div style={{ background: FE_T.purpleDim, border: `1px solid ${FE_T.purple}22`, borderRadius: '8px', padding: '11px', marginBottom: '8px' }}>
            <p style={{ fontSize: '0.85rem', color: FE_T.inputText, fontWeight: '700', marginBottom: '3px' }}>{detalhe.nome}</p>
            <p style={{ fontSize: '0.62rem', color: FE_T.textMuted, marginBottom: '8px' }}>{detalhe.modelo} · Tom: {detalhe.tom}</p>
            <p style={{ fontSize: '0.58rem', color: FE_T.purple, fontWeight: '800', marginBottom: '4px', letterSpacing: '0.5px' }}>INSTRUCAO</p>
            <p style={{ fontSize: '0.68rem', color: FE_T.textMuted, lineHeight: '1.55', fontStyle: 'italic' }}>{resumoPrompt}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setDetalhe(null)}
              style={{ flex: 1, background: 'transparent', border: `1px solid ${FE_T.sidebarBorder}`, color: FE_T.textMuted, fontSize: '0.65rem', fontWeight: '700', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
              VOLTAR
            </button>
            <button onClick={confirmarAgente}
              style={{ flex: 2, background: FE_T.purpleDim, border: `1px solid ${FE_T.purple}55`, color: FE_T.purple, fontSize: '0.65rem', fontWeight: '800', padding: '8px', borderRadius: '8px', cursor: 'pointer', letterSpacing: '0.5px' }}>
              USAR ESTE AGENTE
            </button>
          </div>
          {botHandle}
        </div>
      </div>
    );
  }

  // ── Estado: lista de agentes (ou vazio) ──
  return (
    <div style={{ background: FE_T.nodeBg, border: `1px solid ${FE_T.purple}44`, borderRadius: '15px', minWidth: '300px', maxWidth: '340px', boxShadow: FE_T.nodeShadow }}>
      {nodeHeader}
      <div style={{ padding: '14px' }}>
        {topHandle}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <Spinner size={18} color={FE_T.purple} />
          </div>
        ) : agentes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '14px 8px' }}>
            <p style={{ fontSize: '0.72rem', color: FE_T.textMuted, marginBottom: '14px', lineHeight: '1.6' }}>
              Nenhuma I.A criada ainda.<br />Crie um agente no Dashboard.
            </p>
            <button onClick={() => FE_NAVIGATE && FE_NAVIGATE('/dashboard?aba=AgenteIA')}
              style={{ background: FE_T.purpleDim, border: `1px solid ${FE_T.purple}44`, color: FE_T.purple, fontSize: '0.72rem', fontWeight: '800', padding: '10px 0', borderRadius: '8px', cursor: 'pointer', width: '100%', letterSpacing: '0.5px' }}>
              CRIAR I.A
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.58rem', color: FE_T.purple, fontWeight: '800', letterSpacing: '0.5px', marginBottom: '10px' }}>
              SELECIONAR AGENTE
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', maxHeight: '230px', overflowY: 'auto' }}>
              {agentes.map(ag => (
                <div key={ag.id} style={{ background: FE_T.purpleDim, border: `1px solid ${FE_T.purple}22`, borderRadius: '8px', padding: '9px 11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.78rem', color: FE_T.inputText, fontWeight: '700', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ag.nome}</p>
                    <p style={{ fontSize: '0.6rem', color: FE_T.textMuted }}>{ag.modelo} · {ag.tom}</p>
                  </div>
                  <button onClick={() => verDetalhes(ag)} disabled={loadingDetalhe}
                    style={{ background: `${FE_T.purple}18`, border: `1px solid ${FE_T.purple}33`, color: FE_T.purple, fontSize: '0.6rem', fontWeight: '800', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, opacity: loadingDetalhe ? 0.5 : 1 }}>
                    VER
                  </button>
                </div>
              ))}
            </div>
            {loadingDetalhe && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                <Spinner size={14} color={FE_T.purple} />
              </div>
            )}
          </div>
        )}
        {botHandle}
      </div>
    </div>
  );
};

const nodeTypes = { botNode: BotNode, imageNode: ImageNode, iaNode: IANode };

const normalizeEdgesForHandles = (nodes, edges) => {
  const normalized = (edges || []).map(e => ({ ...e }));
  const bySource = new Map();
  const incomingByTarget = new Map();

  normalized.forEach(edge => {
    const src = edge.source;
    const tgt = edge.target;
    if (!src || !tgt) return;

    if (!bySource.has(src)) bySource.set(src, []);
    bySource.get(src).push(edge);

    if (!incomingByTarget.has(tgt)) incomingByTarget.set(tgt, []);
    incomingByTarget.get(tgt).push(edge);
  });

  const getHandleIndex = (edge) => {
    if (!edge || !edge.sourceHandle) return 999;
    const mt = `${edge.sourceHandle}`.match(/^opt(\d+)$/);
    return mt ? Number(mt[1]) : 999;
  };

  nodes.forEach(node => {
    const options = node.data?.options || [];
    const outgoing = bySource.get(node.id) || [];

    if (options.length > 0) {
      const sortedOutgoing = [...outgoing].sort((a, b) => getHandleIndex(a) - getHandleIndex(b));
      let candidate = 0;

      sortedOutgoing.forEach(edge => {
        if (edge.sourceHandle && edge.sourceHandle.startsWith('opt')) return;
        while (candidate < options.length && outgoing.some(e => e.sourceHandle === `opt${candidate}`)) {
          candidate += 1;
        }
        if (candidate < options.length) {
          edge.sourceHandle = `opt${candidate}`;
          candidate += 1;
        }
      });
    } else if (outgoing.length === 1 && !outgoing[0].sourceHandle) {
      outgoing[0].sourceHandle = 'default';
    }

    const connectedOptions = outgoing.filter(e => e.sourceHandle && e.sourceHandle.startsWith('opt')).length;
    const hasIncoming = incomingByTarget.has(node.id) && incomingByTarget.get(node.id).length > 0;
    const hasOutgoing = outgoing.length > 0;

    node.data = {
      ...node.data,
      incomplete: false, // Desativar aviso de opções sem conexão para evitar mensagens falsas.
      orphan: !hasIncoming && !hasOutgoing,
    };
  });

  return normalized;
};

const shouldAutoLayout = (nodes) => {
  if (!nodes || nodes.length === 0) return false;
  const withPos = nodes.filter(node => node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number');
  if (withPos.length === 0) return true;

  const xs = withPos.map(node => node.position.x);
  const ys = withPos.map(node => node.position.y);
  const range = (Math.max(...xs) - Math.min(...xs)) + (Math.max(...ys) - Math.min(...ys));
  return range < 180;
};

const autoLayout = (nodes, edges) => {
  if (!nodes || nodes.length === 0) return nodes;

  const indegree = new Map(nodes.map(n => [n.id, 0]));
  const outgoingEdges = new Map(nodes.map(n => [n.id, []]));
  const incomingEdges = new Map(nodes.map(n => [n.id, []]));

  (edges || []).forEach(edge => {
    if (!edge.source || !edge.target) return;
    if (!outgoingEdges.has(edge.source) || !incomingEdges.has(edge.target)) return;

    outgoingEdges.get(edge.source).push(edge);
    incomingEdges.get(edge.target).push(edge);
    indegree.set(edge.target, indegree.get(edge.target) + 1);
  });

  const nodeIds = nodes.map(n => n.id);
  const roots = nodeIds.filter(id => indegree.get(id) === 0 && (outgoingEdges.get(id)?.length || 0) > 0);
  const isolated = nodeIds.filter(id => indegree.get(id) === 0 && (outgoingEdges.get(id)?.length || 0) === 0);

  const leveled = [];
  const visited = new Set();
  const indegCopy = new Map(indegree);

  let current = roots.length > 0 ? roots : nodeIds.filter(id => indegree.get(id) === 0);

  const getHandleIndex = (edge) => {
    if (!edge || !edge.sourceHandle) return 999;
    const match = `${edge.sourceHandle}`.match(/^opt(\d+)$/);
    return match ? Number(match[1]) : 999;
  };

  while (current.length > 0) {
    leveled.push(current);
    const next = [];

    current.forEach(nodeId => {
      visited.add(nodeId);
      const children = outgoingEdges.get(nodeId) || [];
      const orderedChildren = [...children]
        .sort((a, b) => getHandleIndex(a) - getHandleIndex(b))
        .map(edge => edge.target)
        .filter(Boolean);

      orderedChildren.forEach(childId => {
        if (!indegCopy.has(childId) || visited.has(childId)) return;
        indegCopy.set(childId, indegCopy.get(childId) - 1);
        if (indegCopy.get(childId) <= 0 && !next.includes(childId)) next.push(childId);
      });
    });

    current = next;
  }

  const remaining = nodeIds.filter(id => !visited.has(id));
  if (remaining.length > 0) leveled.push(remaining);

  const GAP_X = 280;
  const GAP_Y = 180;
  const LEFT_X = 80;
  const TOP_Y = 50;

  const positions = {};

  if (leveled.length > 0) {
    leveled[0].forEach((nodeId, index) => {
      positions[nodeId] = { x: LEFT_X, y: TOP_Y + index * GAP_Y };
    });
  }

  for (let lvl = 1; lvl < leveled.length; lvl += 1) {
    let yCurrent = TOP_Y;
    const levelNodes = leveled[lvl];
    const positioned = new Set();

    const parentLevel = leveled[lvl - 1] || [];

    parentLevel.forEach(parentId => {
      const children = outgoingEdges.get(parentId) || [];
      const orderedChildren = [...children]
        .sort((a, b) => getHandleIndex(a) - getHandleIndex(b))
        .map(edge => edge.target)
        .filter(target => levelNodes.includes(target));

      orderedChildren.forEach(childId => {
        if (positioned.has(childId)) return;
        positions[childId] = { x: LEFT_X + lvl * GAP_X, y: yCurrent };
        yCurrent += GAP_Y;
        positioned.add(childId);
      });
    });

    levelNodes.forEach(nodeId => {
      if (positioned.has(nodeId)) return;
      positions[nodeId] = { x: LEFT_X + lvl * GAP_X, y: yCurrent };
      yCurrent += GAP_Y;
    });
  }

  isolated.forEach((id, index) => {
    positions[id] = { x: LEFT_X + (leveled.length + 1) * GAP_X, y: TOP_Y + index * GAP_Y };
  });

  return nodes.map(node => ({ ...node, position: positions[node.id] || node.position || { x: 100, y: 100 } }));
};

// ─── ITEM DA SIDEBAR ──────────────────────────────────────────────────────────

// ─── ITEM DA SIDEBAR ──────────────────────────────────────────────────────────
const ComponentItem = ({ title, desc, color, locked, onClick }) => (
  <div onClick={locked ? undefined : onClick}
    style={{ position: 'relative', width: '100%', background: locked ? FE_T.inputBg : `${color}0a`, border: `1px solid ${locked ? FE_T.sidebarBorder : `${color}22`}`, color: FE_T.inputText, padding: '12px 14px', borderRadius: '10px', textAlign: 'left', cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.45 : 1, marginBottom: '8px', transition: '0.2s' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
      <span style={{ color: locked ? FE_T.textSub : color, fontWeight: '900', fontSize: '0.75rem' }}>
        {title}
      </span>
      {locked && <span style={{ fontSize: '0.58rem', color: FE_T.sidebarText, background: FE_T.inputBg, padding: '2px 6px', borderRadius: '4px' }}>PRO</span>}
    </div>
    <div style={{ fontSize: '0.6rem', color: FE_T.textSub, lineHeight: '1.4' }}>{desc}</div>
  </div>
);

// ─── FLOW CONTENT ─────────────────────────────────────────────────────────────
const FlowContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fitView, setCenter } = useReactFlow();

  // Lê o tema salvo e atualiza FE_T (módulo-level) para que os nodes o usem
  FE_T = FE_TEMAS[localStorage.getItem('zapchat_tema') || 'escuro'];

  const usuarioId = parseInt(localStorage.getItem('usuario_id')) || 0;
  FE_USUARIO_ID = usuarioId;
  FE_NAVIGATE = navigate;

  // ── Histórico de undo/redo ───────────────────────────────────────────────
  const historyRef  = useRef([]);
  const historyIdx  = useRef(-1);
  const historyTimer = useRef(null);
  const nodesRef    = useRef(nodes);
  const edgesRef    = useRef(edges);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  const pushHistory = useCallback(() => {
    const snap = { nodes: nodesRef.current, edges: edgesRef.current };
    historyRef.current = historyRef.current.slice(0, historyIdx.current + 1);
    historyRef.current.push(snap);
    if (historyRef.current.length > 60) historyRef.current.shift();
    historyIdx.current = historyRef.current.length - 1;
  }, []);

  const debouncedPush = useCallback(() => {
    clearTimeout(historyTimer.current);
    historyTimer.current = setTimeout(pushHistory, 350);
  }, [pushHistory]);

  FE_PUSH_HISTORY = debouncedPush;

  const undo = useCallback(() => {
    if (historyIdx.current <= 0) return;
    clearTimeout(historyTimer.current);
    historyIdx.current--;
    const snap = historyRef.current[historyIdx.current];
    if (snap) { setNodes(snap.nodes); setEdges(snap.edges); setAlterado(true); }
  }, []); // eslint-disable-line

  const redo = useCallback(() => {
    if (historyIdx.current >= historyRef.current.length - 1) return;
    clearTimeout(historyTimer.current);
    historyIdx.current++;
    const snap = historyRef.current[historyIdx.current];
    if (snap) { setNodes(snap.nodes); setEdges(snap.edges); setAlterado(true); }
  }, []); // eslint-disable-line

  const [plano, setPlano]         = useState(localStorage.getItem('usuario_plano') || 'starter');
  const [isPro, setIsPro]         = useState(['pro', 'business'].includes(localStorage.getItem('usuario_plano') || 'starter'));
  const [nodes, setNodes]         = useState([{ id: '1', type: 'botNode', data: { label: 'Ola! Como posso te ajudar?', options: [], delay: 2 }, position: { x: 400, y: 100 } }]);
  const [edges, setEdges]         = useState([]);
  const [nomeFluxo, setNomeFluxo] = useState('Novo Fluxo');
  const [salvando, setSalvando]   = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusTipo, setStatusTipo] = useState('ok');
  const [fluxoId, setFluxoId]     = useState(id && id !== 'novo' ? parseInt(id) : 0);
  const [carregando, setCarregando] = useState(false);
  const [alterado, setAlterado]   = useState(false);
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [minimapVisivel, setMinimapVisivel] = useState(true);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  // ── CSS do editor: injeta ao montar, remove ao desmontar ─────────────────
  // Isso evita que os estilos do FlowEditor vazem para o Dashboard ao voltar
  useEffect(() => {
    const existing = document.getElementById('flow-editor-styles');
    if (existing) existing.remove();

    const style = document.createElement('style');
    style.id = 'flow-editor-styles';
    style.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      .flow-sidebar { transition: transform 0.3s ease; }
      @media (max-width: 768px) {
        .flow-sidebar {
          position: fixed !important;
          left: 0;
          top: 0;
          height: 100vh;
          z-index: 200;
          transform: translateX(-100%);
        }
        .flow-sidebar.aberta { transform: translateX(0); }
        .nav-nome { width: 130px !important; }
        .nav-stats { display: none !important; }
        .hamburger-flow { display: block !important; }
      }
      .reactflow-wrapper .react-flow__controls { bottom: 16px !important; left: 16px !important; }
    `;
    document.head.appendChild(style);

    // Remove ao sair do FlowEditor — Dashboard fica limpo
    return () => {
      const el = document.getElementById('flow-editor-styles');
      if (el) el.remove();
    };
  }, []);

  // ── Busca plano ──────────────────────────────────────────────────────────
  useEffect(() => {
    authFetch(`${API_URL}/pagamentos/minha-assinatura`)
      .then(res => {
        if (res.status === 401) { localStorage.clear(); window.location.href = '/login'; return null; }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        const p = data.tem_assinatura ? data.plano : 'starter';
        setPlano(p);
        setIsPro(['pro', 'business'].includes(p));
        localStorage.setItem('usuario_plano', p);
      })
      .catch(() => {});
  }, []);

  // ── Aviso de saida com alteracoes nao salvas ─────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (alterado) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [alterado]);

  // ── Carrega fluxo e faz fitView APOS carregar ────────────────────────────
  useEffect(() => {
    const idNumerico = parseInt(id);
    if (!id || id === 'novo' || isNaN(idNumerico) || usuarioId === null || isNaN(usuarioId)) {
      setTimeout(() => fitView({ padding: 0.3, duration: 600 }), 300);
      return;
    }
    setCarregando(true);
    authFetch(`${API_URL}/fluxos/${idNumerico}/${usuarioId}`)
      .then(res => {
        if (res.status === 401) { localStorage.clear(); window.location.href = '/login'; return null; }
        if (!res.ok) throw new Error('Fluxo nao encontrado');
        return res.json();
      })
      .then(data => {
        if (!data) return;
        const nodesCarregados = (data.nodes || []).map(node => ({
          ...node,
          data: {
            label:    node.data?.label    ?? '',
            options:  node.data?.options  ?? [],
            delay:    node.data?.delay    ?? 2,
            caption:  node.data?.caption  ?? '',
            imageUrl: node.data?.imageUrl ?? '',
            prompt:   node.data?.prompt   ?? '',
            modelo:   (node.data?.modelo && node.data.modelo !== 'gemini-pro' && node.data.modelo !== 'gpt-4') ? node.data.modelo : 'gpt-4o-mini',
          }
        }));

        const edgesNormalizados = normalizeEdgesForHandles(nodesCarregados, data.edges || []);
        const nodesParaUsar = shouldAutoLayout(nodesCarregados)
          ? autoLayout(nodesCarregados, edgesNormalizados)
          : nodesCarregados;
        const edgesOrganizados = edgesNormalizados.map(edge => ({
          ...edge,
          animated: false,
          style: { stroke: FE_T.green, strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: FE_T.green },
        }));

        setNodes(nodesParaUsar);
        setEdges(edgesOrganizados);
        setNomeFluxo(data.nome_fluxo || 'Fluxo');
        setFluxoId(data.id);
        setAlterado(false);
        setTimeout(() => fitView({ padding: 0.25, duration: 700, minZoom: 0.3, maxZoom: 1 }), 350);
      })
      .catch(() => {
        mostrarStatus('Fluxo nao encontrado, comecando do zero.', 'erro');
        setTimeout(() => fitView({ padding: 0.3, duration: 600 }), 300);
      })
      .finally(() => setCarregando(false));
  }, [id, usuarioId]); // eslint-disable-line

  const mostrarStatus = (msg, tipo = 'ok') => {
    setStatusMsg(msg);
    setStatusTipo(tipo);
    setTimeout(() => setStatusMsg(''), tipo === 'erro' ? 5000 : 3000);
  };

  const onNodesChange = useCallback((changes) => {
    setNodes(nds => applyNodeChanges(changes, nds));
    if (changes.some(c => c.type === 'remove')) debouncedPush();
    setAlterado(true);
  }, [debouncedPush]);

  const onEdgesChange = useCallback((changes) => {
    setEdges(eds => applyEdgeChanges(changes, eds));
    if (changes.some(c => c.type === 'remove')) debouncedPush();
    setAlterado(true);
  }, [debouncedPush]);

  const onConnect = useCallback((params) => {
    setEdges(eds => addEdge({
      ...params,
      animated: false,
      style: { stroke: FE_T.green, strokeWidth: 2.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: FE_T.green }
    }, eds));
    debouncedPush();
    setAlterado(true);
  }, [debouncedPush]); // eslint-disable-line

  const onNodeDragStop = useCallback(() => { debouncedPush(); }, [debouncedPush]);

  const addNode = (type) => {
    const lastNode = nodes[nodes.length - 1];
    const newY = (lastNode?.position.y || 0) + 380;
    const newX = (lastNode?.position.x || 400);
    const typeData = {
      botNode:   { label: 'Nova mensagem...', options: [], delay: 2 },
      imageNode: { caption: '', imageUrl: '', delay: 2 },
      iaNode:    { agenteId: null, agenteName: '', prompt: '', modelo: 'gpt-4o-mini', delay: 3 },
    };
    const newNode = {
      id: Date.now().toString(),
      type,
      data: { ...typeData[type] },
      position: { x: newX, y: newY }
    };
    setNodes(nds => [...nds, newNode]);
    debouncedPush();
    setAlterado(true);
    setSidebarAberta(false);
    setTimeout(() => setCenter(newX + 150, newY + 150, { zoom: 1, duration: 700 }), 150);
  };

  const handleFitView = () => fitView({ padding: 0.25, duration: 500, minZoom: 0.2 });

  const handleVoltar = () => {
    if (alterado && !window.confirm('Voce tem alteracoes nao salvas. Deseja sair mesmo assim?')) return;
    navigate('/dashboard');
  };

  const salvarFluxo = async () => {
    if (!usuarioId) { mostrarStatus('Faca login novamente.', 'erro'); return; }
    setSalvando(true);
    try {
      const res = await authFetch(`${API_URL}/fluxos/salvar`, {
        method: 'POST',
        body: JSON.stringify({ id: fluxoId, usuario_id: usuarioId, nome_fluxo: nomeFluxo, nodes, edges }),
      });
      if (res.status === 401) { localStorage.clear(); window.location.href = '/login'; return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (fluxoId === 0 && data.id) {
        setFluxoId(data.id);
        window.history.replaceState(null, '', `/editor/${data.id}`);
      }
      setAlterado(false);
      mostrarStatus('Salvo com sucesso!');
    } catch {
      mostrarStatus('Erro ao salvar. Tente novamente.', 'erro');
    } finally {
      setSalvando(false);
    }
  };

  // Atalhos de teclado
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); salvarFluxo(); return; }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nodes, edges, nomeFluxo, fluxoId]); // eslint-disable-line

  const statsNodes = nodes.length;
  const statsEdges = edges.length;

  return (
    <div style={{ width: '100vw', height: '100vh', background: FE_T.canvasBg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: FE_T.navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${FE_T.navBorder}`, zIndex: 100, gap: '10px', flexShrink: 0 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          {/* Hamburger — visivel so no mobile via CSS injetado */}
          <button
            onClick={() => setSidebarAberta(!sidebarAberta)}
            className="hamburger-flow"
            style={{ display: 'none', background: FE_T.inputBg, border: `1px solid ${FE_T.navBorder}`, color: FE_T.navText, cursor: 'pointer', fontSize: '1rem', padding: '6px 10px', borderRadius: '8px', flexShrink: 0 }}>
            &#9776;
          </button>

          <h2 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '-1px', margin: 0, color: FE_T.navText, flexShrink: 0 }}>
            ZAP<span style={{ color: FE_T.green }}>CHAT</span>
          </h2>

          <div style={{ width: '1px', height: '20px', background: FE_T.navBorder, flexShrink: 0 }} />

          <input
            value={nomeFluxo}
            onChange={e => { setNomeFluxo(e.target.value); setAlterado(true); }}
            className="nav-nome"
            style={{ background: FE_T.inputBg, border: `1px solid ${FE_T.inputBorder}`, borderRadius: '8px', color: FE_T.navText, fontSize: '0.78rem', fontWeight: '700', padding: '6px 12px', outline: 'none', width: '200px', minWidth: 0 }}
          />

          <div className="nav-stats" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.65rem', color: FE_T.textSub, background: FE_T.inputBg, padding: '4px 10px', borderRadius: '6px', fontWeight: '600', whiteSpace: 'nowrap' }}>
              {statsNodes} blocos · {statsEdges} conexões
            </span>
            <span title={alterado ? 'Alterações não salvas' : 'Tudo salvo'} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: alterado ? FE_T.warning : FE_T.textSub, transition: 'color 0.3s', position: 'relative' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                <polyline points="13 2 13 9 20 9"/>
              </svg>
              {alterado && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: FE_T.warning, position: 'absolute', top: '-2px', right: '-3px' }} />}
            </span>
            <button onClick={undo} title="Desfazer (Ctrl+Z)"
              style={{ background: 'transparent', border: 'none', color: FE_T.textSub, cursor: 'pointer', fontSize: '1rem', padding: '2px 5px', lineHeight: 1, opacity: historyIdx.current > 0 ? 1 : 0.35 }}>
              ↩
            </button>
            <button onClick={redo} title="Refazer (Ctrl+Y)"
              style={{ background: 'transparent', border: 'none', color: FE_T.textSub, cursor: 'pointer', fontSize: '1rem', padding: '2px 5px', lineHeight: 1, opacity: historyIdx.current < historyRef.current.length - 1 ? 1 : 0.35 }}>
              ↪
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {carregando && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Spinner size={13} color={FE_T.textMuted} />
              <span style={{ fontSize: '0.68rem', color: FE_T.textMuted }}>Carregando...</span>
            </div>
          )}
          {statusMsg && (
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: statusTipo === 'ok' ? FE_T.green : FE_T.danger, animation: 'fadeIn 0.3s ease', whiteSpace: 'nowrap' }}>
              {statusMsg}
            </span>
          )}

          <button onClick={handleFitView} title="Ver tudo"
            style={{ background: FE_T.inputBg, border: `1px solid ${FE_T.inputBorder}`, color: FE_T.textMuted, cursor: 'pointer', fontSize: '0.8rem', padding: '7px 10px', borderRadius: '8px', transition: '0.2s' }}>
            [ ]
          </button>

          <button onClick={() => setMinimapVisivel(v => !v)} title="Mini-mapa"
            style={{ background: minimapVisivel ? `${FE_T.green}14` : FE_T.inputBg, border: `1px solid ${minimapVisivel ? FE_T.green + '44' : FE_T.inputBorder}`, color: minimapVisivel ? FE_T.green : FE_T.textMuted, cursor: 'pointer', fontSize: '0.65rem', padding: '7px 10px', borderRadius: '8px', fontWeight: '700', whiteSpace: 'nowrap', transition: '0.2s' }}>
            MAPA
          </button>

          <button onClick={handleVoltar}
            style={{ background: 'transparent', color: FE_T.textMuted, border: `1px solid ${FE_T.navBorder}`, padding: '8px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '0.7rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.2s' }}>
            VOLTAR
          </button>

          <button onClick={salvarFluxo} disabled={salvando}
            style={{ background: salvando ? FE_T.green + '66' : FE_T.green, color: salvando ? FE_T.navBg : FE_T.navBg, border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: '900', fontSize: '0.75rem', cursor: salvando ? 'not-allowed' : 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}>
            {salvando ? <><Spinner size={12} color={FE_T.navBg} /> SALVANDO...</> : 'SALVAR'}
          </button>
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{ flexGrow: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Overlay mobile */}
        {sidebarAberta && (
          <div
            onClick={() => setSidebarAberta(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 199 }}
          />
        )}

        {/* ── SIDEBAR ── */}
        <aside
          className={`flow-sidebar${sidebarAberta ? ' aberta' : ''}`}
          style={{ width: '240px', minWidth: '240px', background: FE_T.sidebarBg, backdropFilter: 'blur(20px)', borderRight: `1px solid ${FE_T.sidebarBorder}`, padding: '20px 14px', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>

          <p style={{ color: FE_T.sidebarLabel, fontSize: '0.58rem', fontWeight: '800', letterSpacing: '2px', marginBottom: '14px', textTransform: 'uppercase' }}>ADICIONAR BLOCO</p>

          <ComponentItem title="TEXTO" desc="Mensagem com delay e opções de resposta ramificada." color={FE_T.green} locked={false} onClick={() => addNode('botNode')} />
          <ComponentItem title="IMAGEM" desc="Envie uma imagem com legenda opcional." color={FE_T.blue} locked={!isPro} onClick={() => addNode('imageNode')} />
          <ComponentItem title="IA COM CONTEXTO" desc="Bot responde com IA baseado no histórico da conversa." color={FE_T.purple} locked={!isPro} onClick={() => addNode('iaNode')} />

          {!isPro && (
            <div style={{ background: FE_T.purpleDim, border: `1px solid ${FE_T.purple}22`, borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
              <p style={{ fontSize: '0.62rem', color: FE_T.purple, fontWeight: '800', marginBottom: '5px' }}>BLOCOS PRO</p>
              <p style={{ fontSize: '0.58rem', color: FE_T.sidebarText, lineHeight: '1.6', marginBottom: '10px' }}>Faca upgrade para desbloquear imagens e IA.</p>
              <button onClick={() => navigate('/assinar')}
                style={{ width: '100%', background: FE_T.green, color: FE_T.navBg, border: 'none', borderRadius: '7px', padding: '8px', fontSize: '0.62rem', fontWeight: '900', cursor: 'pointer' }}>
                VER PLANOS
              </button>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${FE_T.sidebarBorder}`, margin: '10px 0' }} />

          <p style={{ color: FE_T.sidebarText, fontSize: '0.58rem', fontWeight: '800', letterSpacing: '1.5px', marginBottom: '10px' }}>LEGENDA</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
            {[
              { cor: FE_T.green, label: 'Opcoes de resposta' },
              { cor: FE_T.cyan, label: 'Fluxo padrao (sem opcoes)' },
              { cor: FE_T.blue, label: 'Saida de imagem' },
              { cor: FE_T.purple, label: 'Saida de IA' },
            ].map(({ cor, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cor, flexShrink: 0 }} />
                <span style={{ fontSize: '0.6rem', color: FE_T.sidebarText, lineHeight: 1 }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', background: FE_T.inputBg, padding: '12px', borderRadius: '10px', border: `1px solid ${FE_T.sidebarBorder}` }}>
            <p style={{ color: FE_T.sidebarText, fontSize: '0.58rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '1px' }}>ATALHOS</p>
            {[
              ['Ctrl+S', 'Salvar'],
              ['Scroll', 'Zoom in/out'],
              ['Arrastar', 'Mover canvas'],
              ['[ ] nav', 'Ver tudo'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.58rem', color: FE_T.sidebarText, background: FE_T.shortcutBg, padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{k}</span>
                <span style={{ fontSize: '0.58rem', color: FE_T.shortcutText }}>{v}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CANVAS ── */}
        <div className="reactflow-wrapper" style={{ flexGrow: 1, position: 'relative' }}>
          {carregando && (
            <div style={{ position: 'absolute', inset: 0, background: FE_T.overlay, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', backdropFilter: 'blur(4px)' }}>
              <Spinner size={36} color={FE_T.green} />
              <p style={{ color: FE_T.textMuted, fontSize: '0.85rem', fontWeight: '600' }}>Carregando fluxo...</p>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.25, minZoom: 0.2, maxZoom: 1.2 }}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            deleteKeyCode="Delete">
            <Background color={FE_T.bgDotColor} gap={36} size={1} variant="dots" opacity={0.12} />
            <Controls style={{ filter: FE_T === FE_TEMAS.claro ? 'none' : 'invert(1) grayscale(1) opacity(0.6)', bottom: 16, left: 16 }} />
            {minimapVisivel && (
              <MiniMap
                nodeColor={(node) => node.type === 'iaNode' ? FE_T.purple : node.type === 'imageNode' ? FE_T.blue : FE_T.green}
                maskColor={FE_T.minimapMask}
                style={{ background: FE_T.minimapBg, border: `1px solid ${FE_T.minimapBorder}`, borderRadius: '10px', bottom: 16, right: 16 }}
              />
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

const FlowEditor = () => (
  <ReactFlowProvider>
    <FlowContent />
  </ReactFlowProvider>
);

export default FlowEditor;