-- Adiciona suporte a modo IA na tabela sessoes_bot
ALTER TABLE sessoes_bot
  ADD COLUMN modo_ia               TINYINT      NOT NULL DEFAULT 0,
  ADD COLUMN ia_agente_id          INT          DEFAULT NULL,
  ADD COLUMN ia_historico          MEDIUMTEXT   DEFAULT NULL,
  ADD COLUMN timeout_aviso_enviado TINYINT      NOT NULL DEFAULT 0;
