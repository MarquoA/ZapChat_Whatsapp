-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: zapchat
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agentes_ia`
--

DROP TABLE IF EXISTS `agentes_ia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agentes_ia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  `tom` varchar(30) NOT NULL DEFAULT 'equilibrado',
  `modelo` varchar(50) NOT NULL DEFAULT 'gpt-4o-mini',
  `max_tokens` int NOT NULL DEFAULT '1000',
  `prompt` text,
  `finalizacao` text,
  `base_conhecimento` json DEFAULT NULL,
  `ferramentas` json DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `agentes_ia_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agentes_ia`
--

LOCK TABLES `agentes_ia` WRITE;
/*!40000 ALTER TABLE `agentes_ia` DISABLE KEYS */;
INSERT INTO `agentes_ia` VALUES (2,3,'Bot tester','equilibrado','gpt-4o-mini',1000,'Você é um assistente especializado no suporte técnico para o time de vendas da nossa loja de roupas. Seu objetivo é ajudar os vendedores com dúvidas sobre o catálogo, tecidos, tabelas de medidas e disponibilidade de estoque. Seja ágil, use um tom profissional, mas amigável, e forneça respostas diretas para que o vendedor possa repassar a informação rapidamente ao cliente','Obrigado por contatar','[]','{\"webSearch\": false, \"coletarLead\": false, \"agendarReuniao\": false, \"consultarEstoque\": false, \"calcularPrecoPedido\": false}','2026-04-09 15:40:46','2026-04-09 15:40:46');
/*!40000 ALTER TABLE `agentes_ia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assinaturas`
--

DROP TABLE IF EXISTS `assinaturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assinaturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `plano` enum('starter','pro','business') NOT NULL,
  `periodo` enum('mensal','anual') NOT NULL DEFAULT 'mensal',
  `status` enum('trial','pendente','ativo','pausado','cancelado','expirado') NOT NULL DEFAULT 'pendente',
  `mp_subscription_id` varchar(120) DEFAULT NULL,
  `periodo_inicio` datetime DEFAULT NULL,
  `periodo_fim` datetime DEFAULT NULL,
  `trial_fim` datetime DEFAULT NULL,
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  KEY `idx_status` (`status`),
  KEY `idx_mp_sub_id` (`mp_subscription_id`),
  KEY `idx_periodo_fim` (`periodo_fim`),
  KEY `idx_assinaturas_usuario_status` (`usuario_id`,`status`),
  CONSTRAINT `fk_assinatura_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assinaturas`
--

LOCK TABLES `assinaturas` WRITE;
/*!40000 ALTER TABLE `assinaturas` DISABLE KEYS */;
INSERT INTO `assinaturas` VALUES (1,3,'business','anual','ativo',NULL,NULL,NULL,NULL,'2026-03-09 17:14:33','2026-03-26 17:42:20'),(5,4,'starter','mensal','trial',NULL,'2026-04-15 15:27:19','2026-04-22 15:27:19','2026-04-22 15:27:19','2026-04-15 15:27:19','2026-04-15 15:27:19');
/*!40000 ALTER TABLE `assinaturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `codigos_2fa`
--

DROP TABLE IF EXISTS `codigos_2fa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `codigos_2fa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `codigo` varchar(10) NOT NULL,
  `expira_em` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT '0',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_2fa_usuario` (`usuario_id`),
  KEY `idx_2fa_expira` (`expira_em`),
  CONSTRAINT `fk_2fa_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `codigos_2fa`
--

LOCK TABLES `codigos_2fa` WRITE;
/*!40000 ALTER TABLE `codigos_2fa` DISABLE KEYS */;
/*!40000 ALTER TABLE `codigos_2fa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disparos`
--

DROP TABLE IF EXISTS `disparos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disparos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `contato` varchar(20) NOT NULL,
  `mensagem` text NOT NULL,
  `status` enum('enviado','erro','pendente') DEFAULT 'pendente',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario_data` (`usuario_id`,`criado_em`),
  KEY `idx_disparos_usuario_data` (`usuario_id`,`criado_em`),
  CONSTRAINT `fk_disp_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disparos`
--

LOCK TABLES `disparos` WRITE;
/*!40000 ALTER TABLE `disparos` DISABLE KEYS */;
/*!40000 ALTER TABLE `disparos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fluxos`
--

DROP TABLE IF EXISTS `fluxos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fluxos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `nome_fluxo` varchar(100) DEFAULT NULL,
  `nodes` longtext,
  `edges` longtext,
  `dados_json` longtext,
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `fluxos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fluxos`
--

LOCK TABLES `fluxos` WRITE;
/*!40000 ALTER TABLE `fluxos` DISABLE KEYS */;
INSERT INTO `fluxos` VALUES (38,4,'Fluxo #1',NULL,NULL,'{\"nodes\": [{\"id\": \"1\", \"type\": \"botNode\", \"data\": {\"label\": \"Ol\\u00e1! Como posso ajudar?\", \"options\": [], \"delay\": 2}, \"position\": {\"x\": 400, \"y\": 100}}], \"edges\": []}','2026-04-15 18:29:38'),(39,3,'Fluxo #1',NULL,NULL,'{\"nodes\": [{\"id\": \"1\", \"type\": \"botNode\", \"data\": {\"label\": \"Ol\\u00e1! Como posso ajudar?\", \"options\": [], \"delay\": 2}, \"position\": {\"x\": 400, \"y\": 100}}], \"edges\": []}','2026-04-16 17:31:41');
/*!40000 ALTER TABLE `fluxos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico_conversas`
--

DROP TABLE IF EXISTS `historico_conversas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_conversas` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `instancia_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `contato` varchar(50) NOT NULL,
  `fluxo_id` int DEFAULT NULL,
  `dados_sessao` json DEFAULT NULL,
  `finalizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario_data` (`usuario_id`,`finalizado_em` DESC),
  KEY `idx_instancia` (`instancia_id`),
  KEY `idx_contato` (`contato`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico_conversas`
--

LOCK TABLES `historico_conversas` WRITE;
/*!40000 ALTER TABLE `historico_conversas` DISABLE KEYS */;
/*!40000 ALTER TABLE `historico_conversas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico_pagamentos`
--

DROP TABLE IF EXISTS `historico_pagamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_pagamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `mp_payment_id` varchar(100) NOT NULL,
  `mp_subscription_id` varchar(100) DEFAULT NULL,
  `plano` enum('starter','pro','business') NOT NULL,
  `periodo` enum('mensal','anual') NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `status` enum('aprovado','recusado','pendente','reembolsado') DEFAULT 'pendente',
  `metodo_pagamento` varchar(50) DEFAULT NULL,
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_mp_payment` (`mp_payment_id`),
  KEY `idx_status_data` (`status`,`criado_em`),
  CONSTRAINT `historico_pagamentos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico_pagamentos`
--

LOCK TABLES `historico_pagamentos` WRITE;
/*!40000 ALTER TABLE `historico_pagamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `historico_pagamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico_tokens_ia`
--

DROP TABLE IF EXISTS `historico_tokens_ia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_tokens_ia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `tokens_usados` int NOT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `historico_tokens_ia_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico_tokens_ia`
--

LOCK TABLES `historico_tokens_ia` WRITE;
/*!40000 ALTER TABLE `historico_tokens_ia` DISABLE KEYS */;
/*!40000 ALTER TABLE `historico_tokens_ia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instancias`
--

DROP TABLE IF EXISTS `instancias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instancias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  `fluxo_id` int DEFAULT NULL,
  `status` varchar(20) DEFAULT 'desconectado',
  `evolution_instance_id` varchar(100) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fluxo_id` (`fluxo_id`),
  KEY `idx_instancias_usuario_id` (`usuario_id`),
  CONSTRAINT `instancias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `instancias_ibfk_2` FOREIGN KEY (`fluxo_id`) REFERENCES `fluxos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instancias`
--

LOCK TABLES `instancias` WRITE;
/*!40000 ALTER TABLE `instancias` DISABLE KEYS */;
/*!40000 ALTER TABLE `instancias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessoes_bot`
--

DROP TABLE IF EXISTS `sessoes_bot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessoes_bot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instancia_id` int NOT NULL,
  `contato` varchar(30) NOT NULL,
  `node_id_atual` varchar(64) NOT NULL DEFAULT '1',
  `fluxo_id` int NOT NULL,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modo_ia` tinyint NOT NULL DEFAULT '0',
  `ia_agente_id` int DEFAULT NULL,
  `ia_historico` mediumtext,
  `timeout_aviso_enviado` tinyint NOT NULL DEFAULT '0',
  `dados_sessao` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_instancia_contato` (`instancia_id`,`contato`),
  KEY `idx_atualizado` (`atualizado_em`),
  KEY `idx_sessoes_instancia_contato` (`instancia_id`,`contato`),
  KEY `fk_sess_agente` (`ia_agente_id`),
  CONSTRAINT `fk_sess_agente` FOREIGN KEY (`ia_agente_id`) REFERENCES `agentes_ia` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sess_instancia` FOREIGN KEY (`instancia_id`) REFERENCES `instancias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessoes_bot`
--

LOCK TABLES `sessoes_bot` WRITE;
/*!40000 ALTER TABLE `sessoes_bot` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessoes_bot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `templates`
--

DROP TABLE IF EXISTS `templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(80) NOT NULL,
  `nome` varchar(120) NOT NULL,
  `descricao` text,
  `categoria` varchar(60) NOT NULL,
  `icone` varchar(10) NOT NULL DEFAULT 0xF09F92AC,
  `cor_destaque` varchar(20) NOT NULL DEFAULT '#25D366',
  `imagem_url` varchar(255) DEFAULT NULL,
  `imagem_descricao` varchar(255) DEFAULT NULL,
  `plano_minimo` enum('starter','pro','business') NOT NULL DEFAULT 'starter',
  `fluxo_json` longtext NOT NULL,
  `customizacoes_globais` json DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `templates`
--

LOCK TABLES `templates` WRITE;
/*!40000 ALTER TABLE `templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens_ia`
--

DROP TABLE IF EXISTS `tokens_ia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_ia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `saldo` bigint NOT NULL DEFAULT '1000000',
  `total_usado` bigint NOT NULL DEFAULT '0',
  `ultimo_reset` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `tokens_ia_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens_ia`
--

LOCK TABLES `tokens_ia` WRITE;
/*!40000 ALTER TABLE `tokens_ia` DISABLE KEYS */;
INSERT INTO `tokens_ia` VALUES (1,3,3000000,0,'2026-04-15 16:24:35'),(41,4,2000000,0,'2026-04-15 16:24:35');
/*!40000 ALTER TABLE `tokens_ia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens_redefinicao`
--

DROP TABLE IF EXISTS `tokens_redefinicao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_redefinicao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `token` varchar(100) NOT NULL,
  `expira_em` datetime NOT NULL,
  `usado` tinyint(1) DEFAULT '0',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_tokens_token` (`token`),
  CONSTRAINT `tokens_redefinicao_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens_redefinicao`
--

LOCK TABLES `tokens_redefinicao` WRITE;
/*!40000 ALTER TABLE `tokens_redefinicao` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens_redefinicao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  `data_cadastro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `dois_fatores_ativo` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `idx_usuarios_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (3,'Administrador','teste@zapchat.com','$2b$12$WshlBuV8xr/DGG31d3F.jukRQMjWvvTaBNMgd1r/NE3o4Z2tMpSSK','admin','2026-03-04 14:03:47',0),(4,'Marco Aurélio Pereira da Silva','marcofabi1505@gmail.com','$2b$12$PocBsEyG9bfIP3VbHp7yy.nl94I8WdfwgwXq/fIqEzE5dNkqAzLNa','user','2026-04-15 18:25:03',0);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-16 17:46:16
