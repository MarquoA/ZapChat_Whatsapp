import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

const makeT = (tema) => tema === 'claro' ? {
  bg: '#e6ebe5',
  bgAlt: '#eaedea',
  card: 'rgba(0,0,0,0.025)',
  cardHover: 'rgba(0,0,0,0.04)',
  border: 'rgba(45,75,45,0.12)',
  borderHover: 'rgba(45,75,45,0.22)',
  text: '#1a2a1a',
  muted: 'rgba(22,42,22,0.55)',
  sub: 'rgba(22,42,22,0.35)',
  input: 'rgba(22,55,22,0.06)',
  inputBorder: 'rgba(22,55,22,0.16)',
  green: '#2e7a50',
  greenDim: 'rgba(46,122,80,0.08)',
  red: '#b53535',
  yellow: '#9a6a08',
  blue: '#3a6fa0',
  purple: '#6b4fa0',
} : {
  bg: '#070b07',
  bgAlt: '#0b100b',
  card: 'rgba(255,255,255,0.022)',
  cardHover: 'rgba(255,255,255,0.038)',
  border: 'rgba(255,255,255,0.07)',
  borderHover: 'rgba(255,255,255,0.13)',
  text: '#f0f2f0',
  muted: 'rgba(255,255,255,0.38)',
  sub: 'rgba(255,255,255,0.18)',
  input: 'rgba(255,255,255,0.04)',
  inputBorder: 'rgba(255,255,255,0.1)',
  green: '#25D366',
  greenDim: 'rgba(37,211,102,0.08)',
  red: '#e05252',
  yellow: '#d4920a',
  blue: '#4a8fd4',
  purple: '#8b6bc4',
};

// T é atualizado pelo componente AdminPanel a cada render com base no tema recebido
let T = makeT('escuro');

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22 },
};

/* ── Icons (SVG inline, no emojis) ── */
const Icon = ({ name, size = 15, color = 'currentColor', style = {} }) => {
  const icons = {
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    revenue: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    flow: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    phone: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    template: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    send: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    chart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    back: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
      </svg>
    ),
    refresh: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
    external: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    ),
    plus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    trash: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  };
  return icons[name] || null;
};

/* ── Base Components ── */

