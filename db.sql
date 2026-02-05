-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           8.4.3 - MySQL Community Server - GPL
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para sci_recurso
CREATE DATABASE IF NOT EXISTS `sci_recurso` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sci_recurso`;

-- Copiando estrutura para tabela sci_recurso.atestados_medicos
CREATE TABLE IF NOT EXISTS `atestados_medicos` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `matricula` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_inicio` date NOT NULL,
  `dias` int NOT NULL,
  `motivo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_matricula` (`matricula`),
  KEY `idx_data_inicio` (`data_inicio`),
  KEY `idx_atestados_periodo` (`matricula`,`data_inicio`,`dias`),
  CONSTRAINT `atestados_medicos_ibfk_1` FOREIGN KEY (`matricula`) REFERENCES `militares` (`matricula`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela sci_recurso.chamada_civil
CREATE TABLE IF NOT EXISTS `chamada_civil` (
  `id_chamada_civil` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `id_turno` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_civil` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_equipe` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quant_civil` int NOT NULL DEFAULT '1',
  `status` enum('livre','empenhada','pausa-operacional') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'livre',
  `matricula_chefe` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bairro` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_status_update` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_chamada_civil`),
  KEY `idx_id_turno` (`id_turno`),
  KEY `idx_id_civil` (`id_civil`),
  KEY `idx_status` (`status`),
  KEY `idx_matricula_chefe` (`matricula_chefe`),
  KEY `idx_last_status_update` (`last_status_update`),
  KEY `idx_chamada_civil_turno_status` (`id_turno`,`status`),
  CONSTRAINT `chamada_civil_ibfk_1` FOREIGN KEY (`id_turno`) REFERENCES `turnos` (`id_turno`) ON DELETE CASCADE,
  CONSTRAINT `chamada_civil_ibfk_2` FOREIGN KEY (`id_civil`) REFERENCES `civis` (`id_civil`) ON DELETE CASCADE,
  CONSTRAINT `chamada_civil_ibfk_3` FOREIGN KEY (`matricula_chefe`) REFERENCES `militares` (`matricula`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela sci_recurso.chamada_militar
CREATE TABLE IF NOT EXISTS `chamada_militar` (
  `id_chamada_militar` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `id_turno` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matricula` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `funcao` enum('SCI','Combatente') COLLATE utf8mb4_unicode_ci NOT NULL,
  `presenca` tinyint(1) DEFAULT '0',
  `obs` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_chamada_militar`),
  KEY `idx_id_turno` (`id_turno`),
  KEY `idx_matricula` (`matricula`),
  KEY `idx_presenca` (`presenca`),
  KEY `idx_funcao` (`funcao`),
  KEY `idx_chamada_militar_turno_presenca` (`id_turno`,`presenca`),
  CONSTRAINT `chamada_militar_ibfk_1` FOREIGN KEY (`id_turno`) REFERENCES `turnos` (`id_turno`) ON DELETE CASCADE,
  CONSTRAINT `chamada_militar_ibfk_2` FOREIGN KEY (`matricula`) REFERENCES `militares` (`matricula`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela sci_recurso.civis
CREATE TABLE IF NOT EXISTS `civis` (
  `id_civil` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `nome_completo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contato` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orgao_origem` enum('Defesa Civil','Cruz Vermelha','Voluntário','Empresa Privada','Outros') COLLATE utf8mb4_unicode_ci NOT NULL,
  `motorista` tinyint(1) DEFAULT '0',
  `modelo_veiculo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `placa_veiculo` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_civil`),
  KEY `idx_orgao_origem` (`orgao_origem`),
  KEY `idx_motorista` (`motorista`),
  KEY `idx_placa_veiculo` (`placa_veiculo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela sci_recurso.logs_operacionais
CREATE TABLE IF NOT EXISTS `logs_operacionais` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `id_turno` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` bigint NOT NULL,
  `mensagem` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` enum('Informativo','Urgente','Equipe') COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_id_turno` (`id_turno`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_categoria` (`categoria`),
  KEY `idx_usuario` (`usuario`),
  KEY `idx_logs_turno_timestamp` (`id_turno`,`timestamp`),
  CONSTRAINT `logs_operacionais_ibfk_1` FOREIGN KEY (`id_turno`) REFERENCES `turnos` (`id_turno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela sci_recurso.militares
CREATE TABLE IF NOT EXISTS `militares` (
  `matricula` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_completo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posto_grad` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_guerra` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rg` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `forca` enum('CBMERJ','PMERJ','EB','MB','FAB','Outros') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cpoe` tinyint(1) DEFAULT '0',
  `mergulhador` tinyint(1) DEFAULT '0',
  `restricao_medica` tinyint(1) DEFAULT '0',
  `desc_rest_med` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`matricula`),
  KEY `idx_posto_grad` (`posto_grad`),
  KEY `idx_forca` (`forca`),
  KEY `idx_restricao_medica` (`restricao_medica`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para procedure sci_recurso.sp_criar_turno
DELIMITER //
CREATE PROCEDURE `sp_criar_turno`(
    IN p_data DATE,
    IN p_periodo VARCHAR(10)
)
BEGIN
    DECLARE v_id_turno VARCHAR(36);
    
    SET v_id_turno = UUID();
    
    INSERT INTO turnos (id_turno, data, periodo)
    VALUES (v_id_turno, p_data, p_periodo);
    
    SELECT v_id_turno AS id_turno;
END//
DELIMITER ;

-- Copiando estrutura para procedure sci_recurso.sp_efetivo_disponivel
DELIMITER //
CREATE PROCEDURE `sp_efetivo_disponivel`(
    IN p_data DATE,
    IN p_periodo VARCHAR(10)
)
BEGIN
    SELECT 
        'Militares' AS tipo,
        m.matricula,
        m.nome_completo,
        m.posto_grad,
        m.nome_guerra,
        CASE WHEN cm.presenca IS TRUE THEN 'Presente' ELSE 'Disponível' END AS status
    FROM militares m
    LEFT JOIN turnos t ON t.data = p_data AND t.periodo = p_periodo
    LEFT JOIN chamada_militar cm ON t.id_turno = cm.id_turno AND cm.matricula = m.matricula
    WHERE (cm.presenca IS NULL OR cm.presenca = FALSE)
    AND m.matricula NOT IN (
        SELECT matricula FROM atestados_medicos 
        WHERE (data_inicio + INTERVAL dias DAY) >= p_data
    )
    
    UNION ALL
    
    SELECT 
        'Civis' AS tipo,
        c.id_civil,
        c.nome_completo,
        c.orgao_origem,
        CASE WHEN c.motorista = TRUE THEN 'Motorista' ELSE 'Voluntário' END,
        'Disponível' AS status
    FROM civis c
    WHERE c.id_civil NOT IN (
        SELECT id_civil FROM chamada_civil cc
        INNER JOIN turnos t ON t.id_turno = cc.id_turno
        WHERE t.data = p_data AND t.periodo = p_periodo
    );
END//
DELIMITER ;

-- Copiando estrutura para tabela sci_recurso.turnos
CREATE TABLE IF NOT EXISTS `turnos` (
  `id_turno` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `data` date NOT NULL,
  `periodo` enum('Manhã','Noite') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_turno`),
  UNIQUE KEY `uk_data_periodo` (`data`,`periodo`),
  KEY `idx_data` (`data`),
  KEY `idx_periodo` (`periodo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela sci_recurso.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Administrador','Operador') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para view sci_recurso.vw_militares_restricoes
-- Criando tabela temporária para evitar erros de dependência de VIEW
CREATE TABLE `vw_militares_restricoes` (
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nome_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`posto_grad` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nome_guerra` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`desc_rest_med` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`data_inicio` DATE NOT NULL,
	`dias` INT NOT NULL,
	`motivo` TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`data_fim` DATE NULL,
	`status_atestado` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

-- Copiando estrutura para view sci_recurso.vw_resumo_civis_turno
-- Criando tabela temporária para evitar erros de dependência de VIEW
CREATE TABLE `vw_resumo_civis_turno` (
	`id_turno` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`data` DATE NOT NULL,
	`periodo` ENUM('Manhã','Noite') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`total_equipes` BIGINT NOT NULL,
	`total_civis` DECIMAL(32,0) NULL,
	`equipes_livres` DECIMAL(23,0) NULL,
	`equipes_empenhadas` DECIMAL(23,0) NULL,
	`equipes_pausa` DECIMAL(23,0) NULL
) ENGINE=MyISAM;

-- Copiando estrutura para view sci_recurso.vw_resumo_militares_turno
-- Criando tabela temporária para evitar erros de dependência de VIEW
CREATE TABLE `vw_resumo_militares_turno` (
	`id_turno` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`data` DATE NOT NULL,
	`periodo` ENUM('Manhã','Noite') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`total_militares` BIGINT NOT NULL,
	`presentes` DECIMAL(23,0) NULL,
	`ausentes` DECIMAL(23,0) NULL,
	`total_sci` DECIMAL(23,0) NULL,
	`total_combatentes` DECIMAL(23,0) NULL
) ENGINE=MyISAM;

-- Copiando estrutura para trigger sci_recurso.tr_chamada_civil_audit
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `tr_chamada_civil_audit` AFTER UPDATE ON `chamada_civil` FOR EACH ROW BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO logs_operacionais (id_turno, timestamp, mensagem, categoria, usuario)
        VALUES (NEW.id_turno, UNIX_TIMESTAMP(), 
                CONCAT('Status da equipe ', NEW.nome_equipe, ' alterado de ', OLD.status, ' para ', NEW.status),
                'Equipe', 'SYSTEM');
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Removendo tabela temporária e criando a estrutura VIEW final
DROP TABLE IF EXISTS `vw_militares_restricoes`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_militares_restricoes` AS select `m`.`matricula` AS `matricula`,`m`.`nome_completo` AS `nome_completo`,`m`.`posto_grad` AS `posto_grad`,`m`.`nome_guerra` AS `nome_guerra`,`m`.`desc_rest_med` AS `desc_rest_med`,`am`.`data_inicio` AS `data_inicio`,`am`.`dias` AS `dias`,`am`.`motivo` AS `motivo`,(`am`.`data_inicio` + interval `am`.`dias` day) AS `data_fim`,(case when ((`am`.`data_inicio` + interval `am`.`dias` day) >= curdate()) then 'Ativo' else 'Expirado' end) AS `status_atestado` from (`militares` `m` join `atestados_medicos` `am` on((`m`.`matricula` = `am`.`matricula`))) where ((`am`.`data_inicio` + interval `am`.`dias` day) >= curdate()) order by `am`.`data_inicio` desc;

-- Removendo tabela temporária e criando a estrutura VIEW final
DROP TABLE IF EXISTS `vw_resumo_civis_turno`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_resumo_civis_turno` AS select `t`.`id_turno` AS `id_turno`,`t`.`data` AS `data`,`t`.`periodo` AS `periodo`,count(`cc`.`id_chamada_civil`) AS `total_equipes`,sum(`cc`.`quant_civil`) AS `total_civis`,sum((case when (`cc`.`status` = 'livre') then 1 else 0 end)) AS `equipes_livres`,sum((case when (`cc`.`status` = 'empenhada') then 1 else 0 end)) AS `equipes_empenhadas`,sum((case when (`cc`.`status` = 'pausa-operacional') then 1 else 0 end)) AS `equipes_pausa` from (`turnos` `t` left join `chamada_civil` `cc` on((`t`.`id_turno` = `cc`.`id_turno`))) group by `t`.`id_turno`,`t`.`data`,`t`.`periodo`;

-- Removendo tabela temporária e criando a estrutura VIEW final
DROP TABLE IF EXISTS `vw_resumo_militares_turno`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_resumo_militares_turno` AS select `t`.`id_turno` AS `id_turno`,`t`.`data` AS `data`,`t`.`periodo` AS `periodo`,count(`cm`.`id_chamada_militar`) AS `total_militares`,sum((case when (`cm`.`presenca` = true) then 1 else 0 end)) AS `presentes`,sum((case when (`cm`.`presenca` = false) then 1 else 0 end)) AS `ausentes`,sum((case when (`cm`.`funcao` = 'SCI') then 1 else 0 end)) AS `total_sci`,sum((case when (`cm`.`funcao` = 'Combatente') then 1 else 0 end)) AS `total_combatentes` from (`turnos` `t` left join `chamada_militar` `cm` on((`t`.`id_turno` = `cm`.`id_turno`))) group by `t`.`id_turno`,`t`.`data`,`t`.`periodo`;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
