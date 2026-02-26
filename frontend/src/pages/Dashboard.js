import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

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

const InstanceCard = ({ name, phone, status, version, onExcluir, onGerenciar }) => (
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
    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
      <div style={{ textAlign: 'right', marginRight: '20px' }}>
        <p style={{ fontSize: '0.6rem', opacity: 0.3, textTransform: 'uppercase' }}>Versão</p>
        <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{version}</p>
      </div>
      <button onClick={onGerenciar} style={{ background: '#25D366', color: '#0d140d', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700' }}>GERENCIAR</button>
      <button onClick={onExcluir} style={{ background: 'transparent', border: '1px solid #ff4b4b', color: '#ff4b4b', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700' }}>EXCLUIR</button>
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
              </div>
            </div>
            <motion.button whileHover={{ backgroundColor: 'var(--brand-green)', color: '#0d140d' }} style={{ background: 'transparent', border: '1px solid var(--brand-green)', color: 'var(--brand-green)', padding: '15px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', transition: '0.3s' }}>SALVAR ALTERAÇÕES</motion.button>
          </motion.div>
        );
      case 'Assinatura': return <p style={{ opacity: 0.4 }}>Plano Free</p>;
      case 'Segurança': return <p style={{ opacity: 0.4 }}>Alterar Senha</p>;
      default: return null;
    }
  };

  return (
    <div style={{ paddingTop: '40px' }}>
      <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
        {['Perfil', 'Assinatura', 'Segurança'].map((item) => (
          <div key={item} onClick={() => setSubTab(item)} style={{ padding: '10px 0', fontSize: '0.9rem', fontWeight: '600', color: subTab === item ? 'var(--brand-green)' : 'rgba(255,255,255,0.4)', borderBottom: subTab === item ? '2px solid var(--brand-green)' : '2px solid transparent', cursor: 'pointer', transition: '0.3s' }}>{item}</div>
        ))}
      </div>
      {renderSubContent()}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [instances, setInstances] = useState([]);

  const menuItems = ['Dashboard', 'Instâncias', 'Chatbot IA', 'Configurações'];

  const criarInstancia = () => {
    const nova = {
      id: Date.now(),
      name: `Fluxo #${instances.length + 1}`,
      phone: "Não conectado",
      status: "Offline",
      version: "v1.0.0"
    };
    setInstances([...instances, nova]);
  };

  const excluirInstancia = (id) => {
    setInstances(instances.filter(inst => inst.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <StatCard label="Mensagens Enviadas" value="0" trend="0% de taxa de erro" />
              <StatCard label="Leads Ativos" value="0" trend="Aguardando conexão" />
              <StatCard label="Horas Economizadas" value="0h" trend="Cálculo em tempo real" />
              <StatCard label="Status da API" value={instances.length > 0 ? "Online" : "Offline"} trend="Status do sistema" />
            </div>

            {instances.length > 0 ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {instances.map((inst) => (
                  <InstanceCard 
                    key={inst.id} 
                    {...inst} 
                    onExcluir={() => excluirInstancia(inst.id)}
                    onGerenciar={() => navigate(`/editor/${inst.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ padding: '80px 40px', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>Nenhum fluxo disponível</h3>
                <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>Clique em "+ NOVO FLUXOGRAMA" para começar.</p>
              </div>
            )}
          </motion.div>
        );
      
      case 'Instâncias': return <p style={{paddingTop: '40px', opacity: 0.4}}>Lista de conexões ativas.</p>;
      case 'Chatbot IA': return <p style={{paddingTop: '40px', opacity: 0.4}}>Treinamento de IA.</p>;
      case 'Configurações': return <ConfigSettings />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080c08', color: 'white', overflow: 'hidden' }}>
      <aside style={{ width: '260px', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '40px 25px', display: 'flex', flexDirection: 'column' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-1px' }}>ZAP<span style={{ color: 'var(--brand-green)' }}>CHAT</span></h2>
        </Link>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexGrow: 1 }}>
          {menuItems.map((item) => (
            <div key={item} onClick={() => setActiveTab(item)} style={{ padding: '12px 15px', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px', color: activeTab === item ? 'var(--brand-green)' : 'rgba(255,255,255,0.5)', background: activeTab === item ? 'rgba(37, 211, 102, 0.05)' : 'transparent', fontWeight: activeTab === item ? '700' : '500' }}>{item}</div>
          ))}
        </nav>
      </aside>

      <main style={{ flexGrow: 1, padding: '0 60px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '40px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: '#080c08', zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{activeTab}</h1>
            <p style={{ opacity: 0.3, fontSize: '0.9rem' }}>Plataforma / {activeTab}</p>
          </div>
          <motion.button 
            onClick={criarInstancia}
            whileHover={{ scale: 1.02, backgroundColor: 'var(--brand-green)', color: '#0d140d' }}
            style={{ background: 'transparent', color: 'var(--brand-green)', border: '1px solid var(--brand-green)', padding: '12px 25px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
          >
            + NOVO FLUXOGRAMA
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