const StatBox = ({ label, value, sub, color = T.green, iconName }) => (
  <motion.div
    whileHover={{ y: -2, borderColor: T.borderHover }}
    transition={{ duration: 0.15 }}
    style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: '22px 24px',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 2,
        height: '100%',
        background: `linear-gradient(180deg, ${color}, transparent)`,
        borderRadius: '12px 0 0 12px',
      }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p
          style={{
            fontSize: '0.6rem',
            color: T.muted,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            marginBottom: 10,
          }}
        >
          {label}
        </p>
        <h3
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color,
            lineHeight: 1,
            marginBottom: sub ? 6 : 0,
            letterSpacing: '-0.5px',
          }}
        >
          {value}
        </h3>
        {sub && <p style={{ fontSize: '0.65rem', color: T.muted, marginTop: 4 }}>{sub}</p>}
      </div>
      {iconName && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: `${color}10`,
            border: `1px solid ${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name={iconName} size={16} color={color} />
        </div>
      )}
    </div>
  </motion.div>
);

const Badge = ({ text, color = T.green }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 4,
      fontSize: '0.58rem',
      fontWeight: 800,
      background: `${color}12`,
      color,
      border: `1px solid ${color}30`,
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
    }}
  >
    {text}
  </span>
);

const Btn = ({ children, onClick, variant = 'green', disabled, small, style = {}, iconName }) => {
  const variants = {
    green: { bg: T.green, color: '#081008', border: 'none' },
    ghost: { bg: 'transparent', color: T.muted, border: `1px solid ${T.border}` },
    red: { bg: 'rgba(224,82,82,0.1)', color: T.red, border: `1px solid rgba(224,82,82,0.25)` },
    blue: { bg: 'rgba(74,143,212,0.1)', color: T.blue, border: `1px solid rgba(74,143,212,0.25)` },
  };
  const v = variants[variant] || variants.green;
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.015, opacity: disabled ? 0.5 : 0.9 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      style={{
        background: v.bg,
        color: v.color,
        border: v.border,
        padding: small ? '5px 12px' : '9px 18px',
        borderRadius: 7,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: small ? '0.65rem' : '0.75rem',
        opacity: disabled ? 0.45 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        letterSpacing: '0.2px',
        transition: 'border-color 0.15s',
        ...style,
      }}
    >
      {iconName && <Icon name={iconName} size={12} color={v.color} />}
      {children}
    </motion.button>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    {label && (
      <label
        style={{
          display: 'block',
          fontSize: '0.6rem',
          color: T.muted,
          marginBottom: 6,
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.8px',
        }}
      >
        {label}
      </label>
    )}
    <input
      {...props}
      style={{
        width: '100%',
        background: T.input,
        border: `1px solid ${T.inputBorder}`,
        padding: '9px 12px',
        borderRadius: 7,
        color: T.text,
        outline: 'none',
        fontSize: '0.82rem',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
        ...props.style,
      }}
    />
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div>
    {label && (
      <label
        style={{
          display: 'block',
          fontSize: '0.6rem',
          color: T.muted,
          marginBottom: 6,
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.8px',
        }}
      >
        {label}
      </label>
    )}
    <textarea
      {...props}
      style={{
        width: '100%',
        background: T.input,
        border: `1px solid ${T.inputBorder}`,
        padding: '9px 12px',
        borderRadius: 7,
        color: T.text,
        outline: 'none',
        fontSize: '0.82rem',
        boxSizing: 'border-box',
        minHeight: 80,
        resize: 'vertical',
        fontFamily: 'inherit',
        transition: 'border-color 0.15s',
        ...props.style,
      }}
    />
  </div>
);

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <h3
      style={{
        fontSize: '0.95rem',
        fontWeight: 800,
        color: T.text,
        marginBottom: sub ? 4 : 0,
        letterSpacing: '-0.2px',
      }}
    >
      {children}
    </h3>
    {sub && <p style={{ fontSize: '0.72rem', color: T.muted }}>{sub}</p>}
  </div>
);

const Divider = () => (
  <div style={{ height: 1, background: T.border, margin: '0 0 20px' }} />
);

const Spinner = () => (
  <span
    style={{
      width: 18,
      height: 18,
      border: `2px solid ${T.green}25`,
      borderTop: `2px solid ${T.green}`,
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.7s linear infinite',
    }}
  />
);

const LoadingState = ({ text = 'Carregando...' }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 40px',
      color: T.muted,
      gap: 12,
      fontSize: '0.8rem',
    }}
  >
    <Spinner />
    {text}
  </div>
);

const MiniBarChart = ({ data, labelKey, valueKey, height = 120, color = T.green }) => {
  if (!data?.length)
    return (
      <p style={{ color: T.muted, fontSize: '0.78rem', textAlign: 'center', padding: 24 }}>
        Sem dados disponíveis
      </p>
    );
  const mx = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height, padding: '0 2px' }}>
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            height: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <span style={{ fontSize: '0.52rem', color: T.muted, fontWeight: 700 }}>
            {d[valueKey]}
          </span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((d[valueKey] / mx) * 80, 3)}%` }}
            transition={{ duration: 0.5, delay: i * 0.04 }}
            style={{
              width: '100%',
              background:
                d[valueKey] === mx
                  ? color
                  : `linear-gradient(180deg, ${color}30, ${color}18)`,
              borderRadius: '3px 3px 0 0',
              border: d[valueKey] === mx ? `1px solid ${color}50` : 'none',
              minHeight: 3,
            }}
          />
          <span style={{ fontSize: '0.48rem', color: T.sub, whiteSpace: 'nowrap' }}>
            {String(d[labelKey] || '').slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Metricas ── */
const MetricasAdmin = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${API_URL}/admin/metricas`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (!data)
    return (
      <p style={{ color: T.red, padding: 40, textAlign: 'center', fontSize: '0.82rem' }}>
        Falha ao carregar métricas.
      </p>
    );

  const planoCor = {
    starter: T.muted,
    pro: T.green,
    business: T.yellow,
    sem_plano: T.red,
  };

  return (
    <motion.div {...fadeUp}>
      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 14,
          marginBottom: 28,
        }}
        className="admin-grid-4"
      >
        <StatBox label="Total de Usuários" value={data.total_usuarios} iconName="users" />
        <StatBox
          label="Receita Mensal"
          value={`R$ ${(data.mrr || 0).toFixed(0)}`}
          sub="MRR estimado"
          iconName="revenue"
        />
        <StatBox label="Total de Fluxos" value={data.total_fluxos} color={T.blue} iconName="flow" />
        <StatBox
          label="Instâncias"
          value={`${data.instancias_conectadas || 0}/${data.total_instancias || 0}`}
          color={T.yellow}
          sub="conectadas"
          iconName="phone"
        />
        <StatBox
          label="Templates"
          value={`${data.templates_ativos || 0}/${data.total_templates || 0}`}
          color={T.purple}
          sub="ativos"
          iconName="template"
        />
        <StatBox
          label="Disparos Hoje"
          value={data.disparos_hoje || 0}
          color={T.blue}
          iconName="send"
        />
      </div>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 24,
        }}
        className="admin-grid-2"
      >
        <div
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 24,
          }}
        >
          <SectionTitle sub="Últimos 7 dias">Novos Cadastros</SectionTitle>
          <Divider />
          <MiniBarChart data={data.cadastros_7d || []} labelKey="dia" valueKey="total" />
        </div>
        <div
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 24,
          }}
        >
          <SectionTitle sub="Últimos 7 dias">Disparos</SectionTitle>
          <Divider />
          <MiniBarChart
            data={data.disparos_7d || []}
            labelKey="dia"
            valueKey="total"
            color={T.blue}
          />
        </div>
      </div>

      {/* Distribution + Top Users */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
        className="admin-grid-2"
      >
        <div
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 24,
          }}
        >
          <SectionTitle sub="Participação por plano">Distribuição de Planos</SectionTitle>
          <Divider />
          {Object.entries(data.usuarios_por_plano || {}).map(([p, total]) => {
            const pct =
              data.total_usuarios > 0 ? Math.round((total / data.total_usuarios) * 100) : 0;
            return (
              <div key={p} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: T.text,
                      textTransform: 'capitalize',
                      fontWeight: 600,
                    }}
                  >
                    {p}
                  </span>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: planoCor[p] || T.muted,
                    }}
                  >
                    {total}{' '}
                    <span style={{ color: T.sub, fontWeight: 400, fontSize: '0.68rem' }}>
                      ({pct}%)
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: T.border,
                    borderRadius: 99,
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6 }}
                    style={{
                      height: '100%',
                      background: planoCor[p] || T.muted,
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 24,
          }}
        >
          <SectionTitle sub="Por fluxos criados">Principais Usuários</SectionTitle>
          <Divider />
          {(data.top_usuarios || []).map((u, i) => (
            <div
              key={u.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderBottom: i < 4 ? `1px solid ${T.border}` : 'none',
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: i === 0 ? T.green : `${T.green}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: i === 0 ? '#081008' : T.green,
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: T.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: 2,
                  }}
                >
                  {u.nome}
                </p>
                <p style={{ fontSize: '0.62rem', color: T.muted }}>{u.email}</p>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  flexShrink: 0,
                }}
              >
                <Icon name="flow" size={11} color={T.green} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: T.green }}>
                  {u.total_fluxos}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Usuarios ── */
