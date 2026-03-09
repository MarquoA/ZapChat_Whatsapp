import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setMenuAberto(false); }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'Home', path: '/' },
    { label: 'Como Funciona', path: '/tecnologia' },
    { label: 'Contato', path: '/sobre' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        .nav-link:hover { opacity: 1 !important; color: #25D366 !important; }
        .nav-link { transition: all 0.25s !important; }
        .hamburger-line { display: block; width: 22px; height: 2px; background: white; border-radius: 2px; transition: all 0.3s; }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-btns-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
        }
      `}</style>

      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 8%', height: '68px',
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
        backdropFilter: 'blur(24px)',
        background: scrolled ? 'rgba(6,10,6,0.95)' : 'rgba(6,10,6,0.75)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxSizing: 'border-box',
        transition: 'background 0.3s'
      }}>

        {/* ── LOGO ── */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{
            fontSize: '1.35rem', fontWeight: '900',
            letterSpacing: '-1px', margin: 0, lineHeight: 1
          }}>
            ZAP<span style={{ color: '#25D366' }}>CHAT</span>
          </h2>
          <span style={{
            background: 'rgba(37,211,102,0.12)', color: '#25D366',
            fontSize: '0.55rem', fontWeight: '800', padding: '2px 7px',
            borderRadius: '20px', border: '1px solid rgba(37,211,102,0.2)',
            textTransform: 'uppercase', letterSpacing: '1px',
          }}>BETA</span>
        </Link>

        {/* ── LINKS DESKTOP ── */}
        <div className="nav-links-desktop" style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="nav-link"
              style={{
                textDecoration: 'none',
                color: isActive(link.path) ? '#25D366' : 'white',
                fontSize: '0.82rem', fontWeight: '600',
                letterSpacing: '0.3px', opacity: isActive(link.path) ? 1 : 0.5,
                position: 'relative'
              }}
            >
              {link.label}
              {isActive(link.path) && (
                <motion.div
                  layoutId="nav-underline"
                  style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px', background: '#25D366', borderRadius: '1px' }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* ── BOTÕES DESKTOP ── */}
        <div className="nav-btns-desktop" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              style={{
                background: 'transparent', color: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(255,255,255,0.12)', padding: '9px 20px',
                borderRadius: '8px', fontWeight: '600', fontSize: '0.8rem',
                cursor: 'pointer', transition: '0.25s',
              }}
            >Entrar</motion.button>
          </Link>
          <Link to="/cadastrar" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(37,211,102,0.3)' }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: '#25D366', color: '#060a06',
                border: 'none', padding: '9px 22px',
                borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem',
                cursor: 'pointer', letterSpacing: '0.2px'
              }}
            >Começar grátis</motion.button>
          </Link>
        </div>

        {/* ── HAMBURGER MOBILE ── */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuAberto(!menuAberto)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: '5px',
            padding: '6px', alignItems: 'center', justifyContent: 'center'
          }}
          aria-label="Menu"
        >
          <span className="hamburger-line" style={{ transform: menuAberto ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span className="hamburger-line" style={{ opacity: menuAberto ? 0 : 1, transform: menuAberto ? 'scaleX(0)' : 'none' }} />
          <span className="hamburger-line" style={{ transform: menuAberto ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* ── MENU MOBILE DROPDOWN ── */}
      <AnimatePresence>
        {menuAberto && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: '68px', left: 0, right: 0, zIndex: 999,
              background: 'rgba(6,10,6,0.98)', backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              padding: '24px 8%'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
              {links.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={link.path}
                    style={{
                      display: 'block', textDecoration: 'none',
                      color: isActive(link.path) ? '#25D366' : 'rgba(255,255,255,0.7)',
                      fontSize: '1.05rem', fontWeight: '600', padding: '14px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    {link.label}
                    {isActive(link.path) && <span style={{ marginLeft: '8px', fontSize: '0.6rem', color: '#25D366', verticalAlign: 'middle' }}>●</span>}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/cadastrar" style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%', background: '#25D366', color: '#060a06',
                  border: 'none', padding: '15px', borderRadius: '10px',
                  fontWeight: '900', fontSize: '0.92rem', cursor: 'pointer',
                }}>
                  COMEÇAR — 7 DIAS GRÁTIS
                </button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%', background: 'transparent', color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.12)', padding: '14px', borderRadius: '10px',
                  fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer',
                }}>
                  Já tenho conta — Entrar
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {menuAberto && (
        <div
          onClick={() => setMenuAberto(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.4)' }}
        />
      )}
    </>
  );
};

export default Navbar;