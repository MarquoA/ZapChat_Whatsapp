import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const PlanCard = ({ name, price, description, features, highlight }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -15, scale: 1.02, zIndex: 10 }}
    transition={{ type: "spring", stiffness: 300 }}
    style={{ 
      flex: 1,
      background: highlight ? '#162116' : 'rgba(255,255,255,0.02)',
      padding: '50px 40px',
      borderRadius: '30px',
      border: highlight ? '1px solid var(--brand-green)' : '1px solid rgba(255,255,255,0.1)',
      minWidth: '320px',
      maxWidth: '380px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      backdropFilter: 'blur(10px)'
    }}
  >
    {highlight && (
      <span style={{ 
        position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', 
        background: 'var(--brand-green)', color: '#0d140d', padding: '6px 18px', 
        borderRadius: '20px', fontSize: '0.7rem', fontWeight: '900' 
      }}>
        MAIS POPULAR
      </span>
    )}
    
    <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', opacity: 0.9 }}>{name}</h3>
    <p style={{ fontSize: '0.85rem', opacity: 0.4, marginBottom: '25px', minHeight: '40px' }}>{description}</p>
    <div style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '35px' }}>
      R$ {price}<span style={{ fontSize: '1rem', opacity: 0.4 }}>/mês</span>
    </div>
    
    <div style={{ flexGrow: 1 }}>
      {features.map((f, j) => (
        <p key={j} style={{ 
          marginBottom: '15px', fontSize: '0.9rem', opacity: 0.7, 
          display: 'flex', alignItems: 'center', gap: '12px' 
        }}>
          <span style={{ color: 'var(--brand-green)', fontWeight: 'bold' }}>✓</span> {f}
        </p>
      ))}
    </div>

    <button style={{ 
      marginTop: '40px', width: '100%', padding: '18px', borderRadius: '12px', border: 'none', 
      background: highlight ? 'var(--brand-green)' : 'rgba(255,255,255,0.05)', 
      color: highlight ? '#0d140d' : 'white', fontWeight: '800', cursor: 'pointer',
      transition: '0.3s'
    }}>
      ASSINAR AGORA
    </button>
  </motion.div>
);

const Technology = () => {
  return (
    <div style={{ backgroundColor: '#0d140d', color: 'var(--text-primary)', overflowX: 'hidden', minHeight: '100vh' }}>
      <Navbar />
      
      <main style={{ position: 'relative' }}>
        <div style={{ 
          position: 'absolute', top: '0', right: '0', width: '100%', height: '800px',
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(37, 211, 102, 0.08) 0%, transparent 50%)',
          pointerEvents: 'none', zIndex: 0
        }} />

        <section style={{ padding: '180px 10% 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: '900', letterSpacing: '-4px', lineHeight: 0.9, marginBottom: '25px' }}>
              A estrutura certa para <br/>
              <span style={{ color: 'var(--brand-green)' }}>cada fase do seu jogo.</span>
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.5, maxWidth: '600px', margin: '0 auto' }}>
              Compare as vantagens e escolha a potência ideal para sua operação.
            </p>
          </motion.div>
        </section>

        <section style={{ padding: '40px 10% 100px', display: 'flex', gap: '25px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <PlanCard 
            name="Starter" 
            price="197" 
            description="Para quem precisa organizar o fluxo e não perder nenhum cliente."
            features={["1 Conexão Oficial Meta", "IA Generativa Padrão", "Atendimento 24h Automático", "Dashboard de Métricas", "Suporte via Email"]} 
          />
          <PlanCard 
            name="Pro" 
            price="447" 
            highlight={true}
            description="Para operações que buscam escala e conversão agressiva."
            features={["Tudo do Starter, mais:", "3 Conexões Simultâneas", "IA com Memória de Contexto", "Disparos em Massa", "Webhooks & API", "Suporte VIP via WhatsApp"]} 
          />
          <PlanCard 
            name="Business" 
            price="897" 
            description="A solução definitiva para grandes empresas e agências."
            features={["Tudo do Pro, mais:", "Conexões Oficiais Ilimitadas", "Treinamento de IA Customizado", "Remoção da marca ZapChat", "Gerente de Conta Exclusivo", "Acesso Antecipado"]} 
          />
        </section>

        <section style={{ padding: '100px 10%', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'flex', gap: '50px', alignItems: 'center', padding: '60px', 
            borderRadius: '40px', border: '1px solid rgba(37, 211, 102, 0.2)',
            background: 'rgba(8, 12, 8, 0.5)', backdropFilter: 'blur(10px)'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--brand-green)', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '20px' }}>TECNOLOGIA OFICIAL</div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '20px', letterSpacing: '-1px' }}>Risco zero de banimento.</h2>
              <p style={{ opacity: 0.5, lineHeight: '1.8', fontSize: '1.1rem' }}>
                O ZapChat utiliza a <strong>API Cloud Oficial da Meta</strong>. Seu número opera dentro das regras, com estabilidade garantida e proteção total contra quedas.
              </p>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                { t: "Conexão Direta", d: "Sem emuladores." },
                { t: "Criptografia", d: "Dados protegidos." },
                { t: "API Oficial", d: "Aprovado pela Meta." },
                { t: "Uptime 99.9%", d: "Sempre online." }
              ].map((item, i) => (
                <div key={i} style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ color: 'var(--brand-green)', marginBottom: '5px', fontSize: '1rem', fontWeight: '800' }}>{item.t}</h4>
                  <p style={{ fontSize: '0.8rem', opacity: 0.4 }}>{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '120px 10%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '80px', letterSpacing: '-1px' }}>
            3 Passos para o <span style={{ color: 'var(--brand-green)' }}>Lucro</span>
          </h2>
          <div style={{ display: 'flex', gap: '40px' }}>
            {[
              { step: "01", t: "Conecte seu Número", d: "Escaneie o QR Code oficial e valide sua instância em segundos." },
              { step: "02", t: "Treine sua IA", d: "Suba seus textos ou manuais. A IA aprende sobre seu produto instantaneamente." },
              { step: "03", t: "Ative a Escala", d: "Solte o bot para atender e vender enquanto você foca no estratégico." }
            ].map((item, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'left', padding: '40px', background: 'rgba(255,255,255,0.01)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: '900', color: 'rgba(37, 211, 102, 0.15)', display: 'block', marginBottom: '10px' }}>{item.step}</span>
                <h4 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '15px' }}>{item.t}</h4>
                <p style={{ opacity: 0.4, fontSize: '1rem', lineHeight: '1.6' }}>{item.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ padding: '80px 10% 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ opacity: 0.3, fontSize: '0.8rem' }}>© 2026 ZAPCHAT TECNOLOGIA LTDA. TODOS OS DIREITOS RESERVADOS.</p>
      </footer>
    </div>
  );
};

export default Technology;