const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [filtroPlano, setFiltroPlano] = useState('todos');

  const carregar = useCallback(() => {
    setLoading(true);
    authFetch(`${API_URL}/admin/usuarios`)
      .then((r) => r.json())
      .then((d) => setUsuarios(d.usuarios || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const toggleRole = async (uid, role) => {
    if (!window.confirm(`Alterar role para "${role === 'admin' ? 'user' : 'admin'}"?`)) return;
    try {
      const res = await authFetch(`${API_URL}/admin/usuarios/${uid}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: role === 'admin' ? 'user' : 'admin' }),
      });
      if (res.ok) carregar();
      else {
        const d = await res.json();
        alert(d.detail);
      }
    } catch {
      alert('Erro ao atualizar role.');
    }
  };

  let filtrados = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      u.email.toLowerCase().includes(filtro.toLowerCase())
  );
  if (filtroPlano !== 'todos') filtrados = filtrados.filter((u) => u.plano === filtroPlano);

  const planoCor = { starter: T.muted, pro: T.green, business: T.yellow, sem_plano: T.red };
  const statusCor = {
    ativo: T.green,
    trial: T.blue,
    pendente: T.yellow,
    cancelado: T.red,
    expirado: T.red,
  };

  if (loading) return <LoadingState />;

  return (
    <motion.div {...fadeUp}>
      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <select
          value={filtroPlano}
          onChange={(e) => setFiltroPlano(e.target.value)}
          style={{
            background: T.input,
            border: `1px solid ${T.inputBorder}`,
            padding: '9px 14px',
            borderRadius: 7,
            color: T.text,
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          <option value="todos">Todos os planos</option>
          <option value="sem_plano">Sem plano</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
        </select>
        <span style={{ fontSize: '0.7rem', color: T.muted, whiteSpace: 'nowrap' }}>
          {filtrados.length} de {usuarios.length}
        </span>
        <Btn variant="ghost" onClick={carregar} small iconName="refresh">
          Atualizar
        </Btn>
      </div>

      {/* Table */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: 10,
          border: `1px solid ${T.border}`,
          background: T.card,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.015)' }}>
              {[
                'ID',
                'Nome',
                'E-mail',
                'Plano',
                'Status',
                'Fluxos',
                'Inst.',
                'Cadastro',
                'Role',
                'Ações',
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '11px 14px',
                    textAlign: 'left',
                    color: T.muted,
                    fontWeight: 700,
                    fontSize: '0.58rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    borderBottom: `1px solid ${T.border}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((u, idx) => (
              <motion.tr
                key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                style={{
                  borderBottom:
                    idx < filtrados.length - 1 ? `1px solid ${T.border}` : 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td
                  style={{
                    padding: '10px 14px',
                    color: T.sub,
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                  }}
                >
                  #{u.id}
                </td>
                <td
                  style={{
                    padding: '10px 14px',
                    color: T.text,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  {u.nome}
                </td>
                <td style={{ padding: '10px 14px', color: T.muted, fontSize: '0.72rem' }}>
                  {u.email}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <Badge text={u.plano} color={planoCor[u.plano] || T.muted} />
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <Badge
                    text={u.status_assinatura || '—'}
                    color={statusCor[u.status_assinatura] || T.muted}
                  />
                </td>
                <td
                  style={{
                    padding: '10px 14px',
                    color: T.text,
                    textAlign: 'center',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {u.total_fluxos}
                </td>
                <td
                  style={{
                    padding: '10px 14px',
                    color: T.text,
                    textAlign: 'center',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {u.total_instancias}
                </td>
                <td style={{ padding: '10px 14px', color: T.muted, fontSize: '0.7rem' }}>
                  {u.data_cadastro
                    ? new Date(u.data_cadastro).toLocaleDateString('pt-BR')
                    : '—'}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <Badge
                    text={u.role || 'user'}
                    color={u.role === 'admin' ? T.yellow : T.sub}
                  />
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <Btn
                    variant={u.role === 'admin' ? 'red' : 'ghost'}
                    onClick={() => toggleRole(u.id, u.role)}
                    small
                    iconName={u.role === 'admin' ? 'trash' : 'shield'}
                  >
                    {u.role === 'admin' ? 'Remover' : 'Promover'}
                  </Btn>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <p
            style={{
              padding: 40,
              textAlign: 'center',
              color: T.muted,
              fontSize: '0.8rem',
            }}
          >
            Nenhum resultado encontrado.
          </p>
        )}
      </div>
    </motion.div>
  );
};

/* ── Templates ── */
const TemplatesAdmin = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [fluxos, setFluxos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modo, setModo] = useState('lista');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    fluxo_id: '',
    slug: '',
    nome: '',
    descricao: '',
    categoria: 'geral',
    icone: '',
    cor_destaque: '#25D366',
    plano_minimo: 'starter',
    imagem_url: '',
    imagem_descricao: '',
  });

  const carregar = useCallback(() => {
    setLoading(true);
    Promise.all([
      authFetch(`${API_URL}/admin/templates`).then((r) => r.json()),
      authFetch(`${API_URL}/admin/fluxos`).then((r) => r.json()),
    ])
      .then(([t, f]) => {
        setTemplates(t.templates || []);
        setFluxos(f.fluxos || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const toggleAtivo = async (id) => {
    try {
      await authFetch(`${API_URL}/admin/templates/${id}/toggle`, { method: 'PUT' });
      carregar();
    } catch {}
  };

  const deletar = async (id) => {
    if (!window.confirm('Deletar permanentemente este template?')) return;
    try {
      await authFetch(`${API_URL}/admin/templates/${id}`, { method: 'DELETE' });
      carregar();
    } catch {}
  };

  const promover = async () => {
    setErro('');
    if (!form.fluxo_id) return setErro('Selecione um fluxo.');
    if (!form.slug.trim()) return setErro('Informe o slug.');
    if (!form.nome.trim()) return setErro('Informe o nome.');
    setSalvando(true);
    try {
      const res = await authFetch(`${API_URL}/admin/templates/promover-fluxo`, {
        method: 'POST',
        body: JSON.stringify({ ...form, fluxo_id: parseInt(form.fluxo_id) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.detail || 'Erro ao salvar.');
        return;
      }
      setModo('lista');
      setForm({
        fluxo_id: '',
        slug: '',
        nome: '',
        descricao: '',
        categoria: 'geral',
        icone: '',
        cor_destaque: '#25D366',
        plano_minimo: 'starter',
        imagem_url: '',
        imagem_descricao: '',
      });
      carregar();
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <LoadingState />;

  if (modo === 'promover') {
    return (
      <motion.div {...fadeUp}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          <SectionTitle sub="Promova um fluxo criado no Editor Visual">
            Novo Template
          </SectionTitle>
          <Btn variant="ghost" onClick={() => setModo('lista')} iconName="back">
            Voltar
          </Btn>
        </div>

        <div
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 28,
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              marginBottom: 24,
              padding: 18,
              background: 'rgba(37,211,102,0.03)',
              border: `1px solid rgba(37,211,102,0.12)`,
              borderRadius: 9,
            }}
          >
            <p
              style={{
                fontSize: '0.6rem',
                color: T.green,
                fontWeight: 800,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Passo 1 — Seleção de fluxo
            </p>
            <p style={{ fontSize: '0.75rem', color: T.muted, marginBottom: 14 }}>
              Crie o fluxo no{' '}
              <strong style={{ color: T.text }}>Editor Visual</strong>, salve e selecione
              abaixo.{' '}
              <span
                onClick={() => navigate('/dashboard')}
                style={{
                  color: T.green,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                Ir para o Editor
              </span>
            </p>
            <select
              value={form.fluxo_id}
              onChange={(e) => setForm((p) => ({ ...p, fluxo_id: e.target.value }))}
              style={{
                width: '100%',
                background: T.input,
                border: `1px solid ${T.inputBorder}`,
                padding: '10px 12px',
                borderRadius: 7,
                color: T.text,
                fontSize: '0.82rem',
              }}
            >
              <option value="">Selecionar fluxo...</option>
              {fluxos.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome_fluxo} — {f.usuario_nome} (
                  {new Date(f.data_criacao).toLocaleDateString('pt-BR')})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2 */}
          <p
            style={{
              fontSize: '0.6rem',
              color: T.green,
              fontWeight: 800,
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Passo 2 — Metadados do template
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 14,
            }}
          >
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                }))
              }
              placeholder="ex: clinica-odonto"
            />
            <Input
              label="Nome"
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              placeholder="ex: Clínica Odonto"
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <TextArea
              label="Descrição"
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              placeholder="Descreva o template brevemente..."
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 120px 1fr',
              gap: 14,
              marginBottom: 14,
            }}
            className="admin-grid-4"
          >
            <Input
              label="Categoria"
              value={form.categoria}
              onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
            />
            <Input
              label="Ícone (emoji)"
              value={form.icone}
              onChange={(e) => setForm((p) => ({ ...p, icone: e.target.value }))}
              placeholder="Opcional"
            />
            <Input
              label="Cor destaque"
              type="color"
              value={form.cor_destaque}
              onChange={(e) => setForm((p) => ({ ...p, cor_destaque: e.target.value }))}
            />
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.6rem',
                  color: T.muted,
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                }}
              >
                Plano mínimo
              </label>
              <select
                value={form.plano_minimo}
                onChange={(e) => setForm((p) => ({ ...p, plano_minimo: e.target.value }))}
                style={{
                  width: '100%',
                  background: T.input,
                  border: `1px solid ${T.inputBorder}`,
                  padding: '9px 10px',
                  borderRadius: 7,
                  color: T.text,
                  fontSize: '0.82rem',
                }}
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 24,
            }}
          >
            <Input
              label="URL da imagem"
              value={form.imagem_url}
              onChange={(e) => setForm((p) => ({ ...p, imagem_url: e.target.value }))}
              placeholder="https://..."
            />
            <Input
              label="Alt da imagem"
              value={form.imagem_descricao}
              onChange={(e) => setForm((p) => ({ ...p, imagem_descricao: e.target.value }))}
            />
          </div>

          {erro && (
            <p
              style={{
                color: T.red,
                fontSize: '0.78rem',
                fontWeight: 600,
                marginBottom: 16,
                padding: '10px 14px',
                background: 'rgba(224,82,82,0.07)',
                border: `1px solid rgba(224,82,82,0.2)`,
                borderRadius: 7,
              }}
            >
              {erro}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="ghost" onClick={() => setModo('lista')}>
              Cancelar
            </Btn>
            <Btn onClick={promover} disabled={salvando} iconName="plus">
              {salvando ? 'Salvando...' : 'Criar Template'}
            </Btn>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeUp}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <span style={{ fontSize: '0.78rem', color: T.muted }}>
          {templates.length} template{templates.length !== 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            small
            iconName="external"
          >
            Editor de Fluxos
          </Btn>
          <Btn onClick={() => setModo('promover')} iconName="plus">
            Promover Fluxo
          </Btn>
        </div>
      </div>

      {templates.length === 0 ? (
        <div
          style={{
            padding: 64,
            textAlign: 'center',
            border: `1px dashed ${T.border}`,
            borderRadius: 12,
            background: T.card,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: 'rgba(37,211,102,0.07)',
              border: `1px solid rgba(37,211,102,0.15)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Icon name="template" size={22} color={T.green} />
          </div>
          <p
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: T.text,
              marginBottom: 6,
            }}
          >
            Nenhum template criado
          </p>
          <p style={{ color: T.muted, fontSize: '0.8rem', marginBottom: 20 }}>
            Crie um fluxo no editor visual e promova a template.
          </p>
          <Btn onClick={() => setModo('promover')} iconName="plus">
            Criar Template
          </Btn>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {templates.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ x: 2, borderColor: T.borderHover }}
              transition={{ duration: 0.12 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                borderLeft: `3px solid ${t.cor_destaque}`,
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: `${t.cor_destaque}15`,
                    border: `1px solid ${t.cor_destaque}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: t.icone ? '1.2rem' : undefined,
                  }}
                >
                  {t.icone ? (
                    t.icone
                  ) : (
                    <Icon name="template" size={16} color={t.cor_destaque} />
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: T.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 5,
                    }}
                  >
                    {t.nome}
                  </h4>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Badge text={t.categoria} color={t.cor_destaque} />
                    <Badge text={t.plano_minimo} color={T.muted} />
                    <Badge
                      text={t.ativo ? 'Ativo' : 'Inativo'}
                      color={t.ativo ? T.green : T.red}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <Btn
                  variant="ghost"
                  onClick={() => toggleAtivo(t.id)}
                  small
                >
                  {t.ativo ? 'Desativar' : 'Ativar'}
                </Btn>
                <Btn variant="red" onClick={() => deletar(t.id)} small iconName="trash">
                  Deletar
                </Btn>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ── Main AdminPanel ── */
const AdminPanel = ({ tema = 'escuro' }) => {
  T = makeT(tema);
  const navigate = useNavigate();
  const [aba, setAba] = useState('metricas');
  const [ok, setOk] = useState(null);

  useEffect(() => {
    authFetch(`${API_URL}/admin/check`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.is_admin) navigate('/dashboard');
        else setOk(true);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  if (!ok)
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: T.bg,
          color: T.muted,
          gap: 12,
          fontSize: '0.8rem',
        }}
      >
        <Spinner />
        Verificando acesso...
      </div>
    );

  const abas = [
    { key: 'metricas', label: 'Métricas', iconName: 'chart' },
    { key: 'usuarios', label: 'Usuários', iconName: 'users' },
    { key: 'templates', label: 'Templates', iconName: 'template' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: ${T.sub}; border-radius: 99px }
        select option { background-color: ${T.bg} !important; color: ${T.text} !important }
        input:focus, textarea:focus, select:focus {
          border-color: ${T.green}66 !important;
          box-shadow: 0 0 0 3px ${T.green}11 !important;
        }
        @media (max-width: 768px) {
          .admin-grid-2 { grid-template-columns: 1fr !important }
          .admin-grid-4 { grid-template-columns: 1fr 1fr !important }
        }
      `}</style>


      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 2,
          padding: '0 36px',
          borderBottom: `1px solid ${T.border}`,
          background: T.bgAlt,
        }}
      >
        {abas.map((a) => (
          <button
            key={a.key}
            onClick={() => setAba(a.key)}
            style={{
              padding: '14px 20px',
              borderRadius: 0,
              border: 'none',
              borderBottom: aba === a.key ? `2px solid ${T.green}` : '2px solid transparent',
              background: 'transparent',
              color: aba === a.key ? T.green : T.muted,
              fontWeight: aba === a.key ? 700 : 500,
              cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              letterSpacing: '0.1px',
              marginBottom: -1,
            }}
          >
            <Icon name={a.iconName} size={13} color={aba === a.key ? T.green : T.muted} />
            {a.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          padding: '32px 36px',
          maxWidth: 1320,
          margin: '0 auto',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={aba}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
          >
            {aba === 'metricas' && <MetricasAdmin />}
            {aba === 'usuarios' && <UsuariosAdmin />}
            {aba === 'templates' && <TemplatesAdmin />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;