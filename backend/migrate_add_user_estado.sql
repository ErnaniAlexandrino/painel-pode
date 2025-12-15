-- Script de migração para adicionar campos user_id e estado na tabela candidatos_grid
-- IMPORTANTE: Este script deve ser executado após fazer backup do banco de dados

-- Adicionar coluna user_id (permite NULL temporariamente para dados existentes)
ALTER TABLE candidatos_grid 
ADD COLUMN user_id INT NULL,
ADD COLUMN estado VARCHAR(100) NULL;

-- Criar índice para melhorar performance
CREATE INDEX idx_candidatos_grid_user_id ON candidatos_grid(user_id);
CREATE INDEX idx_candidatos_grid_estado ON candidatos_grid(estado);
CREATE INDEX idx_candidatos_grid_user_estado ON candidatos_grid(user_id, estado);

-- Adicionar foreign key constraint (após popular os dados)
-- ALTER TABLE candidatos_grid 
-- ADD CONSTRAINT fk_candidatos_grid_user 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- NOTA: Para dados existentes, você precisará:
-- 1. Atribuir um user_id padrão ou deletar registros antigos
-- 2. Definir um estado padrão ou deletar registros sem estado
-- 3. Depois, tornar as colunas NOT NULL:
-- ALTER TABLE candidatos_grid MODIFY COLUMN user_id INT NOT NULL;
-- ALTER TABLE candidatos_grid MODIFY COLUMN estado VARCHAR(100) NOT NULL;

