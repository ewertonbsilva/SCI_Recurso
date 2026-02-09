-- Limpeza final do banco de dados
USE sci_recurso;

-- 1. Remover turnos de teste (opcional)
DELETE FROM turnos WHERE id_turno LIKE 'test_%' OR id_turno LIKE 'manual_%';

-- 2. Verificar estrutura final da tabela turnos
SHOW CREATE TABLE turnos;

-- 3. Verificar se o trigger está ativo
SHOW TRIGGERS LIKE 'tr_turno_before_insert';

-- 4. Verificar procedure definitiva
SHOW PROCEDURE STATUS WHERE Db = 'sci_recurso' AND Name = 'sp_criar_turno_definitivo';

-- 5. Contar registros atuais
SELECT COUNT(*) as total_turnos FROM turnos;

-- 6. Verificar últimos turnos criados
SELECT * FROM turnos ORDER BY created_at DESC LIMIT 5;
