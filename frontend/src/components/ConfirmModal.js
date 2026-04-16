import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal de confirmação/alerta customizado que substitui window.confirm e alert.
 *
 * Prop `modal`:
 *   {
 *     mensagem: string,
 *     tipo: 'confirmar' | 'alerta',
 *     perigo: boolean,        // usa cor de danger no botão confirmar
 *     titulo: string,         // opcional
 *     onSim: () => void,
 *     onNao: () => void,      // somente quando tipo === 'confirmar'
 *     coresTema: {
 *       bg, border, text, muted, accent, danger
 *     }
 *   }
 */
export default function ConfirmModal({ modal }) {
  const isAlerta = modal?.tipo === 'alerta';
  const { mensagem, perigo, titulo, onSim, onNao, coresTema } = modal || {};
  const btnColor = perigo && !isAlerta ? coresTema?.danger : coresTema?.accent;

  return (
    <AnimatePresence>
      {modal && (
        <motion.div
          key="cm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={isAlerta ? onSim : onNao}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.52)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            key="cm-card"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: coresTema?.bg,
              border: `1px solid ${coresTema?.border}`,
              borderRadius: 14,
              padding: '26px 26px 22px',
              width: '90%',
              maxWidth: 380,
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
            }}
          >
            {titulo && (
              <p style={{
                color: coresTema?.text,
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 8,
                fontFamily: 'inherit',
              }}>
                {titulo}
              </p>
            )}
            <p style={{
              color: coresTema?.muted,
              fontSize: 13.5,
              lineHeight: 1.65,
              fontFamily: 'inherit',
            }}>
              {mensagem}
            </p>
            <div style={{
              display: 'flex',
              gap: 8,
              marginTop: 22,
              justifyContent: 'flex-end',
            }}>
              {!isAlerta && (
                <button
                  onClick={onNao}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    border: `1px solid ${coresTema?.border}`,
                    background: 'transparent',
                    color: coresTema?.muted,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={onSim}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: btnColor,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                }}
              >
                {isAlerta ? 'Fechar' : (perigo ? 'Excluir' : 'Confirmar')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
