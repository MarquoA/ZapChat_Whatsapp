import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const secoes = [
  {
    titulo: "1. Aceitação dos Termos",
    conteudo: `Ao acessar ou utilizar os serviços da ZapChat Tecnologia LTDA ("ZapChat"), você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize nossos serviços.`
  },
  {
    titulo: "2. Descrição do Serviço",
    conteudo: `O ZapChat é uma plataforma SaaS (Software as a Service) de automação de mensagens via WhatsApp, oferecendo recursos como criação de fluxos de atendimento, disparos em massa, chatbot com inteligência artificial e gerenciamento de instâncias WhatsApp.`
  },
  {
    titulo: "3. Cadastro e Conta",
    conteudo: `Para utilizar o ZapChat, você deve criar uma conta com informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente em caso de uso não autorizado.`
  },
  {
    titulo: "4. Planos e Pagamentos",
    conteudo: `Os serviços são oferecidos em planos pagos (Starter, Pro e Business) com cobrança mensal ou anual via Mercado Pago. O plano Starter possui período de trial de 7 dias. Os valores estão sujeitos a alterações com aviso prévio de 30 dias. O não pagamento resultará na suspensão do acesso.`
  },
  {
    titulo: "5. Uso Aceitável",
    conteudo: `Você concorda em utilizar o ZapChat apenas para fins legais e de acordo com a legislação brasileira. É expressamente proibido: enviar spam ou mensagens não solicitadas, violar a privacidade de terceiros, transmitir conteúdo ilegal, difamatório ou prejudicial, tentar acessar sistemas ou dados não autorizados, revender ou sublicenciar o serviço sem autorização.`
  },
  {
    titulo: "6. Política de Anti-Spam",
    conteudo: `O uso do ZapChat para envio de mensagens em massa deve respeitar as políticas do WhatsApp e a legislação vigente. O usuário é responsável por obter consentimento dos destinatários antes de enviar mensagens. O ZapChat implementa delays automáticos nos disparos para proteção da conta do usuário, mas não se responsabiliza por bloqueios causados pelo uso indevido da plataforma.`
  },
  {
    titulo: "7. Propriedade Intelectual",
    conteudo: `Todo o conteúdo da plataforma ZapChat, incluindo código, design, logotipos e documentação, é de propriedade exclusiva da ZapChat Tecnologia LTDA. É vedada a reprodução, distribuição ou criação de obras derivadas sem autorização prévia por escrito.`
  },
  {
    titulo: "8. Limitação de Responsabilidade",
    conteudo: `O ZapChat não se responsabiliza por: interrupções no serviço do WhatsApp, bloqueios de conta causados por uso indevido, perda de dados decorrente de falhas técnicas, danos indiretos ou lucros cessantes. Nossa responsabilidade total está limitada ao valor pago pelo plano no último mês.`
  },
  {
    titulo: "9. Cancelamento",
    conteudo: `Você pode cancelar sua assinatura a qualquer momento pelo Dashboard. O cancelamento é efetivo ao final do período já pago. Não há reembolso de períodos já utilizados. O ZapChat pode suspender ou encerrar contas que violem estes Termos.`
  },
  {
    titulo: "10. Alterações nos Termos",
    conteudo: `Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações relevantes serão comunicadas por email com antecedência mínima de 15 dias. O uso continuado dos serviços após as alterações implica aceitação dos novos Termos.`
  },
  {
    titulo: "11. Lei Aplicável e Foro",
    conteudo: `Estes Termos são regidos pelas leis da República Federativa do Brasil. Para dirimir quaisquer conflitos, fica eleito o foro da comarca de [CIDADE/UF], com renúncia expressa a qualquer outro, por mais privilegiado que seja.`
  },
  {
    titulo: "12. Contato",
    conteudo: `Para dúvidas sobre estes Termos de Uso, entre em contato conosco:\n\nZapChat Tecnologia LTDA\nCNPJ: [A PREENCHER]\nEndereço: [A PREENCHER]\nEmail: contato@zapchat.com.br\nSite: www.zapchat.com.br`
  },
];

const Termos = () => {
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
              Termos de Uso
            </h1>
            <p style={{ opacity: 0.4, fontSize: '0.9rem', margin: 0 }}>
              Última atualização: [11/03/2026] — ZapChat Tecnologia LTDA
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
              Leia atentamente estes Termos de Uso antes de utilizar a plataforma ZapChat. 
              Ao se cadastrar ou utilizar nossos serviços, você confirma que leu, entendeu e concorda 
              com todas as condições aqui estabelecidas.
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

export default Termos;