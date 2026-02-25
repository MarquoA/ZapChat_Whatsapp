import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const PolicyCard = ({ title, text }) => (
  <div style={{ 
    padding: '30px', 
    background: 'rgba(255,255,255,0.02)', 
    borderRadius: '20px', 
    border: '1px solid rgba(255,255,255,0.05)',
    height: '100%'
  }}>
    <h4 style={{ color: 'var(--brand-green)', marginBottom: '15px', fontWeight: '800' }}>{title}</h4>
    <p style={{ fontSize: '0.9rem', opacity: 0.5, lineHeight: '1.6' }}>{text}</p>
  </div>
);

const Technology = () => {
  return (
    <div style={{ backgroundColor: '#0d140d', color: 'var(--text-primary)', overflowX: 'hidden', minHeight: '100vh' }}>
      <Navbar />
      
      <main style={{ position: 'relative' }}>
        <div style={{ 
          position: 'absolute', top: '0', left: '0', width: '100%', height: '100vh',
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(37, 211, 102, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0
        }} />

        <section style={{ padding: '220px 10% 120px', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', fontWeight: '900', letterSpacing: '-5px', lineHeight: 0.8, marginBottom: '40px' }}>
              NÃO É APENAS CÓDIGO.<br/>
              <span style={{ color: 'var(--brand-green)' }}>É COMPROMISSO.</span>
            </h1>
            <div style={{ maxWidth: '700px', borderLeft: '4px solid var(--brand-green)', paddingLeft: '30px', marginTop: '40px' }}>
              <p style={{ fontSize: '1.4rem', fontWeight: '500', lineHeight: '1.4', opacity: 0.8 }}>
                Nascemos da necessidade de humanizar a escala. O ZapChat não foi criado para substituir pessoas, mas para dar superpoderes a elas.
              </p>
            </div>
          </motion.div>
        </section>

        <section style={{ padding: '100px 10%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            style={{ position: 'relative' }}
          >
            <div style={{ 
              width: '100%', height: '500px', background: 'rgba(255,255,255,0.02)', 
              borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem'
            }}>
              👤
            </div>
            <div style={{ 
              position: 'absolute', bottom: '-30px', right: '-30px', 
              background: 'var(--brand-green)', color: '#000', padding: '30px', 
              borderRadius: '20px', fontWeight: '900', fontSize: '1.2rem' 
            }}>
              +500 Empresas Atendidas
            </div>
          </motion.div>
          
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '30px' }}>Quem está por trás do ZapChat?</h2>
            <p style={{ opacity: 0.5, lineHeight: '1.8', marginBottom: '20px' }}>
              Sou especialista em automação e apaixonado por eficiência. Desenvolvi o ZapChat após notar que milhares de empresas perdiam vendas preciosas por falta de agilidade no WhatsApp.
            </p>
            <p style={{ opacity: 0.5, lineHeight: '1.8', marginBottom: '30px' }}>
              Minha missão é democratizar o acesso à Inteligência Artificial de ponta, permitindo que pequenos e médios empreendedores compitam de igual para igual com gigantes do mercado.
            </p>
            <button style={{ background: 'transparent', border: '1px solid var(--brand-green)', color: 'var(--brand-green)', padding: '15px 40px', borderRadius: '30px', fontWeight: '700', cursor: 'pointer' }}>
              CONHEÇA MINHA TRAJETÓRIA
            </button>
          </div>
        </section>

        <section style={{ padding: '120px 10%', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900' }}>Nossas <span style={{ color: 'var(--brand-green)' }}>Políticas</span></h2>
            <p style={{ opacity: 0.4 }}>Transparência total com nossos clientes e parceiros.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <PolicyCard 
              title="Segurança de Dados" 
              text="Seguimos rigorosamente a LGPD. Seus dados e os dados de seus clientes são criptografados e nunca compartilhados com terceiros."
            />
            <PolicyCard 
              title="Ética em IA" 
              text="Nossos modelos são treinados para serem honestos e úteis. Repudiamos o uso da nossa tecnologia para SPAM ou práticas ilícitas."
            />
            <PolicyCard 
              title="Política de Reembolso" 
              text="Confiamos tanto no que entregamos que oferecemos 7 dias de garantia incondicional. Se não servir para você, devolvemos cada centavo."
            />
            <PolicyCard 
              title="Uso da API Oficial" 
              text="Nossa prioridade é a longevidade do seu negócio. Por isso, trabalhamos apenas com métodos aprovados pela Meta para evitar banimentos."
            />
          </div>
        </section>

        <section style={{ padding: '150px 10%', textAlign: 'center' }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{ 
              padding: '80px', borderRadius: '50px', 
              background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, transparent 100%)',
              border: '1px solid rgba(37, 211, 102, 0.3)'
            }}
          >
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px' }}>Vamos construir o futuro?</h2>
            <p style={{ opacity: 0.6, fontSize: '1.2rem', marginBottom: '40px' }}>Junte-se a centenas de empresas que já transformaram seu atendimento.</p>
            <button style={{ background: 'var(--brand-green)', color: '#0d140d', padding: '20px 60px', borderRadius: '15px', fontWeight: '900', fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>
              FALAR COM UM CONSULTOR
            </button>
          </motion.div>
        </section>
      </main>

      <footer style={{ padding: '60px 10% 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ opacity: 0.3, fontSize: '0.8rem' }}>© 2026 ZAPCHAT TECNOLOGIA LTDA. TODOS OS DIREITOS RESERVADOS.</p>
      </footer>
    </div>
  );
};

export default Technology;