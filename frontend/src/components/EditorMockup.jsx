import { motion } from "framer-motion";

const FlowNode = ({ top, left, content, options, delay, isActive, type = "txt" }) => {
  const colors = {
    txt: { border: "rgba(37,211,102,0.4)", dot: "#25D366", dotShadow: "rgba(37,211,102,0.8)", label: "#25D366", labelText: "Mensagem de Texto" },
    ia:  { border: "rgba(180,100,255,0.4)", dot: "#b464ff", dotShadow: "rgba(180,100,255,0.8)", label: "#b464ff", labelText: "IA Com Contexto" },
    img: { border: "rgba(100,180,255,0.4)", dot: "#64b4ff", dotShadow: "rgba(100,180,255,0.8)", label: "#64b4ff", labelText: "Imagem" },
  };
  const c = colors[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 160, damping: 20 }}
      style={{
        position: "absolute", top, left,
        width: type === "ia" ? 172 : 160,
        background: "#0f1a0f",
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        overflow: "visible",
        zIndex: 10,
      }}
    >
      <div style={{
        padding: "4px 7px", display: "flex", alignItems: "center", gap: 5,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.02)",
        borderRadius: "8px 8px 0 0",
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, boxShadow: `0 0 5px ${c.dotShadow}`, flexShrink: 0 }} />
        <span style={{ color: c.label, fontSize: "0.5rem", fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase" }}>{c.labelText}</span>
        <span style={{ fontSize: "0.45rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", background: type === "ia" ? "rgba(180,100,255,0.1)" : type === "img" ? "rgba(100,180,255,0.1)" : "rgba(255,255,255,0.06)", borderRadius: 3, padding: "1px 4px", marginLeft: 1 }}>
          {type === "ia" ? "3 s" : "2 s"}
        </span>
        <span style={{ marginLeft: "auto", color: "#ff5555", fontSize: "0.45rem", fontWeight: 700 }}>APAGAR</span>
      </div>

      <div style={{ padding: "6px 7px" }}>

        {type === "txt" && (
          <>
            <p style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.4, margin: "0 0 4px" }}>{content}</p>
            <p style={{ fontSize: "0.45rem", color: "rgba(255,255,255,0.22)", margin: "0 0 5px" }}>{content.length} caracteres</p>
            <p style={{ fontSize: "0.45rem", fontWeight: 700, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: 1, display: "flex", justifyContent: "space-between", margin: "0 0 4px" }}>
              Opções de Resposta <span style={{ color: "#25D366" }}>+ ADD</span>
            </p>
            {options ? options.map((opt, i) => (
              <div key={i} style={{
                padding: "3px 6px", background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4,
                fontSize: "0.5rem", color: "rgba(255,255,255,0.65)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 3, position: "relative",
              }}>
                <span>{i + 1} - {opt}</span>
                <span style={{ color: "#ff5555", fontSize: "0.5rem", fontWeight: 700 }}>✕</span>
                <div style={{ position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: "#25D366", border: "2px solid #0f1a0f" }} />
              </div>
            )) : (
              <p style={{ fontSize: "0.45rem", color: "rgba(255,255,255,0.2)", fontStyle: "italic", textAlign: "center", padding: "3px 0", margin: 0 }}>
                Sem opcoes — saída única pelo fundo
              </p>
            )}
          </>
        )}

        {type === "ia" && (
          <>
            <p style={{ fontSize: "0.45rem", color: "rgba(255,255,255,0.32)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 3px", fontWeight: 700 }}>Modelo de IA</p>
            <div style={{
              width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(180,100,255,0.25)",
              borderRadius: 4, padding: "3px 6px", fontSize: "0.5rem", color: "rgba(255,255,255,0.65)",
              display: "flex", justifyContent: "space-between", marginBottom: 6, boxSizing: "border-box",
            }}>GPT-3.5 Turbo <span style={{ opacity: 0.4 }}>▾</span></div>
            <p style={{ fontSize: "0.45rem", color: "rgba(255,255,255,0.32)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 3px", fontWeight: 700 }}>Instrucao do Bot</p>
            <div style={{
              width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4, padding: "4px 6px", fontSize: "0.5rem", color: "rgba(255,255,255,0.45)",
              lineHeight: 1.4, boxSizing: "border-box", minHeight: 36,
            }}>Ex: Voce é um atendente da empresa X. Responda de forma educada e objetiva sobre nossos produtos...</div>
            <p style={{ fontSize: "0.45rem", color: "rgba(180,100,255,0.55)", margin: "4px 0 0", lineHeight: 1.35 }}>
              A IA responde com base nessa instrucao e no histórico da conversa.
            </p>
          </>
        )}

        {type === "img" && (
          <>
            <div style={{
              width: "100%", borderRadius: 4, background: "rgba(100,180,255,0.06)",
              border: "1px solid rgba(100,180,255,0.2)", overflow: "hidden", marginBottom: 5, boxSizing: "border-box",
            }}>
              <div style={{ width: "100%", height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  width: "80%", height: 24, background: "rgba(255,255,255,0.06)",
                  borderRadius: 3, border: "1px solid rgba(100,180,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.5rem", color: "rgba(100,180,255,0.5)",
                }}>▶ team viewer</div>
              </div>
              <div style={{ fontSize: "0.45rem", color: "rgba(100,180,255,0.6)", textAlign: "center", padding: "2px 0", borderTop: "1px solid rgba(100,180,255,0.1)" }}>
                Remover imagem
              </div>
            </div>
            <p style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.75)", margin: 0 }}>Segue o team viewer do nosso atendime</p>
          </>
        )}
      </div>

      {/* Handle entrada esquerda */}
      <div style={{
        position: "absolute", left: -5, top: "50%", transform: "translateY(-50%)",
        width: 8, height: 8, borderRadius: "50%",
        background: "#1a2a1a", border: `2px solid ${c.border}`,
      }} />

      {/* Handle saída fundo */}
      {(type === "ia" || type === "img" || (type === "txt" && !options)) && (
        <div style={{
          position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
          width: 8, height: 8, borderRadius: "50%",
          background: c.dot, border: "2px solid #0f1a0f",
        }} />
      )}
    </motion.div>
  );
};

