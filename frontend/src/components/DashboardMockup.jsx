import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const StatCard = ({ label, value, sub, highlight, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    style={{
      flex: 1,
      background: highlight ? "rgba(37,211,102,0.07)" : "rgba(255,255,255,0.03)",
      border: highlight ? "1px solid rgba(37,211,102,0.3)" : "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10,
      padding: "12px 10px",
      position: "relative",
      boxShadow: highlight ? "0 0 18px rgba(37,211,102,0.07)" : "none",
      minWidth: 0,
    }}
  >
    <p style={{ fontSize: "0.52rem", fontWeight: 700, opacity: 0.4, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</p>
    <p style={{ fontSize: highlight ? "0.85rem" : "1.3rem", fontWeight: 900, color: highlight ? "#25D366" : "white", margin: "0 0 3px", letterSpacing: -0.5, lineHeight: 1.2 }}>{value}</p>
    <p style={{ fontSize: "0.55rem", color: "#25D366", margin: 0, fontWeight: 600, opacity: 0.8 }}>{sub}</p>
  </motion.div>
);

export default function DashboardMockup() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: "relative",
      width: "100%",
      maxWidth: 560,          // ← era 860, reduzido para caber no hero
      margin: "0 auto",
      userSelect: "none",
    }}>
      {/* Glow sutil de fundo */}
      <div style={{
        position: "absolute", inset: "-20px", zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(37,211,102,0.08) 0%, transparent 70%)"
      }} />

      {/* Frame do browser */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          position: "relative", zIndex: 1,
          borderRadius: 14,
          border: "1px solid rgba(37,211,102,0.25)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          overflow: "hidden",
          background: "#0d130d",
          animation: "float 6s ease-in-out infinite",
        }}
      >
        {/* Barra do browser */}
        <div style={{
          background: "#080e08", padding: "8px 14px",
          display: "flex", alignItems: "center", gap: 6,
          borderBottom: "1px solid rgba(255,255,255,0.05)"
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 5,
            padding: "3px 8px", fontSize: "0.55rem", opacity: 0.35,
            textAlign: "center", maxWidth: 200, margin: "0 auto"
          }}>app.zapchat.com.br/dashboard</div>
        </div>

        {/* Conteúdo */}
        <div style={{ display: "flex", height: 260 }}>

          {/* Sidebar */}
          <motion.div
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              width: 130, background: "#080e08", padding: "14px 0",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              display: "flex", flexDirection: "column", gap: 1, flexShrink: 0
            }}
          >
            <div style={{ padding: "0 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 6 }}>
              <span style={{ fontWeight: 900, fontSize: "0.75rem", letterSpacing: -0.5 }}>
                ZAP<span style={{ color: "#25D366" }}>CHAT</span>
              </span>
            </div>
            {["Dashboard", "Instâncias", "WhatsApp", "Chatbot IA", "Configurações"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                style={{
                  padding: "7px 12px", fontSize: "0.65rem", fontWeight: 600,
                  color: item === "Dashboard" ? "#25D366" : "rgba(255,255,255,0.4)",
                  background: item === "Dashboard" ? "rgba(37,211,102,0.1)" : "transparent",
                  borderRight: item === "Dashboard" ? "2px solid #25D366" : "none",
                  cursor: "default"
                }}
              >
                {item}
              </motion.div>
            ))}
            <div style={{ marginTop: "auto", padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: "0.48rem", opacity: 0.3, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 1 }}>Logado como</p>
              <p style={{ fontSize: "0.62rem", color: "#25D366", fontWeight: 700, margin: 0 }}>Usuário Teste</p>
            </div>
          </motion.div>

          {/* Main */}
          <div style={{ flex: 1, padding: "14px 16px", overflow: "hidden", minWidth: 0 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 900, margin: "0 0 2px", letterSpacing: -0.5 }}>Dashboard</h2>
                <p style={{ fontSize: "0.52rem", opacity: 0.3, margin: 0 }}>Plataforma / Dashboard</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.04 }}
                style={{
                  background: "#25D366", color: "#060a06", padding: "6px 10px",
                  borderRadius: 7, fontSize: "0.55rem", fontWeight: 900, cursor: "default",
                  whiteSpace: "nowrap"
                }}
              >
                + NOVO FLUXO
              </motion.div>
            </div>

            {/* Stat cards */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <StatCard label="Fluxos Criados" value="1" sub="no banco" delay={0.4} />
              <StatCard label="Último Fluxo" value="Exemplo de Fluxo" sub="04/03/2026" highlight delay={0.5} />
              <StatCard label="Sessões" value="0" sub="Aguardando" delay={0.6} />
              <StatCard
                label="Status"
                value={
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%", background: "#25D366", flexShrink: 0,
                      boxShadow: pulse ? "0 0 8px #25D366" : "0 0 3px #25D366",
                      transition: "box-shadow 0.6s"
                    }} />
                    On
                  </span>
                }
                sub="Online"
                delay={0.7}
              />
            </div>

            {/* Lista de fluxos */}
            <div>
              <p style={{ fontSize: "0.52rem", fontWeight: 700, opacity: 0.3, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 8px" }}>Seus Fluxos</p>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8, padding: "10px 12px",
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#25D366", boxShadow: "0 0 5px #25D366", flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Exemplo de Fluxo</p>
                    <p style={{ fontSize: "0.52rem", opacity: 0.35, margin: 0 }}>04/03/2026, 11:57</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <span style={{ background: "#25D366", color: "#060a06", padding: "4px 10px", borderRadius: 5, fontSize: "0.55rem", fontWeight: 800 }}>EDITAR</span>
                  <span style={{ background: "rgba(255,60,60,0.15)", color: "#ff5555", border: "1px solid rgba(255,60,60,0.3)", padding: "4px 10px", borderRadius: 5, fontSize: "0.55rem", fontWeight: 800 }}>EXCLUIR</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Anotações — agora DENTRO do contêiner, não para fora ── */}

      {/* Bot Online — canto inferior esquerdo, sobreposto ao frame */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
        style={{
          position: "absolute", bottom: -14, left: 14, zIndex: 10,
          background: "#0d1a0d", border: "1px solid rgba(37,211,102,0.28)",
          borderRadius: 10, padding: "9px 13px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#25D366", animation: "pulse-dot 2s infinite" }} />
          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#25D366" }}>Bot Online</span>
        </div>
        <p style={{ fontSize: "0.6rem", opacity: 0.45, margin: "2px 0 0" }}>Atendendo agora</p>
      </motion.div>

      {/* Badge topo central */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          position: "absolute", top: 36, left: "50%", transform: "translateX(-50%)",
          background: "#25D366", color: "#060a06",
          padding: "3px 12px", borderRadius: 20, fontSize: "0.55rem", fontWeight: 900,
          letterSpacing: 0.8, zIndex: 10, textTransform: "uppercase", whiteSpace: "nowrap"
        }}
      >
        ✦ Dashboard Real do ZapChat
      </motion.div>
    </div>
  );
}