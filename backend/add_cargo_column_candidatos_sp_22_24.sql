SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Adiciona a coluna 'cargo' na tabela candidatos_sp_22_24
ALTER TABLE candidatos_sp_22_24 
ADD COLUMN cargo VARCHAR(255) NULL AFTER genero;

-- Adiciona índice na coluna cargo para melhor performance
CREATE INDEX idx_candidatos_sp_22_24_cargo ON candidatos_sp_22_24(cargo);

