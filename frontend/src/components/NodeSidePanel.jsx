import React, { useState } from 'react';

// ─── helpers ────────────────────────────────────────────────────────────────

function gerarChave(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// ─── main component ──────────────────────────────────────────────────────────

const NodeSidePanel = ({
  open,
  onClose,
  customVars,
  onCustomVarsChange,
  tema,
}) => {
  const [tab, setTab]         = useState('vars');
  const [nomeVar, setNomeVar] = useState('');
  const [erroCriar, setErroCriar] = useState('');

  const T      = tema || {};
  const bg     = T.sidebarBg    || 'rgba(8,12,8,0.97)';
  const border = T.sidebarBorder || 'rgba(255,255,255,0.06)';
  const green  = T.green         || '#25D366';
  const muted  = T.textMuted     || 'rgba(255,255,255,0.4)';
  const sub    = T.textSub       || 'rgba(255,255,255,0.2)';
  const iBg    = T.inputBg       || 'rgba(255,255,255,0.04)';
  const iBdr   = T.inputBorder   || 'rgba(255,255,255,0.1)';
  const iText  = T.inputText     || '#ffffff';
  const danger = T.danger        || '#ff4d4d';
  const amber  = '#f59e0b';
  const cyan   = '#34b7f1';
  const purple = T.purple        || '#a78bfa';

  // ── variable groups ──────────────────────────────────────────────────────
  const allVars = window._zapAllVars || [];
  const grupos  = {};
  allVars.forEach(v => {
    if (!grupos[v.category]) grupos[v.category] = [];
    grupos[v.category].push(v);
  });

  // ── insert into focused ChipTextarea ────────────────────────────────────
  const inserir = v => window._zapInsertToFocused?.(v);

  // ── create custom var ────────────────────────────────────────────────────
  const criarVar = () => {
    const nome  = nomeVar.trim();
    if (!nome) { setErroCriar('Informe um nome.'); return; }
    const chave = gerarChave(nome);
    if (!chave || chave.length < 2) { setErroCriar('Nome inválido.'); return; }
    if (customVars.some(v => v.key === chave)) { setErroCriar('Já existe.'); return; }
    onCustomVarsChange([...customVars, { key: chave, label: nome }]);
    setNomeVar('');
    setErroCriar('');
  };

  // ── style helpers ────────────────────────────────────────────────────────
  const chip = color => ({
    display: 'inline-flex',
    alignItems: 'center',
    background: `${color}18`,
    border: `1px solid ${color}44`,
    color,
    borderRadius: '5px',
    padding: '3px 9px',
    fontSize: '0.7rem',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  });

  const sectionTitle = color => ({
    fontSize: '0.55rem',
    color,
    fontWeight: '800',
    letterSpacing: '1px',
    marginBottom: '7px',
  });

  const TABS = [
    { key: 'vars',   label: 'Variáveis'   },
    { key: 'minhas', label: 'Minhas Vars' },
  ];

  return (
    <div
      style={{
        width: open ? '270px' : '0',
        minWidth: open ? '270px' : '0',
        overflow: 'hidden',
        background: bg,
        borderLeft: open ? `1px solid ${border}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        flexShrink: 0,
      }}
    >
      {open && (
        <div style={{ width: '270px', height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

          {/* ── Header ── */}
          <div style={{ padding: '12px 14px 8px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '0.6rem', fontWeight: '800', color: green, letterSpacing: '1.5px' }}>VARIÁVEIS</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: muted, cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '2px 5px' }}>×</button>
          </div>

          {/* ── Tab bar ── */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1,
                  padding: '9px 4px',
                  background: tab === t.key ? `${green}10` : 'transparent',
                  border: 'none',
                  borderBottom: tab === t.key ? `2px solid ${green}` : '2px solid transparent',
                  color: tab === t.key ? green : muted,
                  fontSize: '0.58rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                  transition: 'all 0.15s',
                }}
              >
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* ══ VARIÁVEIS ══════════════════════════════════════════════════ */}
          {tab === 'vars' && (
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.6rem', color: sub, lineHeight: '1.5', margin: 0 }}>
                Clique para inserir na caixa de texto em foco. Ou use <span style={{ color: green, fontWeight: '700' }}>/</span> enquanto digita.
              </p>

              {Object.entries(grupos).map(([cat, vars]) => {
                const catColor =
                  cat === 'Capturadas'     ? amber  :
                  cat === 'Personalizadas' ? cyan   :
                  cat === 'Atendimento'    ? purple :
                  cat === 'Agendamento'    ? T.blue || '#63b3ed' :
                  cat === 'Pedido'         ? cyan   : green;
                return (
                  <div key={cat}>
                    <p style={sectionTitle(catColor)}>{cat.toUpperCase()}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {vars.map(v => (
                        <span
                          key={v.key}
                          onMouseDown={e => { e.preventDefault(); inserir(v); }}
                          style={chip(v.color)}
                        >
                          ({v.label})
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {allVars.length === 0 && (
                <p style={{ fontSize: '0.62rem', color: sub, textAlign: 'center', fontStyle: 'italic' }}>
                  Sem variáveis disponíveis.
                </p>
              )}
            </div>
          )}

          {/* ══ MINHAS VARS ═══════════════════════════════════════════════ */}
          {tab === 'minhas' && (
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '0.6rem', color: sub, lineHeight: '1.5', margin: 0 }}>
                Crie variáveis extras para guardar qualquer informação que o bot coleta.
              </p>

              {/* Create */}
              <div style={{ background: iBg, border: `1px solid ${border}`, borderRadius: '10px', padding: '12px' }}>
                <p style={sectionTitle(cyan)}>NOVA VARIÁVEL</p>
                <input
                  value={nomeVar}
                  onChange={e => { setNomeVar(e.target.value); setErroCriar(''); }}
                  onKeyDown={e => e.key === 'Enter' && criarVar()}
                  placeholder="Nome da informação (ex: Endereço, Empresa)"
                  className="nodrag"
                  onMouseDown={e => e.stopPropagation()}
                  style={{
                    width: '100%', background: iBg, border: `1px solid ${iBdr}`,
                    borderRadius: '7px', color: iText, fontSize: '0.72rem',
                    padding: '8px 10px', outline: 'none', boxSizing: 'border-box', marginBottom: '6px',
                  }}
                />

                {nomeVar.trim() && (
                  <p style={{ fontSize: '0.6rem', color: cyan, marginBottom: '8px' }}>
                    Variável: <strong>({gerarChave(nomeVar.trim()) || '...'})</strong>
                  </p>
                )}

                {erroCriar && (
                  <p style={{ fontSize: '0.6rem', color: danger, marginBottom: '6px' }}>{erroCriar}</p>
                )}

                <button
                  onClick={criarVar}
                  className="nodrag"
                  onMouseDown={e => e.stopPropagation()}
                  style={{
                    width: '100%', background: `${cyan}14`, border: `1px solid ${cyan}44`,
                    color: cyan, borderRadius: '7px', padding: '7px', fontSize: '0.65rem',
                    fontWeight: '800', cursor: 'pointer', letterSpacing: '0.5px',
                  }}
                >
                  + CRIAR
                </button>
              </div>

              {/* List */}
              {customVars.length > 0 && (
                <div>
                  <p style={sectionTitle(muted)}>CRIADAS ({customVars.length})</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {customVars.map(v => (
                      <div
                        key={v.key}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: `${cyan}08`, border: `1px solid ${cyan}22`,
                          borderRadius: '7px', padding: '7px 10px',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.72rem', color: cyan, fontWeight: '700' }}>{v.label}</span>
                          <span style={{ fontSize: '0.58rem', color: sub, marginLeft: '6px' }}>({v.key})</span>
                        </div>
                        <button
                          onClick={() => onCustomVarsChange(customVars.filter(x => x.key !== v.key))}
                          className="nodrag"
                          onMouseDown={e => e.stopPropagation()}
                          style={{ background: 'none', border: 'none', color: `${danger}88`, cursor: 'pointer', fontSize: '0.8rem', padding: '2px 4px', lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {customVars.length === 0 && (
                <p style={{ fontSize: '0.62rem', color: sub, textAlign: 'center', fontStyle: 'italic' }}>
                  Nenhuma variável criada ainda.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NodeSidePanel;
