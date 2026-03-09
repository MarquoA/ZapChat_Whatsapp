import { motion } from "framer-motion";

// ── Nó do fluxo ───────────────────────────────────────────────────────────────
const FlowNode = ({ top, left, content, options, delay, isActive }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 160, damping: 20 }}
    style={{
      position: "absolute", top, left,
      width: 192,
      background: "#0f1a0f",
      border: `1px solid ${isActive ? "rgba(37,211,102,0.45)" : "rgba(255,255,255,0.09)"}`,
      borderRadius: 10,
      boxShadow: isActive
        ? "0 0 0 1px rgba(37,211,102,0.2), 0 8px 28px rgba(0,0,0,0.55)"
        : "0 8px 28px rgba(0,0,0,0.55)",
      overflow: "visible",
      zIndex: 10,
    }}
  >
    <div style={{
      padding: "6px 10px",
      display: "flex", alignItems: "center", gap: 8,
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(255,255,255,0.02)",
      borderRadius: "10px 10px 0 0",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#25D366", boxShadow: "0 0 6px rgba(37,211,102,0.8)", flexShrink: 0 }} />
      <span style={{ color: "#25D366", fontSize: "0.55rem", fontWeight: 800, letterSpacing: 1 }}>✕ 2 SEC</span>
      <span style={{ marginLeft: "auto", color: "#ff5555", fontSize: "0.55rem", fontWeight: 700 }}>APAGAR</span>
    </div>
    <div style={{ padding: "10px 10px 8px" }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 500, margin: "0 0 10px", lineHeight: 1.5, color: "rgba(255,255,255,0.85)" }}>{content}</p>
      {options && (
        <div>
          <p style={{ fontSize: "0.48rem", fontWeight: 700, opacity: 0.3, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 6px" }}>
            Opções de resposta <span style={{ float: "right", color: "#25D366", opacity: 1 }}>+ ADD</span>
          </p>
          {options.map((opt, i) => (
            <div key={i} style={{
              padding: "5px 8px", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
              fontSize: "0.62rem", marginBottom: 4, color: "rgba(255,255,255,0.72)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              position: "relative",
            }}>
              <span>{i + 1} - {opt}</span>
              <span style={{ color: "#ff5555", fontSize: "0.6rem", fontWeight: 700 }}>✕</span>
              <div style={{
                position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)",
                width: 10, height: 10, borderRadius: "50%",
                background: "#25D366", border: "2px solid #0f1a0f",
                boxShadow: "0 0 6px rgba(37,211,102,0.7)",
              }} />
            </div>
          ))}
        </div>
      )}
    </div>
    {!options && (
      <div style={{
        position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
        width: 11, height: 11, borderRadius: "50%",
        background: "#25D366", border: "2px solid #0f1a0f",
        boxShadow: "0 0 7px rgba(37,211,102,0.8)",
      }} />
    )}
    <div style={{
      position: "absolute", top: "50%", left: -6, transform: "translateY(-50%)",
      width: 11, height: 11, borderRadius: "50%",
      background: "#1a2a1a", border: "2px solid rgba(37,211,102,0.5)",
      boxShadow: "0 0 5px rgba(37,211,102,0.4)",
    }} />
  </motion.div>
);

const Connector = ({ x1, y1, x2, y2, delay }) => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5, overflow: "visible" }}>
    <motion.path
      d={`M ${x1} ${y1} C ${x1 + 70} ${y1}, ${x2 - 70} ${y2}, ${x2} ${y2}`}
      fill="none" stroke="rgba(37,211,102,0.55)" strokeWidth="1.8" strokeDasharray="7,5"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay: delay + 0.3, duration: 0.9, ease: "easeInOut" }}
    />
    <motion.circle r="3.5" fill="#25D366" style={{ filter: "drop-shadow(0 0 5px #25D366)" }}>
      <animateMotion dur="2.8s" repeatCount="indefinite" begin={`${delay + 1.2}s`}
        path={`M ${x1} ${y1} C ${x1 + 70} ${y1}, ${x2 - 70} ${y2}, ${x2} ${y2}`}
      />
    </motion.circle>
  </svg>
);

