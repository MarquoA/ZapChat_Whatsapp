import React, { useState, useEffect, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * VariavelPicker
 * Botão que abre um dropdown com todas as variáveis disponíveis,
 * agrupadas por categoria. Ao clicar em uma variável, ela é inserida
 * no cursor do textarea/input alvo.
 *
 * Props:
 *   textareaRef  — ref do textarea onde a variável será inserida
 *   onInsert     — callback(novoTexto) chamado após inserção
 *   tema         — "claro" | "escuro"
 */
export default function VariavelPicker({ textareaRef, onInsert, tema = 'escuro' }) {
  const [aberto, setAberto]         = useState(false);
  const [categorias, setCategorias] = useState({});
  const [busca, setBusca]           = useState('');
  const [carregando, setCarregando] = useState(false);
  const dropdownRef                 = useRef(null);

  const escuro = tema === 'escuro';
  const cores = {
    bg:    escuro ? '#1a2a1a' : '#ffffff',
    borda: escuro ? 'rgba(37,211,102,0.2)' : 'rgba(0,0,0,0.12)',
    texto: escuro ? '#e8f5e8' : '#1a1a1a',
    muted: escuro ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
    hover: escuro ? 'rgba(37,211,102,0.08)' : 'rgba(37,211,102,0.06)',
    input: escuro ? '#0d1a0d' : '#f5f5f5',
  };

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAberto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Busca as variáveis na API quando abre pela primeira vez
  useEffect(() => {
    if (!aberto || Object.keys(categorias).length > 0) return;
    setCarregando(true);
    fetch(`${API_URL}/bot/variaveis`)
      .then(r => r.json())
      .then(data => setCategorias(data))
      .catch(() => {
        // Fallback offline caso a API falhe
        setCategorias({
          "Contato":     [
            { variavel: "(nome)",     descricao: "Primeiro nome" },
            { variavel: "(telefone)", descricao: "Telefone" },
            { variavel: "(email)",    descricao: "E-mail" },
          ],
          "Atendimento": [
            { variavel: "(protocolo)",  descricao: "Protocolo gerado" },
            { variavel: "(data_hoje)",  descricao: "Data de hoje" },
            { variavel: "(hora_atual)", descricao: "Hora atual" },
          ],
        });
      })
      .finally(() => setCarregando(false));
  }, [aberto]); // eslint-disable-line

  const inserirVariavel = (variavel) => {
    const el = textareaRef?.current;
    if (!el) return;

    const inicio    = el.selectionStart ?? el.value.length;
    const fim       = el.selectionEnd   ?? el.value.length;
    const antes     = el.value.slice(0, inicio);
    const depois    = el.value.slice(fim);
    const novoTexto = antes + variavel + depois;

    onInsert(novoTexto);

    // Reposiciona o cursor após a variável inserida
    setTimeout(() => {
      el.focus();
      const novaPosicao = inicio + variavel.length;
      el.setSelectionRange(novaPosicao, novaPosicao);
    }, 0);

    setAberto(false);
    setBusca('');
  };

  // Filtra por busca
  const categoriasFiltradas = Object.entries(categorias).reduce((acc, [cat, vars]) => {
    const filtradas = vars.filter(v =>
      v.variavel.includes(busca.toLowerCase()) ||
      v.descricao.toLowerCase().includes(busca.toLowerCase())
    );
    if (filtradas.length > 0) acc[cat] = filtradas;
    return acc;
  }, {});

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>

      {/* Botão trigger */}
      <button
        type="button"
        onClick={() => setAberto(v => !v)}
        title="Inserir variável dinâmica"
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
          background: aberto ? 'rgba(37,211,102,0.15)' : 'rgba(37,211,102,0.07)',
          border: '1px solid rgba(37,211,102,0.25)',
          color: '#25D366', fontSize: '0.72rem', fontWeight: 700,
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{'{}'}</span>
        Variável
      </button>

      {/* Dropdown */}
      {aberto && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 9999,
          width: 300, maxHeight: 380, overflowY: 'auto',
          background: cores.bg, border: `1px solid ${cores.borda}`,
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* Campo de busca */}
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${cores.borda}`, flexShrink: 0 }}>
            <input
              autoFocus
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar variável..."
              style={{
                width: '100%', background: cores.input,
                border: `1px solid ${cores.borda}`, borderRadius: 7,
                padding: '7px 10px', color: cores.texto,
                fontSize: '0.78rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Lista */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {carregando && (
              <p style={{ textAlign: 'center', padding: 20, fontSize: '0.75rem', color: cores.muted }}>
                Carregando...
              </p>
            )}

            {!carregando && Object.keys(categoriasFiltradas).length === 0 && (
              <p style={{ textAlign: 'center', padding: 20, fontSize: '0.75rem', color: cores.muted }}>
                Nenhuma variável encontrada.
              </p>
            )}

            {Object.entries(categoriasFiltradas).map(([categoria, vars]) => (
              <div key={categoria}>
                {/* Cabeçalho da categoria */}
                <div style={{
                  padding: '7px 12px 4px',
                  fontSize: '0.6rem', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '1px',
                  color: '#25D366', opacity: 0.7,
                }}>
                  {categoria}
                </div>

                {/* Itens */}
                {vars.map(({ variavel, descricao }) => (
                  <div
                    key={variavel}
                    onClick={() => inserirVariavel(variavel)}
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', gap: 8,
                      padding: '8px 12px', cursor: 'pointer',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = cores.hover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      fontFamily: 'monospace', fontSize: '0.78rem',
                      color: '#25D366', fontWeight: 700, flexShrink: 0,
                    }}>
                      {variavel}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: cores.muted, textAlign: 'right' }}>
                      {descricao}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Rodapé */}
          <div style={{
            padding: '8px 12px', borderTop: `1px solid ${cores.borda}`,
            fontSize: '0.62rem', color: cores.muted, flexShrink: 0,
          }}>
            Clique em uma variável para inserir no texto
          </div>
        </div>
      )}
    </div>
  );
}
