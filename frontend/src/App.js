import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PageTransition from './components/PageTransition';
import Tech from './pages/Tech';
import Sobre from './pages/Sobre';
import Login from './pages/Login';
import Register from './pages/Register';
import FlowEditor from './pages/FlowEditor';
import Assinar from './pages/Assinar';
import EsqueciSenha from './pages/EsqueciSenha';
import RedefinirSenha from './pages/RedefinirSenha';
import PagamentoConfirmado from './pages/PagamentoConfirmado';
import Termos from './pages/Termos';
import Privacidade from './pages/Privacidade';
import CookieBanner from './components/CookieBanner';
import NotFound from './pages/NotFound';
import AdminPanel from './pages/AdminPanel';

const RotaProtegida = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return children;
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/tecnologia" element={<PageTransition><Tech /></PageTransition>} />
        <Route path="/sobre" element={<PageTransition><Sobre /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/cadastrar" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/esqueci-senha" element={<PageTransition><EsqueciSenha /></PageTransition>} />
        <Route path="/redefinir-senha" element={<PageTransition><RedefinirSenha /></PageTransition>} />
        <Route path="/pagamento-confirmado" element={<PagamentoConfirmado />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />

        <Route path="/assinar" element={<PageTransition><Assinar /></PageTransition>} />
        <Route path="/dashboard" element={
          <RotaProtegida>
            <PageTransition><Dashboard /></PageTransition>
          </RotaProtegida>
        } />
        <Route path="/editor/:id" element={
          <RotaProtegida>
            <PageTransition><FlowEditor /></PageTransition>
          </RotaProtegida>
        } />

        {/* ── CORRIGIDO: rota /admin ANTES do catch-all path="*" ── */}
        <Route path="/admin" element={
          <RotaProtegida>
            <PageTransition><AdminPanel /></PageTransition>
          </RotaProtegida>
        } />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div style={{ overflowX: 'hidden' }}>
        <AnimatedRoutes />
        <CookieBanner />
      </div>
    </Router>
  );
}

export default App;