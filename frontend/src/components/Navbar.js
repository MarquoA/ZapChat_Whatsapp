import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navLinkStyle = (path) => ({
    textDecoration: 'none',
    color: location.pathname === path ? 'var(--brand-green)' : 'white',
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    opacity: location.pathname === path ? 1 : 0.6,
    transition: '0.3s'
  });

  return (
    <nav style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '20px 80px', position: 'fixed', top: 0, width: '100%', 
      zIndex: 100, backdropFilter: 'blur(20px)', background: 'rgba(8, 12, 8, 0.8)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      boxSizing: 'border-box'
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-1.5px', margin: 0 }}>
          ZAP<span style={{ color: 'var(--brand-green)' }}>CHAT</span>
        </h2>
      </Link>

      <div style={{ display: 'flex', gap: '40px' }}>
        <Link to="/" style={navLinkStyle('/')}>Home</Link>
        <Link to="/tecnologia" style={navLinkStyle('/tecnologia')}>Tecnologia</Link>
        <Link to="/sobre" style={navLinkStyle('/sobre')}>Sobre</Link>
      </div>

      <Link to="/login" style={{ textDecoration: 'none' }}>
        <button style={{ 
          background: 'var(--brand-green)', color: '#0d140d', border: 'none', 
          padding: '12px 30px', borderRadius: '30px', fontWeight: '800', 
          fontSize: '0.8rem', cursor: 'pointer' 
        }}>
          ENTRAR
        </button>
      </Link>
    </nav>
  );
};

export default Navbar;