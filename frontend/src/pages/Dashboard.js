import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, trend }) => (
  <motion.div 
    whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.03)' }}
    style={{ 
      background: 'rgba(255,255,255,0.01)', padding: '30px', borderRadius: '15px', 
      border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' 
    }}
  >
    <p style={{ opacity: 0.4, fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{label}</p>
    <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>{value}</h3>
    <span style={{ color: 'var(--brand-green)', fontSize: '0.75rem', fontWeight: '600' }}>{trend}</span>
  </motion.div>
);

const InstanceCard = ({ name, phone, status, version }) => (
  <motion.div 
    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.02)' }}
    style={{ 
      padding: '20px 25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', 
      background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '15px'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status === 'Online' ? 'var(--brand-green)' : '#ff4b4b' }} />
      <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>{name}</h4>
        <p style={{ fontSize: '0.75rem', opacity: 0.4 }}>{phone}</p>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '0.6rem', opacity: 0.3, textTransform: 'uppercase' }}>Versão</p>
        <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{version}</p>
      </div>
      <motion.button 
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700' }}
      >
        GERENCIAR
      </motion.button>
    </div>
  </motion.div>
);

const ConfigSettings = () => {
  const [subTab, setSubTab] = useState('Perfil');

  const renderSubContent = () => {
    switch (subTab) {
      case 'Perfil':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.01)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '20px', fontWeight: '700' }}>Dados Pessoais</h4>
              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.4, marginBottom: '8px', textTransform: 'uppercase' }}>Nome de Exibição</label>
                  <input type="text" placeholder="Seu nome" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.4, marginBottom: '8px', textTransform: 'uppercase' }}>E-mail Principal</label>
                  <input type="email" placeholder="seu@email.com" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white', outline: 'none' }} />
                </div>
              </div>
            </div>
            <motion.button whileHover={{ backgroundColor: 'var(--brand-green)', color: '#0d140d' }} style={{ background: 'transparent', border: '1px solid var(--brand-green)', color: 'var(--brand-green)', padding: '15px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', transition: '0.3s' }}>SALVAR ALTERAÇÕES</motion.button>
          </motion.div>
        );
      case 'Assinatura':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '30px', background: 'rgba(255,255,255,0.01)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '600px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '10px', fontWeight: '700' }}>Seu Plano Atual</h4>
            <p style={{ opacity: 0.4, fontSize: '0.9rem', marginBottom: '25px' }}>Você está utilizando a versão gratuita do ZapChat.</p>
            <motion.button whileHover={{ scale: 1.02 }} style={{ background: 'var(--brand-green)', color: '#0d140d', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}>UPGRADE PARA PRO</motion.button>
          </motion.div>
        );
      case 'Segurança':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '30px', background: 'rgba(255,255,255,0.01)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '600px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '20px', fontWeight: '700' }}>Alterar Senha</h4>
            <div style={{ display: 'grid', gap: '15px', marginBottom: '25px' }}>
              <input type="password" placeholder="Senha atual" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white', outline: 'none' }} />
              <input type="password" placeholder="Nova senha" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white', outline: 'none' }} />
            </div>
            <button style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>ATUALIZAR SENHA</button>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div style={{ paddingTop: '40px' }}>
      <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
        {['Perfil', 'Assinatura', 'Segurança'].map((item) => (
          <div
            key={item}
            onClick={() => setSubTab(item)}
            style={{
              padding: '10px 0', fontSize: '0.9rem', fontWeight: '600',
              color: subTab === item ? 'var(--brand-green)' : 'rgba(255,255,255,0.4)',
              borderBottom: subTab === item ? '2px solid var(--brand-green)' : '2px solid transparent',
              cursor: 'pointer', marginBottom: '-1px', transition: '0.3s'
            }}
          >
            {item}
          </div>
        ))}
      </div>
      {renderSubContent()}
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [instances] = useState([]);

  const menuItems = ['Dashboard', 'Instâncias', 'Chatbot IA', 'Configurações'];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <StatCard label="Mensagens Enviadas" value="0" trend="0% de taxa de erro" />
              <StatCard label="Leads Ativos" value="0" trend="Aguardando conexão" />
              <StatCard label="Horas Economizadas" value="0h" trend="Cálculo em tempo real" />
              <StatCard label="Status da API" value="Offline" trend="Sem conexão ativa" />
            </div>
            <div style={{ padding: '80px 40px', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>Nenhum dado disponível</h3>
              <p style={{ opacity: 0.4, fontSize: '0.9rem', maxWidth: '350px', margin: '0 auto' }}>Conecte uma instância para monitorar suas métricas.</p>
            </div>
          </motion.div>
        );
      
      case 'Instâncias':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '40px' }}>
            {instances.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {instances.map((inst, i) => <InstanceCard key={i} {...inst} version="v2.1.0" />)}
              </div>
            ) : (
              <div style={{ padding: '60px 40px', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.01)', textAlign: 'center' }}>
                <h3 style={{ fontWeight: '700', marginBottom: '10px' }}>Nenhuma Conexão Ativa</h3>
                <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>Clique em "+ NOVA INSTÂNCIA" para conectar seu WhatsApp.</p>
              </div>
            )}
          </motion.div>
        );

      case 'Chatbot IA':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '40px' }}>
            <div style={{ padding: '40px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '20px' }}>Treinamento do Agente</h3>
              <div style={{ border: '1px dashed rgba(255,255,255,0.1)', padding: '40px', borderRadius: '15px', textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>Arraste arquivos PDF ou TXT para treinar sua IA.</p>
              </div>
              <div style={{ display: 'grid', gap: '15px' }}>
                <label style={{ fontSize: '0.7rem', opacity: 0.4, textTransform: 'uppercase' }}>Instruções do Sistema (Prompt)</label>
                <textarea placeholder="Ex: Você é um assistente de vendas educado..." style={{ width: '100%', minHeight: '120px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px', color: 'white', outline: 'none', resize: 'none' }} />
              </div>
            </div>
          </motion.div>
        );

      case 'Configurações':
        return <ConfigSettings />;

      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080c08', color: 'white', overflow: 'hidden' }}>
      <aside style={{ width: '260px', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '40px 25px', display: 'flex', flexDirection: 'column' }}>
        
        {/* LOGO CLICÁVEL QUE VOLTA PARA A HOME */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-1px', cursor: 'pointer' }}>
            ZAP<span style={{ color: 'var(--brand-green)' }}>CHAT</span>
          </h2>
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexGrow: 1 }}>
          {menuItems.map((item) => (
            <motion.div 
              key={item} onClick={() => setActiveTab(item)}
              whileHover={{ x: 5, color: 'var(--brand-green)', background: 'rgba(37, 211, 102, 0.05)' }}
              style={{ 
                padding: '12px 15px', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px', transition: '0.2s',
                color: activeTab === item ? 'var(--brand-green)' : 'rgba(255,255,255,0.5)', 
                fontWeight: activeTab === item ? '700' : '500',
                background: activeTab === item ? 'rgba(37, 211, 102, 0.05)' : 'transparent'
              }}
            >
              {item}
            </motion.div>
          ))}
        </nav>
        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '6px', height: '6px', background: 'var(--brand-green)', borderRadius: '50%' }} />
            <p style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--brand-green)', textTransform: 'uppercase' }}>Plano Free</p>
          </div>
          <p style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Upgrade disponível</p>
          <p style={{ fontSize: '0.7rem', opacity: 0.4 }}>Aumente seus limites.</p>
        </div>
      </aside>

      <main style={{ flexGrow: 1, padding: '0 60px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '40px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: '#080c08', zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>{activeTab}</h1>
            <p style={{ opacity: 0.3, fontSize: '0.9rem' }}>Plataforma / {activeTab}</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: 'var(--brand-green)', color: '#0d140d' }}
            style={{ background: 'transparent', color: 'var(--brand-green)', border: '1px solid var(--brand-green)', padding: '12px 25px', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', transition: '0.3s' }}
          >
            + NOVA INSTÂNCIA
          </motion.button>
        </header>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}>{renderContent()}</motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;