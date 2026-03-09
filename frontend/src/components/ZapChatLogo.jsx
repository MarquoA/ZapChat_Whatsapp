import { motion } from 'framer-motion';

const ZapChatLogo = ({ size = 220 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}
    >
      <style>{`
        @keyframes neon-pulse {
          0%, 100% { filter: drop-shadow(0 0 8px #25D366) drop-shadow(0 0 20px rgba(37,211,102,0.6)); }
          50%       { filter: drop-shadow(0 0 18px #25D366) drop-shadow(0 0 45px rgba(37,211,102,0.9)); }
        }
        @keyframes ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ring-spin-rev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes dot-bounce {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.7; }
        }
      `}</style>

      <svg
        viewBox="0 0 220 220"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* ── Definições ── */}
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#0d1f0d" />
            <stop offset="100%" stopColor="#060c06" />
          </radialGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(37,211,102,0.18)" />
            <stop offset="100%" stopColor="rgba(37,211,102,0)" />
          </radialGradient>
          <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongNeon" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="circleClip">
            <circle cx="110" cy="105" r="72" />
          </clipPath>
        </defs>

        {/* ── Glow de fundo radial ── */}
        <circle cx="110" cy="105" r="105" fill="url(#glowGrad)" />

        {/* ── Círculo base escuro ── */}
        <circle cx="110" cy="105" r="76"
          fill="url(#bgGrad)"
          stroke="rgba(37,211,102,0.15)"
          strokeWidth="1"
        />

        {/* ── Anel externo girando (animado via CSS) ── */}
        <g style={{ transformOrigin: '110px 105px', animation: 'ring-spin 18s linear infinite' }}>
          <circle cx="110" cy="105" r="86"
            fill="none"
            stroke="rgba(37,211,102,0.25)"
            strokeWidth="1.5"
            strokeDasharray="12 8"
          />
        </g>

        {/* ── Anel médio girando ao contrário ── */}
        <g style={{ transformOrigin: '110px 105px', animation: 'ring-spin-rev 12s linear infinite' }}>
          <circle cx="110" cy="105" r="96"
            fill="none"
            stroke="rgba(37,211,102,0.12)"
            strokeWidth="1"
            strokeDasharray="4 16"
          />
        </g>

        {/* ── Ícone WhatsApp — balão ── */}
        <g filter="url(#strongNeon)" style={{ animation: 'neon-pulse 3s ease-in-out infinite' }}>
          {/* Balão principal */}
          <path
            d="M110 68
               C88 68 70 83 70 101
               C70 112 76 122 86 128
               L82 142
               L98 134
               C102 135 106 136 110 136
               C132 136 150 121 150 101
               C150 83 132 68 110 68 Z"
            fill="none"
            stroke="#25D366"
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Pontos internos — circuito / IA */}
          {/* Ponto esquerdo */}
          <circle cx="97" cy="101" r="4" fill="#25D366"
            style={{ animation: 'dot-bounce 2s ease-in-out infinite' }}
          />
          {/* Ponto central */}
          <circle cx="110" cy="101" r="4" fill="#25D366"
            style={{ animation: 'dot-bounce 2s ease-in-out 0.3s infinite' }}
          />
          {/* Ponto direito */}
          <circle cx="123" cy="101" r="4" fill="#25D366"
            style={{ animation: 'dot-bounce 2s ease-in-out 0.6s infinite' }}
          />

          {/* Linhas de conexão entre pontos */}
          <line x1="101" y1="101" x2="106" y2="101" stroke="#25D366" strokeWidth="1.5" opacity="0.6" />
          <line x1="114" y1="101" x2="119" y2="101" stroke="#25D366" strokeWidth="1.5" opacity="0.6" />

          {/* Curva superior decorativa */}
          <path
            d="M90 88 Q110 82 130 88"
            fill="none" stroke="rgba(37,211,102,0.3)" strokeWidth="1" strokeDasharray="3 4"
          />
        </g>

        {/* ── Texto ZAPCHAT ── */}
        <text
          x="110" y="168"
          textAnchor="middle"
          fontSize="18"
          fontWeight="900"
          letterSpacing="1"
          fill="white"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          ZAP<tspan fill="#25D366">CHAT</tspan>
        </text>

        {/* ── Linha decorativa abaixo do texto ── */}
        <line x1="72" y1="174" x2="148" y2="174"
          stroke="rgba(37,211,102,0.25)" strokeWidth="1"
        />

        {/* ── Pontos cantos decorativos ── */}
        <circle cx="72"  cy="174" r="2" fill="#25D366" opacity="0.5" />
        <circle cx="148" cy="174" r="2" fill="#25D366" opacity="0.5" />

        {/* ── Tagline micro ── */}
        <text
          x="110" y="186"
          textAnchor="middle"
          fontSize="7"
          fontWeight="600"
          letterSpacing="2.5"
          fill="rgba(255,255,255,0.3)"
          style={{ fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}
        >
          API OFICIAL META
        </text>
      </svg>
    </motion.div>
  );
};

export default ZapChatLogo;