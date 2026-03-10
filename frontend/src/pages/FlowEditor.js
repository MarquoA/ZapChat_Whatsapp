import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge, Background, Controls,
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

  const handleLabelChange = (e) => {
    setLabel(e.target.value);
    updateNodeData(e.target.value, options, delay);
  };

  const handleDelayChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setDelay(val);
    updateNodeData(label, options, val);
  };

  const addOption = () => {
    const newOpts = [...options, 'Nova Opção'];
    setOptions(newOpts);
    updateNodeData(label, newOpts, delay);
  };

  const removeOption = (index) => {
    const optionHandleId = `opt${index}`;
    const newOpts = options.filter((_, i) => i !== index);
    setOptions(newOpts);
    updateNodeData(label, newOpts, delay);
    setEdges(eds => eds.filter(e => !(e.source === id && e.sourceHandle === optionHandleId)));
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
  };

  return (
    <div style={{ background: 'rgba(8,12,8,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', minWidth: '280px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', background: '#25D366', borderRadius: '50%' }} />
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>TEXTO</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
            <span style={{ fontSize: '10px' }}>⏳</span>
            <input type="text" value={delay} onChange={handleDelayChange}
              style={{ background: 'none', border: 'none', color: '#25D366', fontSize: '11px', width: '20px', fontWeight: 'bold', outline: 'none', textAlign: 'center' }} />
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>SEC</span>
          </div>
        </div>
        <button onClick={deleteNode} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', opacity: 0.6 }}>APAGAR</button>
      </div>
      <div style={{ padding: '16px' }}>
        <Handle type="target" position={Position.Top} style={{ background: '#25D366', width: '10px', height: '10px', border: 'none' }} />
        <textarea
          value={label}
          onChange={handleLabelChange}
          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', padding: '12px', minHeight: '80px', outline: 'none', resize: 'none', marginBottom: '15px', boxSizing: 'border-box' }}
          placeholder="Texto da mensagem..." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800' }}>OPÇÕES DE RESPOSTA</span>
            <button onClick={addOption} style={{ background: 'none', border: 'none', color: '#25D366', fontSize: '0.65rem', cursor: 'pointer', fontWeight: '900' }}>+ ADD</button>
          </div>
          {options.map((opt, i) => (
            <div key={i} style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
              <input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.75rem', outline: 'none', width: '80%' }} />
              <button onClick={() => removeOption(i)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '12px', marginLeft: 'auto' }}>×</button>
              <Handle type="source" position={Position.Right} id={`opt${i}`} style={{ right: '-6px', background: '#25D366', width: '12px', height: '12px', border: '2px solid #080c08' }} />
            </div>
          ))}
          {options.length === 0 && (
            <Handle type="source" position={Position.Bottom} id="default" style={{ bottom: '-10px', background: '#34b7f1', width: '12px', height: '12px', border: '2px solid #080c08' }} />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── NODE: IMAGEM (Pro) ───────────────────────────────────────────────────────
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
    reader.onload = (ev) => {
      setImageUrl(ev.target.result);
      update(caption, ev.target.result, delay);
    };
    reader.readAsDataURL(file);
  };

  const deleteNode = () => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
  };

  return (
    <div style={{ background: 'rgba(8,12,8,0.95)', border: '1px solid rgba(99,179,237,0.3)', borderRadius: '15px', minWidth: '280px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(99,179,237,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', background: '#63b3ed', borderRadius: '50%' }} />
          <span style={{ fontSize: '10px', color: '#63b3ed', fontWeight: '700' }}>IMAGEM</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
            <span style={{ fontSize: '10px' }}>⏳</span>
            <input type="text" value={delay} onChange={e => { const v = e.target.value.replace(/\D/g,''); setDelay(v); update(caption, imageUrl, v); }}
              style={{ background: 'none', border: 'none', color: '#63b3ed', fontSize: '11px', width: '20px', fontWeight: 'bold', outline: 'none', textAlign: 'center' }} />
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>SEC</span>
          </div>
        </div>
        <button onClick={deleteNode} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', opacity: 0.6 }}>APAGAR</button>
      </div>
      <div style={{ padding: '16px' }}>
        <Handle type="target" position={Position.Top} style={{ background: '#63b3ed', width: '10px', height: '10px', border: 'none' }} />
        <div onClick={() => fileRef.current?.click()}
          style={{ width: '100%', height: '140px', background: 'rgba(99,179,237,0.05)', border: '2px dashed rgba(99,179,237,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '12px', overflow: 'hidden', position: 'relative' }}>
          {imageUrl
            ? <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            : <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>🖼️</div>
                <p style={{ color: 'rgba(99,179,237,0.7)', fontSize: '0.65rem', fontWeight: '700' }}>CLIQUE PARA ENVIAR</p>
              </div>
          }
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </div>
        <input
          value={caption}
          onChange={e => { setCaption(e.target.value); update(e.target.value, imageUrl, delay); }}
          placeholder="Legenda da imagem (opcional)..."
          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.8rem', padding: '10px 12px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }} />
        <Handle type="source" position={Position.Bottom} id="default" style={{ bottom: '-10px', background: '#63b3ed', width: '12px', height: '12px', border: '2px solid #080c08' }} />
      </div>
    </div>
  );
};

// ─── NODE: IA COM CONTEXTO (Pro) ──────────────────────────────────────────────
const IANode = ({ id, data }) => {
  const { setNodes, setEdges } = useReactFlow();
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [modelo, setModelo] = useState(data.modelo || 'gpt-3.5-turbo');
  const [delay, setDelay] = useState(data.delay ?? 3);

  useEffect(() => {
    setPrompt(data.prompt || '');
    setModelo(data.modelo || 'gpt-3.5-turbo');
    setDelay(data.delay ?? 3);
  }, [data.prompt, data.modelo, data.delay]);

  const update = useCallback((newPrompt, newModelo, newDelay) => {
    setNodes(nds => nds.map(n => n.id === id
      ? { ...n, data: { ...n.data, prompt: newPrompt, modelo: newModelo, delay: newDelay } }
      : n
    ));
  }, [id, setNodes]);

  const deleteNode = () => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
  };

  return (
    <div style={{ background: 'rgba(8,12,8,0.95)', border: '1px solid rgba(167,139,250,0.35)', borderRadius: '15px', minWidth: '300px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(167,139,250,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', background: '#a78bfa', borderRadius: '50%' }} />
          <span style={{ fontSize: '10px', color: '#a78bfa', fontWeight: '700' }}>IA COM CONTEXTO</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
            <span style={{ fontSize: '10px' }}>⏳</span>
            <input type="text" value={delay} onChange={e => { const v = e.target.value.replace(/\D/g,''); setDelay(v); update(prompt, modelo, v); }}
              style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '11px', width: '20px', fontWeight: 'bold', outline: 'none', textAlign: 'center' }} />
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>SEC</span>
          </div>
        </div>
        <button onClick={deleteNode} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', opacity: 0.6 }}>APAGAR</button>
      </div>
      <div style={{ padding: '16px' }}>
        <Handle type="target" position={Position.Top} style={{ background: '#a78bfa', width: '10px', height: '10px', border: 'none' }} />
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(167,139,250,0.7)', fontWeight: '700', marginBottom: '6px' }}>MODELO</label>
          <select value={modelo} onChange={e => { setModelo(e.target.value); update(prompt, e.target.value, delay); }}
            style={{ width: '100%', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', color: 'white', fontSize: '0.8rem', padding: '8px 10px', outline: 'none' }}>
            <option value="gpt-3.5-turbo" style={{ background: '#0d140d' }}>GPT-3.5 Turbo</option>
            <option value="gpt-4" style={{ background: '#0d140d' }}>GPT-4</option>
            <option value="gemini-pro" style={{ background: '#0d140d' }}>Gemini Pro</option>
          </select>
        </div>
        <label style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(167,139,250,0.7)', fontWeight: '700', marginBottom: '6px' }}>INSTRUÇÃO DO BOT (PROMPT)</label>
        <textarea
          value={prompt}
          onChange={e => { setPrompt(e.target.value); update(e.target.value, modelo, delay); }}
          placeholder="Ex: Você é um atendente da empresa X. Responda de forma educada e objetiva sobre nossos produtos..."
          style={{ width: '100%', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', color: 'white', fontSize: '0.8rem', padding: '12px', minHeight: '100px', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: '10px' }} />
        <div style={{ background: 'rgba(167,139,250,0.06)', borderRadius: '8px', padding: '10px 12px', border: '1px solid rgba(167,139,250,0.1)' }}>
          <p style={{ fontSize: '0.6rem', color: 'rgba(167,139,250,0.6)', margin: 0, lineHeight: '1.6' }}>
            💡 A IA responderá com base nessa instrução e no histórico da conversa. Conecte após um node de texto para dar contexto ao cliente.
          </p>
        </div>
        <Handle type="source" position={Position.Bottom} id="default" style={{ bottom: '-10px', background: '#a78bfa', width: '12px', height: '12px', border: '2px solid #080c08' }} />
      </div>
    </div>
  );
};

const nodeTypes = { botNode: BotNode, imageNode: ImageNode, iaNode: IANode };

// ─── SIDEBAR: ITEM DE COMPONENTE ─────────────────────────────────────────────
const ComponentItem = ({ title, desc, color, locked, onClick }) => (
  <div onClick={locked ? undefined : onClick}
    style={{ position: 'relative', width: '100%', background: locked ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', border: `1px solid ${locked ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`, color: 'white', padding: '14px', borderRadius: '12px', textAlign: 'left', cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.5 : 1, marginBottom: '10px' }}>
    <div style={{ color: locked ? 'rgba(255,255,255,0.3)' : color, fontWeight: '900', fontSize: '0.78rem', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{title}</span>
      {locked && <span style={{ fontSize: '0.65rem' }}>🔒 PRO</span>}
    </div>
    <div style={{ fontSize: '0.62rem', opacity: 0.45, lineHeight: '1.4' }}>{desc}</div>
  </div>
);

// ─── FLOW CONTENT ─────────────────────────────────────────────────────────────
const FlowContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCenter } = useReactFlow();

  const usuarioId = parseInt(localStorage.getItem('usuario_id'));

  // ── PLANO: buscado da API para garantir valor sempre atualizado ──
  const [plano, setPlano] = useState(localStorage.getItem('usuario_plano') || 'starter');
  const [isPro, setIsPro] = useState(['pro', 'business'].includes(localStorage.getItem('usuario_plano') || 'starter'));

  useEffect(() => {
    // Busca o plano real da API ao abrir o editor
    authFetch(`${API_URL}/pagamentos/minha-assinatura`)
      .then(res => {
        if (res.status === 401) { localStorage.clear(); window.location.href = '/login'; return null; }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        const planoAtual = data.tem_assinatura ? data.plano : 'starter';
        setPlano(planoAtual);
        setIsPro(['pro', 'business'].includes(planoAtual));
        // Atualiza o localStorage com o valor mais recente
        localStorage.setItem('usuario_plano', planoAtual);
      })
      .catch(() => {
        // Se falhar, mantém o valor do localStorage como fallback
      });
  }, []);

  const [nodes, setNodes] = useState([
    { id: '1', type: 'botNode', data: { label: 'Olá!', options: [], delay: 2 }, position: { x: 400, y: 100 } }
  ]);
  const [edges, setEdges] = useState([]);
  const [nomeFluxo, setNomeFluxo] = useState('Novo Fluxo');
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [fluxoId, setFluxoId] = useState(id && id !== 'novo' ? parseInt(id) : 0);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const idNumerico = parseInt(id);
    if (id && id !== 'novo' && !isNaN(idNumerico) && usuarioId) {
      setCarregando(true);
      authFetch(`${API_URL}/fluxos/${idNumerico}/${usuarioId}`)
        .then(res => {
          if (res.status === 401) { localStorage.clear(); window.location.href = '/login'; return null; }
          if (!res.ok) throw new Error('Fluxo não encontrado');
          return res.json();
        })
        .then(data => {
          if (!data) return;
          const nodesCarregados = (data.nodes || []).map(node => ({
            ...node,
            data: {
              label: node.data?.label ?? '',
              options: node.data?.options ?? [],
              delay: node.data?.delay ?? 2,
              caption: node.data?.caption ?? '',
              imageUrl: node.data?.imageUrl ?? '',
              prompt: node.data?.prompt ?? '',
              modelo: node.data?.modelo ?? 'gpt-3.5-turbo',
            }
          }));
          setNodes(nodesCarregados);
          setEdges(data.edges || []);
          setNomeFluxo(data.nome_fluxo || 'Fluxo');
          setFluxoId(data.id);
        })
        .catch(() => setStatusMsg('⚠️ Fluxo não encontrado, começando do zero.'))
        .finally(() => setCarregando(false));
    }
  }, [id, usuarioId]);

  const onNodesChange = useCallback((changes) => setNodes(nds => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges(eds => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges(eds => addEdge({
    ...params, animated: true,
    style: { stroke: params.sourceHandle === 'default' ? '#34b7f1' : '#25D366', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: params.sourceHandle === 'default' ? '#34b7f1' : '#25D366' }
  }, eds)), []);

  const addNode = (type) => {
    const lastNode = nodes[nodes.length - 1];
    const newY = (lastNode?.position.y || 0) + 400;
    const baseData = { delay: 2 };
    const typeData = {
      botNode:   { label: 'Nova mensagem...', options: [] },
      imageNode: { caption: '', imageUrl: '' },
      iaNode:    { prompt: '', modelo: 'gpt-3.5-turbo', delay: 3 },
    };
    const newNode = {
      id: Date.now().toString(),
      type,
      data: { ...baseData, ...typeData[type] },
      position: { x: 400, y: newY }
    };
    setNodes(nds => nds.concat(newNode));
    setTimeout(() => setCenter(400 + 140, newY + 150, { zoom: 1, duration: 800 }), 100);
  };

  const salvarFluxo = async () => {
    if (!usuarioId) { setStatusMsg('❌ Faça login novamente.'); setTimeout(() => setStatusMsg(''), 4000); return; }
    setSalvando(true); setStatusMsg('');
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
      setStatusMsg('✅ Salvo!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch {
      setStatusMsg('❌ Erro ao salvar.');
      setTimeout(() => setStatusMsg(''), 4000);
    } finally { setSalvando(false); }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#141b26', display: 'flex', flexDirection: 'column' }}>
      {/* ── NAVBAR ── */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: 'rgba(8,12,8,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 100, flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '900', letterSpacing: '-1.5px', margin: 0, color: 'white' }}>
            ZAP<span style={{ color: '#25D366' }}>CHAT</span>
          </h2>
          <input value={nomeFluxo} onChange={e => setNomeFluxo(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: '700', padding: '6px 12px', outline: 'none', width: '200px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {carregando && <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Carregando...</span>}
          {statusMsg && <span style={{ fontSize: '0.75rem', fontWeight: '700', color: statusMsg.startsWith('✅') ? '#25D366' : '#ff4d4d' }}>{statusMsg}</span>}
          <button onClick={() => navigate('/dashboard')}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '30px', fontWeight: '800', fontSize: '0.7rem', cursor: 'pointer' }}>
            VOLTAR
          </button>
          <button onClick={salvarFluxo} disabled={salvando}
            style={{ background: salvando ? 'rgba(37,211,102,0.5)' : '#25D366', color: '#0d140d', border: 'none', padding: '10px 24px', borderRadius: '30px', fontWeight: '800', fontSize: '0.7rem', cursor: salvando ? 'not-allowed' : 'pointer', transition: '0.2s' }}>
            {salvando ? 'SALVANDO...' : 'SALVAR'}
          </button>
        </div>
      </nav>

      <div style={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ── SIDEBAR ── */}
        <aside style={{ width: '260px', background: 'rgba(8,12,8,0.95)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '28px 16px', zIndex: 10, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '1.5px', marginBottom: '16px' }}>COMPONENTES</p>

          <ComponentItem title="+ TEXTO" desc="Mensagem com delay e opções de resposta." color="#25D366" locked={false} onClick={() => addNode('botNode')} />
          <ComponentItem title="+ IMAGEM" desc="Envie uma imagem com legenda opcional." color="#63b3ed" locked={!isPro} onClick={() => addNode('imageNode')} />
          <ComponentItem title="+ IA COM CONTEXTO" desc="Bot responde com IA baseado no histórico." color="#a78bfa" locked={!isPro} onClick={() => addNode('iaNode')} />

          {!isPro && (
            <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
              <p style={{ fontSize: '0.65rem', color: '#a78bfa', fontWeight: '700', marginBottom: '6px' }}>🔒 FUNCIONALIDADES PRO</p>
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', lineHeight: '1.5', marginBottom: '10px' }}>Faça upgrade para desbloquear imagens e IA com contexto no seu fluxo.</p>
              <button onClick={() => navigate('/assinar')}
                style={{ width: '100%', background: '#25D366', color: '#0d140d', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '0.65rem', fontWeight: '900', cursor: 'pointer' }}>
                VER PLANOS →
              </button>
            </div>
          )}

          <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: '#25D366', fontSize: '0.7rem', fontWeight: '900', marginBottom: '10px' }}>DICAS ÚTEIS</p>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', lineHeight: '1.4' }}>• Arraste os pontos coloridos para conectar nodes.</li>
              <li style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', lineHeight: '1.4' }}>• Use o DELAY para simular digitação humana.</li>
              <li style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', lineHeight: '1.4' }}>• Ao apagar uma opção, o link some automaticamente.</li>
              <li style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', lineHeight: '1.4' }}>• 🟢 Verde = opções  |  🔵 Azul = fluxo padrão  |  🟣 Roxo = IA</li>
            </ul>
          </div>
        </aside>

        {/* ── CANVAS ── */}
        <div style={{ flexGrow: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}>
            <Background color="#25D366" gap={40} size={1} variant="dots" opacity={0.1} />
            <Controls style={{ filter: 'invert(1) grayscale(1)' }} />
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