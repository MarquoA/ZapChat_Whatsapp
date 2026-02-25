import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import Typewriter from 'typewriter-effect';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '15px 0' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', background: 'none', border: 'none', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
          color: 'var(--text-primary)', textAlign: 'left', fontSize: '1rem', fontWeight: '600'
        }}
      >
        {question}
        <span style={{ color: 'var(--brand-green)', fontSize: '1.2rem' }}>{isOpen ? '-' : '+'}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 0.6 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', paddingTop: '10px', fontSize: '0.9rem', lineHeight: '1.5' }}
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Home = () => {
  return (
    <div style={{ backgroundColor: '#0d140d', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <Navbar />
      
      <main>
        <section style={{ 
          position: 'relative',
          height: '110vh', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 10%',
          backgroundImage: 'linear-gradient(to bottom, rgba(13, 20, 13, 0.2) 0%, #0d140d 95%), url("https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginBottom: '-10vh'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{ maxWidth: '800px', zIndex: 2 }}
          >
            <div style={{ 
              padding: '4px 12px', borderRadius: '20px', background: 'rgba(37, 211, 102, 0.1)',
              color: 'var(--brand-green)', fontSize: '0.65rem', fontWeight: '700',
              marginBottom: '20px', border: '1px solid rgba(37, 211, 102, 0.3)',
              display: 'inline-block', textTransform: 'uppercase', letterSpacing: '2px'
            }}>
              IA Oficial & Anti-Ban
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: '1.1', fontWeight: '900', marginBottom: '20px', letterSpacing: '-3px' }}>
              Faça com que seu WhatsApp <br/>
              <span style={{ color: 'var(--brand-green)' }}>
                <Typewriter
                  options={{
                    autoStart: true,
                    loop: false,
                    cursor: '|',
                    delay: 70,
                  }}
                  onInit={(typewriter) => {
                    typewriter
                      .typeString('se organize.')
                      .pauseFor(700)
                      .deleteAll()
                      .typeString('venda mais.')
                      .pauseFor(700)
                      .deleteAll()
                      .typeString('trabalhe para você.')
                      .start();
                  }}
                />
              </span>
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.7, maxWidth: '480px', marginBottom: '35px' }}>
              Integre a API oficial da Meta com nossa IA para converter conversas em vendas 24/7.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              style={{ background: 'var(--brand-green)', color: '#0d140d', padding: '18px 38px', borderRadius: '10px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
            >
              COMEÇAR AGORA
            </motion.button>
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ position: 'absolute', bottom: '15vh', left: '50%', transform: 'translateX(-50%)', opacity: 0.3 }}
          >
            <span style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>SCROLL</span>
          </motion.div>
        </section>

        <section style={{ padding: '120px 10%', position: 'relative', background: '#0d140d' }}>
          <div style={{ marginBottom: '80px', position: 'relative' }}>
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              style={{ color: 'var(--brand-green)', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '3px' }}
            >
              INFRAESTRUTURA
            </motion.span>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', marginTop: '10px' }}>
              O padrão ouro do <span style={{ color: 'var(--brand-green)' }}>WhatsApp.</span>
            </h2>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px' 
          }}>
            {[
              { 
                n: "01", 
                t: "Estabilidade Total", 
                d: "Esqueça instabilidades de emuladores. Nossa conexão via API Cloud oficial garante 99.9% de uptime.",
                gradient: "linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, transparent 100%)"
              },
              { 
                n: "02", 
                t: "Cérebro Digital", 
                d: "Uma IA treinada com os dados do seu negócio. Ela não apenas responde, ela converte dúvidas em vendas.",
                gradient: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)"
              },
              { 
                n: "03", 
                t: "Escala Infinita", 
                d: "Distribuição inteligente de leads. Atenda 10 ou 10.000 clientes simultaneamente com a mesma fluidez.",
                gradient: "linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, transparent 100%)"
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ scale: 1.02 }}
                style={{ 
                  position: 'relative',
                  background: f.gradient,
                  padding: '60px 40px', 
                  borderRadius: '30px', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  overflow: 'hidden',
                  cursor: 'default'
                }}
              >
                <span style={{ 
                  position: 'absolute',
                  right: '-10px',
                  bottom: '-20px',
                  fontSize: '10rem',
                  fontWeight: '900',
                  color: 'rgba(255,255,255,0.03)',
                  zIndex: 0,
                  userSelect: 'none'
                }}>
                  {f.n}
                </span>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    background: 'var(--brand-green)', 
                    color: '#0d140d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    marginBottom: '30px',
                    fontSize: '0.9rem',
                    boxShadow: '0 0 20px rgba(37, 211, 102, 0.4)'
                  }}>
                    {f.n}
                  </div>
                  <h3 style={{ marginBottom: '15px', fontSize: '1.6rem', fontWeight: '800' }}>{f.t}</h3>
                  <p style={{ opacity: 0.5, lineHeight: '1.7', fontSize: '1rem', maxWidth: '80%' }}>{f.d}</p>
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(circle at center, rgba(37, 211, 102, 0.05) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }}
                />
              </motion.div>
            ))}
          </div>
        </section>

        <section id="plans" style={{ padding: '100px 10%', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1px' }}>Escolha sua escala.</h2>
            <p style={{ opacity: 0.5, fontSize: '1.1rem' }}>Sem taxas escondidas. Cancele quando quiser.</p>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '25px', 
            justifyContent: 'center', 
            flexWrap: 'nowrap', 
            overflowX: 'auto', 
            padding: '40px 0' 
          }}>
            {[
              { name: "Starter", price: "197", features: ["1 Conexão Oficial", "IA Generativa Básica", "Suporte via Email", "Dashboard Mensal"] },
              { name: "Pro", price: "447", features: ["3 Conexões Oficiais", "IA Generativa Avançada", "Suporte via WhatsApp", "Dashboard em Tempo Real"], highlight: true },
              { name: "Business", price: "897", features: ["Conexões Ilimitadas", "Treinamento de IA Custom", "Gerente de Conta", "Acesso antecipado"] }
            ].map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -15, scale: 1.02, zIndex: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ 
                  background: p.highlight ? '#162116' : 'rgba(255,255,255,0.02)',
                  padding: '50px 40px',
                  borderRadius: '30px',
                  border: p.highlight ? '1px solid var(--brand-green)' : '1px solid rgba(255,255,255,0.1)',
                  minWidth: '320px',
                  maxWidth: '350px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {p.highlight && (
                  <span style={{ 
                    position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', 
                    background: 'var(--brand-green)', color: '#0d140d', padding: '6px 18px', 
                    borderRadius: '20px', fontSize: '0.7rem', fontWeight: '900' 
                  }}>
                    MAIS POPULAR
                  </span>
                )}
                
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', opacity: 0.9 }}>{p.name}</h3>
                <div style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '35px' }}>
                  R$ {p.price}<span style={{ fontSize: '1rem', opacity: 0.4 }}>/mês</span>
                </div>
                
                <div style={{ flexGrow: 1 }}>
                  {p.features.map((f, j) => (
                    <p key={j} style={{ 
                      marginBottom: '15px', fontSize: '0.9rem', opacity: 0.7, 
                      display: 'flex', alignItems: 'center', gap: '12px' 
                    }}>
                      <span style={{ color: 'var(--brand-green)' }}>✓</span> {f}
                    </p>
                  ))}
                </div>

                <button style={{ 
                  marginTop: '40px', width: '100%', padding: '18px', borderRadius: '12px', border: 'none', 
                  background: p.highlight ? 'var(--brand-green)' : 'rgba(255,255,255,0.05)', 
                  color: p.highlight ? '#0d140d' : 'white', fontWeight: '800', cursor: 'pointer',
                  transition: '0.3s'
                }}>
                  ASSINAR AGORA
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        <section style={{ padding: '80px 15%' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '40px', textAlign: 'center' }}>Perguntas Frequentes</h2>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 30px', borderRadius: '20px' }}>
            <FAQItem question="É seguro contra banimento?" answer="Sim. Utilizamos a API Cloud oficial da Meta." />
            <FAQItem question="Preciso deixar o celular ligado?" answer="Não. A conexão é via servidor." />
          </div>
        </section>
      </main>

      <footer style={{ padding: '80px 10% 40px', background: '#080c08', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          <div>
            <h3 style={{ color: 'var(--brand-green)', marginBottom: '20px' }}>ZAPCHAT</h3>
            <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>A solução definitiva para escala de atendimento via WhatsApp utilizando Inteligência Artificial oficial.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px' }}>Produto</h4>
            <ul style={{ listStyle: 'none', opacity: 0.5, fontSize: '0.9rem', lineHeight: '2' }}>
              <li>Tecnologia</li>
              <li>Planos</li>
              <li>API Oficial</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px' }}>Empresa</h4>
            <ul style={{ listStyle: 'none', opacity: 0.5, fontSize: '0.9rem', lineHeight: '2' }}>
              <li>Sobre nós</li>
              <li>Carreiras</li>
              <li>Contato</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px' }}>Social</h4>
            <ul style={{ listStyle: 'none', opacity: 0.5, fontSize: '0.9rem', lineHeight: '2' }}>
              <li>Instagram</li>
              <li>LinkedIn</li>
              <li>YouTube</li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px', textAlign: 'center', opacity: 0.3, fontSize: '0.8rem' }}>
          © 2026 ZAPCHAT TECNOLOGIA LTDA.
        </div>
      </footer>
    </div>
  );
};

export default Home;