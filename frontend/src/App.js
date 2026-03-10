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
import NotFound from './pages/NotFound';

// ─── PROTEÇÃO DE ROTA ────────────────────────────────────────────────────────
const RotaProtegida = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rotas públicas */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/tecnologia" element={<PageTransition><Tech /></PageTransition>} />
        <Route path="/sobre" element={<PageTransition><Sobre /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/cadastrar" element={<PageTransition><Register /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        <Route path="/esqueci-senha" element={<PageTransition><EsqueciSenha /></PageTransition>} />
        <Route path="/redefinir-senha" element={<PageTransition><RedefinirSenha /></PageTransition>} />

        {/* Rotas protegidas */}
        <Route path="/assinar" element={
          <RotaProtegida>
            <PageTransition><Assinar /></PageTransition>
          </RotaProtegida>
        } />
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
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div style={{ overflowX: 'hidden' }}>
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;