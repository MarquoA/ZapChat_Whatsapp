-- Tabela para controle de orçamento de tokens por usuário
-- Implementar quando quiser cobrar por uso de IA
--
-- Lógica planejada:
--   - Cada usuário recebe 1.000.000 tokens por ciclo (recarregado mensalmente)
--   - GPT-4o-mini: ~$0.375/1M tokens = ~R$2 de custo para você
--   - Quando o saldo zerar, bloquear novas chamadas até recarregar
--   - Vender pacotes de tokens como add-on (ex: R$5 = +1M tokens extras)

CREATE TABLE IF NOT EXISTS tokens_ia (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT NOT NULL UNIQUE,
    saldo           BIGINT NOT NULL DEFAULT 1000000,  -- tokens disponíveis
    total_usado     BIGINT NOT NULL DEFAULT 0,         -- total histórico usado
    ultimo_reset    DATETIME NOT NULL DEFAULT NOW(),   -- última recarga mensal
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Histórico de consumo (para relatórios e debugging)
CREATE TABLE IF NOT EXISTS historico_tokens_ia (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT NOT NULL,
    tokens_usados   INT NOT NULL,
    modelo          VARCHAR(50),
    criado_em       DATETIME NOT NULL DEFAULT NOW(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
