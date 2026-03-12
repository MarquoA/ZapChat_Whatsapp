import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const secoes = [
  {
    titulo: "1. Quem Somos",
    conteudo: `ZapChat Tecnologia LTDA, inscrita no CNPJ [A PREENCHER], com sede em [ENDEREÇO COMPLETO], é a controladora dos dados pessoais tratados por meio da plataforma zapchat.com.br.`
  },
  {
    titulo: "2. Dados que Coletamos",
    conteudo: `Coletamos os seguintes dados pessoais:\n\n• Dados de cadastro: nome completo, endereço de email e senha (armazenada com criptografia bcrypt)\n• Dados de pagamento: processados exclusivamente pelo Mercado Pago — não armazenamos dados de cartão\n• Dados de uso: logs de acesso, fluxos criados, instâncias conectadas, disparos realizados\n• Dados técnicos: endereço IP, tipo de navegador, sistema operacional`
  },
  {
    titulo: "3. Como Usamos Seus Dados",
    conteudo: `Seus dados são utilizados para:\n\n• Criação e gerenciamento da sua conta\n• Prestação dos serviços contratados\n• Processamento de pagamentos e controle de assinaturas\n• Envio de emails transacionais (confirmação de cadastro, redefinição de senha)\n• Segurança da plataforma (prevenção de fraudes e acessos não autorizados)\n• Suporte ao cliente\n• Melhoria contínua dos serviços`
  },
  {
    titulo: "4. Base Legal (LGPD)",
    conteudo: `O tratamento dos seus dados pessoais se baseia nas seguintes hipóteses legais previstas na Lei 13.709/2018 (LGPD):\n\n• Execução de contrato: para prestação dos serviços contratados\n• Legítimo interesse: para segurança e melhoria da plataforma\n• Consentimento: para envio de comunicações de marketing (quando aplicável)\n• Obrigação legal: para cumprimento de obrigações legais e regulatórias`
  },
  {
    titulo: "5. Compartilhamento de Dados",
    conteudo: `Seus dados podem ser compartilhados com:\n\n• Mercado Pago: para processamento de pagamentos\n• Resend: para envio de emails transacionais\n• Provedores de infraestrutura (VPS/cloud): para hospedagem dos serviços\n\nNão vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de marketing.`
  },
  {
    titulo: "6. Segurança dos Dados",
    conteudo: `Adotamos medidas técnicas e organizacionais para proteger seus dados:\n\n• Senhas criptografadas com bcrypt\n• Comunicação via HTTPS/TLS\n• Autenticação por JWT com expiração\n• Tokens de redefinição de senha de uso único com expiração em 2 horas\n• Rate limiting para prevenção de ataques\n• Backups automáticos diários`
  },
  {
    titulo: "7. Retenção de Dados",
    conteudo: `Seus dados são mantidos pelo período necessário para a prestação dos serviços e cumprimento de obrigações legais. Após o cancelamento da conta, os dados são excluídos em até 90 dias, salvo obrigação legal de retenção por prazo superior.`
  },
  {
    titulo: "8. Seus Direitos (LGPD)",
    conteudo: `Como titular de dados, você tem direito a:\n\n• Confirmar a existência de tratamento dos seus dados\n• Acessar seus dados pessoais\n• Corrigir dados incompletos, inexatos ou desatualizados\n• Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários\n• Solicitar a portabilidade dos dados\n• Revogar o consentimento\n• Solicitar a eliminação de dados tratados com base no consentimento\n\nPara exercer esses direitos, entre em contato: privacidade@zapchat.com.br`
  },
  {
    titulo: "9. Cookies",
    conteudo: `Utilizamos cookies e tecnologias similares para:\n\n• Manter sua sessão ativa (cookies essenciais)\n• Analisar o uso da plataforma (cookies analíticos)\n• Melhorar a experiência do usuário\n\nVocê pode gerenciar suas preferências de cookies a qualquer momento. Veja nossa Política de Cookies para mais detalhes.`
  },
  {
    titulo: "10. Transferência Internacional",
    conteudo: `Seus dados podem ser processados em servidores localizados fora do Brasil por nossos parceiros de tecnologia (como provedores de infraestrutura cloud). Quando isso ocorrer, garantimos que o nível de proteção seja equivalente ao exigido pela LGPD.`
  },
  {
    titulo: "11. Alterações nesta Política",
    conteudo: `Esta Política pode ser atualizada periodicamente. Notificaremos você por email sobre alterações relevantes. A data da última atualização sempre estará indicada no topo deste documento.`
  },
  {
    titulo: "12. Contato e Encarregado (DPO)",
    conteudo: `Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:\n\nZapChat Tecnologia LTDA\nEmail: privacidade@zapchat.com.br\nCNPJ: [A PREENCHER]\nEndereço: [A PREENCHER]\n\nEncarregado de Dados (DPO): [NOME DO DPO]\nEmail: dpo@zapchat.com.br`
  },
];

const Privacidade = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ backgroundColor: '#0a0f0a', color: 'white', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: '1.4rem', margin: 0, letterSpacing: '-1px' }}>
            ZAP<span style={{ color: '#25D366' }}>CHAT</span>
          </h2>
        </Link>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, transition: '0.2s' }}
          onMouseEnter={e => e.target.style.color = '#25D366'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>
          ← Voltar ao site
        </Link>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, rgba(37,211,102,0.04) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '60px 40px 50px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#25D366', textTransform: 'uppercase', letterSpacing: '3px', display: 'block', marginBottom: '16px' }}>
              Documento Legal
            </span>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.2rem)', margin: '0 0 16px', lineHeight: 1.1 }}>
              Política de Privacidade
            </h1>
            <p style={{ opacity: 0.4, fontSize: '0.9rem', margin: 0 }}>
              Última atualização: [11/03/2026] — ZapChat Tecnologia LTDA — LGPD (Lei 13.709/2018)
            </p>
          </motion.div>
        </div>
      </div>

      {/* Conteúdo */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>

          {/* Intro */}
          <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '16px', padding: '24px 28px', marginBottom: '48px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.7)' }}>
              A ZapChat Tecnologia LTDA está comprometida com a proteção dos seus dados pessoais. 
              Esta Política descreve como coletamos, usamos, armazenamos e protegemos suas informações, 
              em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
            </p>
          </div>

          {/* Seções */}
          {secoes.map((secao, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.03 }}
              style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: i < secoes.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#25D366', marginBottom: '14px', marginTop: 0 }}>
                {secao.titulo}
              </h2>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', whiteSpace: 'pre-line' }}>
                {secao.conteudo}
              </p>
            </motion.div>
          ))}

          {/* Rodapé */}
          <div style={{ marginTop: '60px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.3 }}>
              © {new Date().getFullYear()} ZapChat Tecnologia LTDA — Todos os direitos reservados<br />
              CNPJ: [A PREENCHER] — [CIDADE/UF], Brasil
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Privacidade;