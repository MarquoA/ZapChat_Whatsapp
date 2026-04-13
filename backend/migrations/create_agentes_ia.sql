-- Tabela para armazenar os agentes de IA configurados pelos usuários
CREATE TABLE IF NOT EXISTS agentes_ia (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT NOT NULL,
    nome            VARCHAR(100) NOT NULL,
    tom             VARCHAR(30)  NOT NULL DEFAULT 'equilibrado',
    modelo          VARCHAR(50)  NOT NULL DEFAULT 'gpt-4o-mini',
    max_tokens      INT          NOT NULL DEFAULT 1000,
    prompt          TEXT,
    finalizacao     TEXT,
    base_conhecimento JSON,
    ferramentas       JSON,
    criado_em       DATETIME NOT NULL DEFAULT NOW(),
    atualizado_em   DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
