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
    const newOpts = [...options, 'Nova Opcao'];
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
  };

  const charCount = label.length;
  const charColor = charCount > 1000 ? '#ff4d4d' : charCount > 700 ? '#f0a500' : 'rgba(255,255,255,0.25)';

  const boxBorder = '1px solid rgba(37,211,102,0.2)';

  return (
    <div style={{ background: 'rgba(8,12,8,0.97)', backdropFilter: 'blur(10px)', border: boxBorder, borderRadius: '15px', minWidth: '280px', maxWidth: '320px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(37,211,102,0.04)', borderRadius: '15px 15px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', background: '#25D366', borderRadius: '50%', boxShadow: '0 0 6px #25D366' }} />
          <span style={{ fontSize: '9px', color: '#25D366', fontWeight: '800', letterSpacing: '1px' }}>MENSAGEM DE TEXTO</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(37,211,102,0.08)', padding: '3px 7px', borderRadius: '6px', border: '1px solid rgba(37,211,102,0.15)' }}>
            <input type="text" value={delay} onChange={handleDelayChange}
              style={{ background: 'none', border: 'none', color: '#25D366', fontSize: '11px', width: '18px', fontWeight: '800', outline: 'none', textAlign: 'center' }} />
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>S</span>
          </div>
        </div>
        <button onClick={deleteNode} title="Apagar node"
          style={{ background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', color: '#ff4d4d', cursor: 'pointer', fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: '5px', transition: '0.2s' }}>
          APAGAR
        </button>
      </div>
      <div style={{ padding: '14px' }}>
        <Handle type="target" position={Position.Top} style={{ background: '#25D366', width: '10px', height: '10px', border: '2px solid #080c08', top: '-6px' }} />
        <textarea value={label} onChange={handleLabelChange}
          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'white', fontSize: '0.83rem', padding: '10px 12px', minHeight: '80px', outline: 'none', resize: 'none', marginBottom: '4px', boxSizing: 'border-box', lineHeight: '1.5' }}
          placeholder="Digite o texto da mensagem..." />
        <p style={{ fontSize: '0.55rem', color: charColor, textAlign: 'right', marginBottom: '12px', fontWeight: '600' }}>{charCount} caracteres</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', fontWeight: '800', letterSpacing: '1px' }}>OPCOES DE RESPOSTA</span>
            <button onClick={addOption}
              style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', color: '#25D366', fontSize: '0.6rem', cursor: 'pointer', fontWeight: '900', padding: '3px 8px', borderRadius: '5px' }}>
              + ADD
            </button>
          </div>
          {options.map((opt, i) => (
            <div key={i} style={{ position: 'relative', background: 'rgba(37,211,102,0.04)', padding: '9px 10px', borderRadius: '8px', border: '1px solid rgba(37,211,102,0.1)', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: '800', marginRight: '6px', flexShrink: 0 }}>{i+1}.</span>
              <input value={opt} onChange={e => updateOption(i, e.target.value)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.75rem', outline: 'none', flex: 1, minWidth: 0 }} />
              <button onClick={() => removeOption(i)}
                style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '14px', marginLeft: '6px', flexShrink: 0, lineHeight: 1 }}>x</button>
              <Handle type="source" position={Position.Right} id={`opt${i}`}
                style={{ right: '-6px', background: '#25D366', width: '11px', height: '11px', border: '2px solid #080c08' }} />
            </div>
          ))}
          {options.length === 0 && (
            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '6px 0', fontStyle: 'italic' }}>
              Sem opcoes — saida unica pelo fundo
            </div>
          )}
          {options.length === 0 && (
            <Handle type="source" position={Position.Bottom} id="default"
              style={{ bottom: '-6px', background: '#34b7f1', width: '11px', height: '11px', border: '2px solid #080c08' }} />
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
  };

  return (
    <div style={{ background: 'rgba(8,12,8,0.97)', border: '1px solid rgba(99,179,237,0.25)', borderRadius: '15px', minWidth: '280px', maxWidth: '320px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(99,179,237,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99,179,237,0.04)', borderRadius: '15px 15px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', background: '#63b3ed', borderRadius: '50%', boxShadow: '0 0 6px #63b3ed' }} />
          <span style={{ fontSize: '9px', color: '#63b3ed', fontWeight: '800', letterSpacing: '1px' }}>IMAGEM</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(99,179,237,0.08)', padding: '3px 7px', borderRadius: '6px', border: '1px solid rgba(99,179,237,0.15)' }}>
            <input type="text" value={delay} onChange={e => { const v = e.target.value.replace(/\D/g,''); setDelay(v); update(caption, imageUrl, v); }}
              style={{ background: 'none', border: 'none', color: '#63b3ed', fontSize: '11px', width: '18px', fontWeight: '800', outline: 'none', textAlign: 'center' }} />
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>S</span>
          </div>
        </div>
        <button onClick={deleteNode}
          style={{ background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', color: '#ff4d4d', cursor: 'pointer', fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: '5px' }}>
          APAGAR
        </button>
      </div>
      <div style={{ padding: '14px' }}>
        <Handle type="target" position={Position.Top} style={{ background: '#63b3ed', width: '10px', height: '10px', border: '2px solid #080c08', top: '-6px' }} />
        <div onClick={() => fileRef.current?.click()}
          style={{ width: '100%', height: '130px', background: 'rgba(99,179,237,0.04)', border: `2px dashed ${imageUrl ? 'rgba(99,179,237,0.4)' : 'rgba(99,179,237,0.2)'}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '10px', overflow: 'hidden', transition: '0.2s' }}>
          {imageUrl
            ? <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            : <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(99,179,237,0.6)', fontSize: '0.6rem', fontWeight: '700', margin: 0 }}>CLIQUE PARA ENVIAR</p>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.55rem', margin: '4px 0 0' }}>PNG, JPG, GIF</p>
              </div>
          }
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </div>
        {imageUrl && (
          <button onClick={() => { setImageUrl(''); update(caption, '', delay); }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,77,77,0.6)', fontSize: '0.6rem', cursor: 'pointer', marginBottom: '8px', padding: 0 }}>
            remover imagem
          </button>
        )}
        <input value={caption} onChange={e => { setCaption(e.target.value); update(e.target.value, imageUrl, delay); }}
          placeholder="Legenda (opcional)..."
          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'white', fontSize: '0.78rem', padding: '9px 11px', outline: 'none', boxSizing: 'border-box' }} />
        <Handle type="source" position={Position.Bottom} id="default"
          style={{ bottom: '-6px', background: '#63b3ed', width: '11px', height: '11px', border: '2px solid #080c08' }} />
      </div>
    </div>
  );
};

// ─── NODE: IA COM CONTEXTO ────────────────────────────────────────────────────
const IANode = ({ id, data }) => {
  const { setNodes, setEdges } = useReactFlow();
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [modelo, setModelo] = useState(data.modelo || 'gemini-pro');
  const [delay, setDelay] = useState(data.delay ?? 3);

  useEffect(() => {
    setPrompt(data.prompt || '');
    setModelo(data.modelo || 'gemini-pro');
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
    <div style={{ background: 'rgba(8,12,8,0.97)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '15px', minWidth: '300px', maxWidth: '340px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(167,139,250,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(167,139,250,0.04)', borderRadius: '15px 15px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', background: '#a78bfa', borderRadius: '50%', boxShadow: '0 0 6px #a78bfa' }} />
          <span style={{ fontSize: '9px', color: '#a78bfa', fontWeight: '800', letterSpacing: '1px' }}>IA COM CONTEXTO</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(167,139,250,0.08)', padding: '3px 7px', borderRadius: '6px', border: '1px solid rgba(167,139,250,0.15)' }}>
            <input type="text" value={delay} onChange={e => { const v = e.target.value.replace(/\D/g,''); setDelay(v); update(prompt, modelo, v); }}
              style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '11px', width: '18px', fontWeight: '800', outline: 'none', textAlign: 'center' }} />
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>S</span>
          </div>
        </div>
        <button onClick={deleteNode}
          style={{ background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', color: '#ff4d4d', cursor: 'pointer', fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: '5px' }}>
          APAGAR
        </button>
      </div>
      <div style={{ padding: '14px' }}>
        <Handle type="target" position={Position.Top} style={{ background: '#a78bfa', width: '10px', height: '10px', border: '2px solid #080c08', top: '-6px' }} />
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontSize: '0.58rem', color: 'rgba(167,139,250,0.7)', fontWeight: '800', marginBottom: '5px', letterSpacing: '0.5px' }}>MODELO DE IA</label>
          <select value={modelo} onChange={e => { setModelo(e.target.value); update(prompt, e.target.value, delay); }}
            style={{ width: '100%', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', color: 'white', fontSize: '0.78rem', padding: '8px 10px', outline: 'none' }}>
            <option value="gemini-pro" style={{ background: '#0d140d' }}>Gemini Pro (recomendado)</option>
            <option value="gpt-3.5-turbo" style={{ background: '#0d140d' }}>GPT-3.5 Turbo</option>
            <option value="gpt-4" style={{ background: '#0d140d' }}>GPT-4</option>
          </select>
        </div>
        <label style={{ display: 'block', fontSize: '0.58rem', color: 'rgba(167,139,250,0.7)', fontWeight: '800', marginBottom: '5px', letterSpacing: '0.5px' }}>INSTRUCAO DO BOT</label>
        <textarea value={prompt} onChange={e => { setPrompt(e.target.value); update(e.target.value, modelo, delay); }}
          placeholder="Ex: Voce e um atendente da empresa X. Responda de forma educada e objetiva sobre nossos produtos..."
          style={{ width: '100%', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', color: 'white', fontSize: '0.78rem', padding: '10px', minHeight: '90px', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: '10px', lineHeight: '1.5' }} />
        <div style={{ background: 'rgba(167,139,250,0.05)', borderRadius: '8px', padding: '9px 11px', border: '1px solid rgba(167,139,250,0.1)' }}>
          <p style={{ fontSize: '0.58rem', color: 'rgba(167,139,250,0.55)', margin: 0, lineHeight: '1.6' }}>
            A IA responde com base nessa instrucao e no historico da conversa.
          </p>
        </div>
        <Handle type="source" position={Position.Bottom} id="default"
          style={{ bottom: '-6px', background: '#a78bfa', width: '11px', height: '11px', border: '2px solid #080c08' }} />
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
    style={{ position: 'relative', width: '100%', background: locked ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', border: `1px solid ${locked ? 'rgba(255,255,255,0.04)' : `${color}22`}`, color: 'white', padding: '12px 14px', borderRadius: '10px', textAlign: 'left', cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.45 : 1, marginBottom: '8px', transition: '0.2s' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
      <span style={{ color: locked ? 'rgba(255,255,255,0.25)' : color, fontWeight: '900', fontSize: '0.75rem' }}>
        {title}
      </span>
      {locked && <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>PRO</span>}
    </div>
    <div style={{ fontSize: '0.6rem', opacity: 0.4, lineHeight: '1.4' }}>{desc}</div>
  </div>
);

// ─── FLOW CONTENT ─────────────────────────────────────────────────────────────
const FlowContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fitView, setCenter } = useReactFlow();

  const usuarioId = parseInt(localStorage.getItem('usuario_id')) || 0;

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
            modelo:   node.data?.modelo   ?? 'gemini-pro',
          }
        }));

        const edgesNormalizados = normalizeEdgesForHandles(nodesCarregados, data.edges || []);
        const nodesParaUsar = shouldAutoLayout(nodesCarregados)
          ? autoLayout(nodesCarregados, edgesNormalizados)
          : nodesCarregados;
        const edgesOrganizados = edgesNormalizados.map(edge => ({
          ...edge,
          animated: true,
          style: { stroke: '#25D366', strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#25D366' },
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
    setAlterado(true);
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges(eds => applyEdgeChanges(changes, eds));
    setAlterado(true);
  }, []);

  const onConnect = useCallback((params) => {
    setEdges(eds => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#25D366', strokeWidth: 2.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#25D366' }
    }, eds));
    setAlterado(true);
  }, []);

  const addNode = (type) => {
    const lastNode = nodes[nodes.length - 1];
    const newY = (lastNode?.position.y || 0) + 380;
    const newX = (lastNode?.position.x || 400);
    const typeData = {
      botNode:   { label: 'Nova mensagem...', options: [], delay: 2 },
      imageNode: { caption: '', imageUrl: '', delay: 2 },
      iaNode:    { prompt: '', modelo: 'gemini-pro', delay: 3 },
    };
    const newNode = {
      id: Date.now().toString(),
      type,
      data: { ...typeData[type] },
      position: { x: newX, y: newY }
    };
    setNodes(nds => [...nds, newNode]);
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

  // Atalho Ctrl+S
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        salvarFluxo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nodes, edges, nomeFluxo, fluxoId]); // eslint-disable-line

  const statsNodes = nodes.length;
  const statsEdges = edges.length;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(8,12,8,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 100, gap: '10px', flexShrink: 0 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          {/* Hamburger — visivel so no mobile via CSS injetado */}
          <button
            onClick={() => setSidebarAberta(!sidebarAberta)}
            className="hamburger-flow"
            style={{ display: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontSize: '1rem', padding: '6px 10px', borderRadius: '8px', flexShrink: 0 }}>
            &#9776;
          </button>

          <h2 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '-1px', margin: 0, color: 'white', flexShrink: 0 }}>
            ZAP<span style={{ color: '#25D366' }}>CHAT</span>
          </h2>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

          <input
            value={nomeFluxo}
            onChange={e => { setNomeFluxo(e.target.value); setAlterado(true); }}
            className="nav-nome"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem', fontWeight: '700', padding: '6px 12px', outline: 'none', width: '200px', minWidth: 0 }}
          />

          <div className="nav-stats" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', whiteSpace: 'nowrap' }}>
              {statsNodes} nodes · {statsEdges} conexoes
            </span>
            {alterado && (
              <span style={{ fontSize: '0.62rem', color: '#f0a500', fontWeight: '700', animation: 'fadeIn 0.3s ease' }}>
                nao salvo
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {carregando && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Spinner size={13} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>Carregando...</span>
            </div>
          )}
          {statusMsg && (
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: statusTipo === 'ok' ? '#25D366' : '#ff6b6b', animation: 'fadeIn 0.3s ease', whiteSpace: 'nowrap' }}>
              {statusMsg}
            </span>
          )}

          <button onClick={handleFitView} title="Ver tudo"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.8rem', padding: '7px 10px', borderRadius: '8px', transition: '0.2s' }}>
            [ ]
          </button>

          <button onClick={() => setMinimapVisivel(v => !v)} title="Mini-mapa"
            style={{ background: minimapVisivel ? 'rgba(37,211,102,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${minimapVisivel ? 'rgba(37,211,102,0.25)' : 'rgba(255,255,255,0.08)'}`, color: minimapVisivel ? '#25D366' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.65rem', padding: '7px 10px', borderRadius: '8px', fontWeight: '700', whiteSpace: 'nowrap', transition: '0.2s' }}>
            MAPA
          </button>

          <button onClick={handleVoltar}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '0.7rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.2s' }}>
            VOLTAR
          </button>

          <button onClick={salvarFluxo} disabled={salvando}
            style={{ background: salvando ? 'rgba(37,211,102,0.4)' : '#25D366', color: '#0d140d', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: '900', fontSize: '0.75rem', cursor: salvando ? 'not-allowed' : 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}>
            {salvando ? <><Spinner size={12} color="#0d140d" /> SALVANDO...</> : 'SALVAR'}
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
          style={{ width: '240px', minWidth: '240px', background: 'rgba(8,12,8,0.97)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px 14px', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>

          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.58rem', fontWeight: '800', letterSpacing: '2px', marginBottom: '14px', textTransform: 'uppercase' }}>ADICIONAR BLOCO</p>

          <ComponentItem title="TEXTO" desc="Mensagem com delay e opcoes de resposta ramificada." color="#25D366" locked={false} onClick={() => addNode('botNode')} />
          <ComponentItem title="IMAGEM" desc="Envie uma imagem com legenda opcional." color="#63b3ed" locked={!isPro} onClick={() => addNode('imageNode')} />
          <ComponentItem title="IA COM CONTEXTO" desc="Bot responde com IA baseado no historico da conversa." color="#a78bfa" locked={!isPro} onClick={() => addNode('iaNode')} />

          {!isPro && (
            <div style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
              <p style={{ fontSize: '0.62rem', color: '#a78bfa', fontWeight: '800', marginBottom: '5px' }}>BLOCOS PRO</p>
              <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', lineHeight: '1.6', marginBottom: '10px' }}>Faca upgrade para desbloquear imagens e IA.</p>
              <button onClick={() => navigate('/assinar')}
                style={{ width: '100%', background: '#25D366', color: '#0d140d', border: 'none', borderRadius: '7px', padding: '8px', fontSize: '0.62rem', fontWeight: '900', cursor: 'pointer' }}>
                VER PLANOS
              </button>
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '10px 0' }} />

          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.58rem', fontWeight: '800', letterSpacing: '1.5px', marginBottom: '10px' }}>LEGENDA</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
            {[
              { cor: '#25D366', label: 'Opcoes de resposta' },
              { cor: '#34b7f1', label: 'Fluxo padrao (sem opcoes)' },
              { cor: '#63b3ed', label: 'Saida de imagem' },
              { cor: '#a78bfa', label: 'Saida de IA' },
            ].map(({ cor, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cor, flexShrink: 0, boxShadow: `0 0 5px ${cor}` }} />
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1 }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.58rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '1px' }}>ATALHOS</p>
            {[
              ['Ctrl+S', 'Salvar'],
              ['Scroll', 'Zoom in/out'],
              ['Arrastar', 'Mover canvas'],
              ['[ ] nav', 'Ver tudo'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{k}</span>
                <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)' }}>{v}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CANVAS ── */}
        <div className="reactflow-wrapper" style={{ flexGrow: 1, position: 'relative' }}>
          {carregando && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,12,8,0.85)', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', backdropFilter: 'blur(4px)' }}>
              <Spinner size={36} color="#25D366" />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: '600' }}>Carregando fluxo...</p>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.25, minZoom: 0.2, maxZoom: 1.2 }}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            deleteKeyCode="Delete">
            <Background color="#25D366" gap={36} size={1} variant="dots" opacity={0.08} />
            <Controls style={{ filter: 'invert(1) grayscale(1) opacity(0.6)', bottom: 16, left: 16 }} />
            {minimapVisivel && (
              <MiniMap
                nodeColor={(node) => node.type === 'iaNode' ? '#a78bfa' : node.type === 'imageNode' ? '#63b3ed' : '#25D366'}
                maskColor="rgba(8,12,8,0.85)"
                style={{ background: 'rgba(8,12,8,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', bottom: 16, right: 16 }}
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