export default function EditorMockup() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 580, margin: "0 auto", userSelect: "none" }}>
      <div style={{
        position: "absolute", inset: "-20px", zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(37,211,102,0.07) 0%, transparent 70%)"
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          position: "relative", zIndex: 1, borderRadius: 14,
          border: "1px solid rgba(37,211,102,0.2)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
          overflow: "hidden", background: "#080e08",
        }}
      >
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", background: "#060b06",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontWeight: 900, fontSize: "0.82rem", letterSpacing: -0.5 }}>
              ZAP<span style={{ color: "#25D366" }}>CHAT</span>
            </span>
            <div style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 7, padding: "5px 14px", fontSize: "0.68rem", color: "rgba(255,255,255,0.75)", fontWeight: 500,
            }}>Exemplo de Fluxo</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.75)", padding: "7px 18px", borderRadius: 8, fontSize: "0.62rem", fontWeight: 800 }}>VOLTAR</span>
            <span style={{ background: "#25D366", color: "#060a06", padding: "7px 18px", borderRadius: 8, fontSize: "0.62rem", fontWeight: 900, boxShadow: "0 0 14px rgba(37,211,102,0.3)" }}>SALVAR</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", height: 290 }}>

          {/* Sidebar */}
          <div style={{
            width: 148, background: "#060b06", padding: "14px 10px",
            borderRight: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <p style={{ fontSize: "0.5rem", fontWeight: 800, opacity: 0.35, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 2px" }}>COMPONENTES</p>

            <motion.div
              animate={{ boxShadow: ["0 0 0px rgba(37,211,102,0)", "0 0 14px rgba(37,211,102,0.28)", "0 0 0px rgba(37,211,102,0)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ background: "rgba(37,211,102,0.07)", border: "1px solid rgba(37,211,102,0.28)", borderRadius: 9, padding: "10px 10px" }}
            >
              <p style={{ color: "#25D366", fontWeight: 900, fontSize: "0.72rem", margin: "0 0 3px" }}>+ TEXTO</p>
              <p style={{ fontSize: "0.58rem", opacity: 0.45, margin: 0, lineHeight: 1.45 }}>Nova mensagem com delay.</p>
            </motion.div>

            <div style={{
              marginTop: "auto", background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, padding: "10px 10px",
            }}>
              <p style={{ color: "#25D366", fontWeight: 800, fontSize: "0.6rem", margin: "0 0 7px" }}>DICAS ÚTEIS</p>
              {[
                "Arraste os pontos verdes para conectar.",
                "Use o DELAY para simular digitação.",
                "Ao apagar uma opção, o link some automaticamente.",
              ].map((tip, i) => (
                <p key={i} style={{ fontSize: "0.55rem", opacity: 0.45, margin: "0 0 4px", lineHeight: 1.45 }}>• {tip}</p>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#0a110a" }}>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }} />
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(ellipse 80% 70% at 55% 45%, rgba(37,211,102,0.04) 0%, transparent 65%)",
            }} />

            {/* Conectores */}
            <Connector x1={174} y1={88}  x2={270} y2={62}  delay={0.9} />
            <Connector x1={174} y1={112} x2={270} y2={198} delay={1.1} />
            <Connector x1={462} y1={74}  x2={340} y2={188} delay={1.4} />

            {/* Nó 1 */}
            <FlowNode
              top={24} left={10}
              content="Olá!"
              options={["Desejo falar com suporte.", "Desejo encerrar por aqui."]}
              delay={0.4} isActive
            />

            {/* Nó 2 */}
            <FlowNode
              top={8} left={250}
              content="Qual área de suporte você gostaria de falar?"
              options={["Infraestrutura", "Vendas"]}
              delay={0.6}
            />

            {/* Nó 3 */}
            <FlowNode
              top={162} left={250}
              content="Obrigado, caso queira falar conosco novamente só enviar uma mensagem :)"
              delay={0.8}
            />

            {/* Controles de zoom */}
            <div style={{ position: "absolute", left: 8, bottom: 10, display: "flex", flexDirection: "column", gap: 3, zIndex: 20 }}>
              {["+", "−", "⤢", "🔒"].map((icon, i) => (
                <div key={i} style={{
                  width: 24, height: 24, background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", cursor: "default",
                }}>{icon}</div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
        style={{
          position: "absolute", top: 38, left: "50%", transform: "translateX(-50%)",
          background: "#25D366", color: "#060a06", padding: "3px 13px", borderRadius: 20,
          fontSize: "0.55rem", fontWeight: 900, letterSpacing: 0.8,
          zIndex: 10, textTransform: "uppercase", whiteSpace: "nowrap",
          boxShadow: "0 0 14px rgba(37,211,102,0.3)",
        }}
      >✦ Editor Visual Real do ZapChat</motion.div>

      {/* Tooltip inferior */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}
        style={{
          position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)",
          background: "rgba(8,14,8,0.96)", border: "1px solid rgba(37,211,102,0.28)",
          borderRadius: 9, padding: "7px 14px", zIndex: 10,
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)", whiteSpace: "nowrap",
        }}
      >
        <p style={{ color: "#25D366", fontWeight: 800, fontSize: "0.6rem", margin: "0 0 1px" }}>↔ Arraste e conecte blocos visualmente</p>
        <p style={{ fontSize: "0.52rem", opacity: 0.45, margin: 0 }}>Sem código — igual ao editor real</p>
        <div style={{
          position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)",
          width: 0, height: 0, borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent", borderBottom: "7px solid rgba(37,211,102,0.35)",
        }} />
      </motion.div>
    </div>
  );
}