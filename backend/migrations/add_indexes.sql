-- Índices para performance em produção
-- Execute uma vez no banco de dados ZapChat
-- Se aparecer erro "Duplicate key name", ignore — o índice já existe.

USE zapchat;

-- Busca de usuário por email (login, esqueci senha)
CREATE INDEX idx_usuarios_email ON usuarios (email);

-- Listagem de fluxos por usuário
CREATE INDEX idx_fluxos_usuario_id ON fluxos (usuario_id);

-- Listagem de instâncias por usuário
CREATE INDEX idx_instancias_usuario_id ON instancias (usuario_id);

-- Contagem e histórico de disparos por usuário + data
CREATE INDEX idx_disparos_usuario_data ON disparos (usuario_id, criado_em);

-- Validação de token de redefinição de senha
CREATE INDEX idx_tokens_token ON tokens_redefinicao (token);

-- Busca de sessão de bot ativa por instância + contato (usado em cada mensagem recebida)
CREATE INDEX idx_sessoes_instancia_contato ON sessoes_bot (instancia_id, contato);

-- Busca de assinaturas por usuário (verificação de plano nos disparos)
CREATE INDEX idx_assinaturas_usuario_status ON assinaturas (usuario_id, status);
