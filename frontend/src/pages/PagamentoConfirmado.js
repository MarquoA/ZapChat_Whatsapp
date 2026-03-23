// frontend/src/pages/PagamentoConfirmado.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const MAX_TENTATIVAS = 20;      // tenta por até ~60 segundos
const INTERVALO_MS   = 3000;    // consulta a cada 3 segundos

export default function PagamentoConfirmado() {
  const navigate  = useNavigate();
  const [tentativa, setTentativa] = useState(0);
  const [mensagem,  setMensagem]  = useState('Confirmando seu pagamento...');
  const [erro,      setErro]      = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    let tentativaAtual = 0;

    const verificar = async () => {
      tentativaAtual++;
      setTentativa(tentativaAtual);

      try {
        const res = await fetch(`${API_URL}/pagamentos/minha-assinatura`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.tem_assinatura && data.status === 'ativo') {
          // Pagamento confirmado — atualiza localStorage e redireciona
          localStorage.setItem('usuario_plano', data.plano);
          clearInterval(intervalo);
          navigate('/dashboard?pagamento=confirmado');
          return;
        }

        if (tentativaAtual >= MAX_TENTATIVAS) {
          clearInterval(intervalo);
          setMensagem(
            'O pagamento está sendo processado. Você receberá uma confirmação em breve. ' +
            'Se o problema persistir, entre em contato com o suporte.'
          );
          setErro(true);
        }
      } catch (e) {
        console.error('Erro ao verificar assinatura:', e);
      }
    };

    // Primeira verificação imediata, depois a cada INTERVALO_MS
    verificar();
    const intervalo = setInterval(verificar, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [navigate]);

  const progresso = Math.min((tentativa / MAX_TENTATIVAS) * 100, 95);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {!erro ? (
          <>
            <div style={styles.spinner} />
            <h2 style={styles.titulo}>Confirmando pagamento</h2>
            <p style={styles.subtitulo}>{mensagem}</p>
            <div style={styles.barraFundo}>
              <div style={{ ...styles.barraProgresso, width: `${progresso}%` }} />
            </div>
            <p style={styles.dica}>Isso pode levar até 1 minuto. Não feche esta página.</p>
          </>
        ) : (
          <>
            <div style={styles.iconeAviso}>⚠️</div>
            <h2 style={styles.titulo}>Processando...</h2>
            <p style={styles.subtitulo}>{mensagem}</p>
            <button
              style={styles.botao}
              onClick={() => window.location.reload()}
            >
              Verificar novamente
            </button>
            <button
              style={{ ...styles.botao, ...styles.botaoSecundario }}
              onClick={() => navigate('/dashboard')}
            >
              Ir para o Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '48px 40px',
    maxWidth: 420,
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  spinner: {
    width: 56,
    height: 56,
    border: '5px solid #e0e0e0',
    borderTop: '5px solid #25D366',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px',
  },
  iconeAviso: {
    fontSize: 48,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a1a2e',
    margin: '0 0 12px',
  },
  subtitulo: {
    fontSize: 15,
    color: '#555',
    lineHeight: 1.6,
    margin: '0 0 24px',
  },
  barraFundo: {
    background: '#e0e0e0',
    borderRadius: 8,
    height: 8,
    overflow: 'hidden',
    margin: '0 0 16px',
  },
  barraProgresso: {
    background: 'linear-gradient(90deg, #25D366, #128C7E)',
    height: '100%',
    borderRadius: 8,
    transition: 'width 0.5s ease',
  },
  dica: {
    fontSize: 13,
    color: '#999',
    margin: 0,
  },
  botao: {
    display: 'block',
    width: '100%',
    padding: '14px',
    background: '#25D366',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 12,
  },
  botaoSecundario: {
    background: 'transparent',
    color: '#25D366',
    border: '2px solid #25D366',
  },
};

// Injeta a animação do spinner globalmente
const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleTag);