-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           8.0.45 - MySQL Community Server - GPL
-- OS do Servidor:               Linux
-- HeidiSQL Versão:              12.16.0.7229
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
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `matricula` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_inicio` date NOT NULL,
  `dias` int NOT NULL,
  `motivo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_matricula` (`matricula`),
  KEY `idx_data_inicio` (`data_inicio`),
  KEY `idx_atestados_periodo` (`matricula`,`data_inicio`,`dias`),
  CONSTRAINT `atestados_medicos_ibfk_1` FOREIGN KEY (`matricula`) REFERENCES `militares` (`matricula`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.atestados_medicos: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela sci_recurso.chamada_civil
CREATE TABLE IF NOT EXISTS `chamada_civil` (
  `id_chamada_civil` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `id_turno` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_civil` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quant_civil` int NOT NULL DEFAULT '1',
  `saida` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_chamada_civil`),
  KEY `idx_id_turno` (`id_turno`),
  KEY `idx_id_civil` (`id_civil`),
  KEY `idx_chamada_civil_turno_status` (`id_turno`),
  CONSTRAINT `chamada_civil_id_turno` FOREIGN KEY (`id_turno`) REFERENCES `turnos` (`id_turno`) ON DELETE CASCADE,
  CONSTRAINT `chamada_civil_ibfk_2` FOREIGN KEY (`id_civil`) REFERENCES `civis` (`id_civil`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.chamada_civil: ~2 rows (aproximadamente)
INSERT INTO `chamada_civil` (`id_chamada_civil`, `id_turno`, `id_civil`, `quant_civil`, `saida`, `created_at`, `updated_at`) VALUES
	('6cf742ec-08db-40e4-ab38-ddaa96e36d83', '71d8e044-26ce-11f1-ac39-167ecf302036', '3eca771d-0907-11f1-bf45-28c5c8c3080c', 2, '11:06:00', '2026-03-23 15:39:43', '2026-03-23 16:06:19'),
	('eca404bb-9d7b-4b08-8c96-d52af2ce45d3', '71d8e044-26ce-11f1-ac39-167ecf302036', '3eca65d4-0907-11f1-bf45-28c5c8c3080c', 3, NULL, '2026-03-23 15:39:43', '2026-03-23 15:39:52');

-- Copiando estrutura para tabela sci_recurso.chamada_militar
CREATE TABLE IF NOT EXISTS `chamada_militar` (
  `id_chamada_militar` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `id_turno` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `matricula` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `funcao` enum('SCI','Combatente') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `presenca` enum('PRESENTE','AUSENTE','PERMUTA','ATESTADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'AUSENTE',
  `obs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_chamada_militar`),
  KEY `idx_id_turno` (`id_turno`),
  KEY `idx_matricula` (`matricula`),
  KEY `idx_funcao` (`funcao`),
  KEY `idx_presenca` (`presenca`) USING BTREE,
  KEY `idx_chamada_militar_turno_presenca` (`id_turno`,`presenca`) USING BTREE,
  CONSTRAINT `chamada_militar_ibfk_2` FOREIGN KEY (`matricula`) REFERENCES `militares` (`matricula`) ON DELETE CASCADE,
  CONSTRAINT `fk_chamada_militar_turno` FOREIGN KEY (`id_turno`) REFERENCES `turnos` (`id_turno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.chamada_militar: ~3 rows (aproximadamente)
INSERT INTO `chamada_militar` (`id_chamada_militar`, `id_turno`, `matricula`, `funcao`, `presenca`, `obs`, `created_at`, `updated_at`) VALUES
	('24093f59-c091-489d-9c01-ca341f1a3500', '71d8e044-26ce-11f1-ac39-167ecf302036', '9606580', 'SCI', 'PRESENTE', NULL, '2026-03-23 15:39:29', '2026-03-23 15:39:36'),
	('a458299f-0c09-4c26-9296-4c9c6250c890', '71d8e044-26ce-11f1-ac39-167ecf302036', '9606327', 'Combatente', 'PRESENTE', NULL, '2026-03-23 15:39:29', '2026-03-23 15:39:36'),
	('beb257c1-ac56-4a8f-9c6c-b0bab4ded17a', '71d8e044-26ce-11f1-ac39-167ecf302036', '9606866', 'Combatente', 'PRESENTE', NULL, '2026-03-23 15:39:29', '2026-03-23 15:39:35');

-- Copiando estrutura para tabela sci_recurso.civis
CREATE TABLE IF NOT EXISTS `civis` (
  `id_civil` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `nome_completo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contato` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `motorista` enum('Y','N') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'N',
  `modelo_veiculo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `placa_veiculo` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_orgao_origem` int NOT NULL,
  PRIMARY KEY (`id_civil`),
  KEY `idx_motorista` (`motorista`),
  KEY `idx_placa_veiculo` (`placa_veiculo`),
  KEY `fk_civis_orgao_origem` (`id_orgao_origem`),
  CONSTRAINT `fk_civis_orgao_origem` FOREIGN KEY (`id_orgao_origem`) REFERENCES `orgaos_origem` (`id_orgao_origem`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.civis: ~25 rows (aproximadamente)
INSERT INTO `civis` (`id_civil`, `nome_completo`, `contato`, `motorista`, `modelo_veiculo`, `placa_veiculo`, `created_at`, `updated_at`, `id_orgao_origem`) VALUES
	('3eca5b1f-0907-11f1-bf45-28c5c8c3080c', 'ANTÔNIO FÉLIX DA COSTA', '(68) 9 9900-9966', 'Y', 'CAÇAMBA', 'JX5-6H36', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 4),
	('3eca625f-0907-11f1-bf45-28c5c8c3080c', 'FRANCISCO SALES DE LIMA', '(68) 9 9951-9697', 'Y', 'CARGA SECA', 'MZW-2C50', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 5),
	('3eca63c4-0907-11f1-bf45-28c5c8c3080c', 'LUIS ZENE', '(68) 9 9229-3702', 'Y', 'CARGA SECA', 'QWO-5F00', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 3),
	('3eca64d6-0907-11f1-bf45-28c5c8c3080c', 'SAMUEL', '(68) 9 9939-9498', 'Y', 'CARGA SECA', 'MZZ-5903', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 5),
	('3eca65d4-0907-11f1-bf45-28c5c8c3080c', 'ANDERSON DE OLIVEIRA', '(68) 9 9988-6908', 'Y', 'CAMIONETE', 'OHV-4G03', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 6),
	('3eca6709-0907-11f1-bf45-28c5c8c3080c', 'JOÃO RAMOS', '(68) 9 9974-0014', 'Y', 'CARGA SECA', 'MZV-6B19', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 5),
	('3eca6801-0907-11f1-bf45-28c5c8c3080c', 'DAMIÃO DE SOUZA', '(68) 9 9225-0565', 'Y', 'CAMIONETE', 'QLV-1H56', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 6),
	('3eca691a-0907-11f1-bf45-28c5c8c3080c', 'PAULO EDER', '(68) 9 9994-5020', 'Y', 'CAÇAMBA', 'NOO-9G60', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 6),
	('3eca6a14-0907-11f1-bf45-28c5c8c3080c', 'JOCICLEI OLIVEIRA', '(68) 9 9971-8964', 'Y', 'ABERTO', 'NAB-5448', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 3),
	('3eca6b02-0907-11f1-bf45-28c5c8c3080c', 'GILMAR LOPES', '(68) 9 9256-9125', 'Y', 'CAÇAMBA', 'JLP-8AN2', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 6),
	('3eca6bfb-0907-11f1-bf45-28c5c8c3080c', 'ISRAEL IALE LIMA DE SOUZA', '(68) 9 8115-5755', 'Y', 'CARGA SECA', 'QLZ-6739', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 2),
	('3eca6d0b-0907-11f1-bf45-28c5c8c3080c', 'MANOEL RIBEIRO DE LIMA', '(68) 9 9929-5807', 'Y', 'CAÇAMBA', 'QWQ-2A82', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 5),
	('3eca6e02-0907-11f1-bf45-28c5c8c3080c', 'JEFE SANDRÉ DE OLIVEIRA SUSSUARANA', '(68) 9 9987-0113', 'Y', 'CARGA SECA', 'NAB3G16', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 5),
	('3eca6ef2-0907-11f1-bf45-28c5c8c3080c', 'RAIMUNDO NOBRE', '(68) 9 9234-2511', 'Y', 'CAÇAMBA', 'MZS-7A54', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 6),
	('3eca6fec-0907-11f1-bf45-28c5c8c3080c', 'JOSÉ EPAMINONDAS', '(68) 9 9922-4141', 'Y', 'CARGA SECA', 'QLZ-6739', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 2),
	('3eca70e2-0907-11f1-bf45-28c5c8c3080c', 'GILSON DE PAULA ALVES', '(68) 9 9961-7991', 'Y', 'CAÇAMBA', 'QWQ-2A62', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 5),
	('3eca71f0-0907-11f1-bf45-28c5c8c3080c', 'GLEISON LIMA COSTA', '(68) 9 9908-2002', 'Y', 'CARGA SECA', 'QWN-5D18', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 3),
	('3eca730c-0907-11f1-bf45-28c5c8c3080c', 'VILMAR LOPES', '(68) 9 9256-9125', 'Y', 'CAÇAMBA', 'JPL-8A92', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 6),
	('3eca7400-0907-11f1-bf45-28c5c8c3080c', 'JOSÉ DE OLIVEIRA MAIA', '(68) 9 9988-6075', 'Y', 'CAÇAMBA', 'QWQ-2A62', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 5),
	('3eca750d-0907-11f1-bf45-28c5c8c3080c', 'ANTÔNIO FRETIAS DE LIMA', '(68) 9 9224-1024', 'Y', 'CAÇAMBA', 'ANA-7H62', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 6),
	('3eca7609-0907-11f1-bf45-28c5c8c3080c', 'JOÃO CUNHA DE LIMA', '(68) 9 9941-4824', 'Y', 'CARGA SECA', 'SQR-3B81', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 6),
	('3eca771d-0907-11f1-bf45-28c5c8c3080c', 'ADALTO DA COSTA', '(68) 9 9965-8315', 'Y', 'CARGA SECA', 'QLV-7010', '2026-02-13 18:10:14', '2026-03-16 15:23:32', 2),
	('3eca7821-0907-11f1-bf45-28c5c8c3080c', 'JOSEBY PINHEIRO DE LIMA', '(68) 9 9212-2120', 'Y', 'CARGA SECA', 'SQR-3B81', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 6),
	('3eca7979-0907-11f1-bf45-28c5c8c3080c', 'FRANCISCO FRAZÃO', '(68) 9 9234-3470', 'Y', 'CAÇAMBA', 'MZP-7H71', '2026-02-13 18:10:14', '2026-02-13 18:10:14', 7),
	('CIV_1773944043045_GWTTJL', 'teste', '3434343434', 'N', NULL, NULL, '2026-03-19 18:14:03', '2026-03-19 18:14:03', 1);

-- Copiando estrutura para tabela sci_recurso.componentes_equipe
CREATE TABLE IF NOT EXISTS `componentes_equipe` (
  `id_componente` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_equipe` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_chamada_militar` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_turno` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_componente`),
  KEY `id_equipe` (`id_equipe`),
  KEY `id_chamada_militar` (`id_chamada_militar`),
  KEY `id_turno` (`id_turno`),
  CONSTRAINT `componentes_equipe_ibfk_1` FOREIGN KEY (`id_equipe`) REFERENCES `equipes` (`id_equipe`) ON DELETE CASCADE,
  CONSTRAINT `componentes_equipe_ibfk_2` FOREIGN KEY (`id_chamada_militar`) REFERENCES `chamada_militar` (`id_chamada_militar`) ON DELETE CASCADE,
  CONSTRAINT `componentes_equipe_ibfk_3` FOREIGN KEY (`id_turno`) REFERENCES `turnos` (`id_turno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.componentes_equipe: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela sci_recurso.equipes
CREATE TABLE IF NOT EXISTS `equipes` (
  `id_equipe` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `id_turno` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_chamada_militar` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_chamada_civil` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nome_equipe` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('livre','empenhada','pausa-operacional') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'livre',
  `total_efetivo` int DEFAULT '0',
  `bairro` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_equipe`),
  KEY `id_chamada_militar` (`id_chamada_militar`),
  KEY `id_chamada_civil` (`id_chamada_civil`),
  KEY `idx_id_turno` (`id_turno`),
  KEY `idx_status` (`status`),
  CONSTRAINT `equipes_ibfk_1` FOREIGN KEY (`id_turno`) REFERENCES `turnos` (`id_turno`) ON DELETE CASCADE,
  CONSTRAINT `equipes_ibfk_2` FOREIGN KEY (`id_chamada_militar`) REFERENCES `chamada_militar` (`id_chamada_militar`) ON DELETE SET NULL,
  CONSTRAINT `equipes_ibfk_3` FOREIGN KEY (`id_chamada_civil`) REFERENCES `chamada_civil` (`id_chamada_civil`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.equipes: ~2 rows (aproximadamente)
INSERT INTO `equipes` (`id_equipe`, `id_turno`, `id_chamada_militar`, `id_chamada_civil`, `nome_equipe`, `status`, `total_efetivo`, `bairro`, `created_at`, `updated_at`) VALUES
	('8abe20ce-26ce-11f1-ac39-167ecf302036', '71d8e044-26ce-11f1-ac39-167ecf302036', 'a458299f-0c09-4c26-9296-4c9c6250c890', '6cf742ec-08db-40e4-ab38-ddaa96e36d83', 'Alpha', 'livre', 0, NULL, '2026-03-23 15:39:55', '2026-03-23 15:40:02'),
	('8c9eb289-26ce-11f1-ac39-167ecf302036', '71d8e044-26ce-11f1-ac39-167ecf302036', 'beb257c1-ac56-4a8f-9c6c-b0bab4ded17a', 'eca404bb-9d7b-4b08-8c96-d52af2ce45d3', 'Bravo', 'livre', 0, NULL, '2026-03-23 15:39:58', '2026-03-23 15:40:03');

-- Copiando estrutura para tabela sci_recurso.forcas
CREATE TABLE IF NOT EXISTS `forcas` (
  `id_forca` int NOT NULL AUTO_INCREMENT,
  `nome_forca` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_forca`),
  UNIQUE KEY `nome_forca` (`nome_forca`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.forcas: ~8 rows (aproximadamente)
INSERT INTO `forcas` (`id_forca`, `nome_forca`, `created_at`, `updated_at`) VALUES
	(1, 'CBMAC', '2026-02-12 14:24:18', '2026-02-12 14:24:18'),
	(2, 'PMAC', '2026-02-12 14:24:18', '2026-03-18 18:13:16'),
	(3, 'EB', '2026-02-12 14:24:18', '2026-02-12 14:24:18'),
	(4, 'MB', '2026-02-12 14:24:18', '2026-02-12 14:24:18'),
	(5, 'FAB', '2026-02-12 14:24:18', '2026-02-12 14:24:18'),
	(6, 'PC', '2026-02-12 14:24:18', '2026-02-12 14:24:18'),
	(7, 'Outros', '2026-02-12 14:24:18', '2026-02-12 14:24:18');

-- Copiando estrutura para tabela sci_recurso.logs_sistema
CREATE TABLE IF NOT EXISTS `logs_sistema` (
  `id_log` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `data_hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `acao` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entidade` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `registro_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  KEY `idx_logs_data_hora` (`data_hora` DESC),
  KEY `idx_logs_usuario` (`usuario`),
  KEY `idx_logs_acao` (`acao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.logs_sistema: ~456 rows (aproximadamente)
INSERT INTO `logs_sistema` (`id_log`, `data_hora`, `usuario`, `acao`, `entidade`, `registro_id`, `descricao`, `ip_address`, `user_agent`, `created_at`) VALUES
	('015c5950-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:05:11', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:05:11'),
	('0160646e-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:05:11', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:05:11'),
	('01632d78-23c2-11f1-8bdd-02b959b4417d', '2026-03-19 13:32:38', 'Administrador', 'CREATE', 'chamada_militar', 'd5ff7b0b-117f-4d27-9eff-b45436bc219c', 'Adicionado militar CEL FONTES à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:32:37'),
	('01fe9da5-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:22:15', 'Administrador', 'DELETE', 'chamada_militar', '8af5a6a5-efa0-4e63-898d-3916f2620f74', 'Removido militar CEL ÉDEN da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:22:15'),
	('0245d6e8-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:19:23', 'Administrador', 'UPDATE', 'chamada_militar', '47c5d5df-2e34-4920-b99a-4f3c672c0c6e', 'Atualizado militar SD ALBUQUERQUE na chamada (turno 19/03/2026 - Noite)Alterações: funcao: "Combatente" → "SCI", presenca: "PRESENTE" → "undefined", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:19:22'),
	('032a8563-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:22:17', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:22:17'),
	('032eaeba-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:22:17', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:22:17'),
	('0352c202-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:12:24', 'Administrador', 'UPDATE', 'forcas', '2', 'Atualizada força PMAC1Alterações: nome_forca: "PMAC" → "PMAC1", created_at: "Thu Feb 12 2026 14:24:18 GMT-0500 (Horário Padrão do Acre)" → "Thu Feb 12 2026 14:24:18 GMT-0500 (Horário Padrão do Acre)", updated_at: "Fri Feb 27 2026 16:27:02 GMT-0500 (Horário Padrão do Acre)" → "Wed Mar 18 2026 18:12:23 GMT-0500 (Horário Padrão do Acre)"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:12:23'),
	('03889478-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:56:54', 'Administrador', 'DELETE', 'turno', 'de2dc0f8-23a6-11f1-8bdd-02b959b4417d', 'Removido turno 19/03/2026 - Noite', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:56:54'),
	('04b2d931-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:12:26', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:12:26'),
	('04b78c4e-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:12:26', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:12:26'),
	('04d08660-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:56:56', 'Administrador', 'DELETE', 'turno', 'adbde420-22f7-11f1-bbc4-8aa4cc4f03dc', 'Removido turno 18/03/2026 - Manhã', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:56:56'),
	('062466ff-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:19:38', 'Administrador', 'CREATE', 'orgaos_origem', '9', 'Criado órgão de origem TESTE', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:19:38'),
	('07010a94-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:19:31', 'Administrador', 'UPDATE', 'chamada_militar', '47c5d5df-2e34-4920-b99a-4f3c672c0c6e', 'Atualizado militar SD ALBUQUERQUE na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "null" → "undefined", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:19:30'),
	('07355d97-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:19:31', 'Administrador', 'UPDATE', 'chamada_militar', '47c5d5df-2e34-4920-b99a-4f3c672c0c6e', 'Atualizado militar SD ALBUQUERQUE na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "null" → "undefined", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:19:31'),
	('074f9a10-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:19:31', 'Administrador', 'UPDATE', 'chamada_militar', '47c5d5df-2e34-4920-b99a-4f3c672c0c6e', 'Atualizado militar SD ALBUQUERQUE na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "null" → "undefined", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:19:31'),
	('0768a5e4-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:19:32', 'Administrador', 'UPDATE', 'chamada_militar', '47c5d5df-2e34-4920-b99a-4f3c672c0c6e', 'Atualizado militar SD ALBUQUERQUE na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "null" → "undefined", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:19:31'),
	('0802f3a5-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:19:41', 'Administrador', 'UPDATE', 'orgaos_origem', '9', 'Atualizado órgão de origem TESTE2 | Alterações: nome_orgao: "TESTE" → "TESTE2"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:19:41'),
	('09220d7e-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:19:43', 'Administrador', 'DELETE', 'orgaos_origem', '9', 'Excluído órgão de origem TESTE2', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:19:43'),
	('0a7768e0-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:19:45', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:19:45'),
	('0a7a1155-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:19:45', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:19:45'),
	('0cd0ae75-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:19:41', 'Administrador', 'CREATE', 'chamada_militar', '0c3e8832-8a4e-4e82-b999-53d580252ac7', 'Adicionado militar 2º SGT ALBUQUERQUE à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:19:40'),
	('0cd58b9b-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:19:41', 'Administrador', 'CREATE', 'chamada_militar', 'fa5e038f-e607-4174-8a94-c520b47fce4d', 'Adicionado militar 3º SGT S ALBUQUERQUE à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:19:40'),
	('0e5deb8e-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:57:12', 'Administrador', 'CREATE', 'turno', NULL, 'Criado turno Turno do dia 17/03/2026: Manhã', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:57:12'),
	('11d49007-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:19:58', 'Administrador', 'CREATE', 'ubm', '21', 'Criada UBM TESTE', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:19:57'),
	('12a1b51b-26cf-11f1-ac39-167ecf302036', '2026-03-23 10:43:44', 'admin', 'READ', 'PESSOAL', NULL, 'Erro: Erro interno do servidor', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:43:43'),
	('12d7e96d-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:57:20', 'Administrador', 'CREATE', 'chamada_militar', '96b54bfa-70c4-4a78-92fe-47cc48221d6b', 'Adicionado militar CEL ÉDEN à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:57:19'),
	('12dc2b11-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:57:20', 'Administrador', 'CREATE', 'chamada_militar', 'd4666b33-24f3-4a1a-a787-1525048d603a', 'Adicionado militar CEL FONTES à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:57:19'),
	('12e0763f-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:57:20', 'Administrador', 'CREATE', 'chamada_militar', '847cba39-7b2f-4fff-b2be-b30290d50208', 'Adicionado militar 1º TEN MISMA FERNANDES à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:57:19'),
	('1391497a-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:20:01', 'Administrador', 'UPDATE', 'ubm', '21', 'Atualizada UBM TESTE1 | Alterações: nome_ubm: "TESTE" → "TESTE1"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:20:00'),
	('14a9b03d-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:20:02', 'Administrador', 'DELETE', 'ubm', '21', 'Excluída UBM TESTE1', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:20:02'),
	('15990098-26cf-11f1-ac39-167ecf302036', '2026-03-23 10:43:49', 'admin', 'READ', 'TURNO', NULL, 'Erro: Erro interno do servidor', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:43:48'),
	('15e4b3fa-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:29:58', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:29:57'),
	('15e70b50-2462-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:38:32', 'Administrador', 'DELETE', 'chamada_militar', '35946b75-9cd3-49e9-80bb-dea51ad5d839', 'Removido militar CEL ÉDEN da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:38:31'),
	('15e9d16b-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:29:58', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:29:58'),
	('165d4681-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:20:05', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:20:05'),
	('16604218-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:20:05', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:20:05'),
	('180d1f10-2462-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:38:35', 'Administrador', 'CREATE', 'chamada_militar', '247b8bf8-86fa-43d3-8f1c-754a366e7e84', 'Adicionado militar CEL ÉDEN à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:38:35'),
	('19bb2683-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:57:31', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:57:31'),
	('19cd1d56-2462-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:38:38', 'Administrador', 'DELETE', 'chamada_militar', '247b8bf8-86fa-43d3-8f1c-754a366e7e84', 'Removido militar CEL ÉDEN da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:38:38'),
	('1a75cece-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:22:56', 'Administrador', 'UPDATE', 'militar', '3452531', 'Atualizado militar ÉDEN - ÉDEN DA SILVA SANTOSAlterações: cpoe: "N" → "true", mergulhador: "Y" → "true", restricao_medica: "N" → "false"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:22:56'),
	('1ab8ef5b-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:57:33', 'Administrador', 'UPDATE', 'equipe', '19b97d35-23bd-11f1-8bdd-02b959b4417d', 'Atualizada equipe Alpha (turno 18/03/2026 - Manhã) | Alterações: Chefe de Equipe: "vazio" → "1º TEN MISMA FERNANDES"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:57:32'),
	('1bad87ff-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:20:06', 'Administrador', 'UPDATE', 'chamada_militar', '47c5d5df-2e34-4920-b99a-4f3c672c0c6e', 'Atualizado militar SD ALBUQUERQUE na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "null" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:20:05'),
	('1bf34de2-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:22:59', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:22:58'),
	('1bf71203-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:22:59', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:22:58'),
	('1dcd40e0-2473-11f1-aac1-8a31bbc50cd3', '2026-03-20 10:40:26', 'Administrador', 'DELETE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Removido militar CEL ÉDEN da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 15:40:26'),
	('1fd718eb-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:20:21', 'Administrador', 'DELETE', 'usuario', 'user_1773857509525_321891', 'Excluído usuário user_1773857509525_321891', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:20:21'),
	('2081d7df-2473-11f1-aac1-8a31bbc50cd3', '2026-03-20 10:40:31', 'Administrador', 'CREATE', 'chamada_militar', '61428f4a-3fd3-45e8-b4f0-a9ea71067ad5', 'Adicionado militar CEL ÉDEN à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 15:40:31'),
	('2086c6d9-2473-11f1-aac1-8a31bbc50cd3', '2026-03-20 10:40:31', 'Administrador', 'CREATE', 'chamada_militar', '5d0e6af2-de3c-4a18-bf47-ef4b1c9d903f', 'Adicionado militar CEL FONTES à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 15:40:31'),
	('208bc14f-2473-11f1-aac1-8a31bbc50cd3', '2026-03-20 10:40:31', 'Administrador', 'CREATE', 'chamada_militar', 'fe8d74e7-994b-4ce8-b34e-78a922c0d4b8', 'Adicionado militar CEL MIRANDA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 15:40:31'),
	('209034a9-2473-11f1-aac1-8a31bbc50cd3', '2026-03-20 10:40:31', 'Administrador', 'CREATE', 'chamada_militar', '0b3a0441-1b99-4701-aced-34cc2d100529', 'Adicionado militar MAJ ATHOS à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 15:40:31'),
	('209a0ecc-2473-11f1-aac1-8a31bbc50cd3', '2026-03-20 10:40:31', 'Administrador', 'CREATE', 'chamada_militar', '16337200-6d81-47ff-a584-a1521ae15b52', 'Adicionado militar MAJ BIASOLI à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 15:40:31'),
	('20d758d8-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:30:16', 'Administrador', 'CREATE', 'atestados_medicos', 'atest_1773855016355', 'Criado atestado para SD EWERTON', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:30:16'),
	('227ac33b-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:30:19', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:30:19'),
	('227e8945-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:30:19', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:30:19'),
	('22d540d3-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:13:17', 'Administrador', 'UPDATE', 'forcas', '2', 'Atualizada força PMACAlterações: nome_forca: "PMAC1" → "PMAC", created_at: "Thu Feb 12 2026 14:24:18 GMT-0500 (Horário Padrão do Acre)" → "Thu Feb 12 2026 14:24:18 GMT-0500 (Horário Padrão do Acre)", updated_at: "Wed Mar 18 2026 18:12:23 GMT-0500 (Horário Padrão do Acre)" → "Wed Mar 18 2026 18:13:16 GMT-0500 (Horário Padrão do Acre)"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:13:16'),
	('252e4f4d-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:30:24', 'Administrador', 'DELETE', 'atestados_medicos', 'atest_1773855016355', 'Removido atestado médico atest_1773855016355 de SD EWERTON', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:30:23'),
	('2644d1ff-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:13:22', 'Administrador', 'UPDATE', 'posto_grad', '1', 'Atualizado posto/graduação AL SD1Alterações: nome_posto_grad: "AL SD" → "AL SD1", created_at: "Tue Feb 10 2026 17:26:53 GMT-0500 (Horário Padrão do Acre)" → "Tue Feb 10 2026 17:26:53 GMT-0500 (Horário Padrão do Acre)", updated_at: "Fri Feb 27 2026 16:26:37 GMT-0500 (Horário Padrão do Acre)" → "Wed Mar 18 2026 18:13:22 GMT-0500 (Horário Padrão do Acre)"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:13:22'),
	('266a652a-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:20:32', 'Administrador', 'CREATE', 'usuario', 'user_1773858032183_988875', 'Criado usuário teste', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:20:32'),
	('27e710ec-23c2-11f1-8bdd-02b959b4417d', '2026-03-19 13:33:43', 'Administrador', 'CREATE', 'chamada_militar', '03476015-d9e5-4c80-92f6-79ead637eda5', 'Adicionado militar CEL MIRANDA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:33:42'),
	('28164fd7-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:13:26', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:13:25'),
	('2819f6d2-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:20:35', 'admin', 'DELETE', 'API', 'e1b2dbc9-3388-4ac5-a7c2-0266f877be6a', 'Erro: Cannot read properties of undefined (reading \'0\')', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:20:35'),
	('281acf86-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:13:26', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:13:25'),
	('28b075dd-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:13', 'Administrador', 'CREATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Adicionado militar CEL ÉDEN à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:12'),
	('28f7e933-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:26:35', 'Administrador', 'CREATE', 'chamada_militar', 'eab31c22-d917-4c94-853d-5d7fecb4e700', 'Adicionado militar MAJ DYEGO VIEIRA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:26:34'),
	('2a3e51fa-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:20:39', 'admin', 'DELETE', 'API', 'e1b2dbc9-3388-4ac5-a7c2-0266f877be6a', 'Erro: Cannot read properties of undefined (reading \'0\')', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:20:38'),
	('2fd81187-26d0-11f1-ac39-167ecf302036', '2026-03-23 10:51:42', 'admin', 'READ', 'PESSOAL', NULL, 'Erro: Parâmetros obrigatórios: matricula, dataInicio, dataFim', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:51:42'),
	('2fe5049c-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:30:42', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Alpha', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:30:41'),
	('30480206-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:26:47', 'Administrador', 'DELETE', 'chamada_militar', '681367e0-4ceb-4d06-b77f-c35446f8c018', 'Removido militar MAJ ATHOS da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:26:47'),
	('309b2d30-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:20:49', 'Administrador', 'DELETE', 'usuario', 'user_1773858032183_988875', 'Excluído usuário user_1773858032183_988875', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:20:49'),
	('30ea2640-2476-11f1-aac1-8a31bbc50cd3', '2026-03-20 11:02:27', 'Administrador', 'UPDATE', 'chamada_militar', '5d0e6af2-de3c-4a18-bf47-ef4b1c9d903f', 'Atualizado militar CEL FONTES na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "Combatente" → "SCI", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 16:02:27'),
	('30f258b1-2476-11f1-aac1-8a31bbc50cd3', '2026-03-20 11:02:27', 'Administrador', 'UPDATE', 'chamada_militar', '61428f4a-3fd3-45e8-b4f0-a9ea71067ad5', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "Combatente" → "SCI", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 16:02:27'),
	('314bc393-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:30:44', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:30:43'),
	('314ea2b7-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:30:44', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:30:43'),
	('31e60090-26d0-11f1-ac39-167ecf302036', '2026-03-23 10:51:46', 'admin', 'READ', 'PESSOAL', NULL, 'Erro: Parâmetros obrigatórios: matricula, dataInicio, dataFim', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:51:45'),
	('32a016d9-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:29', 'Administrador', 'UPDATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "AUSENTE" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:29'),
	('334eb640-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:31', 'Administrador', 'UPDATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "PRESENTE" → "AUSENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:30'),
	('33e14ade-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:32', 'Administrador', 'UPDATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "AUSENTE" → "PERMUTA", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:31'),
	('3423ac48-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:32', 'Administrador', 'UPDATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "PERMUTA" → "ATESTADO", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:32'),
	('3471e7c1-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:33', 'Administrador', 'UPDATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "ATESTADO" → "PERMUTA", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:32'),
	('34ad4719-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:33', 'Administrador', 'UPDATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "PERMUTA" → "AUSENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:32'),
	('34e64d87-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:33', 'Administrador', 'UPDATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "AUSENTE" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:33'),
	('353b7e60-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:34', 'Administrador', 'UPDATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "PRESENTE" → "AUSENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:33'),
	('355b1511-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:26:56', 'Administrador', 'UPDATE', 'chamada_militar', 'd7fd8bac-0f55-4950-8a20-27827e21cfb1', 'Atualizado militar MAJ BIASOLI na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "Combatente" → "SCI", presenca: "PRESENTE" → "undefined", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:26:55'),
	('35b94983-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:35', 'Administrador', 'UPDATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "AUSENTE" → "PERMUTA", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:34'),
	('35ef0ecf-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:35', 'Administrador', 'UPDATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "PERMUTA" → "ATESTADO", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:35'),
	('35f53cd0-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:23:42', 'Administrador', 'UPDATE', 'militar', '3452531', 'Atualizado militar ÉDEN - ÉDEN DA SILVA SANTOSAlterações: cpoe: "Y" → "false", mergulhador: "Y" → "true", restricao_medica: "N" → "false"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:23:42'),
	('36285149-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:26:57', 'Administrador', 'UPDATE', 'chamada_militar', '14301240-3147-4021-bbeb-33b8ec19a6b6', 'Atualizado militar CEL FONTES na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "Combatente" → "SCI", presenca: "PRESENTE" → "undefined", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:26:56'),
	('364e71b7-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:36', 'Administrador', 'UPDATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "ATESTADO" → "PERMUTA", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:35'),
	('365caa51-22f8-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:28:08', 'Administrador', 'CREATE', 'chamada_civil', '66bd7305-68a1-40f6-85bd-1e74912634ed', 'Adicionado civil ADALTO DA COSTA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:28:08'),
	('3662333a-22f8-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:28:08', 'Administrador', 'CREATE', 'chamada_civil', 'f86451ee-5b52-4d99-852d-8ccc9d18533d', 'Adicionado civil ANDERSON DE OLIVEIRA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:28:08'),
	('3692132b-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:36', 'Administrador', 'UPDATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "PERMUTA" → "AUSENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:36'),
	('36e5ca3b-2463-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:46:37', 'Administrador', 'UPDATE', 'chamada_militar', '61ce795a-b785-4f6c-858a-ba0183780f74', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "AUSENTE" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:46:36'),
	('37e45fe1-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:30:55', 'Administrador', 'DELETE', 'equipe', '2fe28c9d-22f0-11f1-bbc4-8aa4cc4f03dc', 'Excluída equipe Alpha', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:30:55'),
	('37fac7da-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:23:46', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:23:45'),
	('37fdf908-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:23:46', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:23:45'),
	('3952ae96-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:30:57', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:30:57'),
	('39562240-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:30:57', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:30:57'),
	('3a845243-26d2-11f1-ac39-167ecf302036', '2026-03-23 11:06:19', 'Administrador', 'UPDATE', 'chamada_civil', '6cf742ec-08db-40e4-ab38-ddaa96e36d83', 'Atualizado civil na chamadaAlterações: saida: "null" → "11:06:00", created_at: "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)" → "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)", updated_at: "Mon Mar 23 2026 15:39:47 GMT-0500 (Horário Padrão do Acre)" → "Mon Mar 23 2026 16:06:19 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 16:06:19'),
	('3e088223-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:21:03', 'Administrador', 'UPDATE', 'chamada_militar', '0c3e8832-8a4e-4e82-b999-53d580252ac7', 'Atualizado militar 2º SGT ALBUQUERQUE na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "PRESENTE" → "AUSENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:21:03'),
	('3ea958d3-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:21:04', 'Administrador', 'UPDATE', 'chamada_militar', '47c5d5df-2e34-4920-b99a-4f3c672c0c6e', 'Atualizado militar SD ALBUQUERQUE na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "PRESENTE" → "AUSENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:21:04'),
	('3f05cd1c-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:21:05', 'Administrador', 'UPDATE', 'chamada_militar', '9e534137-94b8-4b96-85c7-861d9693c50e', 'Atualizado militar SD EWERTON na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "PRESENTE" → "AUSENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:21:04'),
	('3f14c009-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:14:04', 'Administrador', 'UPDATE', 'posto_grad', '1', 'Atualizado posto/graduação AL SDAlterações: nome_posto_grad: "AL SD1" → "AL SD", created_at: "Tue Feb 10 2026 17:26:53 GMT-0500 (Horário Padrão do Acre)" → "Tue Feb 10 2026 17:26:53 GMT-0500 (Horário Padrão do Acre)", updated_at: "Wed Mar 18 2026 18:13:22 GMT-0500 (Horário Padrão do Acre)" → "Wed Mar 18 2026 18:14:04 GMT-0500 (Horário Padrão do Acre)"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:14:04'),
	('3fc106be-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:31:08', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Alpha', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:31:08'),
	('3fd79f19-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:21:06', 'Administrador', 'UPDATE', 'chamada_militar', 'fa5e038f-e607-4174-8a94-c520b47fce4d', 'Atualizado militar 3º SGT S ALBUQUERQUE na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "PRESENTE" → "AUSENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:21:06'),
	('40518699-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:21:07', 'Administrador', 'UPDATE', 'chamada_militar', '28efda41-471d-4996-a514-d37603032ff0', 'Atualizado militar SD WILKER na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "PRESENTE" → "AUSENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:21:07'),
	('40c4388d-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:21:16', 'admin', 'LOGIN', 'AUTH', NULL, 'Usuário fez login no sistema', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:21:16'),
	('42cfcc35-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:21:20', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:21:19'),
	('42d3080d-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:21:20', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:21:19'),
	('430444ea-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:04', 'Administrador', 'CREATE', 'militar', '123131', 'Criado militar teste - teste', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:04'),
	('4471db2b-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:31:16', 'Administrador', 'CREATE', 'chamada_militar', 'e7f7e341-6538-487b-90f1-c976e9f0b80f', 'Adicionado militar CEL ÉDEN à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:31:16'),
	('44775d48-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:31:16', 'Administrador', 'CREATE', 'chamada_militar', '8783a555-7cc5-46e5-b978-729970040121', 'Adicionado militar CEL FONTES à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:31:16'),
	('447f8b4d-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:07', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:06'),
	('44822707-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:07', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:06'),
	('45d17d74-245c-11f1-aac1-8a31bbc50cd3', '2026-03-20 07:56:55', 'admin', 'CREATE', 'API', NULL, 'Erro: Dados inválidos: presenca: Invalid option: expected one of "PRESENTE"|"AUSENTE"|"PERMUTA"|"ATESTADO"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 12:56:55'),
	('4609f5a9-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:31:19', 'Administrador', 'UPDATE', 'chamada_militar', 'e7f7e341-6538-487b-90f1-c976e9f0b80f', 'Atualizado militar CEL ÉDEN na chamada (turno 16/03/2026 - Manhã)Alterações: obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:31:18'),
	('46609d0c-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:31:19', 'Administrador', 'UPDATE', 'chamada_militar', '8783a555-7cc5-46e5-b978-729970040121', 'Atualizado militar CEL FONTES na chamada (turno 16/03/2026 - Manhã)Alterações: obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:31:19'),
	('476f3aea-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:14:18', 'Administrador', 'UPDATE', 'orgaos_origem', '2', 'Atualizado órgão de origem SMCCI1Alterações: nome_orgao: "SMCCI" → "SMCCI1", created_at: "Thu Feb 12 2026 14:24:18 GMT-0500 (Horário Padrão do Acre)" → "Thu Feb 12 2026 14:24:18 GMT-0500 (Horário Padrão do Acre)", updated_at: "Fri Feb 27 2026 16:24:59 GMT-0500 (Horário Padrão do Acre)" → "Wed Mar 18 2026 18:14:18 GMT-0500 (Horário Padrão do Acre)"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:14:18'),
	('47725611-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:17:02', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:17:02'),
	('47754e9a-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:17:02', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:17:02'),
	('48080c0c-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:17:03', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:17:03'),
	('480cc20c-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:17:03', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:17:03'),
	('4919121d-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:31:24', 'Administrador', 'UPDATE', 'equipe', '3fbf37ed-22f0-11f1-bbc4-8aa4cc4f03dc', 'Atualizada equipe AlphaAlterações: id_chamada_militar: "null" → "8783a555-7cc5-46e5-b978-729970040121"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:31:23'),
	('49240388-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:14:21', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:14:20'),
	('49275110-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:14:21', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:14:20'),
	('4b8794ba-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:18', 'Administrador', 'DELETE', 'militar', '123131', 'Excluído militar teste - teste', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:18'),
	('4bd78ff1-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:21:26', 'Administrador', 'UPDATE', 'chamada_militar', '47c5d5df-2e34-4920-b99a-4f3c672c0c6e', 'Atualizado militar SD ALBUQUERQUE na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "AUSENTE" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:21:26'),
	('4c2da8f6-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:21:27', 'Administrador', 'UPDATE', 'chamada_militar', '0c3e8832-8a4e-4e82-b999-53d580252ac7', 'Atualizado militar 2º SGT ALBUQUERQUE na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "AUSENTE" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:21:26'),
	('4c920a25-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:21:28', 'Administrador', 'UPDATE', 'chamada_militar', '9e534137-94b8-4b96-85c7-861d9693c50e', 'Atualizado militar SD EWERTON na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "AUSENTE" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:21:27'),
	('4cff6644-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:21:28', 'Administrador', 'UPDATE', 'chamada_militar', 'fa5e038f-e607-4174-8a94-c520b47fce4d', 'Atualizado militar 3º SGT S ALBUQUERQUE na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "AUSENTE" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:21:28'),
	('4d4e0bfd-245c-11f1-aac1-8a31bbc50cd3', '2026-03-20 07:57:08', 'admin', 'CREATE', 'API', NULL, 'Erro: Dados inválidos: presenca: Invalid option: expected one of "PRESENTE"|"AUSENTE"|"PERMUTA"|"ATESTADO"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 12:57:07'),
	('4d566487-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:21:29', 'Administrador', 'UPDATE', 'chamada_militar', '28efda41-471d-4996-a514-d37603032ff0', 'Atualizado militar SD WILKER na chamada (turno 19/03/2026 - Noite)Alterações: presenca: "AUSENTE" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:21:28'),
	('4d6fdae2-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:22', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:21'),
	('4d72ee24-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:22', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:21'),
	('4ef32724-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:59:01', 'Administrador', 'UPDATE', 'chamada_militar', 'd4666b33-24f3-4a1a-a787-1525048d603a', 'Atualizado militar CEL FONTES na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "Combatente" → "SCI", presenca: "PRESENTE" → "undefined", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:59:00'),
	('4ef67b42-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:07:21', 'Administrador', 'CREATE', 'chamada_civil', '5a8c30c1-8327-4c02-8c7d-fcb91c047b3d', 'Adicionado civil ADALTO DA COSTA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:07:21'),
	('4f621dcf-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:17:15', 'Administrador', 'DELETE', 'chamada_militar', 'd505ef11-89f5-4af1-8ed9-e2b81aebb0cd', 'Removido militar VERAS da chamada (turno 16/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:17:15'),
	('4fb0fca2-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:59:02', 'Administrador', 'UPDATE', 'chamada_militar', '96b54bfa-70c4-4a78-92fe-47cc48221d6b', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "Combatente" → "SCI", presenca: "PRESENTE" → "undefined", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:59:01'),
	('50dbad11-22f8-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:28:53', 'Administrador', 'DELETE', 'chamada_civil', 'f86451ee-5b52-4d99-852d-8ccc9d18533d', 'Removido civil ANDERSON DE OLIVEIRA da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:28:52'),
	('51944e2d-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:17:19', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:17:19'),
	('5196bf06-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:17:19', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:17:19'),
	('51e46b39-22f8-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:28:55', 'Administrador', 'DELETE', 'chamada_civil', '66bd7305-68a1-40f6-85bd-1e74912634ed', 'Removido civil ADALTO DA COSTA da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:28:54'),
	('52523e67-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:07:27', 'Administrador', 'UPDATE', 'equipe', 'e642cb12-22f0-11f1-bbc4-8aa4cc4f03dc', 'Atualizada equipe Alpha (turno 16/03/2026 - Manhã) | Alterações: Motorista: "vazio" → "ADALTO DA COSTA"Alterações: id_chamada_civil: "null" → "5a8c30c1-8327-4c02-8c7d-fcb91c047b3d"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:07:26'),
	('5274e3a6-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:59:06', 'Administrador', 'DELETE', 'equipe', '19b97d35-23bd-11f1-8bdd-02b959b4417d', 'Excluída equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:59:06'),
	('53ecc9c0-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:07:30', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:07:29'),
	('53f051a9-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:07:30', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:07:29'),
	('549e6fe7-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:59:10', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:59:10'),
	('54da3b16-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:34', 'Administrador', 'CREATE', 'civil', 'CIV_1773854674112_T0DWWA', 'Criado civil teste', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:34'),
	('54dbdcad-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:06:20', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:06:19'),
	('560ec39c-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:36', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:36'),
	('5612f9fe-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:36', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:36'),
	('56653658-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:21:44', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Alpha (turno 19/03/2026 - Noite)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:21:44'),
	('56f81281-245c-11f1-aac1-8a31bbc50cd3', '2026-03-20 07:57:24', 'admin', 'CREATE', 'API', NULL, 'Erro: Dados inválidos: presenca: Invalid option: expected one of "PRESENTE"|"AUSENTE"|"PERMUTA"|"ATESTADO"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 12:57:23'),
	('581fdb82-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:31:49', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:31:49'),
	('5824458e-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:31:49', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:31:49'),
	('58f8f6b7-23c2-11f1-8bdd-02b959b4417d', '2026-03-19 13:35:05', 'Administrador', 'CREATE', 'chamada_militar', 'dbcd7ec0-247d-4316-b7a1-cfa3695b3763', 'Adicionado militar MAJ BIASOLI à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:35:04'),
	('59d0dfb5-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:21:50', 'Administrador', 'UPDATE', 'equipe', '56632b58-23a7-11f1-8bdd-02b959b4417d', 'Atualizada equipe Alpha (turno 19/03/2026 - Noite) | Alterações: Chefe de Equipe: "vazio" → "SD EWERTON"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:21:49'),
	('5a4a3372-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:43', 'Administrador', 'UPDATE', 'civil', 'CIV_1773854674112_T0DWWA', 'Atualizado civil testeAlterações: id_orgao_origem: "1" → "6", motorista: "N" → "false"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:43'),
	('5b4ac0ee-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:45', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:44'),
	('5b4d4413-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:45', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:44'),
	('5c1bbfd2-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:17:37', 'Administrador', 'CREATE', 'turno', NULL, 'Criado turno Turno do dia 17/03/2026: Manhã', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:17:36'),
	('5dca4b4b-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:17:40', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:17:39'),
	('5dcde126-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:17:40', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:17:39'),
	('5ebd2e18-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:06:37', 'Administrador', 'CREATE', 'chamada_militar', '14a91a7c-ba21-4f79-bb5c-5ceaf354b62e', 'Adicionado militar MAJ DYEGO VIEIRA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:06:36'),
	('5f7c2759-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:59:28', 'Administrador', 'UPDATE', 'chamada_militar', '96b54bfa-70c4-4a78-92fe-47cc48221d6b', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "null" → "undefined", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:59:28'),
	('60135c51-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:53', 'Administrador', 'DELETE', 'civil', 'CIV_1773854674112_T0DWWA', 'Excluído civil teste', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:52'),
	('6027d79d-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:15:00', 'Administrador', 'UPDATE', 'orgaos_origem', '2', 'Atualizado órgão de origem SMCCIAlterações: nome_orgao: "SMCCI1" → "SMCCI", created_at: "Thu Feb 12 2026 14:24:18 GMT-0500 (Horário Padrão do Acre)" → "Thu Feb 12 2026 14:24:18 GMT-0500 (Horário Padrão do Acre)", updated_at: "Wed Mar 18 2026 18:14:18 GMT-0500 (Horário Padrão do Acre)" → "Wed Mar 18 2026 18:14:59 GMT-0500 (Horário Padrão do Acre)"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:14:59'),
	('6033357b-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 12:59:29', 'Administrador', 'UPDATE', 'chamada_militar', 'd4666b33-24f3-4a1a-a787-1525048d603a', 'Atualizado militar CEL FONTES na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "null" → "undefined", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 17:59:29'),
	('618de206-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:55', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:55'),
	('61913204-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:24:55', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:24:55'),
	('634abd16-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:15:05', 'Administrador', 'UPDATE', 'ubm', '2', 'Atualizada UBM QCG1Alterações: nome_ubm: "QCG" → "QCG1", created_at: "Tue Feb 10 2026 15:23:20 GMT-0500 (Horário Padrão do Acre)" → "Tue Feb 10 2026 15:23:20 GMT-0500 (Horário Padrão do Acre)", updated_at: "Tue Feb 10 2026 15:23:20 GMT-0500 (Horário Padrão do Acre)" → "Wed Mar 18 2026 18:15:04 GMT-0500 (Horário Padrão do Acre)"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:15:04'),
	('64fe863f-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:15:08', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:15:07'),
	('6502b65c-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:15:08', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:15:07'),
	('65ab7db8-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:21:07', 'Administrador', 'DELETE', 'chamada_militar', '14a91a7c-ba21-4f79-bb5c-5ceaf354b62e', 'Removido militar MAJ DYEGO VIEIRA da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:21:07'),
	('65de1a1f-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:15:01', 'Administrador', 'UPDATE', 'chamada_militar', '707746d0-85af-415a-bfb4-88917219ad8a', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "PRESENTE" → "AUSENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:15:00'),
	('6667ce35-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:15:01', 'Administrador', 'UPDATE', 'chamada_militar', '67c138fe-8e15-44ad-ac88-702ba4aa0ffa', 'Atualizado militar CEL FONTES na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "PRESENTE" → "AUSENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:15:01'),
	('668acaff-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:21:09', 'Administrador', 'DELETE', 'chamada_militar', '96b54bfa-70c4-4a78-92fe-47cc48221d6b', 'Removido militar CEL ÉDEN da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:21:08'),
	('6774d034-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:21:10', 'Administrador', 'DELETE', 'chamada_militar', 'd4666b33-24f3-4a1a-a787-1525048d603a', 'Removido militar CEL FONTES da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:21:10'),
	('68128405-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:17:57', 'Administrador', 'CREATE', 'chamada_civil', '94883609-d2da-48e2-80f9-c4853189eaef', 'Adicionado civil à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:17:56'),
	('68c00c35-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:21:12', 'Administrador', 'DELETE', 'chamada_militar', '847cba39-7b2f-4fff-b2be-b30290d50208', 'Removido militar 1º TEN MISMA FERNANDES da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:21:12'),
	('68e2aa75-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:14:03', 'Administrador', 'CREATE', 'civil', 'CIV_1773944043045_GWTTJL', 'Criado civil teste', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:14:03'),
	('6929bd7d-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:15:06', 'Administrador', 'DELETE', 'chamada_militar', '707746d0-85af-415a-bfb4-88917219ad8a', 'Removido militar CEL ÉDEN da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:15:06'),
	('695497e8-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:25:08', 'Administrador', 'CREATE', 'atestados_medicos', 'atest_1773854708471', 'Criado atestado para matrícula 9606580', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:25:08'),
	('699132e3-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:17:59', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:17:59'),
	('6993beb0-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:17:59', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:17:59'),
	('6aa68cd9-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:25:11', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:25:10'),
	('6aa96abe-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:25:11', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:25:10'),
	('6afefa25-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:14:07', 'Administrador', 'CREATE', 'chamada_civil', '3a6e3175-02cd-4b2f-a734-caa7063aad86', 'Adicionado civil teste à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:14:06'),
	('6b4a01d1-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:15:10', 'Administrador', 'DELETE', 'chamada_militar', '67c138fe-8e15-44ad-ac88-702ba4aa0ffa', 'Removido militar CEL FONTES da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:15:09'),
	('6b8f372c-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:21:17', 'admin', 'CREATE', 'CHAMADA-MILITAR', NULL, 'Erro: Token inválido ou expirado', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:21:17'),
	('6c443bb4-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:05', 'admin', 'READ', 'PESSOAL', NULL, 'Erro: Erro interno do servidor', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:04'),
	('6c6675a4-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:14:09', 'Administrador', 'UPDATE', 'chamada_civil', '3a6e3175-02cd-4b2f-a734-caa7063aad86', 'Atualizado civil na chamadaAlterações: quant_civil: "0" → "1", created_at: "Thu Mar 19 2026 18:14:06 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:14:06 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:14:06 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:14:08 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "teste", contato: "undefined" → "3434343434", nome_orgao: "undefined" → "Defesa Civil"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:14:08'),
	('6c8a11bb-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:14:09', 'Administrador', 'UPDATE', 'chamada_civil', '3a6e3175-02cd-4b2f-a734-caa7063aad86', 'Atualizado civil na chamadaAlterações: quant_civil: "1" → "2", created_at: "Thu Mar 19 2026 18:14:06 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:14:06 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:14:08 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:14:09 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "teste", contato: "undefined" → "3434343434", nome_orgao: "undefined" → "Defesa Civil"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:14:09'),
	('6ccca2b7-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:14:10', 'Administrador', 'UPDATE', 'chamada_civil', '3a6e3175-02cd-4b2f-a734-caa7063aad86', 'Atualizado civil na chamadaAlterações: quant_civil: "2" → "3", created_at: "Thu Mar 19 2026 18:14:06 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:14:06 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:14:09 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:14:09 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "teste", contato: "undefined" → "3434343434", nome_orgao: "undefined" → "Defesa Civil"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:14:09'),
	('6cd79856-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:15:12', 'Administrador', 'CREATE', 'chamada_civil', '01450248-8a84-4d61-af76-c8024764f664', 'Adicionado civil ADALTO DA COSTA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:15:12'),
	('6d050f5f-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:14:10', 'Administrador', 'UPDATE', 'chamada_civil', '3a6e3175-02cd-4b2f-a734-caa7063aad86', 'Atualizado civil na chamadaAlterações: quant_civil: "3" → "4", created_at: "Thu Mar 19 2026 18:14:06 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:14:06 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:14:09 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:14:09 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "teste", contato: "undefined" → "3434343434", nome_orgao: "undefined" → "Defesa Civil"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:14:09'),
	('6d39b8a7-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:14:10', 'Administrador', 'UPDATE', 'chamada_civil', '3a6e3175-02cd-4b2f-a734-caa7063aad86', 'Atualizado civil na chamadaAlterações: quant_civil: "4" → "5", created_at: "Thu Mar 19 2026 18:14:06 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:14:06 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:14:09 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:14:10 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "teste", contato: "undefined" → "3434343434", nome_orgao: "undefined" → "Defesa Civil"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:14:10'),
	('6dc23001-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:14:11', 'Administrador', 'UPDATE', 'chamada_civil', '3a6e3175-02cd-4b2f-a734-caa7063aad86', 'Atualizado civil na chamadaAlterações: quant_civil: "5" → "4", created_at: "Thu Mar 19 2026 18:14:06 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:14:06 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:14:10 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:14:11 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "teste", contato: "undefined" → "3434343434", nome_orgao: "undefined" → "Defesa Civil"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:14:11'),
	('6dfe227d-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:15:14', 'Administrador', 'DELETE', 'chamada_civil', '01450248-8a84-4d61-af76-c8024764f664', 'Removido civil ADALTO DA COSTA da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:15:14'),
	('703fa3f6-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:21:25', 'admin', 'LOGIN', 'AUTH', NULL, 'Usuário fez login no sistema', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:21:24'),
	('70cf164e-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:18:12', 'Administrador', 'DELETE', 'chamada_civil', '94883609-d2da-48e2-80f9-c4853189eaef', 'Removido civil ADALTO DA COSTA da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:18:11'),
	('7131f795-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:25:22', 'Administrador', 'DELETE', 'atestados_medicos', 'atest_1773854708471', 'Removido atestado médico atest_1773854708471 da matrícula ', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:25:21'),
	('71da665c-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:14', 'Administrador', 'CREATE', 'turno', NULL, 'Criado turno Turno do dia 19/03/2026: Manhã', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:14'),
	('722b58ef-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:18:14', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:18:13'),
	('722d2dbf-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:18:14', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:18:13'),
	('7393ae33-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:25:26', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:25:25'),
	('739750a3-22ef-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:25:26', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:25:25'),
	('74563473-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:21:32', 'Administrador', 'CREATE', 'chamada_militar', 'bdd7e140-be77-4e55-a35a-9c901f9c198e', 'Adicionado militar CEL ÉDEN à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:21:31'),
	('745a74f1-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:21:32', 'Administrador', 'CREATE', 'chamada_militar', 'e5d9b0ae-5cee-484f-8975-f73b955102c7', 'Adicionado militar CEL FONTES à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:21:31'),
	('745e124c-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:21:32', 'Administrador', 'CREATE', 'chamada_militar', '735dc18b-4798-4e59-a29c-8619932baa23', 'Adicionado militar CEL MIRANDA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:21:31'),
	('74626586-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:21:32', 'Administrador', 'CREATE', 'chamada_militar', 'fc9eae0d-cb71-4fd3-b65d-e829ded7ebbb', 'Adicionado militar MAJ ATHOS à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:21:31'),
	('787fb1cf-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:15:32', 'Administrador', 'CREATE', 'atestados_medicos', 'atest_1773933331824', 'Criado atestado para SD EWERTON', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:15:31'),
	('7a7f0527-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:15:35', 'Administrador', 'DELETE', 'atestados_medicos', 'atest_1773933331824', 'Removido atestado médico atest_1773933331824 de SD EWERTON', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:15:35'),
	('7aec8c1c-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:22:45', 'Administrador', 'CREATE', 'componentes_equipe', 'comp_1773933765388_3wzlw', 'Adicionado componente 2º SGT ALBUQUERQUE à equipe Alpha (turno 19/03/2026 - Noite)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:22:45'),
	('7b01222f-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:29', 'Administrador', 'CREATE', 'chamada_militar', '24093f59-c091-489d-9c01-ca341f1a3500', 'Adicionado militar SD EWERTON à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:29'),
	('7b072537-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:29', 'Administrador', 'CREATE', 'chamada_militar', 'beb257c1-ac56-4a8f-9c6c-b0bab4ded17a', 'Adicionado militar SD WILKER à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:29'),
	('7b0e9cf6-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:29', 'Administrador', 'CREATE', 'chamada_militar', 'a458299f-0c09-4c26-9296-4c9c6250c890', 'Adicionado militar SD ALBUQUERQUE à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:29'),
	('7b8c7464-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:15:46', 'Administrador', 'UPDATE', 'ubm', '2', 'Atualizada UBM QCGAlterações: nome_ubm: "QCG1" → "QCG", created_at: "Tue Feb 10 2026 15:23:20 GMT-0500 (Horário Padrão do Acre)" → "Tue Feb 10 2026 15:23:20 GMT-0500 (Horário Padrão do Acre)", updated_at: "Wed Mar 18 2026 18:15:04 GMT-0500 (Horário Padrão do Acre)" → "Wed Mar 18 2026 18:15:45 GMT-0500 (Horário Padrão do Acre)"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:15:45'),
	('7c271f7c-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:31', 'Administrador', 'UPDATE', 'chamada_militar', '24093f59-c091-489d-9c01-ca341f1a3500', 'Atualizado militar SD EWERTON na chamada (turno 19/03/2026 - Manhã)Alterações: funcao: "Combatente" → "SCI", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:31'),
	('7eb65128-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:36', 'Administrador', 'UPDATE', 'chamada_militar', 'beb257c1-ac56-4a8f-9c6c-b0bab4ded17a', 'Atualizado militar SD WILKER na chamada (turno 19/03/2026 - Manhã)Alterações: presenca: "AUSENTE" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:35'),
	('7f07270d-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:36', 'Administrador', 'UPDATE', 'chamada_militar', '24093f59-c091-489d-9c01-ca341f1a3500', 'Atualizado militar SD EWERTON na chamada (turno 19/03/2026 - Manhã)Alterações: presenca: "AUSENTE" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:36'),
	('7f317cd1-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:15:43', 'Administrador', 'CREATE', 'civil', 'CIV_1773933343049_6CDQ4R', 'Criado civil teste', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:15:43'),
	('7f894b23-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:37', 'Administrador', 'UPDATE', 'chamada_militar', 'a458299f-0c09-4c26-9296-4c9c6250c890', 'Atualizado militar SD ALBUQUERQUE na chamada (turno 19/03/2026 - Manhã)Alterações: presenca: "AUSENTE" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:37'),
	('81069de1-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:07:34', 'Administrador', 'UPDATE', 'equipe', '54d9e3a5-23be-11f1-8bdd-02b959b4417d', 'Atualizada equipe Alpha (turno 18/03/2026 - Manhã) | Alterações: Chefe de Equipe: "vazio" → "MAJ DYEGO VIEIRA"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:07:34'),
	('8120f0b7-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:15:46', 'Administrador', 'DELETE', 'civil', 'CIV_1773933343049_6CDQ4R', 'Excluído civil teste', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:15:46'),
	('824a2bf0-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:07:36', 'Administrador', 'CREATE', 'componentes_equipe', 'comp_1773943656172_4gdjw', 'Adicionado componente 1º TEN MISMA FERNANDES à equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:07:36'),
	('83a75fcb-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:44', 'Administrador', 'CREATE', 'chamada_civil', '6cf742ec-08db-40e4-ab38-ddaa96e36d83', 'Adicionado civil ADALTO DA COSTA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:43'),
	('83ab1c75-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:44', 'Administrador', 'CREATE', 'chamada_civil', 'eca404bb-9d7b-4b08-8c96-d52af2ce45d3', 'Adicionado civil ANDERSON DE OLIVEIRA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:43'),
	('84b966d2-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:46', 'Administrador', 'UPDATE', 'chamada_civil', '6cf742ec-08db-40e4-ab38-ddaa96e36d83', 'Atualizado civil na chamadaAlterações: quant_civil: "0" → "1", created_at: "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)" → "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)", updated_at: "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)" → "Mon Mar 23 2026 15:39:45 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:45'),
	('8562dd89-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:11:37', 'Administrador', 'DELETE', 'turno', '77b96e57-22ed-11f1-bbc4-8aa4cc4f03dc', 'Removido turno 18/03/2026', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:11:36'),
	('85826eab-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:47', 'Administrador', 'UPDATE', 'chamada_civil', '6cf742ec-08db-40e4-ab38-ddaa96e36d83', 'Atualizado civil na chamadaAlterações: quant_civil: "1" → "2", created_at: "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)" → "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)", updated_at: "Mon Mar 23 2026 15:39:45 GMT-0500 (Horário Padrão do Acre)" → "Mon Mar 23 2026 15:39:47 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:47'),
	('859f7ce7-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:29:10', 'Administrador', 'CREATE', 'chamada_militar', '78a318bd-8900-4923-867a-618657f4ca19', 'Adicionado militar MAJ EURICO à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:29:10'),
	('85a510f2-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:29:10', 'Administrador', 'CREATE', 'chamada_militar', '30226340-a274-429e-87f6-d45d0be8d79b', 'Adicionado militar MAJ ATHOS à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:29:10'),
	('863e8d6b-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:11:38', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:11:38'),
	('863ea4d9-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:11:38', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:11:38'),
	('8716eafe-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 13:00:35', 'Administrador', 'UPDATE', 'chamada_militar', '847cba39-7b2f-4fff-b2be-b30290d50208', 'Atualizado militar 1º TEN MISMA FERNANDES na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "Combatente" → "SCI", presenca: "PRESENTE" → "undefined", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:00:34'),
	('87b87892-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 13:00:36', 'Administrador', 'UPDATE', 'chamada_militar', '847cba39-7b2f-4fff-b2be-b30290d50208', 'Atualizado militar 1º TEN MISMA FERNANDES na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "SCI" → "Combatente", presenca: "null" → "undefined", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:00:35'),
	('8862f72c-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:52', 'Administrador', 'UPDATE', 'chamada_civil', 'eca404bb-9d7b-4b08-8c96-d52af2ce45d3', 'Atualizado civil na chamadaAlterações: quant_civil: "0" → "1", created_at: "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)" → "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)", updated_at: "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)" → "Mon Mar 23 2026 15:39:51 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ANDERSON DE OLIVEIRA", contato: "undefined" → "(68) 9 9988-6908", nome_orgao: "undefined" → "SEAGRO"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:51'),
	('88834187-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:52', 'Administrador', 'UPDATE', 'chamada_civil', 'eca404bb-9d7b-4b08-8c96-d52af2ce45d3', 'Atualizado civil na chamadaAlterações: quant_civil: "1" → "2", created_at: "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)" → "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)", updated_at: "Mon Mar 23 2026 15:39:51 GMT-0500 (Horário Padrão do Acre)" → "Mon Mar 23 2026 15:39:52 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ANDERSON DE OLIVEIRA", contato: "undefined" → "(68) 9 9988-6908", nome_orgao: "undefined" → "SEAGRO"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:52'),
	('889a0360-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:52', 'Administrador', 'UPDATE', 'chamada_civil', 'eca404bb-9d7b-4b08-8c96-d52af2ce45d3', 'Atualizado civil na chamadaAlterações: quant_civil: "2" → "3", created_at: "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)" → "Mon Mar 23 2026 15:39:43 GMT-0500 (Horário Padrão do Acre)", updated_at: "Mon Mar 23 2026 15:39:52 GMT-0500 (Horário Padrão do Acre)" → "Mon Mar 23 2026 15:39:52 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ANDERSON DE OLIVEIRA", contato: "undefined" → "(68) 9 9988-6908", nome_orgao: "undefined" → "SEAGRO"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:52'),
	('88bb8a12-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:09', 'Administrador', 'CREATE', 'chamada_civil', '52695995-467f-46ab-96dc-623fcfcb7fc8', 'Adicionado civil ADALTO DA COSTA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:08'),
	('88bfe20f-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:09', 'Administrador', 'CREATE', 'chamada_civil', 'df7dac6d-4054-4032-b4b3-a0f2df1b6e2f', 'Adicionado civil ANDERSON DE OLIVEIRA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:08'),
	('88c3dff9-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:09', 'Administrador', 'CREATE', 'chamada_civil', '2dc72217-1b2f-47f2-aed4-e3fbcd91fbf2', 'Adicionado civil ANTÔNIO FRETIAS DE LIMA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:08'),
	('88c8a7ca-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:09', 'Administrador', 'CREATE', 'chamada_civil', '2767c706-622a-47d5-8972-3702b9f3f70a', 'Adicionado civil ANTÔNIO FÉLIX DA COSTA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:08'),
	('89b5e646-22f2-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:47:31', 'Administrador', 'UPDATE', 'equipe', 'e642cb12-22f0-11f1-bbc4-8aa4cc4f03dc', 'Atualizada equipe Alpha (turno 16/03/2026 - Manhã) | Alterações: status: "livre" → "empenhada"Alterações: status: "livre" → "empenhada"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:47:31'),
	('8ac04429-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:56', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Alpha (turno 19/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:55'),
	('8ac5f5a1-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:07:50', 'Administrador', 'CREATE', 'chamada_civil', '0f6adf27-0a70-48e2-8ddd-507065f96e57', 'Adicionado civil ADALTO DA COSTA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:07:50'),
	('8ac9f7fa-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:07:50', 'Administrador', 'CREATE', 'chamada_civil', '9eccbc8f-cac5-43c4-b334-046af42fde98', 'Adicionado civil ANDERSON DE OLIVEIRA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:07:50'),
	('8ace3cf5-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:07:50', 'Administrador', 'CREATE', 'chamada_civil', '4aca5f0d-17fa-4a8e-91ab-c2da92d67dd3', 'Adicionado civil ANTÔNIO FÉLIX DA COSTA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:07:50'),
	('8ad1d92b-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:07:50', 'Administrador', 'CREATE', 'chamada_civil', 'adfae467-051a-4370-a620-7f55147560d9', 'Adicionado civil ANTÔNIO FRETIAS DE LIMA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:07:50'),
	('8b06a97c-2477-11f1-aac1-8a31bbc50cd3', '2026-03-20 11:12:08', 'Administrador', 'UPDATE', 'chamada_militar', '61428f4a-3fd3-45e8-b4f0-a9ea71067ad5', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "AUSENTE" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 16:12:07'),
	('8b95e451-22f2-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:47:34', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:47:34'),
	('8b98b2d3-22f2-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:47:34', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:47:34'),
	('8c0b7106-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:58', 'Administrador', 'UPDATE', 'equipe', '8abe20ce-26ce-11f1-ac39-167ecf302036', 'Atualizada equipe Alpha (turno 19/03/2026 - Manhã) | Alterações: Chefe de Equipe: "vazio" → "SD ALBUQUERQUE"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:57'),
	('8ca04aa0-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:39:59', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Bravo (turno 19/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:39:58'),
	('8cc75611-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:07:54', 'Administrador', 'UPDATE', 'chamada_civil', '0f6adf27-0a70-48e2-8ddd-507065f96e57', 'Atualizado civil na chamadaAlterações: quant_civil: "0" → "1", created_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:53 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:07:53'),
	('8ccdf28c-2477-11f1-aac1-8a31bbc50cd3', '2026-03-20 11:12:11', 'Administrador', 'UPDATE', 'equipe', 'bcc9e1e0-2476-11f1-aac1-8a31bbc50cd3', 'Atualizada equipe Alpha (turno 18/03/2026 - Manhã) | Alterações: Chefe de Equipe: "vazio" → "CEL ÉDEN"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 16:12:10'),
	('8ce2b29d-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:07:54', 'Administrador', 'UPDATE', 'chamada_civil', '0f6adf27-0a70-48e2-8ddd-507065f96e57', 'Atualizado civil na chamadaAlterações: quant_civil: "1" → "2", created_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:07:53 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:53 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:07:53'),
	('8cfb4194-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:07:54', 'Administrador', 'UPDATE', 'chamada_civil', '0f6adf27-0a70-48e2-8ddd-507065f96e57', 'Atualizado civil na chamadaAlterações: quant_civil: "2" → "3", created_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:07:53 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:54 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:07:54'),
	('8d129061-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:07:54', 'Administrador', 'UPDATE', 'chamada_civil', '0f6adf27-0a70-48e2-8ddd-507065f96e57', 'Atualizado civil na chamadaAlterações: quant_civil: "3" → "4", created_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:07:54 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:54 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:07:54'),
	('8d8fca97-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:40:01', 'Administrador', 'UPDATE', 'equipe', '8c9eb289-26ce-11f1-ac39-167ecf302036', 'Atualizada equipe Bravo (turno 19/03/2026 - Manhã) | Alterações: Chefe de Equipe: "vazio" → "SD WILKER"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:40:00'),
	('8da38320-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:07:55', 'Administrador', 'UPDATE', 'chamada_civil', 'adfae467-051a-4370-a620-7f55147560d9', 'Atualizado civil na chamadaAlterações: quant_civil: "0" → "1", created_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:55 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ANTÔNIO FRETIAS DE LIMA", contato: "undefined" → "(68) 9 9224-1024", nome_orgao: "undefined" → "SEAGRO"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:07:55'),
	('8de8095a-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:07:56', 'Administrador', 'UPDATE', 'chamada_civil', 'adfae467-051a-4370-a620-7f55147560d9', 'Atualizado civil na chamadaAlterações: quant_civil: "1" → "2", created_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:07:55 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:55 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ANTÔNIO FRETIAS DE LIMA", contato: "undefined" → "(68) 9 9224-1024", nome_orgao: "undefined" → "SEAGRO"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:07:55'),
	('8df4d0d0-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:19:00', 'Administrador', 'CREATE', 'chamada_militar', '62633b1c-0eb5-45be-8514-b34ff9e55038', 'Adicionado militar à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:19:00'),
	('8ea4f79b-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:23:27', 'Administrador', 'DELETE', 'turno', 'f4400745-2165-11f1-b9dc-822d1480bc1e', 'Removido turno 16/03/2026 - Manhã', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:23:27'),
	('8eaae1f4-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:40:02', 'Administrador', 'UPDATE', 'equipe', '8abe20ce-26ce-11f1-ac39-167ecf302036', 'Atualizada equipe Alpha (turno 19/03/2026 - Manhã) | Alterações: Motorista: "vazio" → "ADALTO DA COSTA"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:40:02'),
	('8edc763e-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:11:52', 'Administrador', 'DELETE', 'equipe', 'fa86ce21-2166-11f1-b9dc-822d1480bc1e', 'Excluída equipe Alpha', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:11:52'),
	('8f279cd0-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:29:26', 'Administrador', 'DELETE', 'chamada_militar', '30226340-a274-429e-87f6-d45d0be8d79b', 'Removido militar MAJ ATHOS da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:29:26'),
	('8f7907d9-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:40:04', 'Administrador', 'UPDATE', 'equipe', '8c9eb289-26ce-11f1-ac39-167ecf302036', 'Atualizada equipe Bravo (turno 19/03/2026 - Manhã) | Alterações: Motorista: "vazio" → "ANDERSON DE OLIVEIRA"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:40:03'),
	('8fa65866-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:19:03', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:19:03'),
	('8fa8d434-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:19:03', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:19:03'),
	('8fc9ec00-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:07:59', 'Administrador', 'UPDATE', 'chamada_civil', '9eccbc8f-cac5-43c4-b334-046af42fde98', 'Atualizado civil na chamadaAlterações: quant_civil: "0" → "1", created_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:58 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ANDERSON DE OLIVEIRA", contato: "undefined" → "(68) 9 9988-6908", nome_orgao: "undefined" → "SEAGRO"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:07:58'),
	('8fce3f60-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:23:29', 'Administrador', 'DELETE', 'turno', '5c19f410-22ee-11f1-bbc4-8aa4cc4f03dc', 'Removido turno 18/03/2026 - Manhã', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:23:29'),
	('8fea135e-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:29:28', 'Administrador', 'DELETE', 'chamada_militar', 'd7fd8bac-0f55-4950-8a20-27827e21cfb1', 'Removido militar MAJ BIASOLI da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:29:27'),
	('9018deee-2477-11f1-aac1-8a31bbc50cd3', '2026-03-20 11:12:16', 'Administrador', 'DELETE', 'equipe', 'bcc9e1e0-2476-11f1-aac1-8a31bbc50cd3', 'Excluída equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 16:12:16'),
	('9019f4d3-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:11:55', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:11:54'),
	('901aa03b-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:11:55', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:11:54'),
	('90d09cea-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:29:29', 'Administrador', 'DELETE', 'chamada_militar', 'eab31c22-d917-4c94-853d-5d7fecb4e700', 'Removido militar MAJ DYEGO VIEIRA da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:29:29'),
	('915a5563-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:08:01', 'Administrador', 'UPDATE', 'chamada_civil', '4aca5f0d-17fa-4a8e-91ab-c2da92d67dd3', 'Atualizado civil na chamadaAlterações: quant_civil: "0" → "1", created_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:08:01 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ANTÔNIO FÉLIX DA COSTA", contato: "undefined" → "(68) 9 9900-9966", nome_orgao: "undefined" → "SEAGRE"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:08:01'),
	('917b7e01-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:08:02', 'Administrador', 'UPDATE', 'chamada_civil', '4aca5f0d-17fa-4a8e-91ab-c2da92d67dd3', 'Atualizado civil na chamadaAlterações: quant_civil: "1" → "2", created_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:08:01 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:08:01 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ANTÔNIO FÉLIX DA COSTA", contato: "undefined" → "(68) 9 9900-9966", nome_orgao: "undefined" → "SEAGRE"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:08:01'),
	('9181a747-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:29:30', 'Administrador', 'DELETE', 'chamada_militar', '6975052e-5ac9-4dca-ad04-3d605d78a146', 'Removido militar CEL ÉDEN da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:29:30'),
	('91b48ee4-23be-11f1-8bdd-02b959b4417d', '2026-03-19 13:08:02', 'Administrador', 'UPDATE', 'chamada_civil', '4aca5f0d-17fa-4a8e-91ab-c2da92d67dd3', 'Atualizado civil na chamadaAlterações: quant_civil: "2" → "3", created_at: "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:07:50 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 18:08:01 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 18:08:02 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ANTÔNIO FÉLIX DA COSTA", contato: "undefined" → "(68) 9 9900-9966", nome_orgao: "undefined" → "SEAGRE"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:08:02'),
	('927eccc8-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:29:32', 'Administrador', 'DELETE', 'chamada_militar', '78a318bd-8900-4923-867a-618657f4ca19', 'Removido militar MAJ EURICO da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:29:31'),
	('936da356-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:29:33', 'Administrador', 'DELETE', 'chamada_militar', '14301240-3147-4021-bbeb-33b8ec19a6b6', 'Removido militar CEL FONTES da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:29:33'),
	('94888917-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:29:35', 'Administrador', 'DELETE', 'chamada_militar', '3b42ede1-a041-4c27-a5ef-a94c91cce0f9', 'Removido militar CEL MIRANDA da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:29:35'),
	('953f6d39-2477-11f1-aac1-8a31bbc50cd3', '2026-03-20 11:12:25', 'Administrador', 'DELETE', 'turno', '0e5bc020-23bd-11f1-8bdd-02b959b4417d', 'Removido turno 18/03/2026 - Manhã', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 16:12:24'),
	('960ec146-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:29:38', 'Administrador', 'CREATE', 'chamada_militar', '087f25e4-10a0-4941-a94e-08949c01fa70', 'Adicionado militar CEL ÉDEN à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:29:37'),
	('967ac06d-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:32', 'Administrador', 'UPDATE', 'chamada_civil', '52695995-467f-46ab-96dc-623fcfcb7fc8', 'Atualizado civil na chamadaAlterações: quant_civil: "0" → "1", created_at: "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:31 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:31'),
	('96c0c37f-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:32', 'Administrador', 'UPDATE', 'chamada_civil', '52695995-467f-46ab-96dc-623fcfcb7fc8', 'Atualizado civil na chamadaAlterações: quant_civil: "1" → "2", created_at: "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 15:23:31 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:32 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:32'),
	('96e28419-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:32', 'Administrador', 'UPDATE', 'chamada_civil', '52695995-467f-46ab-96dc-623fcfcb7fc8', 'Atualizado civil na chamadaAlterações: quant_civil: "2" → "3", created_at: "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 15:23:32 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:32 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:32'),
	('972caed0-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:33', 'Administrador', 'UPDATE', 'chamada_civil', '52695995-467f-46ab-96dc-623fcfcb7fc8', 'Atualizado civil na chamadaAlterações: quant_civil: "3" → "4", created_at: "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 15:23:32 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:32 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:32'),
	('974ac517-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:33', 'Administrador', 'UPDATE', 'chamada_civil', '52695995-467f-46ab-96dc-623fcfcb7fc8', 'Atualizado civil na chamadaAlterações: quant_civil: "4" → "3", created_at: "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 15:23:32 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:32 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:32'),
	('97bcad06-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:34', 'Administrador', 'UPDATE', 'chamada_civil', '52695995-467f-46ab-96dc-623fcfcb7fc8', 'Atualizado civil na chamadaAlterações: quant_civil: "3" → "4", created_at: "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 15:23:32 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:33 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:33'),
	('97de83ec-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 13:01:03', 'Administrador', 'UPDATE', 'chamada_militar', '847cba39-7b2f-4fff-b2be-b30290d50208', 'Atualizado militar 1º TEN MISMA FERNANDES na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "null" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:01:02'),
	('97f4719e-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:34', 'Administrador', 'UPDATE', 'chamada_civil', '52695995-467f-46ab-96dc-623fcfcb7fc8', 'Atualizado civil na chamadaAlterações: quant_civil: "4" → "5", created_at: "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:08 GMT-0500 (Horário Padrão do Acre)", updated_at: "Thu Mar 19 2026 15:23:33 GMT-0500 (Horário Padrão do Acre)" → "Thu Mar 19 2026 15:23:34 GMT-0500 (Horário Padrão do Acre)", nome_completo: "undefined" → "ADALTO DA COSTA", contato: "undefined" → "(68) 9 9965-8315", nome_orgao: "undefined" → "SMCCI"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:34'),
	('9872621d-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 13:01:04', 'Administrador', 'UPDATE', 'chamada_militar', 'd4666b33-24f3-4a1a-a787-1525048d603a', 'Atualizado militar CEL FONTES na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "null" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:01:03'),
	('98d88aea-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:40:19', 'admin', 'READ', 'PESSOAL', NULL, 'Erro: Erro interno do servidor', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:40:19'),
	('98ea761c-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 13:01:05', 'Administrador', 'UPDATE', 'chamada_militar', '96b54bfa-70c4-4a78-92fe-47cc48221d6b', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "null" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:01:04'),
	('9a49ebc5-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:12:12', 'Administrador', 'DELETE', 'chamada_militar', 'c4ae053e-2d97-459e-b774-3ea51e2a1a2c', 'Removido militar 9376828 da chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:12:11'),
	('9aaf4936-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:29:46', 'Administrador', 'DELETE', 'chamada_militar', '087f25e4-10a0-4941-a94e-08949c01fa70', 'Removido militar CEL ÉDEN da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:29:45'),
	('9b22e9ce-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:40:23', 'admin', 'READ', 'PESSOAL', NULL, 'Erro: Erro interno do servidor', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:40:23'),
	('9b390a4a-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:40', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Bravo (turno 19/03/2026 - Noite)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:39'),
	('9b78de26-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:40', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Charlie (turno 19/03/2026 - Noite)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:40'),
	('9b948a7b-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:12:14', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:12:13'),
	('9b9496c3-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:12:14', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:12:13'),
	('9c647214-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:42', 'Administrador', 'UPDATE', 'equipe', '9b2e62d3-23a7-11f1-8bdd-02b959b4417d', 'Atualizada equipe Bravo (turno 19/03/2026 - Noite) | Alterações: Chefe de Equipe: "vazio" → "SD WILKER"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:41'),
	('9c989eec-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:09:31', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:09:31'),
	('9c9c8b2f-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:09:32', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:09:31'),
	('9cf9edcf-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:29:49', 'Administrador', 'CREATE', 'chamada_militar', '5e4b5412-19e9-42be-8698-86f1fadaf319', 'Adicionado militar CEL FONTES à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:29:49'),
	('9d2a702b-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:43', 'Administrador', 'UPDATE', 'equipe', '9b771b27-23a7-11f1-8bdd-02b959b4417d', 'Atualizada equipe Charlie (turno 19/03/2026 - Noite) | Alterações: Chefe de Equipe: "vazio" → "3º SGT S ALBUQUERQUE"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:42'),
	('9de83151-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:19:27', 'Administrador', 'DELETE', 'chamada_militar', '62633b1c-0eb5-45be-8514-b34ff9e55038', 'Removido militar ÉDEN da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:19:27'),
	('9df6d537-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 13:01:13', 'Administrador', 'DELETE', 'equipe', '549cc948-23bd-11f1-8bdd-02b959b4417d', 'Excluída equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:01:13'),
	('9e0af221-22f8-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:31:02', 'Administrador', 'CREATE', 'civil', 'CIV_1773858662377_WECZAN', 'Criado civil teste', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:31:02'),
	('9ea3868e-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 13:01:14', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:01:14'),
	('9ee1c0ae-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:09:35', 'Administrador', 'UPDATE', 'equipe', 'e642cb12-22f0-11f1-bbc4-8aa4cc4f03dc', 'Atualizada equipe Alpha (turno 16/03/2026 - Manhã) | Alterações: Status: "pausa-operacional" → "empenhada"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:09:35'),
	('9f117627-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:19:29', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:19:29'),
	('9f14d670-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:19:29', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:19:29'),
	('9f7c58d9-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:47', 'Administrador', 'UPDATE', 'equipe', '56632b58-23a7-11f1-8bdd-02b959b4417d', 'Atualizada equipe Alpha (turno 19/03/2026 - Noite) | Alterações: Motorista: "vazio" → "ANTÔNIO FÉLIX DA COSTA"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:46'),
	('a09fe143-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:49', 'Administrador', 'UPDATE', 'equipe', '9b2e62d3-23a7-11f1-8bdd-02b959b4417d', 'Atualizada equipe Bravo (turno 19/03/2026 - Noite) | Alterações: Motorista: "vazio" → "ADALTO DA COSTA"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:48'),
	('a19cf890-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:09:40', 'Administrador', 'UPDATE', 'equipe', 'e642cb12-22f0-11f1-bbc4-8aa4cc4f03dc', 'Atualizada equipe Alpha (turno 16/03/2026 - Manhã) | Alterações: Setor de Atuação: "Sobral" → "teste"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:09:39'),
	('a1dfb1f6-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:51', 'Administrador', 'UPDATE', 'equipe', '9b771b27-23a7-11f1-8bdd-02b959b4417d', 'Atualizada equipe Charlie (turno 19/03/2026 - Noite) | Alterações: Motorista: "vazio" → "ANTÔNIO FRETIAS DE LIMA"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:50'),
	('a2b2e885-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:09:42', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:09:41'),
	('a2b70831-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:09:42', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:09:41'),
	('a3997c45-22f8-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:31:12', 'Administrador', 'DELETE', 'civil', 'CIV_1773858662377_WECZAN', 'Excluído civil teste', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:31:11'),
	('a3a1ac5a-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:54', 'Administrador', 'UPDATE', 'equipe', '56632b58-23a7-11f1-8bdd-02b959b4417d', 'Atualizada equipe Alpha (turno 19/03/2026 - Noite) | Alterações: Status: "livre" → "empenhada"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:53'),
	('a421393f-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:23:55', 'Administrador', 'UPDATE', 'equipe', '9b2e62d3-23a7-11f1-8bdd-02b959b4417d', 'Atualizada equipe Bravo (turno 19/03/2026 - Noite) | Alterações: Status: "livre" → "empenhada"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:23:54'),
	('a4c21a78-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:19:39', 'Administrador', 'CREATE', 'chamada_militar', '8af5a6a5-efa0-4e63-898d-3916f2620f74', 'Adicionado militar à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:19:38'),
	('a57437ac-245d-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:06:45', 'Administrador', 'CREATE', 'chamada_militar', '2b2dc34c-b3e2-407f-a7e9-e0549b3658e0', 'Adicionado militar MAJ DYEGO VIEIRA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:06:45'),
	('a63cb20b-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:19:41', 'Administrador', 'UPDATE', 'chamada_militar', '8af5a6a5-efa0-4e63-898d-3916f2620f74', 'Atualizado militar ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:19:41'),
	('a757e8b3-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:19:43', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:19:43'),
	('a75a611c-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:19:43', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:19:43'),
	('a86cf944-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:24:02', 'Administrador', 'UPDATE', 'equipe', '56632b58-23a7-11f1-8bdd-02b959b4417d', 'Atualizada equipe Alpha (turno 19/03/2026 - Noite) | Alterações: Setor de Atuação: "vazio" → "Sobral"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:24:01'),
	('ab330881-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:24:06', 'Administrador', 'UPDATE', 'equipe', '9b2e62d3-23a7-11f1-8bdd-02b959b4417d', 'Atualizada equipe Bravo (turno 19/03/2026 - Noite) | Alterações: Setor de Atuação: "vazio" → "Cidade Nova"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:24:06'),
	('ab4dcba6-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:23:04', 'Administrador', 'CREATE', 'chamada_militar', 'cf586466-f732-4cbe-ad48-c4d5389745b0', 'Adicionado militar MAJ BIASOLI à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:23:03'),
	('ab528243-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:23:04', 'Administrador', 'CREATE', 'chamada_militar', '5ece6a99-052c-40b7-8539-d37ab3d9ee1b', 'Adicionado militar MAJ DYEGO VIEIRA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:23:04'),
	('adc063b3-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:24:19', 'Administrador', 'CREATE', 'turno', NULL, 'Criado turno Turno do dia 17/03/2026: Manhã', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:24:19'),
	('af4ac4c5-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:10:03', 'Administrador', 'DELETE', 'componentes_equipe', 'comp_1773857103890_35vna', 'Removido componente CEL ÉDEN da equipe Alpha (turno 16/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:10:02'),
	('afee5e6c-2476-11f1-aac1-8a31bbc50cd3', '2026-03-20 11:06:00', 'Administrador', 'UPDATE', 'chamada_militar', '5d0e6af2-de3c-4a18-bf47-ef4b1c9d903f', 'Atualizado militar CEL FONTES na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "SCI" → "Combatente", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 16:06:00'),
	('b09db822-2476-11f1-aac1-8a31bbc50cd3', '2026-03-20 11:06:01', 'Administrador', 'UPDATE', 'chamada_militar', '61428f4a-3fd3-45e8-b4f0-a9ea71067ad5', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "SCI" → "Combatente", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 16:06:01'),
	('b1b63f3e-2476-11f1-aac1-8a31bbc50cd3', '2026-03-20 11:06:03', 'Administrador', 'UPDATE', 'chamada_militar', '61428f4a-3fd3-45e8-b4f0-a9ea71067ad5', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "Combatente" → "SCI", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 16:06:03'),
	('b48175eb-2476-11f1-aac1-8a31bbc50cd3', '2026-03-20 11:06:08', 'Administrador', 'UPDATE', 'chamada_militar', '61428f4a-3fd3-45e8-b4f0-a9ea71067ad5', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 16:06:07'),
	('b4c6ede0-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:10:12', 'Administrador', 'UPDATE', 'equipe', 'e642cb12-22f0-11f1-bbc4-8aa4cc4f03dc', 'Atualizada equipe Alpha (turno 16/03/2026 - Manhã) | Alterações: Chefe de Equipe: "CEL FONTES" → "CEL ÉDEN"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:10:12'),
	('b683935a-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:10:15', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:10:14'),
	('b686cff1-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:10:15', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:10:14'),
	('bac3ec78-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:24:41', 'Administrador', 'CREATE', 'chamada_militar', '707746d0-85af-415a-bfb4-88917219ad8a', 'Adicionado militar CEL ÉDEN à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:24:41'),
	('bac9528d-22f7-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:24:41', 'Administrador', 'CREATE', 'chamada_militar', '67c138fe-8e15-44ad-ac88-702ba4aa0ffa', 'Adicionado militar CEL FONTES à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:24:41'),
	('bb086942-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:17', 'admin', 'READ', 'ME', NULL, 'Erro: Token inválido ou expirado', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:16'),
	('bb089ead-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:17', 'admin', 'READ', 'ME', NULL, 'Erro: Token inválido ou expirado', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:16'),
	('bb0f2cd8-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:17', 'anonymous', 'READ', 'UNKNOWN', NULL, 'Erro: Token de autenticação necessário', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:16'),
	('bb0f3fb6-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:17', 'anonymous', 'READ', 'UNKNOWN', NULL, 'Erro: Token de autenticação necessário', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:16'),
	('bb0f5962-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:17', 'anonymous', 'READ', 'UNKNOWN', NULL, 'Erro: Token de autenticação necessário', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:16'),
	('bb0f795a-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:17', 'anonymous', 'READ', 'EQUIPES', NULL, 'Erro: Token de autenticação necessário', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:16'),
	('bb0f977f-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:17', 'anonymous', 'READ', 'UNKNOWN', NULL, 'Erro: Token de autenticação necessário', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:16'),
	('bb0fa557-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:17', 'anonymous', 'READ', 'UNKNOWN', NULL, 'Erro: Token de autenticação necessário', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:16'),
	('bb11659b-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:17', 'anonymous', 'READ', 'UNKNOWN', NULL, 'Erro: Token de autenticação necessário', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:16'),
	('bb117f82-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:17', 'anonymous', 'READ', 'EQUIPES', NULL, 'Erro: Token de autenticação necessário', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:16'),
	('bccbf067-2476-11f1-aac1-8a31bbc50cd3', '2026-03-20 11:06:22', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 16:06:21'),
	('bd7b8bf5-245d-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:07:25', 'Administrador', 'DELETE', 'chamada_militar', 'dbcd7ec0-247d-4316-b7a1-cfa3695b3763', 'Removido militar MAJ BIASOLI da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:07:25'),
	('bdbf0de7-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:24:38', 'Administrador', 'UPDATE', 'equipe', '56632b58-23a7-11f1-8bdd-02b959b4417d', 'Atualizada equipe Alpha (turno 19/03/2026 - Noite) | Alterações: Status: "empenhada" → "livre"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:24:37'),
	('bdfcfc40-23a7-11f1-8bdd-02b959b4417d', '2026-03-19 10:24:38', 'Administrador', 'UPDATE', 'equipe', '56632b58-23a7-11f1-8bdd-02b959b4417d', 'Atualizada equipe Alpha (turno 19/03/2026 - Noite) | Alterações: Status: "livre" → "empenhada"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:24:37'),
	('be889d2d-245d-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:07:27', 'Administrador', 'DELETE', 'chamada_militar', '2b2dc34c-b3e2-407f-a7e9-e0549b3658e0', 'Removido militar MAJ DYEGO VIEIRA da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:07:27'),
	('bf87ed61-245d-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:07:29', 'Administrador', 'DELETE', 'chamada_militar', 'c8f92b79-dc28-438e-bca8-0ddf6a4aef99', 'Removido militar CEL ÉDEN da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:07:28'),
	('bfc12e0b-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:17:31', 'Administrador', 'CREATE', 'atestados_medicos', 'atest_1773933451369', 'Criado atestado para SD EWERTON', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:17:31'),
	('c04ded3c-245d-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:07:30', 'Administrador', 'DELETE', 'chamada_militar', 'd5ff7b0b-117f-4d27-9eff-b45436bc219c', 'Removido militar CEL FONTES da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:07:30'),
	('c13cd58c-245d-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:07:32', 'Administrador', 'DELETE', 'chamada_militar', '03476015-d9e5-4c80-92f6-79ead637eda5', 'Removido militar CEL MIRANDA da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:07:31'),
	('c167a120-2476-11f1-aac1-8a31bbc50cd3', '2026-03-20 11:06:29', 'Administrador', 'UPDATE', 'chamada_militar', '61428f4a-3fd3-45e8-b4f0-a9ea71067ad5', 'Atualizado militar CEL ÉDEN na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "SCI" → "Combatente", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 16:06:29'),
	('c1ef2f5b-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:28', 'admin', 'LOGIN', 'AUTH', NULL, 'Usuário fez login no sistema', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:28'),
	('c26560c1-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:13:19', 'Administrador', 'DELETE', 'chamada_civil', '7c0396a0-c956-415f-b694-63074a81d19d', 'Removido civil 3eca6b02-0907-11f1-bf45-28c5c8c3080c da chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:13:18'),
	('c3507fcf-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:13:20', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:13:20'),
	('c35123dc-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:13:20', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:13:20'),
	('c3775030-245d-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:07:36', 'Administrador', 'CREATE', 'chamada_militar', '9d569b75-123d-4de5-846e-529821f22379', 'Adicionado militar CEL ÉDEN à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:07:35'),
	('c37d085d-245d-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:07:36', 'Administrador', 'CREATE', 'chamada_militar', 'dac09a3c-e47d-4a67-b3a2-e9f1e6ff32c6', 'Adicionado militar CEL FONTES à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:07:35'),
	('c42fbe73-22f1-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:42:00', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:41:59'),
	('c570bc87-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:10:40', 'Administrador', 'CREATE', 'componentes_equipe', 'comp_1773857439984_cqy5d', 'Adicionado componente CEL FONTES à equipe Alpha (turno 16/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:10:40'),
	('c6e80c58-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:10:42', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:10:42'),
	('c6ede243-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:10:42', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:10:42'),
	('c74ad090-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:31:00', 'Administrador', 'DELETE', 'chamada_militar', '5e4b5412-19e9-42be-8698-86f1fadaf319', 'Removido militar CEL FONTES da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:31:00'),
	('c7a2979d-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:17:45', 'Administrador', 'DELETE', 'atestados_medicos', 'atest_1773933451369', 'Removido atestado médico atest_1773933451369 de SD EWERTON', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:17:44'),
	('c7dd4885-26cd-11f1-ac39-167ecf302036', '2026-03-23 10:34:29', 'admin', 'LOGIN', 'AUTH', NULL, 'Usuário fez login no sistema', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:34:28'),
	('c81e4d25-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 13:02:24', 'Administrador', 'CREATE', 'componentes_equipe', 'comp_1773943343822_ds2ea', 'Adicionado componente CEL FONTES à equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:02:23'),
	('c9461d4e-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:41', 'admin', 'READ', 'PESSOAL', NULL, 'Erro: Erro interno do servidor', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:40'),
	('c9ac558d-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:41', 'admin', 'READ', 'PESSOAL', NULL, 'Erro: Erro interno do servidor', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:41'),
	('c9c48c24-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:42', 'admin', 'READ', 'PESSOAL', NULL, 'Erro: Erro interno do servidor', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:41'),
	('cacc5ef4-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 13:02:28', 'Administrador', 'DELETE', 'componentes_equipe', 'comp_1773943343822_ds2ea', 'Removido componente CEL FONTES da equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:02:28'),
	('cd61b71b-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:10:53', 'Administrador', 'DELETE', 'equipe', 'e642cb12-22f0-11f1-bbc4-8aa4cc4f03dc', 'Excluída equipe Alpha (turno 16/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:10:53'),
	('ce0c9b42-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:49', 'admin', 'READ', 'TURNO', NULL, 'Erro: Erro interno do servidor', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:48'),
	('cec0f575-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:10:56', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:10:55'),
	('cec49996-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:10:56', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:10:55'),
	('d1451e14-26ce-11f1-ac39-167ecf302036', '2026-03-23 10:41:54', 'admin', 'READ', 'UNIDADE', NULL, 'Erro: Erro interno do servidor', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-23 15:41:54'),
	('d3b9ca8a-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:31:21', 'Administrador', 'CREATE', 'chamada_militar', '2d97a179-3719-4126-b591-12f668418d86', 'Adicionado militar CEL FONTES à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:31:21'),
	('d59feb4e-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:24:15', 'Administrador', 'DELETE', 'chamada_militar', 'fc9eae0d-cb71-4fd3-b65d-e829ded7ebbb', 'Removido militar MAJ ATHOS da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:24:14'),
	('d672043c-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:24:16', 'Administrador', 'DELETE', 'chamada_militar', 'cf586466-f732-4cbe-ad48-c4d5389745b0', 'Removido militar MAJ BIASOLI da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:24:16'),
	('d73f365c-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:24:18', 'Administrador', 'DELETE', 'chamada_militar', '5ece6a99-052c-40b7-8539-d37ab3d9ee1b', 'Removido militar MAJ DYEGO VIEIRA da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:24:17'),
	('d76b0ed6-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:11:10', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:11:10'),
	('d76fe353-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:11:10', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:11:10'),
	('d7efa7f0-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:24:19', 'Administrador', 'DELETE', 'chamada_militar', 'bdd7e140-be77-4e55-a35a-9c901f9c198e', 'Removido militar CEL ÉDEN da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:24:18'),
	('d89a6f89-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:24:20', 'Administrador', 'DELETE', 'chamada_militar', 'e5d9b0ae-5cee-484f-8975-f73b955102c7', 'Removido militar CEL FONTES da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:24:19'),
	('d96e294f-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:24:21', 'Administrador', 'DELETE', 'chamada_militar', '735dc18b-4798-4e59-a29c-8619932baa23', 'Removido militar CEL MIRANDA da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:24:21'),
	('dad96c8c-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:24:24', 'Administrador', 'CREATE', 'chamada_militar', '5c29ac05-ea27-4b85-89a1-244e63ce2e19', 'Adicionado militar CEL ÉDEN à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:24:23'),
	('dadd79a7-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:24:24', 'Administrador', 'CREATE', 'chamada_militar', '14301240-3147-4021-bbeb-33b8ec19a6b6', 'Adicionado militar CEL FONTES à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:24:23'),
	('dae2d3e2-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:24:24', 'Administrador', 'CREATE', 'chamada_militar', '3b42ede1-a041-4c27-a5ef-a94c91cce0f9', 'Adicionado militar CEL MIRANDA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:24:23'),
	('dc34814a-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:18:28', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:18:27'),
	('dc38f58c-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:18:28', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:18:27'),
	('de30d60d-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:18:22', 'Administrador', 'CREATE', 'turno', NULL, 'Criado turno Turno do dia 18/03/2026: Noite', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:18:22'),
	('df408060-245d-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:08:22', 'Administrador', 'DELETE', 'chamada_militar', '9d569b75-123d-4de5-846e-529821f22379', 'Removido militar CEL ÉDEN da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:08:22'),
	('e0b51108-245d-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:08:25', 'Administrador', 'DELETE', 'chamada_militar', 'dac09a3c-e47d-4a67-b3a2-e9f1e6ff32c6', 'Removido militar CEL FONTES da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:08:24'),
	('e1188b9b-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:17:25', 'Administrador', 'DELETE', 'chamada_civil', '3a6e3175-02cd-4b2f-a734-caa7063aad86', 'Removido civil teste da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:17:24'),
	('e1542ccf-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:14:11', 'Administrador', 'UPDATE', 'chamada_militar', 'd505ef11-89f5-4af1-8ed9-e2b81aebb0cd', 'Atualizado militar na chamadaAlterações: presenca: "null" → "PRESENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:14:10'),
	('e1c9277f-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:14:12', 'Administrador', 'UPDATE', 'chamada_militar', 'd505ef11-89f5-4af1-8ed9-e2b81aebb0cd', 'Atualizado militar na chamadaAlterações: presenca: "PRESENTE" → "AUSENTE", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:14:11'),
	('e2469d83-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:18:38', 'Administrador', 'CREATE', 'forcas', '9', 'Criada força TESTE', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:18:37'),
	('e275d27d-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:35:41', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:35:41'),
	('e2785a75-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:35:41', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:35:41'),
	('e29b1eda-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:24:37', 'Administrador', 'DELETE', 'chamada_militar', '5c29ac05-ea27-4b85-89a1-244e63ce2e19', 'Removido militar CEL ÉDEN da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:24:36'),
	('e2e5bf13-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:14:13', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:14:13'),
	('e2e5e201-22ed-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:14:13', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:14:13'),
	('e4bdb199-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:24:40', 'Administrador', 'CREATE', 'chamada_militar', '6975052e-5ac9-4dca-ad04-3d605d78a146', 'Adicionado militar CEL ÉDEN à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:24:40'),
	('e4c3ef51-245d-11f1-aac1-8a31bbc50cd3', '2026-03-20 08:08:31', 'Administrador', 'CREATE', 'chamada_militar', '35946b75-9cd3-49e9-80bb-dea51ad5d839', 'Adicionado militar CEL ÉDEN à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 13:08:31'),
	('e5196976-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:18:43', 'Administrador', 'UPDATE', 'forcas', '9', 'Atualizada força TESTE1 | Alterações: nome_forca: "TESTE" → "TESTE1"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:18:42'),
	('e5d5c839-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:35:47', 'Administrador', 'DELETE', 'equipe', '3fbf37ed-22f0-11f1-bbc4-8aa4cc4f03dc', 'Excluída equipe Alpha (turno 16/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:35:46'),
	('e6425291-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:18:45', 'Administrador', 'DELETE', 'forcas', '9', 'Excluída força TESTE1', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:18:44'),
	('e6447ceb-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:35:48', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Alpha (turno 16/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:35:47'),
	('e742ae73-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:35:49', 'Administrador', 'UPDATE', 'equipe', 'e642cb12-22f0-11f1-bbc4-8aa4cc4f03dc', 'Atualizada equipe Alpha (turno 16/03/2026 - Manhã) | Alterações: militar: "null" → "CEL FONTES"Alterações: id_chamada_militar: "null" → "8783a555-7cc5-46e5-b978-729970040121"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:35:49'),
	('e7ba367a-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:18:47', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:18:47'),
	('e7bad642-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:24:45', 'Administrador', 'CREATE', 'chamada_militar', '681367e0-4ceb-4d06-b77f-c35446f8c018', 'Adicionado militar MAJ ATHOS à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:24:45'),
	('e7bea701-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:18:47', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:18:47'),
	('e8d23ae9-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:35:52', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:35:51'),
	('e8d6506a-22f0-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:35:52', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:35:51'),
	('e9d279c9-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:17:39', 'Administrador', 'UPDATE', 'equipe', '54d9e3a5-23be-11f1-8bdd-02b959b4417d', 'Atualizada equipe Alpha (turno 18/03/2026 - Manhã) | Alterações: Motorista: "vazio" → "ADALTO DA COSTA"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:17:39'),
	('eaa12e9e-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:32:00', 'Administrador', 'DELETE', 'chamada_militar', '2d97a179-3719-4126-b591-12f668418d86', 'Removido militar CEL FONTES da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:31:59'),
	('eac534dd-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:17:41', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Bravo (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:17:40'),
	('eb109750-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:17:41', 'Administrador', 'CREATE', 'equipe', NULL, 'Criada equipe Charlie (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:17:41'),
	('ed107028-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:17:45', 'Administrador', 'DELETE', 'componentes_equipe', 'comp_1773943656172_4gdjw', 'Removido componente 1º TEN MISMA FERNANDES da equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:17:44'),
	('edcdae93-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:17:46', 'Administrador', 'UPDATE', 'equipe', 'eac38673-23bf-11f1-8bdd-02b959b4417d', 'Atualizada equipe Bravo (turno 18/03/2026 - Manhã) | Alterações: Chefe de Equipe: "vazio" → "1º TEN MISMA FERNANDES"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:17:46'),
	('eee0e877-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:17:48', 'Administrador', 'UPDATE', 'equipe', 'eac38673-23bf-11f1-8bdd-02b959b4417d', 'Atualizada equipe Bravo (turno 18/03/2026 - Manhã) | Alterações: Motorista: "vazio" → "ANTÔNIO FÉLIX DA COSTA"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:17:47'),
	('eee369f1-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:11:50', 'Administrador', 'CREATE', 'usuario', 'user_1773857509525_321891', 'Criado usuário teste', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:11:49'),
	('f0a32570-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:11:52', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:11:52'),
	('f0a68f20-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:11:52', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:11:52'),
	('f194682d-23c0-11f1-8bdd-02b959b4417d', '2026-03-19 13:25:02', 'Administrador', 'CREATE', 'chamada_militar', 'd7fd8bac-0f55-4950-8a20-27827e21cfb1', 'Adicionado militar MAJ BIASOLI à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:25:01'),
	('f244b41c-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:17:54', 'Administrador', 'DELETE', 'equipe', 'eb0d57b4-23bf-11f1-8bdd-02b959b4417d', 'Excluída equipe Charlie (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:17:53'),
	('f344ca31-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:17:55', 'Administrador', 'DELETE', 'equipe', 'eac38673-23bf-11f1-8bdd-02b959b4417d', 'Excluída equipe Bravo (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:17:55'),
	('f3c3b18a-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 13:03:37', 'Administrador', 'UPDATE', 'equipe', '9ea1b83e-23bd-11f1-8bdd-02b959b4417d', 'Atualizada equipe Alpha (turno 18/03/2026 - Manhã) | Alterações: Chefe de Equipe: "vazio" → "1º TEN MISMA FERNANDES"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:03:37'),
	('f442d4d8-23bf-11f1-8bdd-02b959b4417d', '2026-03-19 13:17:57', 'Administrador', 'DELETE', 'equipe', '54d9e3a5-23be-11f1-8bdd-02b959b4417d', 'Excluída equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:17:56'),
	('f4a407f9-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:19:09', 'Administrador', 'CREATE', 'posto_grad', '18', 'Criado posto/graduação TESTE', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:19:08'),
	('f5c9d0c3-22f4-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:04:52', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:04:51'),
	('f5cd8c3a-22f4-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:04:52', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:04:51'),
	('f62d7c3e-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:19:11', 'Administrador', 'UPDATE', 'posto_grad', '18', 'Atualizado posto/graduação TESTE1 | Alterações: nome_posto_grad: "TESTE" → "TESTE1"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:19:11'),
	('f687e63f-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:12:02', 'admin', 'UPDATE', 'API', '426c38e8-afff-428f-9fe3-fa7da13afe4d', 'Erro: Cannot read properties of undefined (reading \'0\')', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:12:02'),
	('f7bf6e3a-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:19:14', 'Administrador', 'DELETE', 'posto_grad', '18', 'Excluído posto/graduação TESTE1', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:19:13'),
	('f7d6d1c5-2473-11f1-aac1-8a31bbc50cd3', '2026-03-20 10:46:32', 'Administrador', 'UPDATE', 'chamada_militar', '16337200-6d81-47ff-a584-a1521ae15b52', 'Atualizado militar MAJ BIASOLI na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "Combatente" → "SCI", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 15:46:32'),
	('f81ff49c-23bd-11f1-8bdd-02b959b4417d', '2026-03-19 13:03:44', 'Administrador', 'DELETE', 'equipe', '9ea1b83e-23bd-11f1-8bdd-02b959b4417d', 'Excluída equipe Alpha (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:03:44'),
	('f84a9c83-23c1-11f1-8bdd-02b959b4417d', '2026-03-19 13:32:23', 'Administrador', 'CREATE', 'chamada_militar', 'c8f92b79-dc28-438e-bca8-0ddf6a4aef99', 'Adicionado militar CEL ÉDEN à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 18:32:22'),
	('f8661e93-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:21:59', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:21:59'),
	('f86bb27e-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:21:59', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:21:59'),
	('f8b52a81-2473-11f1-aac1-8a31bbc50cd3', '2026-03-20 10:46:34', 'Administrador', 'UPDATE', 'chamada_militar', '16337200-6d81-47ff-a584-a1521ae15b52', 'Atualizado militar MAJ BIASOLI na chamada (turno 18/03/2026 - Manhã)Alterações: funcao: "SCI" → "Combatente", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 15:46:33'),
	('f8d99bc6-22f4-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:04:57', 'Administrador', 'UPDATE', 'equipe', 'e642cb12-22f0-11f1-bbc4-8aa4cc4f03dc', 'Atualizada equipe Alpha (turno 16/03/2026 - Manhã) | Alterações: Status: "empenhada" → "pausa-operacional"Alterações: status: "empenhada" → "pausa-operacional"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:04:56'),
	('f984a5d1-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:19:17', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:19:16'),
	('f987fbe9-22f6-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:19:17', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:19:16'),
	('fa077608-2473-11f1-aac1-8a31bbc50cd3', '2026-03-20 10:46:36', 'Administrador', 'DELETE', 'chamada_militar', '0b3a0441-1b99-4701-aced-34cc2d100529', 'Removido militar MAJ ATHOS da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 15:46:35'),
	('fa117aab-2473-11f1-aac1-8a31bbc50cd3', '2026-03-20 10:46:36', 'Administrador', 'DELETE', 'chamada_militar', '16337200-6d81-47ff-a584-a1521ae15b52', 'Removido militar MAJ BIASOLI da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 15:46:36'),
	('fa11b0c6-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:19:09', 'Administrador', 'CREATE', 'chamada_militar', '9e534137-94b8-4b96-85c7-861d9693c50e', 'Adicionado militar SD EWERTON à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:19:09'),
	('fa16032c-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:19:09', 'Administrador', 'CREATE', 'chamada_militar', '28efda41-471d-4996-a514-d37603032ff0', 'Adicionado militar SD WILKER à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:19:09'),
	('fa1a76d7-23a6-11f1-8bdd-02b959b4417d', '2026-03-19 10:19:09', 'Administrador', 'CREATE', 'chamada_militar', '47c5d5df-2e34-4920-b99a-4f3c672c0c6e', 'Adicionado militar SD ALBUQUERQUE à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-19 15:19:09'),
	('fa1d3932-2473-11f1-aac1-8a31bbc50cd3', '2026-03-20 10:46:36', 'Administrador', 'DELETE', 'chamada_militar', 'fe8d74e7-994b-4ce8-b34e-78a922c0d4b8', 'Removido militar CEL MIRANDA da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-20 15:46:36'),
	('fb3c4a8f-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:22:04', 'Administrador', 'CREATE', 'chamada_militar', '03930fb2-98c9-46db-9cb3-a0275e029030', 'Adicionado militar CEL FONTES à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:22:03'),
	('fc0247e9-22f4-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:05:02', 'Administrador', 'UPDATE', 'equipe', 'e642cb12-22f0-11f1-bbc4-8aa4cc4f03dc', 'Atualizada equipe Alpha (turno 16/03/2026 - Manhã) | Alterações: Setor de Atuação: "vazio" → "Sobral"Alterações: bairro: "null" → "Sobral"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:05:02'),
	('fccf715f-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:22:06', 'Administrador', 'CREATE', 'chamada_civil', '500de1f1-635f-42b2-b6df-e68da28ec9a6', 'Adicionado civil ADALTO DA COSTA à chamada', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:22:06'),
	('fd1d6338-22f4-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:05:04', 'Administrador', 'CREATE', 'componentes_equipe', 'comp_1773857103890_35vna', 'Adicionado componente à equipe', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:05:03'),
	('fde914c9-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:12:15', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:12:14'),
	('fdec58d3-22f5-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 13:12:15', 'admin', 'READ', 'LOGS', NULL, 'Acessou logs com filtros: {"limite":50,"offset":0}', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 18:12:14'),
	('fe21829a-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:22:09', 'Administrador', 'DELETE', 'chamada_civil', '500de1f1-635f-42b2-b6df-e68da28ec9a6', 'Removido civil ADALTO DA COSTA da chamada (turno 18/03/2026 - Manhã)', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:22:08'),
	('ff7fb946-22ee-11f1-bbc4-8aa4cc4f03dc', '2026-03-18 12:22:11', 'Administrador', 'UPDATE', 'chamada_militar', '03930fb2-98c9-46db-9cb3-a0275e029030', 'Atualizado militar CEL FONTES na chamada (turno 18/03/2026 - Manhã)Alterações: presenca: "PRESENTE" → "PERMUTA", obs: "null" → "undefined"', '::ffff:192.168.88.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2026-03-18 17:22:10');

-- Copiando estrutura para tabela sci_recurso.militares
CREATE TABLE IF NOT EXISTS `militares` (
  `matricula` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_completo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_guerra` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rg` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cpoe` enum('Y','N') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'N',
  `mergulhador` enum('Y','N') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'N',
  `restricao_medica` enum('Y','N') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'N',
  `desc_rest_med` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_ubm` int NOT NULL AUTO_INCREMENT,
  `id_posto_grad` int DEFAULT NULL,
  `id_forca` int NOT NULL,
  PRIMARY KEY (`matricula`),
  KEY `idx_restricao_medica` (`restricao_medica`),
  KEY `fk_militares_posto_grad` (`id_posto_grad`),
  KEY `fk_militares_forca` (`id_forca`),
  KEY `fk_militares_ubms` (`id_ubm`) USING BTREE,
  CONSTRAINT `fk_militares_forca` FOREIGN KEY (`id_forca`) REFERENCES `forcas` (`id_forca`),
  CONSTRAINT `fk_militares_posto_grad` FOREIGN KEY (`id_posto_grad`) REFERENCES `posto_grad` (`id_posto_grad`) ON DELETE SET NULL,
  CONSTRAINT `fk_militares_ubms` FOREIGN KEY (`id_ubm`) REFERENCES `ubms` (`id_ubm`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.militares: ~680 rows (aproximadamente)
INSERT INTO `militares` (`matricula`, `nome_completo`, `nome_guerra`, `rg`, `cpoe`, `mergulhador`, `restricao_medica`, `desc_rest_med`, `created_at`, `updated_at`, `id_ubm`, `id_posto_grad`, `id_forca`) VALUES
	('318043', 'ALLAN NOGUEIRA DE ASSIS', 'ALLAN', '120305-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 13, 1),
	('3452531', 'ÉDEN DA SILVA SANTOS', 'ÉDEN', '120356-3', 'N', 'Y', 'N', NULL, '2026-02-13 16:56:34', '2026-03-18 17:23:42', 2, 16, 1),
	('3453501', 'ALZERINO NUNES DE FONTES', 'FONTES', '120355-5', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 16, 1),
	('3454581', 'OTONI DOS SANTOS MIRANDA', 'MIRANDA', '120351-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 16, 1),
	('9000313', 'EDILÂNDIO DE SOUZA DAMASCENO', 'DAMASCENO', '120303-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9000399', 'CRISTIAN MELO DE SOUZA', 'CRISTIAN', '120314-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 13, 1),
	('9000461', 'CICERO VIEIRA MIGUÉIS', 'CICERO', '120335-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9000658', 'ANTONIO AGNALDO REGO RIBEIRO', 'R RIBEIRO', '120333-1', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9000682', 'AGENÁRIO REBOUÇAS MORAIS', 'REBOUÇAS', '120346-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9000852', 'MANOEL JOSE DE SOUZA', 'MANOEL', '120337-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9001409', 'HÉLIO XAVIER DE CARVALHO', 'HÉLIO', '120350-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 13, 1),
	('9001778', 'JOSÉ ROSIVAN CAVALCANTE LIMA', 'R CAVALCANTE', '120347-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 12, 1),
	('9019065', 'WILLIAN DOUGLAS DA SILVA PINHO', 'PINHO', '120510-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 7, 1),
	('9057285', 'EMERSON SANDRO CORDEIRO BRAGA', 'SANDRO', '120183-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 14, 1),
	('9086854', 'MAURO CELSON SILVA DOS SANTOS', 'CELSON', '120416-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 10, 1),
	('9091955', 'JOSÉ JAILTON CAVALCANTE DE FIGUEIREDO', 'JAILTON', '120403-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9111190', 'FRANCISCO MÁRCIO MORAIS DA PASCOA', 'MÁRCIO MORAIS', '120372-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 11, 1),
	('9112944', 'FRANCISCO ANTONIO NEVES ASSUNÇÃO', 'ASSUNÇÃO', '120651-6', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 7, 1),
	('9116133', 'ÁTILA COSTA DE SOUZA', 'ÁTILA', '120388-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 12, 1),
	('9116699', 'ISMAEL CARLOS GOUVEIA DA SILVA', 'ISMAEL CARLOS', '120381-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 11, 1),
	('9117466', 'ODICENIR DA SILVA MARTINS', 'ODICENIR', '120454-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 10, 1),
	('9121099', 'FRANCIMAR ELY SOUSA DO NASCIMENTO', 'ELY', '120772-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 13, 1),
	('9127232', 'ENILSON COSTA DE LIMA PUYANAWA', 'ENILSON', '120587-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9135413', 'JOSÉ FRANCISCO AMORIM DE SOUZA', 'AMORIM', '120447-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 10, 1),
	('9140484', 'AGENALDO BATISTA SOUZA', 'AGENALDO', '120445-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 4, 10, 1),
	('9142908', 'MARCOS ROBERTO CRUZ MARINHO', 'MARINHO', '120427-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 10, 1),
	('9155767', 'ANTÔNIO CAUASSA DE OLIVEIRA', 'CAUASSA', '120753-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9156119', 'REGINALDO OLIVEIRA DE SANTANA', 'REGINALDO', '120654-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9159029', 'GEANFRANCO DA SILVA AGUIAR', 'S AGUIAR', '120709-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 6, 1),
	('9162011', 'IRANILSON NERI DA SILVA', 'IRANILSON', '120419-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 10, 1),
	('9162020', 'GUSTAVO DE LIMA MARINHO', 'GUSTAVO', '120774-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 13, 1),
	('9162186', 'MARIANO ROMÃO RODRIGUES MACHADO', 'ROMÃO', '120659-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 6, 1),
	('9162771', 'WEVERTON DA SILVA BRITO', 'WEVERTON', '120397-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 10, 1),
	('9162909', 'DAVID DE SOUZA AMORIM', 'AMORIM', '120417-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 4, 11, 1),
	('9163085', 'FRANCISCO CARLOS SANTOS DE FREITAS FILHO', 'FREITAS', '120385-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 14, 1),
	('9163131', 'JONATAS DA COSTA GOMES', 'JONATAS', '120769-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 14, 1),
	('9163204', 'JOSÉ SEBASTIÃO CARVALHOSA DE SOUZA', 'CARVALHOSA', '120364-6', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 12, 1),
	('9163450', 'ROGÉRIO SOARES DA SILVA', 'ROGÉRIO SOARES', '120422-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 12, 1),
	('9164286', 'TCHEDDERY WALLERYU SILVA DE ARAÚJO', 'TCHEDDERY', '120370-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 12, 1),
	('9164448', 'ANTONIA JARLENE VALE BRITO', 'JARLENE', '120471-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 7, 1),
	('9164707', 'ARUAN CAIANO SANTOS GOMES', 'ARUAN', '120402-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 12, 1),
	('9166599', 'HEBESSON CARLOS GOMES DE AZEVEDO', 'AZEVEDO', '120433-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 11, 1),
	('9166718', 'ABRAHAO CARLOS MOTA PÚPIO', 'ABRAHAO', '120395-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 12, 1),
	('9167552', 'EDJONSON ABREU DA SILVA', 'EDJONSON', '120448-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 11, 1),
	('9169750', 'IVAN ALEISON AZEVEDO IWAMOTO', 'IWAMOTO', '120450-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 10, 1),
	('9180052', 'MOISÉS CARVALHO BENEVENUTO', 'BENEVENUTO', '120423-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 11, 1),
	('9185518', 'ROGER JOHNNY FILGUEIRA LIMA SANTOS', 'ROGER', '120763-9', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 14, 1),
	('9187596', 'RICARDO CORREA DA CRUZ', 'RICARDO', '120421-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 11, 1),
	('9188312', 'OSIMAR DE SOUZA FARIAS', 'FARIAS', '120394-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 14, 1),
	('9188428', 'JOSADAC CAVALCANTE IBERNON', 'JOSADAC', '120393-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 14, 1),
	('9189548', 'GLAUCIA PEREIRA DE SOUZA B. SALES', 'GLAUCIA', '120420-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 10, 1),
	('9191283', 'ANSELMO BATISTA LIMA', 'ANSELMO', '120391-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 12, 1),
	('9196927', 'JOSÉ CARLISON PLÁCIDO DE SOUZA', 'PLÁCIDO', '120413-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 11, 1),
	('9205110', 'MARIA DALVA DE AZEVEDO SOUZA', 'DALVA', '120559-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 7, 1),
	('9214526', 'CHARLES DO NASCIMENTO ALMEIDA', 'CHARLES ALMEIDA', '120564-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 7, 1),
	('9218661', 'ALFERINO CANDIDO ÂNGELO NETO', 'ÂNGELO', '120434-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 11, 1),
	('9219471', 'ISMAEL BARBOSA DA SILVA MEDEIROS', 'S MEDEIROS', '120598-9', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 7, 1),
	('9220089', 'ALISSON ROGÉRIO CAETANO SILVA', 'ALISSON', '120382-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 12, 1),
	('9236805', 'JADSON CONCEIÇÃO DA SILVA', 'JADSON', '120435-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 11, 1),
	('9236813', 'JAIRO COSTA DOS PRAZERES', 'JAIRO', '120384-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 12, 1),
	('9236821', 'FRANCISCA FRAGOSO DOS SANTOS', 'FRAGOSO', '120362-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 14, 1),
	('9236848', 'GEICIANE DE OLIVEIRA BATISTA', 'GEICIANE', '120404-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 11, 1),
	('9236872', 'JOÃO BATISTA ARAÚJO DE OLIVEIRA', 'J BATISTA', '120415-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 11, 1),
	('9236880', 'ADACIR VIVAN', 'VIVAN', '120455-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 10, 1),
	('9236899', 'JOÃO LUIZ MELO GONZAGA', 'GONZAGA', '120411-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 10, 1),
	('9236902', 'JEFERSON VIANA DO NASCIMENTO', 'JEFERSON', '120431-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 10, 1),
	('9236929', 'MARCIANA GONÇALVES FREIRE', 'GONÇALVES', '120439-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 10, 1),
	('9236937', 'RUAN VIEIRA GONZALEZ', 'RUAN', '120408-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 12, 1),
	('9236945', 'RURIO GUIWEL DE MELO SILVA', 'RURIO', '120368-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 11, 1),
	('9236961', 'THIAGO FERREIRA NERY', 'NERY', '120401-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 12, 1),
	('9236996', 'ÍRIA CARLOS ALVES', 'ÍRIA', '120399-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 12, 1),
	('9237003', 'FABRÍCIA LIMA DA COSTA', 'FABRÍCIA', '120392-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 11, 1),
	('9237011', 'JAQUELINE DANIEL ALMEIDA DE MIRANDA', 'JAQUELINE', '120440-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 10, 1),
	('9237020', 'MARCELA SARKIS SOPCHAKI', 'SOPCHAKI', '120443-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 13, 1),
	('9237038', 'ADÃO DA ROCHA SEVERO', 'SEVERO', '120442-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 10, 1),
	('9237046', 'FRANCISCO LIMA DE MIRANDA', 'MIRANDA', '120380-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 10, 1),
	('9237054', 'RAIANE ALVES DE SOUZA', 'RAIANE', '120451-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 11, 1),
	('9237062', 'GENILSON SILVA DOS SANTOS', 'GENILSON', '120373-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 12, 1),
	('9237070', 'FELIPE LIMA CARNEIRO', 'FELIPE', '120367-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 4, 14, 1),
	('9237089', 'JOCILEIDE FELÍCIO QUEIROZ', 'JOCILEIDE', '120409-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 4, 11, 1),
	('9237097', 'ANDRÉ DA SILVA BARROS', 'ANDRÉ SILVA', '120426-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 10, 1),
	('9237100', 'GLEDSON NOGUEIRA SANTIAGO', 'GLEDSON', '120383-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 12, 1),
	('9237119', 'JOSÉ DOS SANTOS CORRÊA', 'CORRÊA', '120386-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 13, 1),
	('9237127', 'SÉRGIO ALEXANDRE DA SILVA ROGÉRIO', 'ROGÉRIO', '120437-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 12, 1),
	('9237143', 'CLEITON SILVA DE CASTRO LIMA', 'CASTRO', '120456-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 10, 1),
	('9237151', 'MARCELO GOMES DE SOUZA', 'MARCELO GOMES', '120387-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 10, 1),
	('9237160', 'ANTÔNIO CARLOS DE QUEIROZ FREIRE', 'C QUEIROZ', '120361-2', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 11, 1),
	('9237178', 'MARCELO MONTEIRO DIAS', 'MONTEIRO', '120428-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 11, 1),
	('9237186', 'FRANCISCO CÍRIO RODRIGUES DE ALMEIDA', 'CÍRIO', '120436-2', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 10, 1),
	('9237194', 'HILDEBRANDO VIEIRA MACEDO JÚNIOR', 'HILDEBRANDO', '120430-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 11, 1),
	('9237208', 'JOÃO PAULO VALE CAMPOS', 'JOÃO PAULO', '120444-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 10, 1),
	('9237216', 'DIEGO SOARES DA SILVA', 'DIEGO', '120441-2', 'Y', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 11, 1),
	('9237224', 'JOSÉ DÁCIO BARBOSA DOS SANTOS', 'DÁCIO', '120458-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 10, 1),
	('9237240', 'MARCIO DA SILVA LIMA', 'M SILVA', '120390-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 11, 1),
	('9237259', 'WLADIMYR AFONSO DE FREITAS', 'WLADIMYR', '120406-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 11, 1),
	('9237267', 'FILIPE ALEXANDRE CAVALCANTE', 'FILIPE', '120432-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 10, 1),
	('9237275', 'DAYANNE ANDRADE DA SILVA', 'DAYANNE', '120407-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 13, 1),
	('9237283', 'ENÁGIO ROGÉRIO DOS SANTOS', 'ENÁGIO', '120366-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 10, 1),
	('9237291', 'FABRÍCIO MACHADO MACIEL', 'FABRÍCIO MACHADO', '120400-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 11, 1),
	('9237305', 'ALEXANDRE DOS SANTOS VERAS', 'VERAS', '120377-8', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 14, 1),
	('9237313', 'ANTÔNIO SOUZA DE FRANÇA', 'FRANÇA', '120365-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 12, 1),
	('9237321', 'ANTÔNIO LIMA DE SÁ', 'DE SÁ', '120405-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 11, 1),
	('9237356', 'JONNEY SANTANA TURI DA SILVA', 'TURI', '120425-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 12, 1),
	('9237364', 'JOÃO DA SILVA DE OLIVEIRA', 'JOÃO', '120457-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 10, 1),
	('9237372', 'EMERSON LEVI DE AZEVEDO SANTOS', 'EMERSON', '120453-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 12, 1),
	('9237380', 'EDUARDO SANTOS SILVA', 'EDUARDO', '120446-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 12, 1),
	('9237399', 'JOSÉ NONATO BASTOS DE QUEIROZ FILHO', 'QUEIROZ', '120496-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 12, 1),
	('9242694', 'MARCELO NEGREIROS DE SOUZA', 'NEGREIROS', '120438-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 10, 1),
	('9258094', 'ERILÂNDIO MANOEL MARTINS MAIA', 'ERILÂNDIO', '120704-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 6, 1),
	('9268863', 'GILMAR TORRES MARQUES MOURA', 'G TORRES', '120768-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 14, 1),
	('9269037', 'LUCIANO ALENCAR DA ROCHA', 'LUCIANO', '120770-4', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9269770', 'ROSENILDO DE SOUZA PIRES', 'PIRES', '120784-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 12, 1),
	('9270272', 'LUIZ ALVES DE MELO NETO', 'NETO', '120765-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 14, 1),
	('9277380', 'MICHEL DE MORAES EVANGELISTA', 'MICHEL', '120398-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 10, 1),
	('9285318', 'MISMA DA SILVA MACIEL FERNANDES', 'MISMA FERNANDES', '120776-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 12, 1),
	('9285660', 'JOSÉ RANDOLFO SILVA ROSA', 'RANDOLFO', '120688-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9290230', 'KATIUCE SARAIVA SANTIAGO', 'KATIUCE', '120781-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 12, 1),
	('9292497', 'JARDEL RODRIGUES LOUREIRO', 'LOUREIRO', '120684-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9293701', 'ERICO JONAS SILVA DE OLIVEIRA', 'JONAS', '120777-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 12, 1),
	('9295011', 'MARCOS DE CASTRO CORRÊA', 'MARCOS', '120771-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 13, 1),
	('9300457', 'RAFAEL FERREIRA DE QUEIROS', 'QUEIROS', '120614-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 7, 1),
	('9302832', 'LEANDRO DA SILVA SIMÕES', 'SIMÕES', '120757-2', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 6, 1),
	('9305157', 'JOELMA SUSSUARANA DA COSTA', 'SUSSUARANA', '120591-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 4, 7, 1),
	('9305165', 'CRISTINA MICHELLE DE LIMA GARCIA', 'MICHELLE', '120647-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 6, 1),
	('9306706', 'ISMAEL CARLOS DE SOUZA AGUIAR', 'SOUZA AGUIAR', '120674-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 6, 1),
	('9307370', 'NORMANDO BORGES MARTINS FILHO', 'BORGES', '120636-7', 'Y', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 7, 1),
	('9307427', 'ISMAIRA ARGOLO DO NASCIMENTO', 'ARGOLO', '120469-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9308733', 'CLAUDIANE SILVA LIMA QUEIROZ', 'CLAUDIANE', '120836-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9309330', 'JOSUÉ SOARES SOBRINHO DE LIMA', 'J SOBRINHO', '120678-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 7, 1),
	('9312366', 'AGUINALDO TANANTA DE SOUZA', 'TANANTA', '120493-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 7, 1),
	('9316906', 'RICARDO MOURA DA SILVA', 'RICARDO MOURA', '120767-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9319948', 'RUANA DA CONCEIÇÃO XAVIER CASAS', 'RUANA CASAS', '120462-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 14, 1),
	('9320121', 'JOÃO MORAIS DE MOURA', 'J MOURA', '120467-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 7, 1),
	('9320849', 'JESSÉ DA SILVA SOUZA', 'JESSÉ', '120644-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 6, 1),
	('9324801', 'JECKLEUDO CRUZ PEIXOTO', 'PEIXOTO', '120476-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9324895', 'VANDERLEI FREITAS VALENTE JUNIOR', 'VALENTE', '120834-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9325085', 'JOÃO PAULO MENEZES MACEDO', 'MACEDO', '120611-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 6, 1),
	('9326162', 'ANTONIO GILEUDO GALVÃO DE LIMA', 'GILEUDO', '120701-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 6, 1),
	('9326790', 'ELISSANDRO DO NASCIMENTO LOPES', 'E NASCIMENTO', '120610-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 6, 1),
	('9330631', 'ANTONIO MARCOS DA SILVA SOUSA', 'MARCOS SOUSA', '120495-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 6, 1),
	('9336540', 'FRANCISCO FÉLIX DE SOUZA NETO', 'FÉLIX', '120785-2', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 12, 1),
	('9338098', 'CRISTIAN DA SILVA LAMEIRA', 'LAMEIRA', '120856-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 2, 1),
	('9338560', 'CANDIDO VIEIRA DA SILVA', 'CANDIDO', '120634-2', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 7, 1),
	('9345515', 'JOHNATAN COSTA DE OLIVEIRA', 'JOHNATAN COSTA', '120584-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 6, 1),
	('9350519', 'GEMERSON NASCIMENTO DE SOUZA', 'GEMERSON', '120718-3', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 6, 1),
	('9352392', 'CLEBER DA CONCEICAO DIAS', 'DIAS', '120887-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9353984', 'WILLIAM DA SILVA MOISÉS', 'W MOISÉS', '120683-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 7, 1),
	('9354956', 'HILTON DOS SANTOS SILVA', 'HILTON', '120639-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9357955', 'RICARDO DA COSTA MORAIS', 'RICARDO', '120715-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9358650', 'JONATAS PEREIRA DE ALBUQUERQUE', 'ALBUQUERQUE', '120606-0', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9359419', 'VÉBISTER CLEYDER MORAIS DE OLIVEIRA', 'CLEYDER', '120641-7', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9369813', 'EDSON QUEIROZ DE OLIVEIRA', 'EDSON', '120661-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 7, 1),
	('9370587', 'ADELSON DOS SANTOS SOUZA', 'ADELSON', '120637-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 6, 1),
	('9373047', 'JOÉLITO DA SILVA LIMA', 'JOÉLITO', '120758-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9375490', 'ANTONIO ADENILSON DE SOUZA COSTA', 'ADENILSON', '120558-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 7, 1),
	('9375503', 'ELENILTON DA SILVA LACERDA', 'LACERDA', '120546-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 7, 1),
	('9375520', 'WELTON CARLOS DO NASCIMENTO', 'WELTON', '120655-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 6, 1),
	('9375546', 'ANDRÉIA RODRIGUES DE SOUZA REGO', 'ANDRÉIA', '120474-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 7, 1),
	('9375554', 'PAULA CRISTINA OLIVEIRA DA SILVA', 'PAULA', '120502-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 12, 1),
	('9375589', 'JOSUÉ DA SILVA DÁVILA', 'DÁVILA', '120666-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9375597', 'ZINHO SILVA GALVÃO', 'GALVÃO', '120480-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 7, 1),
	('9375600', 'CLARA NASCIMENTO PIMENTEL', 'CLARA', '120608-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 6, 1),
	('9375635', 'KAREN FLORES DE MELO', 'KAREN', '120508-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 7, 1),
	('9375651', 'NATANAELE ESMERIA DOS SANTOS', 'NATANAELE', '120544-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 7, 1),
	('9375660', 'MICHEL LEVI DE SOUSA RODRIGUES', 'MICHEL LEVI', '120529-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 6, 1),
	('9375708', 'EFRAIM GILEADE DE FREITAS TEODORO', 'TEODORO', '120515-3', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 4, 7, 1),
	('9375716', 'FRANCISCA FLORES DO NASCIMENTO', 'F FLORES', '120511-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 6, 1),
	('9375732', 'TAYSSON FARRAPO DE ARAÚJO', 'TAYSSON', '120535-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 7, 1),
	('9375759', 'DIEGO AYSLAN DA SILVA DE SOUZA', 'AYSLAN', '120517-9', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 7, 1),
	('9375775', 'ISNARD WERNER FERREIRA DA SILVA', 'ISNARD', '120648-2', 'Y', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9375783', 'CLEUDE SOUSA DO NASCIMENTO', 'CLEUDE', '120673-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 6, 1),
	('9375805', 'MARCOS ANTÔNIO DE SOUZA SILVA', 'MARCOS ANTÔNIO', '120519-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9375813', 'JOSÉ LEANDRO DE LIMA SILVA', 'LEANDRO', '120560-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 7, 1),
	('9375830', 'VICTOR ROCHA FLORES DA SILVA', 'VICTOR FLORES', '120601-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9375856', 'FRANCISCO EVILAZIO DA SILVA NASCIMENTO', 'EVILAZIO', '120597-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 7, 1),
	('9375872', 'JOÃO SILVA DE LIMA', 'J SILVA', '120477-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9375902', 'JOSE FRANCENILSON MARTINS DA SILVA', 'F SILVA', '120669-8', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 7, 1),
	('9375937', 'DAIANE MENDES RODRIGUES', 'DAIANE MENDES', '120595-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9375953', 'JOÃO RENATO MAIA RIBEIRO', 'RENATO', '120585-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9375961', 'ANDERSON DE SOUZA CHAVES', 'ANDERSON', '120479-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9375988', 'ALEXANDRE NOGUEIRA DA SILVA', 'NOGUEIRA', '120681-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 6, 1),
	('9376011', 'FERNANDO EDUARDO GOMES GADELHA', 'FERNANDO', '120679-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 6, 1),
	('9376046', 'ELTON DJONES TABOSA DE OLIVEIRA', 'ELTON DJONES', '120693-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9376089', 'ANDRE BARCELOS DA ROCHA BRASILEIRO', 'BRASILEIRO', '120657-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 7, 1),
	('9376097', 'ANTÔNIO MARCELO RODRIGUES DE ARAÚJO', 'ARAÚJO', '120542-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 7, 1),
	('9376100', 'PAULO SERGIO FURTADO PEREIRA JUNIOR', 'JUNIOR', '120617-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9376119', 'CLEBER HERCULES SOUZA FERNANDES', 'HERCULES', '120626-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 7, 1),
	('9376151', 'ALEFI DE SOUZA COSTA', 'ALEFI', '120668-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 6, 1),
	('9376160', 'NÂNGELA MARIA LUNA PEREIRA', 'LUNA', '120635-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 6, 1),
	('9376178', 'MARIA DE FÁTIMA DANTAS DE AMORIM', 'FÁTIMA', '120680-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 6, 1),
	('9376194', 'CLEITON CARVALHO PINHEIRO', 'CARVALHO', '120690-4', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 7, 1),
	('9376224', 'ANTONIO EDISON DE FRANÇA ARAUJO', 'FRANÇA', '120490-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 6, 1),
	('9376267', 'ANDRÉ SOUZA DA SILVA', 'ANDRÉ', '120571-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 7, 1),
	('9376275', 'DÁRISSON DE MOURA SILVA', 'DÁRISSON', '120629-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9376291', 'ANDERSON OLIVEIRA DA ROCHA', 'ROCHA', '120592-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9376313', 'ADRIANO DA SILVA SOUZA', 'ADRIANO SOUZA', '120633-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 6, 1),
	('9376321', 'FELIPE BISPO REZENDE', 'REZENDE', '120622-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 7, 1),
	('9376330', 'ADRIANO ANDRADE BARBOZA', 'ANDRADE', '120512-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9376364', 'JOSÉ DE ALMEIDA ROQUES', 'ROQUES', '120596-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 6, 1),
	('9376380', 'ARITON OLIVEIRA DO NASCIMENTO', 'ARITON', '120589-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 7, 1),
	('9376402', 'EDIVAN DE SOUSA E SOUSA', 'EDIVAN', '120536-9', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 7, 1),
	('9376410', 'EVERTON BISPO DA SILVA', 'BISPO', '120494-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 6, 7, 1),
	('9376429', 'UILIAN DA SILVA OLIVEIRA', 'UILIAN', '120473-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9376461', 'JOSE DUARTE DE SOUSA JUNIOR', 'DUARTE', '120520-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 6, 1),
	('9376470', 'LUIGGI SALES PALÚ', 'PALÚ', '120562-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 4, 7, 1),
	('9376488', 'JACSON COELHO GOMES', 'J GOMES', '120498-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9376496', 'ARNALDO FELIX ARARIPE LEITE JUNIOR', 'ARNALDO', '120538-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 6, 7, 1),
	('9376518', 'ARLEN SOARES PASSOS', 'PASSOS', '120625-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 6, 1),
	('9376534', 'EDIVAN RODRIGUES DOS SANTOS', 'DOS SANTOS', '120670-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 6, 1),
	('9376569', 'THAIS CRUZ DE SOUZA', 'THAIS', '120487-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9376577', 'SADIK WILLY LOPES LIMA', 'SADIK', '120539-3', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 7, 1),
	('9376585', 'ESTEVÃO LIMA MENDES', 'ESTEVÃO', '120579-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 6, 1),
	('9376623', 'ANTONIO VALDERLI DO CARMO SANTOS', 'VALDERLI', '120530-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 7, 1),
	('9376666', 'BRUNO ARRYSON OLIVEIRA CONCEIÇÃO', 'ARRYSON', '120521-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 7, 1),
	('9376682', 'FERNANDO LUIZ VILLANOVA MACHADO', 'VILLANOVA', '120652-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9376690', 'LUCIANA SILVA MACIEL', 'LUCIANA', '120552-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 6, 1),
	('9376704', 'GEIZA ANDRADE DE LIMA', 'GEIZA', '120489-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9376747', 'DIEGO COSTA DA SILVA', 'DIEGO', '120663-1', 'Y', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9376755', 'ATHOS ALBUQUERQUE MENDES E SILVA', 'ATHOS', '120463-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 14, 1),
	('9376771', 'JOÃO PAULO MARQUES FERREIRA', 'JOÃO MARQUES', '120514-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 6, 1),
	('9376798', 'ADEILSON BORGES DA PÁSCOA', 'PÁSCOA', '120576-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 7, 1),
	('9376801', 'NATANIEL CHARLES DA SILVA MELO', 'NATANIEL', '120677-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 7, 1),
	('9376828', 'FELIPE SANTIAGO ROSAS DA COSTA', 'SANTIAGO', '120682-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 14, 1),
	('9376844', 'DYEGO RIBEIRO DA SILVA VIEIRA', 'DYEGO VIEIRA', '120459-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 14, 1),
	('9376852', 'WILAME PRAXEDES DA SILVA JUNIOR', 'WILAME', '120565-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9376909', 'DANIELA MARQUES DA SILVA', 'DANIELA', '120523-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 13, 1),
	('9376933', 'SIZENANDO DE FREITAS LIMA', 'FREITAS', '120612-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 7, 1),
	('9376941', 'MARIO SERGIO CARLOS DE SOUSA', 'MARIO SERGIO', '120550-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9376968', 'LAIZA MARIA SILVA MENDONÇA DA LUZ', 'LAIZA', '120547-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 13, 1),
	('9376984', 'FRANCISCO JASONE OLIVEIRA', 'JASONE', '120656-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 6, 6, 1),
	('9377000', 'MARILVA DE SANTANA BARBOSA', 'MARILVA', '120537-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 7, 1),
	('9377018', 'ANTONIO MARCOS ALMEIDA LIMA', 'MARCOS ALMEIDA', '120586-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9377042', 'CLEBER ARAUJO DE OLIVEIRA', 'CLEBER', '120540-1', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 6, 1),
	('9377069', 'GUTEMBERG DE OLIVEIRA ALBUQUERQUE', 'GUTEMBERG', '120533-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 7, 1),
	('9377077', 'SAMUEL ARAUJO DE OLIVEIRA', 'SAMUEL', '120497-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 7, 1),
	('9377107', 'MOISES NASCIMENTO MUSTAFA', 'MUSTAFA', '120621-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9377115', 'KEROLAYNE MENDES DE ARAUJO', 'KEROLAYNE', '120482-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9377123', 'MICHAEL VILISSON DE JESUS SALES', 'VILISSON', '120583-1', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9377131', 'ALINE DE OLIVEIRA FERREIRA', 'ALINE', '120628-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 6, 1),
	('9377140', 'MAICO NAIT LUCAS CARDOSO', 'MAICO', '120603-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9377190', 'MARCOS PAULO DOS ANJOS', 'DOS ANJOS', '120646-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9377220', 'BRUNO LUIZ ALENCAR DE SOUZA MELO', 'ALENCAR', '120630-0', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9377271', 'ANTÔNIO FERREIRA DE ARAÚJO JÚNIOR', 'ANTÔNIO', '120604-5', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9377328', 'LEONARDO DOUGLAS ROCHA BRASIL', 'BRASIL', '120541-9', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9377336', 'JOSÉ DA CRUZ SANTOS DA SILVA', 'DA CRUZ', '120464-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 6, 1),
	('9377395', 'BRUNO LUIS BIAZI', 'BIAZI', '120620-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 7, 1),
	('9377425', 'LEONARDO SILVA QUEIROZ', 'LEONARDO', '120686-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9377441', 'RAILSON RIGAMONTE LIZA', 'RIGAMONTE', '120556-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 6, 1),
	('9377476', 'RONALDO W. DE MENEZES SALDANHA', 'MENEZES', '120650-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 7, 1),
	('9377506', 'HÁVILA DE ABREU ROCHA', 'HÁVILA ROCHA', '120557-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9377514', 'JEFERSON AVILA DA COSTA', 'AVILA', '120580-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9377522', 'FELIPE LINDOSO DA SILVA', 'FELIPE SILVA', '120640-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 6, 1),
	('9377557', 'GLEILSON OLIVEIRA DE PAULA', 'GLEILSON', '120513-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 6, 1),
	('9377565', 'ANA PAULA SOUZA DE LIMA', 'ANA PAULA', '120524-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 7, 1),
	('9377581', 'KENNEDY JULIANO ELIAS PEREIRA', 'JULIANO ELIAS', '120527-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 7, 1),
	('9377590', 'JOCIANO DOS SANTOS FREITAS', 'JOCIANO', '120664-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 7, 1),
	('9377603', 'LUIZ PAULO LEITE BELTRÃO FREDERICO', 'BELTRÃO', '120658-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9377638', 'FRANCISCO VALENTE FERREIRA', 'F VALENTE', '120619-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 6, 1),
	('9377662', 'ISAIAS COUTINHO DE OLIVEIRA', 'ISAIAS', '120504-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 6, 1),
	('9377689', 'LUIS FERNANDO VIDAL LIMA', 'LUIS', '120574-0', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 7, 1),
	('9377697', 'JAMIM VITOR SIRIANO NOLETO', 'SIRIANO', '120705-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 12, 1),
	('9377700', 'LARISSA CAROLINA ALVES MELO', 'LARISSA', '120567-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 7, 1),
	('9377719', 'MANOEL RUSSELMO DE ARAGÃO C. FILHO', 'ARAGÃO', '120507-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 6, 1),
	('9377751', 'LEANDRO CÉSAR NOGUEIRA FERRAZ', 'FERRAZ', '120573-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 6, 6, 1),
	('9377760', 'GERALDO ALVES DE OLIVEIRA', 'DE OLIVEIRA', '120613-6', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9377786', 'MADSON HUILBER DA SILVA MORAES', 'HUILBER', '120486-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9377808', 'NEUZIVAN PEREIRA DE ARAÚJO', 'NEUZIVAN', '120525-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 6, 1),
	('9377824', 'HELIO CASTELO DA SILVA NETO', 'HELIO CASTELO', '120545-0', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9377832', 'ISMAEL CARLOS AMORIM DO NASCIMENTO', 'ISMAEL', '120578-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 7, 1),
	('9377867', 'JORGEANO CANDIDO DA CONCEIÇÃO', 'JORGEANO', '120696-1', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 7, 1),
	('9377875', 'ROMÁRIO LEITE DE OLIVEIRA', 'ROMÁRIO', '120618-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9377891', 'GLEDSON DE SOUZA ALMEIDA', 'GLEDSON ALMEIDA', '120594-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9377913', 'EVANGELISTA FERREIRA MOREIRA', 'EVANGELISTA', '120671-4', 'Y', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9377921', 'ROGERIO FREITAS DE OLIVEIRA', 'OLIVEIRA', '120465-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9377948', 'ROBERTO MONTEIRO DA SILVA', 'R MONTEIRO', '120478-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 7, 1),
	('9377972', 'MARCELO FERREIRA DE OLIVEIRA', 'MARCELO', '120492-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 6, 1),
	('9377980', 'HELITON GUIMARÃES DE MENEZES', 'GUIMARÃES', '120575-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9378014', 'JEFERSON TELES DE LIMA', 'JEFERSON TELES', '120600-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9378022', 'BRUNO VIEIRA DE SOUZA', 'BRUNO', '120572-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 7, 1),
	('9378030', 'JHONATAS SANTOS DE FREITAS', 'S FREITAS', '120522-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9378065', 'OMAR DE ALMEIDA FARIAS FILHO', 'OMAR', '120509-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9378073', 'ANDREI DAMASCENO DO VALE', 'ANDREI', '120649-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 6, 1),
	('9378081', 'OZÉIAS FERREIRA ROSA', 'OZÉIAS', '120605-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9378090', 'RENAN FELIPE GADELHA SOUZA', 'GADELHA', '120503-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9378103', 'GUILHERME E. P. GOMES DE OLIVEIRA', 'GUILHERME', '120581-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9378138', 'TAILA MARTINS BARBOSA', 'TAILA', '120501-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9378146', 'HELDON RAFAEL SILVA FERNANDES', 'RAFAEL', '120685-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 6, 1),
	('9378154', 'JOSUÉ MARTINS DE ORIAR MATOS', 'ORIAR', '120543-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 7, 1),
	('9378162', 'THIAGO MENDES DE ARAUJO', 'THIAGO', '120553-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 7, 1),
	('9378189', 'WANDESSON SANTOS DA CUNHA', 'SANTOS', '120590-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 6, 1),
	('9378200', 'PAULO SOUZA DE ALMEIDA FREIRE', 'PAULO SOUZA', '120691-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9378227', 'PEDRO CARVALHO SILVINO', 'SILVINO', '120500-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 6, 7, 1),
	('9378235', 'TEREZE CRISTINA RODRIGUES MENDES', 'CRISTINA', '120531-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9378243', 'PAULO JANES DA SILVA FERREIRA', 'JANES', '120485-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9378251', 'SEBASTIAO MORAES DA SILVA', 'MORAES', '120528-6', 'Y', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 7, 1),
	('9378286', 'SUZANE FRANCISCA HERCULANO MELO', 'SUZANE', '120470-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9378294', 'TIMÓTEO MOURA DOS SANTOS', 'TIMÓTEO', '120698-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 6, 1),
	('9378308', 'JOSÉ ANTÔNIO COSTA DA SILVA', 'J ANTÔNIO', '120616-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 7, 1),
	('9378332', 'GILIARDE OLIVEIRA DA SILVA', 'GILIARDE', '120505-4', 'Y', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9378359', 'JOSÉ MARIA FERREIRA DA SILVA', 'J FERREIRA', '120534-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 6, 1),
	('9378375', 'THIAGO DE MELO SOUZA', 'M SOUZA', '120563-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 6, 1),
	('9378383', 'THIAGO DA SILVA ROCHA', 'S ROCHA', '120624-3', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9378405', 'BRUNO MORENO DA SILVA', 'MORENO', '120555-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 7, 1),
	('9378413', 'GEOVANA FREITAS DUTRA', 'GEOVANA', '120506-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9378448', 'NOMACILIO DA SILVA OLIVEIRA', 'NOMACILIO', '120588-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9378456', 'AKAUANY FERRAZ PEREIRA', 'AKAUANY', '120778-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 13, 1),
	('9378464', 'EMANUEL CAVALCANTE PINHEIRO', 'EMANUEL', '120568-2', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 7, 1),
	('9378472', 'LUCIANA MACIEL DE SOUZA', 'LUCIANA MACIEL', '120468-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 6, 1),
	('9378480', 'ONACELIO DOS SANTOS DA SILVA', 'ONACELIO', '120549-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9378502', 'RUANDISON EHLANDSTARLEY SOUZA DE CASTRO', 'RUANDISON', '120653-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 6, 1),
	('9378510', 'MARCOS MENDES DE ARAÚJO', 'MENDES', '120689-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 7, 1),
	('9378545', 'ROOBSON LEVI TAVARES DOS SANTOS', 'LEVI', '120695-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 7, 1),
	('9378553', 'MIRLA DA SILVA SANTOS', 'MIRLA', '120491-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 13, 1),
	('9378570', 'ANA PAULA CORREIA DE OLIVEIRA', 'PAULA CORREIA', '120475-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9378588', 'JESSYCA LIMA DA SILVA', 'JESSYCA', '120466-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 7, 1),
	('9378596', 'MARIA TAINÁ ITALIANO DE ALBUQUERQUE', 'TAINÁ', '120488-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9378618', 'HENRIQUE MACHADO MARTINS', 'HENRIQUE', '120607-8', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 7, 1),
	('9378634', 'CESIANE FEITOSA DOS SANTOS', 'FEITOSA', '120582-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9378642', 'PAULO VITOR RIBEIRO DE OLIVEIRA', 'PAULO VITOR', '120697-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9378669', 'LUIZ EDUARDO PADILLA MARQUES', 'PADILLA', '120566-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 6, 1),
	('9378707', 'MARCOS FERNANDES MURIETA', 'MURIETA', '120687-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 6, 1),
	('9378855', 'DHEIME PEREIRA DOS SANTOS', 'DHEIME', '120623-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 7, 1),
	('9378863', 'WILKE MACIEL PEIXE', 'WILKE', '120632-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 6, 1),
	('9378871', 'MANOEL MARCELO DO CARMO NASCIMENTO', 'MARCELO NASCIMENTO', '120662-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 6, 6, 1),
	('9378880', 'ALEX COSTA MESQUITA', 'ALEX', '120602-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 6, 6, 1),
	('9378910', 'EVERTON LIMA DE FARIAS', 'L FARIAS', '120676-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 6, 1),
	('9378979', 'EVANILSON DE CASTRO FREIRE', 'DE CASTRO', '120699-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9378995', 'SIDNEY ALBUQUERQUE MENDONSA', 'S ALBUQUERQUE', '120694-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 6, 1),
	('9379010', 'GENILVAN APOLINÁRIO DE MOURA', 'MOURA', '120642-5', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 7, 1),
	('9379029', 'JOSÉ SANSUI DA SILVA FERREIRA', 'SANSUI', '120577-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 6, 1),
	('9379037', 'MAÍRA DA SILVA DE SOUZA', 'MAÍRA', '120569-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 7, 1),
	('9379045', 'OSIEL PESSOA DE SOUZA', 'OSIEL', '120570-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 7, 1),
	('9379053', 'HELDER FREIRE DA SILVA', 'HELDER', '120627-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9379061', 'WILDY KENEDY FERREIRA', 'WILDY', '120609-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9379070', 'WELLINGTON LUIZ SOUZA MOURA', 'WELLINGTON', '120667-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9379088', 'LUCAS BALDUINO SILVA', 'BALDUINO', '120660-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 6, 1),
	('9379096', 'BRUNO LIRA SANDRA DE VASCONCELOS', 'VASCONCELOS', '120643-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 6, 1),
	('9379118', 'WALMIR VIVAN JUNIOR', 'W VIVAN', '120665-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 6, 1),
	('9379134', 'LUIZ PEREIRA DE LIMA JUNIOR', 'DE LIMA', '120638-3', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 7, 1),
	('9384324', 'ANTONIO SALOMÃO SOUZA DE ALMEIDA', 'SALOMÃO', '120702-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 6, 1),
	('9385673', 'FLAMEL DE ARAÚJO SILVA', 'FLAMEL', '120706-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 6, 1),
	('9385681', 'ARLYS DE OLIVEIRA DINIZ', 'ARLYS', '120708-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 6, 1),
	('9385690', 'HUGO BREDA', 'BREDA', '120703-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9385797', 'MESSIAS VIANA DE LIMA', 'VIANA', '120707-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9385800', 'ANTÔNIO RÔMULO CAMPOS DE NORONHA', 'NORONHA', '120700-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 6, 1),
	('9389105', 'RAYANE CASIMIRO ROSAS MATOS', 'RAYANE', '120891-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9390073', 'LUCAS OLIVEIRA DE SOUZA', 'LUCAS', '120920-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 2, 1),
	('9391347', 'ALEXANDRO SANTOS DE ALENCAR', 'ALEXANDRO', '120843-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9396403', 'AYRTON SILVA BRITO', 'AYRTON', '120739-9', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9396780', 'TAUANA FORTUNA DE OLIVEIRA', 'FORTUNA', '120922-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9398635', 'EVERTON ALMEIDA DO NASCIMENTO', 'ALMEIDA', '120738-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 6, 6, 1),
	('9400176', 'RENATA FRANÇA REZENDE', 'REZENDE', '120848-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9400265', 'EURICO FERNANDO MELO LEITE', 'EURICO', '120766-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 14, 1),
	('9400494', 'GEOVANE DA CONCEIÇÃO GOMES', 'GEOVANE', '120720-9', 'Y', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 6, 1),
	('9405097', 'QUELVILIN GOMES DA SILVA', 'GOMES', '120752-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9411224', 'AIRTON SILVA OLIVEIRA', 'AIRTON', '120830-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9411461', 'RAIMUNDO MARQUES DA SILVA NETO', 'MARQUES', '121006-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9414037', 'MÁRCIO FELIPE COSTA E SILVA', 'MÁRCIO FELIPE', '120960-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 2, 1),
	('9416439', 'WELINGTON NASCIMENTO DE SOUZA', 'W SOUZA', '120734-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9416447', 'LUIZ DE GONZAGA RIBEIRO DA S. JUNIOR', 'RIBEIRO JUNIOR', '120733-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 6, 6, 1),
	('9416455', 'WEMERSON XAVIER DE JESUS', 'XAVIER', '120716-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9416463', 'RODRIGO TELES DA SILVA', 'RODRIGO', '120744-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416471', 'DIONE HENRE BEZERRA OLIVEIRA BRITO', 'HENRE', '120743-1', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 6, 1),
	('9416480', 'RAIMUNDO ROSENIR DO VALLE CRUZ', 'VALLE', '120740-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416498', 'PRISCILIA DA SILVA WALTER', 'PRISCILIA', '120717-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416501', 'NIRLAN SILVA DA COSTA', 'NIRLAN', '120714-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416510', 'MARCELO DE OLIVEIRA SOUZA', 'DE SOUZA', '120732-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416528', 'JOSÉ MARIA NASCIMENTO DA SILVA', 'J NASCIMENTO', '120724-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416536', 'RODRIGO BARDALES REBOUÇAS', 'BARDALES', '120749-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9416544', 'JOSE JARDESSON OLIVEIRA DA COSTA', 'JARDESSON', '120727-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416552', 'MARIO LIMA RODRIGUES', 'L RODRIGUES', '120730-8', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9416560', 'JOSÉ ALISSON DA SILVA PINTO', 'SILVA PINTO', '120710-0', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416579', 'JOSIMAR OLIVEIRA RODRIGUES DE QUEIROS', 'J QUEIROS', '120712-6', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 6, 1),
	('9416587', 'JHONATAN CARNEIRO DA SILVA', 'CARNEIRO', '120735-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 6, 1),
	('9416595', 'RAMON LIMA DO NASCIMENTO', 'RAMON', '120759-7', 'Y', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416609', 'BRUNO DANTAS DA SILVA', 'B DANTAS', '120746-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 6, 1),
	('9416617', 'ASAFE DE SOUZA COSTA', 'ASAFE', '120754-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9416633', 'NAPOLEÃO MENDONÇA MUNIZ', 'NAPOLEÃO', '120760-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 6, 1),
	('9416650', 'ANDRÉ FELÍCIO TEODORO DA SILVA', 'FELÍCIO', '120719-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 6, 1),
	('9416668', 'JARDSON BARROSO DE ARAÚJO', 'BARROSO', '120725-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416676', 'FILIPE DE SOUZA LIMA', 'FILIPE LIMA', '120742-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 4, 6, 1),
	('9416684', 'ALEX SANDRO AGUIAR NUNES', 'NUNES', '120729-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 6, 1),
	('9416692', 'JOSÉ JARISON DE ARAÚJO FARIAS', 'JARISON', '120747-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 6, 1),
	('9416714', 'ADRIANO DA SILVA ROCHA', 'ADRIANO ROCHA', '120737-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 6, 1),
	('9416722', 'JOSÉ HANGEL FARRAPO DOS SANTOS', 'HANGEL', '120726-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 6, 1),
	('9416730', 'FRANCISCO SANTANA BARBOSA', 'SANTANA', '120721-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 6, 1),
	('9416749', 'FRANCIVALDO RODRIGUES DA COSTA', 'COSTA', '120745-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 6, 1),
	('9416765', 'ANTONIO ANAILSON FAÇANHA DA C. JÚNIOR', 'FAÇANHA', '120731-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416773', 'ERLISSON OLIVEIRA DA SILVA', 'ERLISSON', '120755-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416781', 'FRANCISCO DAS CHAGAS DA ROCHA CRUZ', 'F ROCHA', '120741-5', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 6, 1),
	('9416790', 'EDMILSON DA SILVA DAMASCENO JÚNIOR', 'DAMASCENO', '120713-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 6, 1),
	('9416803', 'ALDEMAURO DE SOUZA MACIEL', 'ALDEMAURO', '120728-2', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416811', 'EDINARA SILVA DE SOUZA', 'EDINARA', '120711-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416820', 'DANILO DO NASCIMENTO CARVALHO', 'DANILO', '120762-1', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 6, 1),
	('9416838', 'BRUNO LUÍS BERNARDO MOTA', 'BERNARDO', '120751-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416846', 'DANIELSON DA SILVA CUNHA', 'CUNHA', '120736-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 6, 1),
	('9416854', 'ANDRÉ RICARDO DE SOUZA LEMOS', 'LEMOS', '120756-4', 'Y', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 6, 1),
	('9416862', 'SANDRO GOMES MARQUES', 'SANDRO GOMES', '120723-3', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9416870', 'UILIAN ISAAC NASCIMENTO DE ALMEIDA,', 'ISAAC', '120750-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 6, 1),
	('9417974', 'JAILDA DOS SANTOS FREITAS', 'JAILDA', '120825-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9418490', 'RAYLANE DIAS DA SILVA', 'R DIAS', '121077-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 2, 1),
	('9423109', 'GIOVANE NEGREIROS DOS SANTOS', 'GIOVANE', '120782-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9431934', 'FABIANO DE ARAÚJO CRUZ', 'CRUZ', '120780-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 12, 1),
	('9436308', 'ANDRE FELIPE DA CONCEIÇÃO', 'ANDRE FELIPE', '120955-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9443339', 'WANDERSON FITTIPALDY DE OLIVEIRA', 'W FITTIPALDY', '120998-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 2, 1),
	('9443568', 'DANILO DE SOUZA LIMA', 'SOUZA LIMA', '121063-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9452338', 'JORDES SOUZA DA SILVA', 'JORDES', '120963-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9453229', 'SILVANA DA SILVA COSTA', 'SILVANA', '121023-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 2, 1),
	('9456740', 'CAIO BIASOLI MARQUES', 'BIASOLI', '120764-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 14, 1),
	('9456910', 'MATHEUS MOURA BERTHOLDI', 'BERTHOLDI', '120773-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 13, 1),
	('9457593', 'LUCAS DE FIGUEIREDO E SILVA', 'FIGUEIREDO', '120857-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9458085', 'AMILSON NOBRE DE SOUZA', 'A NOBRE', '120981-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9459286', 'JUDSON GOMES DA COSTA', 'JUDSON', '120850-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9462910', 'FRANCISCO ADVILSON DA SILVA NASCIMENTO', 'ADVILSON', '121009-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9466673', 'JORLAN SAVIO COSTA DE SOUZA', 'JORLAN SAVIO', '120888-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9467491', 'DARLAN CASTRO DA ROCHA', 'DARLAN', '120823-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9468722', 'JADISON DE SOUZA DAVILA', 'J DAVILA', '120797-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9470018', 'ANTONIO FRANCISCO DA SILVA LIMA', 'A LIMA', '120882-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9472762', 'JOSE WELLYTON QUEIROZ SANTIAGO', 'WELLYTON', '120924-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9474129', 'CRISTIAN FARIAS DE SOUZA', 'CRISTIAN', '120969-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9484256', 'LESSANDRO LIMA E LIMA', 'LESSANDRO', '120965-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9486763', 'CINDY LEAL LIMA', 'CINDY LEAL', '120991-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9486968', 'HELIO FIESCA NETO', 'HELIO NETO', '120951-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9488650', 'JESSICA COSTA MARTINS', 'JESSICA COSTA', '120815-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9491392', 'JOABE FREITAS DO NASCIMENTO', 'JOABE', '120847-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9491767', 'LINEKER LAUDRUP DOS SANTOS', 'LAUDRUP', '120899-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9494774', 'ELUZANO ANDRE DA SILVA', 'ELUZANO', '120840-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 2, 1),
	('9497595', 'KEILA ROBERTA SOUZA DA SILVA', 'ROBERTA', '121056-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9500537', 'GEOZADAQUE BEZERRA OLIVEIRA', 'GEOZADAQUE', '120900-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9505393', 'JOSE AELSON DA SILVA MELO', 'AELSON', '120927-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9512870', 'LUIZ FERNANDO VASCONCELOS DE ARAUJO', 'L FERNANDO', '121053-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9512985', 'DANYELLE AMARAL DE ARAÚJO', 'DANYELLE', '121028-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9514074', 'RAYNE DA SILVA LUNA OLIVEIRA', 'RAYNE LUNA', '120947-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9514180', 'FRANCISCO WEVELLEY DA SILVA NERI', 'F NERI', '120877-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9514260', 'CAUANE DA SILVA LEBRE', 'CAUANE', '120915-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9515461', 'PAULO MARTINS DIAS', 'PAULO DIAS', '120946-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9515569', 'TALYSON DA SILVA NOGUEIRA', 'NOGUEIRA', '121072-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9515771', 'ANDRESSA DE CASTRO SOUZA', 'A CASTRO', '121052-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9515941', 'JOAO VICTOR RODRIGUES DANTAS', 'J RODRIGUES', '120855-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9516719', 'ANDREILSON COSTA DE MELO', 'ANDREILSON', '120798-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9518657', 'LARISSA ALMEIDA SILVA', 'LARISSA', '120835-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 2, 1),
	('9519637', 'DANIEL DIOGO DE ALMEIDA', 'DIOGO', '120871-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9521291', 'EVELY MONIQUE FLORES XAVIER', 'EVELY', '120949-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 2, 1),
	('9523553', 'KENNEDY EMANUEL SAMPAIO DA SILVA', 'K SAMPAIO', '120822-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 2, 1),
	('9525092', 'ADRIANO ARAÚJO PEREIRA', 'A PEREIRA', '120861-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9526200', 'MARCELO BRILHANTE DE ARAÚJO LIMA', 'MARCELO BRILHANTE', '121048-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9527001', 'FRANCISCO RODRIGO COUTINHO DA SILVA', 'COUTINHO', '120938-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9528911', 'RANDSON DA SILVA COSTA', 'RANDSON', '121059-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9535861', 'EVERTON OLIVEIRA DA SILVA', 'E SILVA', '120926-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9546502', 'MARCUS VENICIUS DA SILVA NOLASCO', 'MARCUS', '120799-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9547380', 'JOSÉ NILTON BARRETO MOTA', 'BARRETO', '120779-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 12, 1),
	('9547398', 'MARLON GABRIEL B. CASTELO BRANCO', 'CASTELO BRANCO', '120783-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 12, 1),
	('9547452', 'LYA JÚLIA BARBOSA MORAIS DE OLIVEIRA', 'LYA JÚLIA', '120775-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 13, 1),
	('9552880', 'ISRAEL FERREIRA BRÁS', 'BRÁS', '120885-0', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9553371', 'SAVIO DE MELO ANDRADE', 'SAVIO ANDRADE', '120940-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 2, 1),
	('9553657', 'JONATHAS DO CARMO NERY', 'NERY', '120801-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9554297', 'GERLAN CHRISTYAN ARAÚJO DE QUEIROZ', 'GERLAN', '120833-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9554939', 'LUCAS CABRAL DE ALENCAR SOUSA', 'CABRAL', '120929-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9559370', 'KATRINE DA SILVA SOUZA', 'KATRINE', '120902-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9569685', 'JONATAS DOS SANTOS FONSECA', 'FONSECA', '120794-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 18, 2, 1),
	('9570519', 'JOAO PAULO FIRMINO DE LIMA', 'FIRMINO', '121055-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9574360', 'MILENA LIMA DA COSTA', 'MILENA', '120934-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 2, 1),
	('9574468', 'MARCELO DO NASCIMENTO MONTEIRO', 'MONTEIRO', '120814-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 2, 1),
	('9581316', 'FRANCISCO CLEBER DE ALMEIDA PONTES', 'PONTES', '120827-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9586741', 'RAINNER DOS SANTOS CARVALHO', 'RAINNER', '121045-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9590021', 'JULIANO GONCALVES FREIRE', 'JULIANO', '121005-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 2, 1),
	('9590030', 'YALLAS VICTOR FREITAS DE QUEIROZ', 'VICTOR QUEIROZ', '120950-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9591680', 'RAFAEL OLIVEIRA DA SILVA', 'OLIVEIRA', '120849-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9592466', 'ANA CAROLAINE COSTA ALVES', 'CAROLAINE', '120954-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9593047', 'JESSICLEY DA SILVA BARROZO', 'J BARROZO', '120875-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9593390', 'JULIO FELIPE ARAÚJO DE FREITAS', 'JULIO', '120808-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9595937', 'JANDERSON NERI CORREIA', 'JANDERSON', '120914-8', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9598740', 'MICHAEL DOUGLAS SOUSA FERNANDES', 'MICHAEL DOUGLAS', '120982-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9600507', 'JOAO VICTOR ARAÚJO DA SILVA', 'VICTOR ARAÚJO', '120903-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9601643', 'GEOVANE DUARTE DA COSTA', 'GEOVANE', '121020-3', 'Y', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 2, 1),
	('9604251', 'CARMEM JÚLIA MARQUES', 'JÚLIA MARQUES', '121079-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9606270', 'ADRIANA DA SILVA MORAIS', 'ADRIANA', '120930-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9606289', 'ANDRE LUIZ DA CRUZ MAIA', 'ANDRE CRUZ', '120901-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9606297', 'APOLLO REIS DOS SANTOS DA SILVA', 'APOLLO', '120904-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9606300', 'ADRIANO DA SILVA TELES', 'TELES', '121008-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9606319', 'ARIEL CAVALCANTE BRILHANTE', 'BRILHANTE', '120817-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 2, 1),
	('9606327', 'ADRIANO DO NASCIMENTO ALBUQUERQUE', 'ALBUQUERQUE', '120971-8', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9606335', 'CAIO DO NASCIMENTO COSTA', 'CAIO COSTA', '121011-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9606343', 'AEOLANE COELHO SOUSA', 'AEOLANE', '120964-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9606351', 'CAIO VINICIUS PRAXEDES RODRIGUES', 'PRAXEDES', '120905-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9606360', 'ANDRESON SILVA CARNEIRO', 'ANDRESON', '120839-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9606378', 'ARIEL DE MELO NICACIO RODRIGUES', 'NICACIO', '120866-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9606386', 'ANDREY FELIPE DIAS DA SILVA', 'FELIPE DIAS', '121010-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9606394', 'BÁRBARA DE SOUZA FERREIRA', 'BÁRBARA', '120886-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9606408', 'ANDREY MATOS DA SILVA', 'ANDREY', '120907-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9606416', 'BILLY MATEUS ARAÚJO REIS', 'BILLY', '120967-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9606424', 'ALEXSANDRO BRAGA DA SILVA', 'BRAGA', '120851-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9606432', 'BRAYAN LUKAS DE ARAÚJO MESQUITA', 'BRAYAN', '120923-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9606440', 'ANTONIO WAGNER SOUSA E SOUSA', 'WAGNER SOUSA', '120932-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9606459', 'ANA CAROLINE ALVES DE BARROS', 'ANA BARROS', '121004-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9606467', 'BRUNA COSTA DE ASSIS', 'BRUNA', '120845-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9606475', 'ANA PETTA SILVA MENDONÇA', 'PETTA', '120872-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9606483', 'BRUNO DE ASSIS CONTREIRAS', 'CONTREIRAS', '121022-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9606491', 'ANDERSON LIMA MANAUARES', 'MANAUARES', '120976-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9606505', 'CRISTIANE BEZERRA DA SILVA LOPES', 'CRISTIANE', '120912-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9606513', 'DAIANE MARIA SILVA DA ROCHA', 'DAIANE SILVA', '120831-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9606521', 'DAVI OLIVEIRA HONORATO JUNIOR', 'HONORATO', '120846-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9606530', 'BRIGIDA FIRMO BEZERRA', 'BRIGIDA', '121007-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9606548', 'DANIEL LINHARES CRAVEIRO', 'LINHARES', '120858-7', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9606556', 'DAVID SILVA LIMA', 'DAVID', '120974-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9606564', 'EDGARD AMARAL DOS SANTOS', 'EDGARD', '120919-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 2, 1),
	('9606572', 'EDICLEI SALES DE SOUZA', 'EDICLEI', '120819-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9606580', 'EWERTON BEZERRA SILVA', 'EWERTON', '120959-3', 'N', 'N', 'N', NULL, '2026-02-13 16:56:34', '2026-02-13 17:52:58', 2, 2, 1),
	('9606599', 'DHEFLE KAIA SOUSA MACEDO', 'DHEFLE', '121021-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9606602', 'FELIPE LIMA DUARTE', 'DUARTE', '120952-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9606610', 'DAYANNE CRISTINE CACAU DE ARAÚJO', 'DAYANNE CACAU', '120961-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9606629', 'EDUARDO GOES MARTINS', 'GOES', '120913-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9606637', 'FRANCISCO ANDRADE E SILVA NETO', 'FRANCISCO', '120826-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9606645', 'FERNANDO AFONSO FERREIRA', 'AFONSO', '120970-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9606653', 'EDUIM FABI SOUZA FERNANDES', 'S FERNANDES', '120980-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9606661', 'GABRIEL NERY DE MOURA', 'G NERY', '120937-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9606670', 'FELIPE RICARDO LIMA', 'FELIPE', '121012-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9606688', 'FRANCISCO BRUNO LIMA DA ROCHA', 'BRUNO', '120820-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9606696', 'FERNANDO FELIPE SILVA', 'FERNANDO', '120975-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9606700', 'EDULIN FELIPE FARIAS PEREIRA', 'EDULIN', '120889-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9606718', 'GERBSON FRANCISCO NOGUEIRA MAIA', 'GERBSON', '120936-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9606726', 'FERNANDO RODRIGUES WALTER', 'WALTER', '120972-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9606734', 'ELUAN THALES LESSA', 'ELUAN', '120878-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9606742', 'FERNANDO SILVA DE BRITO', 'F BRITO', '120977-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9606750', 'GABRIEL BASTOS NARDINO', 'NARDINO', '120879-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9606769', 'GABRIEL DA CUNHA JORGE RIGONATO LIMA', 'RIGONATO', '120874-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9606777', 'ERISSON SILVA DAMASCENO', 'ERISSON', '120832-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9606793', 'GABRIEL LUCAS CARMO DE SOUZA', 'CARMO', '120911-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9606807', 'GUSTAVO DA CUNHA GOMES', 'GUSTAVO', '120995-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9606815', 'ISMAEL PESSOA DE ARAÚJO FERREIRA', 'PESSOA', '120884-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9606823', 'HAROLD BRAGA AMORIM', 'HAROLD', '120869-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9606831', 'JAMERSON LEITE DA ROCHA JUNIOR', 'JAMERSON', '121002-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9606840', 'HELEN CRISTINA DA SILVA MENEZES', 'HELEN', '120944-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9606858', 'JAMERSON SOUZA', 'JAMERSON', '120962-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9606866', 'JOAO WILKER RODRIGUES DE SOUSA', 'WILKER', '120873-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9606874', 'HUGO KANT DE ARAÚJO E ARAÚJO', 'KANT', '120865-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9606882', 'JANDERSON QUEIROZ ARAÚJO', 'QUEIROZ', '120992-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9606890', 'IAGO ANDRADE COSTA', 'COSTA', '120918-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9606912', 'IAN SILVA FREITAS', 'IAN', '120890-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9606920', 'ITALO KEVIN CASTRO DA SILVA', 'ITALO CASTRO', '120925-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9606939', 'JOSIEL DE LIMA CAVALCANTE', 'J CAVALCANTE', '120910-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9606955', 'JOAO CARLOS LIMA DA SILVA', 'C LIMA', '120841-3', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9606963', 'JOSE HENRIQUE MONTEIRO PIMENTA', 'PIMENTA', '120809-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9606971', 'IZABEL OLIVEIRA DO REGO', 'IZABEL', '120941-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9606980', 'LEONARDO CORDEIRO TERAMOTO', 'TERAMOTO', '120800-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 2, 1),
	('9606998', 'KEILA BEZERRA DA COSTA', 'KEILA', '120787-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9607013', 'KAUENDRE MENDES COSTA', 'KAUENDRE', '120931-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9607030', 'JOAO VICTOR DE SOUZA CALIXTO', 'CALIXTO', '120893-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9607048', 'LAELIA FERNANDES DA SILVA', 'LAELIA', '121017-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9607056', 'LEANDRO PINHO DA SILVA', 'L PINHO', '120816-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9607072', 'LORENA OLIVEIRA DA SILVA', 'LORENA', '120906-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9607080', 'JOAO VICTOR RIBEIRO MORAES', 'MORAES', '120842-1', 'Y', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9607099', 'LEANDRO SANTOS DA SILVA', 'LEANDRO', '121013-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9607102', 'LUAND GADELHA LIMA', 'LUAND', '120928-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9607129', 'MARCOS JUNIOR SILVA E SILVA', 'M JUNIOR', '120852-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 2, 1),
	('9607137', 'MICAELLI THAIS DE OLIVEIRA MENDONÇA', 'MENDONÇA', '120973-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9607145', 'LUIS FILIPE MENDOÇA PINHEIRO DE ALMEIDA', 'ALMEIDA', '120807-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9607153', 'MARCUS VINICIUS LIRA PADILLA', 'PADILLA', '120956-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 2, 1),
	('9607161', 'LUCAS RAMON CRUZ BARROS', 'CRUZ', '120837-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9607170', 'LUIZ CARLOS PAZA JUNIOR', 'PAZA', '120788-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 2, 1),
	('9607188', 'MARIA CELESTE DA COSTA DINIZ', 'CELESTE', '120896-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 2, 1),
	('9607196', 'MARIA LEONIZA DA SILVA E SILVA CHAVES', 'LEONIZA', '121018-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9607200', 'MARCELLA LIRA FRANCA', 'MARCELLA', '120859-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 2, 1),
	('9607226', 'MILTON ARAÚJO FERREIRA DA SILVA', 'M ARAÚJO', '120838-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9607234', 'LUCICLENIO DA COSTA FONTENELE', 'FONTENELE', '120792-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9607242', 'MARIA REGINA MOREIRA DA SILVA', 'REGINA', '120802-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 2, 1),
	('9607250', 'MARCELO DA SILVA LIMA', 'DA SILVA', '120828-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9607269', 'MARIA TEREZINHA CAVALCANTE', 'CAVALCANTE', '121001-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9607277', 'PATRIK ANDERSSON SOUZA DA COSTA', 'PATRIK', '120945-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9607285', 'MATEUS DE OLIVEIRA MAGALHAES', 'M MAGALHAES', '120985-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9607293', 'MATEUS FERREIRA OLIVEIRA', 'M OLIVEIRA', '120933-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9607307', 'PAULO DA SILVA ROCHA JUNIOR', 'JUNIOR', '120990-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9607323', 'MARCIO RIBEIRO HIERT DA CRUZ', 'HIERT', '120844-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9607331', 'PAULO HENRIQUE SILVA FERREIRA', 'FERREIRA', '120921-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9607340', 'NATHAN SILVA DOS SANTOS', 'NATHAN', '120870-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9607358', 'MATHEUS FERNANDES DA COSTA SILVA', 'M FERNANDES', '120898-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9607366', 'MARCOS ANTONIO SANTOS', 'MARCOS SANTOS', '120968-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9607374', 'NAYSSON CASTRO SOUZA', 'CASTRO', '120829-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9607382', 'MATHEUS FERREIRA DE OLIVEIRA', 'MATHEUS FERREIRA', '120989-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9607390', 'MATHEUS RIBEIRO LIMA', 'M RIBEIRO', '120957-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9607404', 'PAULO HENRIQUE BRAGA LOPES', 'P LOPES', '120978-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9607412', 'OSIEL MACEDO TEIXEIRA', 'MACEDO', '120948-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9607420', 'PEDRO LIRA SANDRA DE VASCONCELOS', 'VASCONCELOS', '120895-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9607439', 'MAX JEFFERSON ALMEIDA DA SILVA', 'MAX', '120804-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9607447', 'PEDRO HENRIQUE DO VALLE COSTA', 'PEDRO', '121015-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9607455', 'MAYCON MIRANDA DE LIMA', 'M MIRANDA', '120876-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9607463', 'SAMUEL ATAN LIMA FERNANDES', 'SAMUEL', '120868-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9607471', 'RENÃ MENDOÇA GALVÃO', 'GALVÃO', '120786-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9607480', 'SANGELA PEREIRA RODRIGUES', 'SANGELA', '120805-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9607498', 'SAYMO HENRIQUE NASCIMENTO GARCIA', 'S GARCIA', '120864-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9607501', 'RENATO COSTA DE ALMEIDA', 'R COSTA', '120999-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9607510', 'LUIZ GUILHERME BEZERRA MAIA', 'GUILHERME', '121016-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9607528', 'STEPHANIE MATOS DE SOUZA', 'STEPHANIE', '120996-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9607536', 'RIKELMIN MUNIZ DA SILVA', 'MUNIZ', '120796-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 2, 1),
	('9607544', 'WENDERSON DE LIMA SAGE', 'SAGE', '120793-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9607552', 'RODRIGO DA COSTA BEIRUTH', 'RODRIGO', '120810-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 2, 1),
	('9607560', 'RAFAEL MENESES DA SILVA', 'RAFAEL SILVA', '120862-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9607579', 'TAIANE DIOGENES DE CARVALHO', 'TAIANE', '120789-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 2, 1),
	('9607587', 'TALISSON SANTANA ALVES JANUARIO', 'JANUARIO', '120803-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9607609', 'WESDRES MAIA FERNANDES', 'FERNANDES', '120818-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 7, 2, 1),
	('9607617', 'ROMARIO BEZERRA VENANCIO', 'VENANCIO', '120979-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 2, 1),
	('9607625', 'RAMON DE SOUZA SILVA', 'RAMON', '120824-9', 'Y', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9607633', 'TANDA DO CARMO DE SOUZA', 'TANDA', '120867-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9607641', 'WILLISMAR DE OLIVEIRA CORDEIRO', 'WILLISMAR', '120892-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9607650', 'THAIS RIBEIRO DAMASCENO ROCHA', 'THAIS RIBEIRO', '120942-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 2, 1),
	('9607668', 'RUAN VICTOR NASCIMENTO BATALHA', 'BATALHA', '120993-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9607676', 'RAMON SILVA DE LIMA', 'RAMON SILVA', '120813-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9607684', 'THALES AUGUSTO SALES DE OLIVEIRA', 'SALES', '120966-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9607692', 'THARSOS MOTA D AVILA', 'THARSOS', '120881-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 8, 2, 1),
	('9607706', 'SALOMÃO CAMPOS DE SOUZA', 'SALOMÃO', '120821-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9607714', 'RANNE KELLY BARBOZA DA SILVA', 'RANNE', '120909-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 2, 1),
	('9607722', 'VICTOR AFONSO SANTANA DA COSTA', 'VICTOR AFONSO', '121000-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 2, 1),
	('9607730', 'THIAGO LIMA DOS SANTOS', 'THIAGO LIMA', '120916-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 3, 2, 1),
	('9607749', 'RAQUEL BENEVENUTO DA SILVA LIMA', 'RAQUEL BENEVENUTO', '120958-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9607757', 'VALDEIR SOUZA COSTA', 'COSTA', '121003-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9607765', 'VIKTOR DA SILVA CAVALCANTE', 'VIKTOR', '120935-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9607773', 'THIAGO RICARDO SOUSA GOMES', 'RICARDO GOMES', '120795-1', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9607781', 'UEVERTON OLIVEIRA DE ANDRADE', 'UEVERTON', '120863-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9607790', 'VALÉRIA ALVES DE OLIVEIRA', 'VALÉRIA', '120791-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9607838', 'RAQUEL SANTANA DA SILVA', 'RAQUEL SANTANA', '120854-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 5, 2, 1),
	('9607870', 'VANESSA MOURA LIMA MURAD', 'VANESSA', '120790-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9607935', 'NICKSON DAVID DE FREITAS DA ROCHA', 'NICKSON', '120953-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9607978', 'WEVERTON SAULO RIBEIRO DOS SANTOS', 'SAULO', '120860-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9608109', 'VINICIUS ALVES CASTRO', 'VINICIUS', '120984-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 9, 2, 1),
	('9608117', 'COSMO DA SILVA JORGE', 'JORGE', '120939-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9608192', 'MAYCON DOUGLAS FALCAO VIEIRA', 'DOUGLAS', '120997-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9608338', 'GUILHERME SAUER DE FARIA', 'SAUER', '120811-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 11, 2, 1),
	('9608346', 'JOSÉ AUGUSTO LINDOSO DA SILVA', 'LINDOSO', '120943-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9608354', 'MÁRCIO ROBERTO SILVA GOMES', 'M ROBERTO', '120983-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9608362', 'MATEUS BATISTA BEZERRA', 'MATEUS', '120917-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9608370', 'MOÉSIO GURGEL DA SILVA', 'MOÉSIO', '120806-6', 'N', 'Y', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 10, 2, 1),
	('9608389', 'PÂMELA LIMA DA CRUZ', 'PÂMELA', '120908-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 2, 2, 1),
	('9609105', 'LUCAS SANTOS DE SOUZA', 'LUCAS', '121019-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9609113', 'JOÃO PAULO CAVALCANTE DE SÁ', 'DE SÁ', '120883-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 2, 1),
	('9614931', 'JOSÉ MÁRCIO DE CARVALHO LIMA', 'CARVALHO LIMA', '121024-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9617604', 'LINO SILVA NOGUEIRA', 'LINO', '121050-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9623205', 'SILMARA SILVA DE PAULA', 'SILMARA', '121030-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9630449', 'RAYANNE FALCÃO DOS SANTOS', 'RAYANNE FALCÃO', '121071-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9630660', 'JANDERSON FERREIRA DE SOUZA', 'F SOUZA', '121033-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9630929', 'ELIKEVERSON NASCIMENTO DOS SANTOS', 'ELIKEVERSON', '121035-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9631070', 'ERIC DA SILVA FRANÇA', 'ERIC', '121047-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9631364', 'LETÍCIA LIMA POSSAMAI', 'POSSAMAI', '121054-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9632220', 'JÚLIA COSTA DE SOUZA', 'JÚLIA COSTA', '121067-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9632565', 'ANTÔNIO TARLESSON CAMPOS DA SILVA', 'CAMPOS', '121057-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9637559', 'PRISCILA FERREIRA PIRES', 'PRISCILA PIRES', '121075-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9643761', 'GIOVANNA EVELIN ANJOS DOS SANTOS', 'GIOVANNA', '121066-5', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9682198', 'ALCIONE NASCIMENTO DA SILVA', 'ALCIONE', '121062-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9682385', 'PRISCILA DE MESQUITA LIMA', 'MESQUITA', '121074-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9682386', 'MARIA DAS GRACAS BARRETO COELHO', 'MARIA DAS GRACAS', '121025-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9682390', 'RODRIGO NERI MOURA DE OLIVEIRA', 'RODRIGO NERI', '121051-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9682391', 'RODRIGO BARBOSA DAS NEVES', 'NEVES', '121058-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9682392', 'MAISA DO CARMO DA SILVA', 'MAISA', '121068-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9682393', 'THYERLLE SIQUEIRA DA COSTA', 'THYERLLE COSTA', '121070-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9682394', 'LUANA PENHA BRAGA PASSO', 'LUANA BRAGA', '121026-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9682396', 'LETÍCIA SILVA BANDEIRA', 'BANDEIRA', '121038-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9682398', 'LARISSA PAULA DE MELO LIMA', 'LARISSA LIMA', '121073-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9682399', 'JONAS DE SOUZA NÓBREGA', 'NÓBREGA', '121065-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9682400', 'JONATAN COSTA SOUZA', 'JONATAN', '121041-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9682402', 'JESSICA PRISCILA VILLAROUCA DE ARAUJO', 'VILLAROUCA', '121043-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9682404', 'JAINA OLIVEIRA SOUZA AZEVEDO', 'JAINA', '121036-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9682405', 'GUSTAVO DOS SANTOS FRANÇA', 'G FRANÇA', '121061-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9682415', 'GLAUCO DE HOLANDA CASTRO', 'HOLANDA', '121044-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 2, 1),
	('9682417', 'ALAN DO NASCIMENTO ALBUQUERQUE', 'ALAN', '121042-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9682418', 'ANDRÉ LUCAS FERREIRA PIRES', 'ANDRÉ', '121076-4', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9682419', 'BRUNA CÂNDIDO DE LIRA', 'BRUNA C LIRA', '121037-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9682420', 'LUMA LOHANA DO NASCIMENTO NASCIMENTO LIMA', 'LUMA', '121049-1', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9682421', 'DAVI DE ARAUJO SOUZA', 'DAVI', '121029-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9682422', 'ESTEFANIA DA SILVA REBÊLO BERTHOLDI', 'REBÊLO', '121032-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 16, 2, 1),
	('9682423', 'FRANCE WILLIAN AVILA DO NASCIMENTO', 'FRANCE WILLIAN', '121078-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 15, 2, 1),
	('9682424', 'FRANCISCA FREITAS DOS SANTOS', 'F SANTOS', '121040-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9682425', 'HELEN DE OLIVEIRA COSTA', 'HELEN COSTA', '121039-2', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9682426', 'GUSTAVO PINTO DE LIMA', 'GUSTAVO LIMA', '121046-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 14, 2, 1),
	('9682427', 'JOAO PAULO SALES DA SILVA', 'P SALES', '121069-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9682428', 'HIROSHE DE SOUZA VALENTE', 'HIROSHE', '121027-7', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9682429', 'FRANCISCO ARIVALDO MORAES DE ANDRADE JUNIOR', 'ARIVALDO JUNIOR', '121080-6', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9682430', 'CARLOS ANDRÉ DA SILVA MOTA', 'MOTA', '121064-0', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1),
	('9682478', 'GUSTAVO MAIA DINIZ', 'DINIZ', '121031-9', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 12, 2, 1),
	('9682479', 'CAROLINE DA SILVA FERRON', 'FERRON', '121034-3', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 13, 2, 1),
	('9682508', 'GLESIA BEZERRA DOS SANTOS', 'GLESIA', '121060-8', 'N', 'N', 'N', '', '2026-02-13 16:56:34', '2026-02-13 16:56:34', 17, 2, 1);

-- Copiando estrutura para tabela sci_recurso.orgaos_origem
CREATE TABLE IF NOT EXISTS `orgaos_origem` (
  `id_orgao_origem` int NOT NULL AUTO_INCREMENT,
  `nome_orgao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_orgao_origem`),
  UNIQUE KEY `nome_orgao` (`nome_orgao`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.orgaos_origem: ~8 rows (aproximadamente)
INSERT INTO `orgaos_origem` (`id_orgao_origem`, `nome_orgao`, `created_at`, `updated_at`) VALUES
	(1, 'Defesa Civil', '2026-02-12 14:24:18', '2026-02-12 14:24:18'),
	(2, 'SMCCI', '2026-02-12 14:24:18', '2026-03-18 18:14:59'),
	(3, 'RBTRANS', '2026-02-12 14:24:18', '2026-02-13 18:03:26'),
	(4, 'SEAGRE', '2026-02-12 14:24:18', '2026-02-13 18:03:15'),
	(5, 'EMURB', '2026-02-12 14:24:18', '2026-02-13 18:03:20'),
	(6, 'SEAGRO', '2026-02-13 18:03:31', '2026-02-13 18:03:31'),
	(7, 'SEMEIA', '2026-02-13 18:03:39', '2026-02-13 18:03:39');

-- Copiando estrutura para tabela sci_recurso.posto_grad
CREATE TABLE IF NOT EXISTS `posto_grad` (
  `id_posto_grad` int NOT NULL AUTO_INCREMENT,
  `nome_posto_grad` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hierarquia` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_posto_grad`),
  UNIQUE KEY `nome_posto_grad` (`nome_posto_grad`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.posto_grad: ~17 rows (aproximadamente)
INSERT INTO `posto_grad` (`id_posto_grad`, `nome_posto_grad`, `hierarquia`, `created_at`, `updated_at`) VALUES
	(1, 'AL SD', 16, '2026-02-10 17:26:53', '2026-03-18 18:14:04'),
	(2, 'SD', 15, '2026-02-10 17:26:53', '2026-02-10 17:26:53'),
	(3, 'AL CB', 14, '2026-02-10 17:26:53', '2026-02-10 17:26:53'),
	(4, 'CB', 13, '2026-02-10 17:26:53', '2026-02-10 17:26:53'),
	(5, 'AL SGT', 12, '2026-02-10 17:26:53', '2026-02-10 17:26:53'),
	(6, '3º SGT', 11, '2026-02-10 17:26:53', '2026-02-10 17:28:04'),
	(7, '2º SGT', 10, '2026-02-10 17:26:53', '2026-02-10 17:28:09'),
	(8, '1º SGT', 9, '2026-02-10 17:26:53', '2026-02-10 17:28:12'),
	(9, 'AL OF', 8, '2026-02-10 17:26:53', '2026-02-10 17:26:53'),
	(10, 'ST', 7, '2026-02-10 17:26:53', '2026-02-10 17:26:53'),
	(11, '2º TEN', 6, '2026-02-10 17:26:53', '2026-02-10 17:28:16'),
	(12, '1º TEN', 5, '2026-02-10 17:26:53', '2026-02-10 17:28:21'),
	(13, 'CAP', 4, '2026-02-10 17:26:53', '2026-02-10 17:26:53'),
	(14, 'MAJ', 3, '2026-02-10 17:26:53', '2026-02-10 17:26:53'),
	(15, 'TC', 2, '2026-02-10 17:26:53', '2026-02-10 17:26:53'),
	(16, 'CEL', 1, '2026-02-10 17:26:53', '2026-02-10 17:26:53');

-- Copiando estrutura para procedure sci_recurso.sp_criar_turno
DELIMITER //
CREATE PROCEDURE `sp_criar_turno`(
	IN `p_data` DATE,
	IN `p_periodo` VARCHAR(50)
)
BEGIN
	DECLARE v_id_turno VARCHAR(36);
	-- Procurar turno existente
	SELECT id_turno INTO v_id_turno
	FROM turnos
	WHERE data = p_data AND periodo = p_periodo
	LIMIT 1;
	-- Criar se nao existir
	IF v_id_turno IS NULL THEN
		SET v_id_turno = UUID();
		INSERT INTO turnos (id_turno, data, periodo) VALUES (v_id_turno, p_data, p_periodo);
	END IF;
	-- Retorno padronizado
	SELECT v_id_turno AS id_turno, p_data AS data, p_periodo AS periodo;
END//
DELIMITER ;

-- Copiando estrutura para procedure sci_recurso.sp_dashboard_geral
DELIMITER //
CREATE PROCEDURE `sp_dashboard_geral`()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM militares) AS total_militares,
        (SELECT COUNT(*) FROM civis) AS total_civis,
        (SELECT COUNT(*) FROM turnos) AS total_turnos,
        (SELECT COUNT(*) FROM atestados_medicos WHERE (data_inicio + INTERVAL dias DAY) >= CURDATE()) AS atestados_ativos,
        (SELECT COUNT(*) FROM atestados_medicos) AS total_atestados,
        (SELECT COUNT(*) FROM chamada_militar WHERE presenca = TRUE) AS militares_presentes_hoje,
        (SELECT COUNT(*) FROM equipes WHERE status = 'empenhada') AS equipes_empenhadas;
END//
DELIMITER ;

-- Copiando estrutura para procedure sci_recurso.sp_efetivo_disponivel
DELIMITER //
CREATE PROCEDURE `sp_efetivo_disponivel`(
    IN p_data DATE,
    IN p_periodo VARCHAR(50)
)
BEGIN
    SELECT 'Militares' AS tipo, m.matricula, m.nome_completo, pg.nome_posto_grad AS posto_grad, m.nome_guerra,
        CASE WHEN cm.presenca IS TRUE THEN 'Presente' ELSE 'Disponível' END AS status
    FROM militares m
    LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
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
        oo.nome_orgao AS orgao_origem,
        CASE WHEN c.motorista = TRUE THEN 'Motorista' ELSE 'Voluntário' END,
        'Disponível' AS status
    FROM civis c
    LEFT JOIN orgaos_origem oo ON c.id_orgao_origem = oo.id_orgao_origem
    WHERE c.id_civil NOT IN (
        SELECT id_civil FROM chamada_civil cc
        INNER JOIN turnos t ON t.id_turno = cc.id_turno
        WHERE t.data = p_data AND t.periodo = p_periodo
    );
END//
DELIMITER ;

-- Copiando estrutura para procedure sci_recurso.sp_gerar_id_atestado
DELIMITER //
CREATE PROCEDURE `sp_gerar_id_atestado`()
BEGIN
    SELECT CONCAT('ate_', UNIX_TIMESTAMP(), '_', FLOOR(RAND() * 10000)) AS id_atestado;
END//
DELIMITER ;

-- Copiando estrutura para procedure sci_recurso.sp_gerar_id_civil
DELIMITER //
CREATE PROCEDURE `sp_gerar_id_civil`()
BEGIN
    SELECT CONCAT('civ_', UNIX_TIMESTAMP(), '_', FLOOR(RAND() * 10000)) AS id_civil;
END//
DELIMITER ;

-- Copiando estrutura para procedure sci_recurso.sp_gerar_id_turno
DELIMITER //
CREATE PROCEDURE `sp_gerar_id_turno`()
BEGIN
    SELECT CONCAT('turno_', UNIX_TIMESTAMP(), '_', FLOOR(RAND() * 10000)) AS id_turno;
END//
DELIMITER ;

-- Copiando estrutura para procedure sci_recurso.sp_gerar_turno_id
DELIMITER //
CREATE PROCEDURE `sp_gerar_turno_id`()
BEGIN
    SELECT CONCAT('turno_', UNIX_TIMESTAMP(), '_', FLOOR(RAND() * 10000)) AS id_turno;
END//
DELIMITER ;

-- Copiando estrutura para procedure sci_recurso.sp_verificar_disponibilidade
DELIMITER //
CREATE PROCEDURE `sp_verificar_disponibilidade`(
    IN p_data DATE,
    IN p_periodo VARCHAR(50)
)
BEGIN
    -- Militares disponíveis
    SELECT 
        'Militar' AS tipo,
        m.matricula,
        m.nome_completo,
        pg.nome_posto_grad AS posto_grad,
        m.nome_guerra,
        'Disponível' AS status
    FROM militares m
    LEFT JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
    WHERE m.matricula NOT IN (
        SELECT matricula FROM atestados_medicos 
        WHERE (data_inicio + INTERVAL dias DAY) >= p_data
    )
    
    UNION ALL
    
    -- Civis disponíveis
    SELECT 
        'Civil' AS tipo,
        c.id_civil AS matricula,
        c.nome_completo,
        oo.nome_orgao AS posto_grad,
        CASE WHEN c.motorista = TRUE THEN 'Motorista' ELSE 'Voluntário' END AS nome_guerra,
        'Disponível' AS status
    FROM civis c
    LEFT JOIN orgaos_origem oo ON c.id_orgao_origem = oo.id_orgao_origem
    WHERE c.id_civil NOT IN (
        SELECT id_civil FROM chamada_civil cc
        INNER JOIN turnos t ON t.id_turno = cc.id_turno
        WHERE t.data = p_data AND t.periodo = p_periodo
    );
END//
DELIMITER ;

-- Copiando estrutura para tabela sci_recurso.turnos
CREATE TABLE IF NOT EXISTS `turnos` (
  `id_turno` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` date NOT NULL,
  `periodo` enum('Manhã','Noite','Tarde') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_turno`),
  UNIQUE KEY `uk_data_periodo` (`data`,`periodo`),
  KEY `idx_data` (`data`),
  KEY `idx_periodo` (`periodo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.turnos: ~2 rows (aproximadamente)
INSERT INTO `turnos` (`id_turno`, `data`, `periodo`, `created_at`, `updated_at`) VALUES
	('71d8e044-26ce-11f1-ac39-167ecf302036', '2026-03-19', 'Manhã', '2026-03-23 15:39:14', '2026-03-23 15:39:14');

-- Copiando estrutura para tabela sci_recurso.ubms
CREATE TABLE IF NOT EXISTS `ubms` (
  `id_ubm` int NOT NULL AUTO_INCREMENT,
  `nome_ubm` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_ubm`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.ubms: ~18 rows (aproximadamente)
INSERT INTO `ubms` (`id_ubm`, `nome_ubm`, `created_at`, `updated_at`) VALUES
	(2, 'QCG', '2026-02-10 15:23:20', '2026-03-18 18:15:45'),
	(3, 'DATOP', '2026-02-10 15:23:20', '2026-02-10 15:23:20'),
	(4, 'DEIP', '2026-02-10 15:23:20', '2026-02-10 15:23:20'),
	(5, 'DS', '2026-02-10 15:23:20', '2026-02-10 15:23:20'),
	(6, 'CICC - COBOM', '2026-02-10 15:23:20', '2026-02-27 14:35:21'),
	(7, '1ª CIA CIAER', '2026-02-10 15:23:20', '2026-02-10 15:23:20'),
	(8, 'CMDP II RBO', '2026-02-10 15:23:20', '2026-02-10 17:12:05'),
	(9, '1º BEPCIF', '2026-02-10 15:23:20', '2026-02-10 15:23:20'),
	(10, '2º BEPCIF', '2026-02-10 15:23:20', '2026-02-10 15:23:20'),
	(11, '3º BEPCIF', '2026-02-10 15:23:20', '2026-02-10 15:23:20'),
	(12, '4º BEPCIF', '2026-02-10 15:23:20', '2026-02-10 15:23:20'),
	(13, '5º BEPCIF', '2026-02-10 15:23:20', '2026-02-10 15:23:20'),
	(14, '6º BEPCIF', '2026-02-10 15:23:20', '2026-02-10 15:23:20'),
	(15, '7º BEPCIF', '2026-02-10 15:23:20', '2026-02-10 15:23:20'),
	(16, '8º BEPCIF', '2026-02-10 15:23:20', '2026-02-10 15:23:20'),
	(17, '9º BEPCIF', '2026-02-10 15:23:20', '2026-02-10 15:23:20'),
	(18, 'A DISPOSIÇÃO', '2026-02-10 15:23:20', '2026-02-10 15:23:20');

-- Copiando estrutura para tabela sci_recurso.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Administrador','Operador') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela sci_recurso.usuarios: ~2 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `username`, `nome`, `password`, `role`, `created_at`, `updated_at`) VALUES
	('user_1770989723427_908938', 'admin', 'Administrador', '$2b$10$XSmwamYBLxr/ogq2VTnNzOyFr/s1vNQPMPxCTmzeqH/hJ/hVZDJp.', 'Administrador', '2026-02-13 13:35:23', '2026-02-13 17:31:27'),
	('user_1772209710808_54590', 'user', 'user', '$2b$10$lbZcuUcFy1KH9ZzdVCAJouPL0rJnpx0gX8R9Tjt4I7bSIqyzQQCNy', 'Operador', '2026-02-27 16:28:30', '2026-03-12 17:04:25');

-- Copiando estrutura para view sci_recurso.vw_civis_completo
-- Criando tabela temporária para evitar erros de dependência de VIEW
CREATE TABLE `vw_civis_completo` (
	`id_civil` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nome_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`contato` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`motorista` ENUM('Y','N') NULL COLLATE 'utf8mb4_unicode_ci',
	`modelo_veiculo` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`placa_veiculo` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`created_at` TIMESTAMP NULL,
	`updated_at` TIMESTAMP NULL,
	`id_orgao_origem` INT NOT NULL,
	`nome_orgao` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci'
);

-- Copiando estrutura para view sci_recurso.vw_dashboard_geral
-- Criando tabela temporária para evitar erros de dependência de VIEW
CREATE TABLE `vw_dashboard_geral` (
	`total_militares` BIGINT NULL,
	`total_civis` BIGINT NULL,
	`total_turnos` BIGINT NULL,
	`atestados_ativos` BIGINT NULL,
	`total_atestados` BIGINT NULL,
	`militares_presentes_hoje` BIGINT NULL,
	`equipes_empenhadas` BIGINT NULL
);

-- Copiando estrutura para view sci_recurso.vw_efetivo_disponivel
-- Criando tabela temporária para evitar erros de dependência de VIEW
CREATE TABLE `vw_efetivo_disponivel` (
	`tipo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nome_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`posto_grad` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`nome_guerra` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`status` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`cpoe` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`mergulhador` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci'
);

-- Copiando estrutura para view sci_recurso.vw_militares_completo
-- Criando tabela temporária para evitar erros de dependência de VIEW
CREATE TABLE `vw_militares_completo` (
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nome_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nome_guerra` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`rg` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`cpoe` ENUM('Y','N') NULL COLLATE 'utf8mb4_unicode_ci',
	`mergulhador` ENUM('Y','N') NULL COLLATE 'utf8mb4_unicode_ci',
	`restricao_medica` ENUM('Y','N') NULL COLLATE 'utf8mb4_unicode_ci',
	`desc_rest_med` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`created_at` TIMESTAMP NULL,
	`updated_at` TIMESTAMP NULL,
	`id_ubm` INT NOT NULL,
	`id_posto_grad` INT NULL,
	`id_forca` INT NOT NULL,
	`nome_posto_grad` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`hierarquia` INT NULL,
	`nome_forca` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`nome_ubm` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci'
);

-- Copiando estrutura para view sci_recurso.vw_militares_restricoes
-- Criando tabela temporária para evitar erros de dependência de VIEW
CREATE TABLE `vw_militares_restricoes` (
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nome_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`posto_grad` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`nome_guerra` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`desc_rest_med` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`data_inicio` DATE NOT NULL,
	`dias` INT NOT NULL,
	`motivo` TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`data_fim` DATE NULL,
	`status_atestado` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_0900_ai_ci'
);

-- Copiando estrutura para view sci_recurso.vw_resumo_civis_turno
-- Criando tabela temporária para evitar erros de dependência de VIEW
CREATE TABLE `vw_resumo_civis_turno` (
	`id_turno` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`data` DATE NOT NULL,
	`periodo` ENUM('Manhã','Noite','Tarde') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`total_equipes` BIGINT NOT NULL,
	`total_civis` DECIMAL(32,0) NULL,
	`equipes_livres` DECIMAL(23,0) NULL,
	`equipes_empenhadas` DECIMAL(23,0) NULL,
	`equipes_pausa` DECIMAL(23,0) NULL
);

-- Copiando estrutura para view sci_recurso.vw_resumo_militares_turno
-- Criando tabela temporária para evitar erros de dependência de VIEW
CREATE TABLE `vw_resumo_militares_turno` (
	`id_turno` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`data` DATE NOT NULL,
	`periodo` ENUM('Manhã','Noite','Tarde') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`total_militares` BIGINT NOT NULL,
	`presentes` DECIMAL(23,0) NULL,
	`ausentes` DECIMAL(23,0) NULL,
	`total_sci` DECIMAL(23,0) NULL,
	`total_combatentes` DECIMAL(23,0) NULL
);

-- Copiando estrutura para view sci_recurso.vw_resumo_turnos
-- Criando tabela temporária para evitar erros de dependência de VIEW
CREATE TABLE `vw_resumo_turnos` (
	`id_turno` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`data` DATE NOT NULL,
	`periodo` ENUM('Manhã','Noite','Tarde') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`total_militares` BIGINT NOT NULL,
	`presentes` DECIMAL(23,0) NULL,
	`ausentes` DECIMAL(23,0) NULL,
	`total_equipes` BIGINT NOT NULL,
	`equipes_livres` DECIMAL(23,0) NULL,
	`equipes_empenhadas` DECIMAL(23,0) NULL
);

-- Copiando estrutura para trigger sci_recurso.tr_turno_before_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `tr_turno_before_insert` BEFORE INSERT ON `turnos` FOR EACH ROW BEGIN
    IF NEW.id_turno IS NULL OR NEW.id_turno = '' THEN
        SET NEW.id_turno = CONCAT('turno_', UNIX_TIMESTAMP(), '_', FLOOR(RAND() * 1000000));
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Copiando estrutura para trigger sci_recurso.tr_validar_atestado_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `tr_validar_atestado_insert` BEFORE INSERT ON `atestados_medicos` FOR EACH ROW BEGIN
    DECLARE conflitos INT;
    
    -- Verificar se já existe atestado no período
    SELECT COUNT(*) INTO conflitos
    FROM atestados_medicos 
    WHERE matricula = NEW.matricula
    AND (
        (NEW.data_inicio BETWEEN data_inicio AND (data_inicio + INTERVAL dias DAY))
        OR ((NEW.data_inicio + INTERVAL NEW.dias DAY) BETWEEN data_inicio AND (data_inicio + INTERVAL dias DAY))
        OR (NEW.data_inicio <= data_inicio AND (NEW.data_inicio + INTERVAL NEW.dias DAY) >= (data_inicio + INTERVAL dias DAY))
    );
    
    IF conflitos > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Conflito de atestados detectado: já existe atestado para este militar no período';
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Removendo tabela temporária e criando a estrutura VIEW final
DROP TABLE IF EXISTS `vw_civis_completo`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_civis_completo` AS select `c`.`id_civil` AS `id_civil`,`c`.`nome_completo` AS `nome_completo`,`c`.`contato` AS `contato`,`c`.`motorista` AS `motorista`,`c`.`modelo_veiculo` AS `modelo_veiculo`,`c`.`placa_veiculo` AS `placa_veiculo`,`c`.`created_at` AS `created_at`,`c`.`updated_at` AS `updated_at`,`c`.`id_orgao_origem` AS `id_orgao_origem`,`o`.`nome_orgao` AS `nome_orgao` from (`civis` `c` left join `orgaos_origem` `o` on((`c`.`id_orgao_origem` = `o`.`id_orgao_origem`)))
;

-- Removendo tabela temporária e criando a estrutura VIEW final
DROP TABLE IF EXISTS `vw_dashboard_geral`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_dashboard_geral` AS select (select count(0) from `militares`) AS `total_militares`,(select count(0) from `civis`) AS `total_civis`,(select count(0) from `turnos`) AS `total_turnos`,(select count(0) from `atestados_medicos` where ((`atestados_medicos`.`data_inicio` + interval `atestados_medicos`.`dias` day) >= curdate())) AS `atestados_ativos`,(select count(0) from `atestados_medicos`) AS `total_atestados`,(select count(0) from `chamada_militar` where (`chamada_militar`.`presenca` = true)) AS `militares_presentes_hoje`,(select count(0) from `equipes` where (`equipes`.`status` = 'empenhada')) AS `equipes_empenhadas`
;

-- Removendo tabela temporária e criando a estrutura VIEW final
DROP TABLE IF EXISTS `vw_efetivo_disponivel`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_efetivo_disponivel` AS select 'Militar' AS `tipo`,`m`.`matricula` AS `matricula`,`m`.`nome_completo` AS `nome_completo`,`pg`.`nome_posto_grad` AS `posto_grad`,`m`.`nome_guerra` AS `nome_guerra`,(case when (`m`.`restricao_medica` = true) then 'Restrito' else 'Disponível' end) AS `status`,`m`.`cpoe` AS `cpoe`,`m`.`mergulhador` AS `mergulhador` from (`militares` `m` left join `posto_grad` `pg` on((`m`.`id_posto_grad` = `pg`.`id_posto_grad`))) where `m`.`matricula` in (select `atestados_medicos`.`matricula` from `atestados_medicos` where ((`atestados_medicos`.`data_inicio` + interval `atestados_medicos`.`dias` day) >= curdate())) is false union all select 'Civil' AS `tipo`,`c`.`id_civil` AS `matricula`,`c`.`nome_completo` AS `nome_completo`,`oo`.`nome_orgao` AS `posto_grad`,(case when (`c`.`motorista` = true) then 'Motorista' else 'Voluntário' end) AS `nome_guerra`,'Disponível' AS `status`,false AS `cpoe`,false AS `mergulhador` from (`civis` `c` left join `orgaos_origem` `oo` on((`c`.`id_orgao_origem` = `oo`.`id_orgao_origem`))) where `c`.`id_civil` in (select `cc`.`id_civil` from (`chamada_civil` `cc` join `turnos` `t` on((`t`.`id_turno` = `cc`.`id_turno`))) where (`t`.`data` = curdate())) is false
;

-- Removendo tabela temporária e criando a estrutura VIEW final
DROP TABLE IF EXISTS `vw_militares_completo`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_militares_completo` AS select `m`.`matricula` AS `matricula`,`m`.`nome_completo` AS `nome_completo`,`m`.`nome_guerra` AS `nome_guerra`,`m`.`rg` AS `rg`,`m`.`cpoe` AS `cpoe`,`m`.`mergulhador` AS `mergulhador`,`m`.`restricao_medica` AS `restricao_medica`,`m`.`desc_rest_med` AS `desc_rest_med`,`m`.`created_at` AS `created_at`,`m`.`updated_at` AS `updated_at`,`m`.`id_ubm` AS `id_ubm`,`m`.`id_posto_grad` AS `id_posto_grad`,`m`.`id_forca` AS `id_forca`,`pg`.`nome_posto_grad` AS `nome_posto_grad`,`pg`.`hierarquia` AS `hierarquia`,`f`.`nome_forca` AS `nome_forca`,`u`.`nome_ubm` AS `nome_ubm` from (((`militares` `m` left join `posto_grad` `pg` on((`m`.`id_posto_grad` = `pg`.`id_posto_grad`))) left join `forcas` `f` on((`m`.`id_forca` = `f`.`id_forca`))) left join `ubms` `u` on((`m`.`id_ubm` = `u`.`id_ubm`)))
;

-- Removendo tabela temporária e criando a estrutura VIEW final
DROP TABLE IF EXISTS `vw_militares_restricoes`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_militares_restricoes` AS select `m`.`matricula` AS `matricula`,`m`.`nome_completo` AS `nome_completo`,`pg`.`nome_posto_grad` AS `posto_grad`,`m`.`nome_guerra` AS `nome_guerra`,`m`.`desc_rest_med` AS `desc_rest_med`,`am`.`data_inicio` AS `data_inicio`,`am`.`dias` AS `dias`,`am`.`motivo` AS `motivo`,(`am`.`data_inicio` + interval `am`.`dias` day) AS `data_fim`,(case when ((`am`.`data_inicio` + interval `am`.`dias` day) >= curdate()) then 'Ativo' else 'Expirado' end) AS `status_atestado` from ((`militares` `m` join `atestados_medicos` `am` on((`m`.`matricula` = `am`.`matricula`))) left join `posto_grad` `pg` on((`m`.`id_posto_grad` = `pg`.`id_posto_grad`))) order by `am`.`data_inicio` desc
;

-- Removendo tabela temporária e criando a estrutura VIEW final
DROP TABLE IF EXISTS `vw_resumo_civis_turno`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_resumo_civis_turno` AS select `t`.`id_turno` AS `id_turno`,`t`.`data` AS `data`,`t`.`periodo` AS `periodo`,count(`e`.`id_equipe`) AS `total_equipes`,sum(`cc`.`quant_civil`) AS `total_civis`,sum((case when (`e`.`status` = 'livre') then 1 else 0 end)) AS `equipes_livres`,sum((case when (`e`.`status` = 'empenhada') then 1 else 0 end)) AS `equipes_empenhadas`,sum((case when (`e`.`status` = 'pausa-operacional') then 1 else 0 end)) AS `equipes_pausa` from ((`turnos` `t` left join `equipes` `e` on((`t`.`id_turno` = `e`.`id_turno`))) left join `chamada_civil` `cc` on((`e`.`id_chamada_civil` = `cc`.`id_chamada_civil`))) group by `t`.`id_turno`,`t`.`data`,`t`.`periodo`
;

-- Removendo tabela temporária e criando a estrutura VIEW final
DROP TABLE IF EXISTS `vw_resumo_militares_turno`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_resumo_militares_turno` AS select `t`.`id_turno` AS `id_turno`,`t`.`data` AS `data`,`t`.`periodo` AS `periodo`,count(`cm`.`id_chamada_militar`) AS `total_militares`,sum((case when (`cm`.`presenca` = true) then 1 else 0 end)) AS `presentes`,sum((case when (`cm`.`presenca` = false) then 1 else 0 end)) AS `ausentes`,sum((case when (`cm`.`funcao` = 'SCI') then 1 else 0 end)) AS `total_sci`,sum((case when (`cm`.`funcao` = 'Combatente') then 1 else 0 end)) AS `total_combatentes` from (`turnos` `t` left join `chamada_militar` `cm` on((`t`.`id_turno` = `cm`.`id_turno`))) group by `t`.`id_turno`,`t`.`data`,`t`.`periodo`
;

-- Removendo tabela temporária e criando a estrutura VIEW final
DROP TABLE IF EXISTS `vw_resumo_turnos`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_resumo_turnos` AS select `t`.`id_turno` AS `id_turno`,`t`.`data` AS `data`,`t`.`periodo` AS `periodo`,count(`cm`.`id_chamada_militar`) AS `total_militares`,sum((case when (`cm`.`presenca` = true) then 1 else 0 end)) AS `presentes`,sum((case when (`cm`.`presenca` = false) then 1 else 0 end)) AS `ausentes`,count(`e`.`id_equipe`) AS `total_equipes`,sum((case when (`e`.`status` = 'livre') then 1 else 0 end)) AS `equipes_livres`,sum((case when (`e`.`status` = 'empenhada') then 1 else 0 end)) AS `equipes_empenhadas` from ((`turnos` `t` left join `chamada_militar` `cm` on((`t`.`id_turno` = `cm`.`id_turno`))) left join `equipes` `e` on((`t`.`id_turno` = `e`.`id_turno`))) group by `t`.`id_turno`,`t`.`data`,`t`.`periodo` order by `t`.`data` desc,`t`.`periodo` desc
;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