const Connector = ({ x1, y1, x2, y2, delay, color = "rgba(37,211,102,0.55)" }) => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5, overflow: "visible" }}>
    <motion.path
      d={`M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`}
      fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="5,4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay: delay + 0.3, duration: 0.9, ease: "easeInOut" }}
    />
    <motion.circle r="3" fill={color.replace(/[\d.]+\)$/, "1)")}>
      <animateMotion dur="2.8s" repeatCount="indefinite" begin={`${delay + 1.2}s`}
        path={`M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`}
      />
    </motion.circle>
  </svg>
);

export default function EditorMockup() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 720, margin: "0 auto", userSelect: "none" }}>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          position: "relative", zIndex: 1, borderRadius: 12,
          border: "1px solid rgba(37,211,102,0.22)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.65)",
          overflow: "hidden", background: "#080e08",
        }}
      >
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "7px 12px", background: "#060b06",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 900, fontSize: "0.78rem", letterSpacing: -0.5, color: "#fff" }}>
              ZAP<span style={{ color: "#25D366" }}>CHAT</span>
            </span>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 5, padding: "3px 9px", fontSize: "0.62rem", color: "rgba(255,255,255,0.7)" }}>
              Exemplo de Fluxo
            </div>
            <span style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.3)" }}>6 nodes · 6 conexões</span>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {["[ ]", "MAPA", "VOLTAR"].map(label => (
              <span key={label} style={{ border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.7)", padding: "4px 10px", borderRadius: 5, fontSize: "0.52rem", fontWeight: 700 }}>{label}</span>
            ))}
            <span style={{ background: "#25D366", color: "#060b06", padding: "4px 12px", borderRadius: 5, fontSize: "0.52rem", fontWeight: 900 }}>SALVAR</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", height: 500 }}>

          {/* Sidebar */}
          <div style={{
            width: 130, background: "#060b06", padding: "10px 8px",
            borderRight: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
            display: "flex", flexDirection: "column", gap: 7,
          }}>
            <p style={{ fontSize: "0.45rem", fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 1px" }}>Adicionar Bloco</p>

            {[
              { title: "TEXTO",          desc: "Mensagem com delay e opcoes ramificadas.", bg: "rgba(37,211,102,0.08)",  border: "rgba(37,211,102,0.3)",  color: "#25D366" },
              { title: "IMAGEM",         desc: "Envie imagem com legenda opcional.",       bg: "rgba(100,180,255,0.08)", border: "rgba(100,180,255,0.3)", color: "#64b4ff" },
              { title: "IA COM CONTEXTO",desc: "Bot com IA baseado no histórico.",         bg: "rgba(180,100,255,0.08)", border: "rgba(180,100,255,0.3)", color: "#b464ff" },
            ].map(b => (
              <div key={b.title} style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: 6, padding: "7px 8px" }}>
                <p style={{ color: b.color, fontWeight: 900, fontSize: "0.6rem", margin: "0 0 2px" }}>{b.title}</p>
                <p style={{ fontSize: "0.48rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.35, margin: 0 }}>{b.desc}</p>
              </div>
            ))}

            <div style={{ marginTop: "auto" }}>
              <p style={{ fontSize: "0.45rem", fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 5px" }}>Legenda</p>
              {[
                { color: "#25D366",              label: "Opcoes de resposta" },
                { color: "rgba(37,211,102,0.35)",label: "Fluxo padrao" },
                { color: "#64b4ff",              label: "Saida de imagem" },
                { color: "#b464ff",              label: "Saida de IA" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.48rem", color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                  {l.label}
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 7 }}>
              <p style={{ fontSize: "0.45rem", fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 5px" }}>Atalhos</p>
              {[["Ctrl+S","Salvar"],["Scroll","Zoom in/out"],["Arrastar","Mover canvas"],["1 seq","Ver tudo"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 3, padding: "1px 4px", fontSize: "0.42rem", color: "rgba(255,255,255,0.45)", fontFamily: "monospace" }}>{k}</span>
                  <span style={{ fontSize: "0.42rem", color: "rgba(255,255,255,0.28)" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#0a110a" }}>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }} />

            <Connector x1={160} y1={75}  x2={210} y2={48}  delay={0.9} />
            <Connector x1={160} y1={94}  x2={210} y2={188} delay={1.1} />
            <Connector x1={370} y1={57}  x2={390} y2={168} delay={1.2} color="rgba(180,100,255,0.5)" />
            <Connector x1={370} y1={74}  x2={370} y2={188} delay={1.3} />
            <Connector x1={290} y1={272} x2={290} y2={342} delay={1.5} color="rgba(100,180,255,0.5)" />
            <Connector x1={476} y1={320} x2={370} y2={342} delay={1.6} color="rgba(180,100,255,0.45)" />

            <FlowNode top={20}  left={6}   type="txt" content="Olá, como posso te ajudar hoje?"                                           options={["Desejo falar com suporte.", "Desejo encerrar por aqui."]} delay={0.4} isActive />
            <FlowNode top={10}  left={210} type="txt" content="Qual área de suporte você gostaria de falar?"                              options={["Infraestrutura", "Vendas"]}                             delay={0.6} />
            <FlowNode top={158} left={210} type="txt" content="Obrigado! Caso queira falar conosco novamente só enviar uma mensagem :)"                                                                      delay={0.8} />
            <FlowNode top={148} left={390} type="ia"  content=""                                                                                                                                             delay={1.0} />
            <FlowNode top={342} left={210} type="img" content=""                                                                                                                                             delay={1.2} />

            <div style={{ position: "absolute", left: 7, bottom: 8, display: "flex", flexDirection: "column", gap: 3, zIndex: 20 }}>
              {["+", "−", "⤢", "🔒"].map((icon, i) => (
                <div key={i} style={{
                  width: 20, height: 20, background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", color: "rgba(255,255,255,0.45)",
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
          fontSize: "0.48rem", fontWeight: 900, letterSpacing: 0.8,
          zIndex: 10, textTransform: "uppercase", whiteSpace: "nowrap",
        }}
      >✦ Editor Visual Real do ZapChat</motion.div>

      {/* Tooltip inferior */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}
        style={{
          position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)",
          background: "rgba(8,14,8,0.96)", border: "1px solid rgba(37,211,102,0.28)",
          borderRadius: 9, padding: "7px 14px", zIndex: 10, whiteSpace: "nowrap",
        }}
      >
        <p style={{ color: "#25D366", fontWeight: 800, fontSize: "0.55rem", margin: "0 0 1px" }}>↔ Arraste e conecte blocos visualmente</p>
        <p style={{ fontSize: "0.48rem", opacity: 0.45, margin: 0 }}>Sem código — igual ao editor real</p>
        <div style={{
          position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)",
          width: 0, height: 0, borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent", borderBottom: "7px solid rgba(37,211,102,0.35)",
        }} />
      </motion.div>
    </div>
  );
}