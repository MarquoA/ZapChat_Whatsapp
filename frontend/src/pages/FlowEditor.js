import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge, Background, Controls,
  applyEdgeChanges, applyNodeChanges,
  Handle, Position, MarkerType,
  useReactFlow, ReactFlowProvider
} from 'reactflow';
import { useNavigate, useParams } from 'react-router-dom';
import 'reactflow/dist/style.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ─── HELPER: requisição autenticada ─────────────────────────────────────────
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

const BotNode = ({ id, data }) => {
  const { setNodes, setEdges } = useReactFlow();
  const [options, setOptions] = useState(data.options || []);
  const [delay, setDelay] = useState(data.delay || 2);

  const addOption = () => setOptions([...options, "Nova Opção"]);

  const removeOption = (index) => {
    const optionHandleId = `opt${index}`;
    setOptions(options.filter((_, i) => i !== index));
    setEdges((eds) => eds.filter((edge) => !(edge.source === id && edge.sourceHandle === optionHandleId)));
  };

  const deleteNode = () => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  useEffect(() => {
    setOptions(data.options || []);
    setDelay(data.delay || 2);
  }, [data.options, data.delay]);

  return (
    <div style={{ background: 'rgba(8, 12, 8, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '15px', minWidth: '280px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', background: '#25D366', borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
            <span style={{ fontSize: '10px' }}>⏳</span>
            <input type="text" value={delay}
              onChange={(e) => { setDelay(e.target.value.replace(/\D/g, '')); data.delay = e.target.value.replace(/\D/g, ''); }}
              style={{ background: 'none', border: 'none', color: '#25D366', fontSize: '11px', width: '20px', fontWeight: 'bold', outline: 'none', textAlign: 'center' }} />
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>SEC</span>
          </div>
        </div>
        <button onClick={deleteNode} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', opacity: 0.6 }}>APAGAR</button>
      </div>
      <div style={{ padding: '16px' }}>
        <Handle type="target" position={Position.Top} style={{ background: '#25D366', width: '10px', height: '10px', border: 'none' }} />
        <textarea defaultValue={data.label}
          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', padding: '12px', minHeight: '80px', outline: 'none', resize: 'none', marginBottom: '15px', boxSizing: 'border-box' }}
          placeholder="Texto da mensagem..."
          onChange={(e) => { data.label = e.target.value; }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800' }}>OPÇÕES DE RESPOSTA</span>
            <button onClick={addOption} style={{ background: 'none', border: 'none', color: '#25D366', fontSize: '0.65rem', cursor: 'pointer', fontWeight: '900' }}>+ ADD</button>
          </div>
          {options.map((opt, i) => (
            <div key={i} style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
              <input defaultValue={opt}
                onChange={(e) => { const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts); data.options = newOpts; }}
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

const nodeTypes = { botNode: BotNode };

const FlowContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCenter } = useReactFlow();

  const usuarioId = parseInt(localStorage.getItem('usuario_id'));

  const [nodes, setNodes] = useState([
    { id: '1', type: 'botNode', data: { label: 'Olá!', options: [], delay: 2 }, position: { x: 400, y: 100 } }
  ]);
  const [edges, setEdges] = useState([]);
  const [nomeFluxo, setNomeFluxo] = useState('Novo Fluxo');
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [fluxoId, setFluxoId] = useState(id && id !== 'novo' ? parseInt(id) : 0);

  useEffect(() => {
    const idNumerico = parseInt(id);
    if (id && id !== 'novo' && !isNaN(idNumerico) && usuarioId) {
      authFetch(`${API_URL}/fluxos/${idNumerico}/${usuarioId}`)
        .then(res => {
          if (res.status === 401) { localStorage.clear(); window.location.href = '/login'; return; }
          if (!res.ok) throw new Error('Fluxo não encontrado');
          return res.json();
        })
        .then(data => {
          if (!data) return;
          setNodes(data.nodes);
          setEdges(data.edges);
          setNomeFluxo(data.nome_fluxo);
          setFluxoId(data.id);
        })
        .catch(() => { setStatusMsg('⚠️ Fluxo não encontrado, começando do zero.'); });
    }
  }, [id, usuarioId]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({
    ...params, animated: true,
    style: { stroke: params.sourceHandle === 'default' ? '#34b7f1' : '#25D366', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: params.sourceHandle === 'default' ? '#34b7f1' : '#25D366' }
  }, eds)), []);

  const addNode = () => {
    const lastNode = nodes[nodes.length - 1];
    const newY = (lastNode?.position.y || 0) + 400;
    const newNode = { id: Date.now().toString(), type: 'botNode', data: { label: 'Nova mensagem...', options: [], delay: 2 }, position: { x: 400, y: newY } };
    setNodes((nds) => nds.concat(newNode));
    setTimeout(() => setCenter(400 + 140, newY + 150, { zoom: 1, duration: 800 }), 100);
  };

  const salvarFluxo = async () => {
    if (!usuarioId) {
      setStatusMsg('❌ Usuário não identificado. Faça login novamente.');
      setTimeout(() => setStatusMsg(''), 4000);
      return;
    }
    setSalvando(true);
    setStatusMsg('');
    try {
      const res = await authFetch(`${API_URL}/fluxos/salvar`, {
        method: 'POST',
        body: JSON.stringify({ id: fluxoId, usuario_id: usuarioId, nome_fluxo: nomeFluxo, nodes, edges }),
      });

      if (res.status === 401) { localStorage.clear(); window.location.href = '/login'; return; }
      if (!res.ok) throw new Error('Erro na resposta do servidor');

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
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#141b26', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: 'rgba(8, 12, 8, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-1.5px', margin: 0, color: 'white' }}>ZAP<span style={{ color: '#25D366' }}>CHAT</span></h2>
          <input value={nomeFluxo} onChange={(e) => setNomeFluxo(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: '700', padding: '6px 12px', outline: 'none', width: '200px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {statusMsg && (
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: statusMsg.startsWith('✅') ? '#25D366' : '#ff4d4d' }}>{statusMsg}</span>
          )}
          <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 25px', borderRadius: '30px', fontWeight: '800', fontSize: '0.7rem', cursor: 'pointer' }}>VOLTAR</button>
          <button onClick={salvarFluxo} disabled={salvando}
            style={{ background: salvando ? 'rgba(37,211,102,0.5)' : '#25D366', color: '#0d140d', border: 'none', padding: '12px 30px', borderRadius: '30px', fontWeight: '800', fontSize: '0.7rem', cursor: salvando ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
            {salvando ? 'SALVANDO...' : 'SALVAR'}
          </button>
        </div>
      </nav>
      <div style={{ flexGrow: 1, display: 'flex' }}>
        <aside style={{ width: '280px', background: 'rgba(8, 12, 8, 0.9)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '40px 20px', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1.5px', marginBottom: '20px' }}>COMPONENTES</p>
          <button onClick={addNode} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', padding: '15px', borderRadius: '15px', textAlign: 'left', cursor: 'pointer' }}>
            <div style={{ color: '#25D366', fontWeight: '900', fontSize: '0.8rem', marginBottom: '4px' }}>+ TEXTO</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>Nova mensagem com delay.</div>
          </button>
          <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: '#25D366', fontSize: '0.75rem', fontWeight: '900', marginBottom: '10px' }}>DICAS ÚTEIS</p>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem' }}>• Arraste os pontos verdes para conectar.</li>
              <li style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem' }}>• Use o DELAY para simular digitação.</li>
              <li style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem' }}>• Ao apagar uma opção, o link some automaticamente.</li>
            </ul>
          </div>
        </aside>
        <div style={{ flexGrow: 1 }}>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }}>
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