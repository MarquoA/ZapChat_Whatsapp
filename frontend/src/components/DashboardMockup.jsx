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
      padding: "14px 12px",
      position: "relative",
      minWidth: 0,
    }}
  >
    <p style={{ fontSize: "0.48rem", fontWeight: 700, opacity: 0.4, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</p>
    <p style={{ fontSize: highlight ? "1rem" : "1.4rem", fontWeight: 900, color: highlight ? "#25D366" : "white", margin: "0 0 4px", letterSpacing: -0.5, lineHeight: 1.1 }}>{value}</p>
    <p style={{ fontSize: "0.52rem", color: "#25D366", margin: 0, fontWeight: 600, opacity: 0.8 }}>{sub}</p>
  </motion.div>
);

export default function DashboardMockup() {
  const [pulse, setPulse] = useState(false);
  const [msgCount, setMsgCount] = useState(42);

  useEffect(() => {
    const t1 = setInterval(() => setPulse(p => !p), 2000);
    const t2 = setInterval(() => setMsgCount(n => n + Math.floor(Math.random() * 3)), 4000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const menuItems = ["Dashboard", "Instâncias", "WhatsApp", "Disparos", "Chatbot IA", "Configurações"];

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 680, margin: "0 auto", userSelect: "none" }}>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          position: "relative", zIndex: 1,
          borderRadius: 14,
          border: "1px solid rgba(37,211,102,0.25)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          overflow: "hidden",
          background: "#0d130d",
        }}
      >
        {/* Barra do browser */}
        <div style={{
          background: "#080e08", padding: "7px 12px",
          display: "flex", alignItems: "center", gap: 6,
          borderBottom: "1px solid rgba(255,255,255,0.05)"
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#28c840" }} />
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 5,
            padding: "3px 8px", fontSize: "0.52rem", opacity: 0.35,
            textAlign: "center", maxWidth: 200, margin: "0 auto"
          }}>app.zapchat.com.br/dashboard</div>
        </div>

        {/* Layout principal */}
        <div style={{ display: "flex", height: 340 }}>

          {/* Sidebar */}
          <motion.div
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              width: 130, background: "#080e08", padding: "12px 0",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              display: "flex", flexDirection: "column", gap: 1, flexShrink: 0
            }}
          >
            {/* Logo */}
            <div style={{ padding: "0 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 6 }}>
              <span style={{ fontWeight: 900, fontSize: "0.82rem", letterSpacing: -0.5 }}>
                ZAP<span style={{ color: "#25D366" }}>CHAT</span>
              </span>
            </div>

            {/* Menu */}
            {menuItems.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                style={{
                  padding: "7px 12px", fontSize: "0.62rem", fontWeight: 600,
                  color: item === "Dashboard" ? "#25D366" : "rgba(255,255,255,0.38)",
                  background: item === "Dashboard" ? "rgba(37,211,102,0.1)" : "transparent",
                  borderRight: item === "Dashboard" ? "2px solid #25D366" : "none",
                  cursor: "default",
                }}
              >{item}</motion.div>
            ))}

            {/* Plano atual */}
            <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 4 }}>
              <p style={{ fontSize: "0.42rem", opacity: 0.3, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 1 }}>Plano Atual</p>
              <p style={{ fontSize: "0.62rem", color: "#25D366", fontWeight: 800, margin: "0 0 1px" }}>Pro</p>
              <p style={{ fontSize: "0.42rem", color: "rgba(255,255,255,0.3)", margin: 0, cursor: "default" }}>fazer upgrade</p>
            </div>

            {/* Logado como */}
            <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: "0.42rem", opacity: 0.3, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 1 }}>Logado como</p>
              <p style={{ fontSize: "0.62rem", color: "#25D366", fontWeight: 700, margin: 0 }}>Usuário Teste</p>
            </div>
          </motion.div>

          {/* Conteúdo principal */}
          <div style={{ flex: 1, padding: "14px 16px", overflow: "hidden", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Topbar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 900, margin: "0 0 2px", letterSpacing: -0.5 }}>Dashboard</h2>
                <p style={{ fontSize: "0.48rem", opacity: 0.3, margin: 0 }}>Plataforma / Dashboard</p>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: "0.52rem", color: "rgba(255,255,255,0.35)", cursor: "default" }}>SAIR</span>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  style={{
                    background: "#25D366", color: "#060a06", padding: "6px 12px",
                    borderRadius: 7, fontSize: "0.55rem", fontWeight: 900, cursor: "default",
                    whiteSpace: "nowrap"
                  }}
                >+ NOVO FLUXOGRAMA</motion.div>
              </div>
            </div>

            {/* Badge plano */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)",
                borderRadius: 20, padding: "3px 10px",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#25D366", boxShadow: pulse ? "0 0 7px #25D366" : "0 0 3px #25D366", transition: "box-shadow 0.6s" }} />
                <span style={{ fontSize: "0.52rem", fontWeight: 800, color: "#25D366" }}>PLANO PRO</span>
                <span style={{ fontSize: "0.48rem", color: "rgba(255,255,255,0.35)", cursor: "default" }}>fazer upgrade</span>
              </div>
            </motion.div>

            {/* Stat cards */}
            <div style={{ display: "flex", gap: 8 }}>
              <StatCard label="Fluxos Criados"  value="1"                 sub="1 fluxo no banco"  delay={0.4} />
              <StatCard label="Último Fluxo"    value="Exemplo de Fluxo" sub="04/03/2026"         highlight delay={0.5} />
              <StatCard label="Sessões Ativas"  value="0"                 sub="Aguardando bot"    delay={0.6} />
              <StatCard
                label="Status"
                value={
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%", background: "#25D366", flexShrink: 0,
                      boxShadow: pulse ? "0 0 8px #25D366" : "0 0 3px #25D366",
                      transition: "box-shadow 0.6s"
                    }} />
                    Online
                  </span>
                }
                sub="Fluxos prontos"
                delay={0.7}
              />
            </div>

            {/* Lista fluxos */}
            <div>
              <p style={{ fontSize: "0.48rem", fontWeight: 700, opacity: 0.3, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 7px" }}>Seus Fluxos</p>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8, padding: "10px 12px",
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#25D366", boxShadow: "0 0 5px #25D366", flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Exemplo de Fluxo</p>
                    <p style={{ fontSize: "0.48rem", opacity: 0.35, margin: 0 }}>Criado em: 04/03/2026, 11:57:18</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <span style={{ background: "#25D366", color: "#060a06", padding: "4px 10px", borderRadius: 5, fontSize: "0.52rem", fontWeight: 800 }}>EDITAR</span>
                  <span style={{ background: "rgba(255,60,60,0.15)", color: "#ff5555", border: "1px solid rgba(255,60,60,0.3)", padding: "4px 10px", borderRadius: 5, fontSize: "0.52rem", fontWeight: 800 }}>EXCLUIR</span>
                </div>
              </motion.div>

              {/* Segunda linha fantasma para dar profundidade */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                style={{
                  background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)",
                  borderRadius: 8, padding: "8px 12px", marginTop: 5,
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
                <div style={{ height: 6, width: "35%", background: "rgba(255,255,255,0.05)", borderRadius: 3 }} />
                <div style={{ height: 6, width: "20%", background: "rgba(255,255,255,0.03)", borderRadius: 3, marginLeft: "auto" }} />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badge topo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          position: "absolute", top: 34, left: "50%", transform: "translateX(-50%)",
          background: "#25D366", color: "#060a06",
          padding: "3px 12px", borderRadius: 20, fontSize: "0.52rem", fontWeight: 900,
          letterSpacing: 0.8, zIndex: 10, textTransform: "uppercase", whiteSpace: "nowrap"
        }}
      >✦ Dashboard Real do ZapChat</motion.div>

      {/* Bot Online flutuante */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
        style={{
          position: "absolute", bottom: -14, left: 14, zIndex: 10,
          background: "#0d1a0d", border: "1px solid rgba(37,211,102,0.28)",
          borderRadius: 10, padding: "8px 12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#25D366", boxShadow: pulse ? "0 0 8px #25D366" : "0 0 3px #25D366", transition: "box-shadow 0.6s" }} />
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#25D366" }}>Bot Online</span>
        </div>
        <p style={{ fontSize: "0.55rem", opacity: 0.45, margin: "2px 0 0" }}>Atendendo agora</p>
      </motion.div>

      {/* Contador de mensagens flutuante */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4 }}
        style={{
          position: "absolute", bottom: -14, right: 14, zIndex: 10,
          background: "#0d1a0d", border: "1px solid rgba(37,211,102,0.2)",
          borderRadius: 10, padding: "8px 12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
        }}
      >
        <p style={{ fontSize: "0.48rem", opacity: 0.35, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 1 }}>Msgs hoje</p>
        <p style={{ fontSize: "0.82rem", fontWeight: 900, color: "#25D366", margin: 0, letterSpacing: -0.5 }}>{msgCount}</p>
      </motion.div>

    </div>
  );
}