import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PageTransition from './components/PageTransition';
import Tech from './pages/Tech';
import Sobre from './pages/Sobre';
import Login from './pages/Login';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <PageTransition>
              <Dashboard />
            </PageTransition>
          }
        />
        <Route 
          path="/tecnologia" 
          element={
            <PageTransition>
              <Tech />
            </PageTransition>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          } 
        />
        <Route 
          path="/sobre" 
          element={
            <PageTransition>
              <Sobre />
            </PageTransition>
          } 
        />
      </Routes>
    </AnimatePresence>

    
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;