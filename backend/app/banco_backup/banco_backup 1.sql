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
-- Table structure for table `fluxos`
--

DROP TABLE IF EXISTS `fluxos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fluxos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `nome_fluxo` varchar(100) DEFAULT NULL,
  `dados_json` longtext,
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `fluxos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fluxos`
--

LOCK TABLES `fluxos` WRITE;
/*!40000 ALTER TABLE `fluxos` DISABLE KEYS */;
INSERT INTO `fluxos` VALUES (6,3,'Exemplo de Fluxo','{\"nodes\": [{\"id\": \"1\", \"type\": \"botNode\", \"data\": {\"label\": \"Ol\\u00e1, como posso te ajudar hoje?\", \"options\": [\"1 - Desejo falar com suporte.\", \"2 - Desejo encerrar por aqui.\"], \"delay\": 2}, \"position\": {\"x\": 350.6744009508923, \"y\": 68.6304345782948}, \"width\": 280, \"height\": 283, \"selected\": false, \"positionAbsolute\": {\"x\": 350.6744009508923, \"y\": 68.6304345782948}, \"dragging\": false}, {\"id\": \"1772636372876\", \"type\": \"botNode\", \"data\": {\"label\": \"Qual \\u00e1rea de suporte voc\\u00ea gostaria de falar?\", \"options\": [\"1 - Infraestrutura\", \"2 - Vendas\"], \"delay\": 2}, \"position\": {\"x\": 780, \"y\": -59.231243609721034}, \"width\": 280, \"height\": 283, \"selected\": false, \"positionAbsolute\": {\"x\": 780, \"y\": -59.231243609721034}, \"dragging\": false}, {\"id\": \"1772636381916\", \"type\": \"botNode\", \"data\": {\"label\": \"Obrigado caso queria falar conosco novamente s\\u00f3 enviar uma mensagem :)\", \"options\": [], \"delay\": 2}, \"position\": {\"x\": 779.6593950717438, \"y\": 330.310370405365}, \"width\": 280, \"height\": 195, \"selected\": false, \"positionAbsolute\": {\"x\": 779.6593950717438, \"y\": 330.310370405365}, \"dragging\": false}, {\"id\": \"1772651513969\", \"type\": \"botNode\", \"data\": {\"label\": \"Maravilha! Voc\\u00ea ser\\u00e1 atendido em breve, por favor aguarde.\", \"options\": [], \"delay\": 2}, \"position\": {\"x\": 1196.99970703125, \"y\": -54.489629594635005}, \"width\": 280, \"height\": 195, \"selected\": true, \"positionAbsolute\": {\"x\": 1196.99970703125, \"y\": -54.489629594635005}, \"dragging\": false}], \"edges\": [{\"source\": \"1\", \"sourceHandle\": \"opt0\", \"target\": \"1772636372876\", \"targetHandle\": null, \"animated\": true, \"style\": {\"stroke\": \"#25D366\", \"strokeWidth\": 2}, \"markerEnd\": {\"type\": \"arrowclosed\", \"color\": \"#25D366\"}, \"id\": \"reactflow__edge-1opt0-1772636372876\"}, {\"source\": \"1\", \"sourceHandle\": \"opt1\", \"target\": \"1772636381916\", \"targetHandle\": null, \"animated\": true, \"style\": {\"stroke\": \"#25D366\", \"strokeWidth\": 2}, \"markerEnd\": {\"type\": \"arrowclosed\", \"color\": \"#25D366\"}, \"id\": \"reactflow__edge-1opt1-1772636381916\"}, {\"source\": \"1772636372876\", \"sourceHandle\": \"opt0\", \"target\": \"1772651513969\", \"targetHandle\": null, \"animated\": true, \"style\": {\"stroke\": \"#25D366\", \"strokeWidth\": 2}, \"markerEnd\": {\"type\": \"arrowclosed\", \"color\": \"#25D366\"}, \"id\": \"reactflow__edge-1772636372876opt0-1772651513969\"}, {\"source\": \"1772636372876\", \"sourceHandle\": \"opt1\", \"target\": \"1772651513969\", \"targetHandle\": null, \"animated\": true, \"style\": {\"stroke\": \"#25D366\", \"strokeWidth\": 2}, \"markerEnd\": {\"type\": \"arrowclosed\", \"color\": \"#25D366\"}, \"id\": \"reactflow__edge-1772636372876opt1-1772651513969\"}]}','2026-03-04 14:57:18');
/*!40000 ALTER TABLE `fluxos` ENABLE KEYS */;
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
  KEY `usuario_id` (`usuario_id`),
  KEY `fluxo_id` (`fluxo_id`),
  CONSTRAINT `instancias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `instancias_ibfk_2` FOREIGN KEY (`fluxo_id`) REFERENCES `fluxos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instancias`
--

LOCK TABLES `instancias` WRITE;
/*!40000 ALTER TABLE `instancias` DISABLE KEYS */;
/*!40000 ALTER TABLE `instancias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessoes`
--

DROP TABLE IF EXISTS `sessoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cliente_whatsapp` varchar(50) DEFAULT NULL,
  `fluxo_id` int DEFAULT NULL,
  `no_atual` varchar(50) DEFAULT NULL,
  `ultima_interacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fluxo_id` (`fluxo_id`),
  CONSTRAINT `sessoes_ibfk_1` FOREIGN KEY (`fluxo_id`) REFERENCES `fluxos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessoes`
--

LOCK TABLES `sessoes` WRITE;
/*!40000 ALTER TABLE `sessoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessoes` ENABLE KEYS */;
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
  `data_cadastro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (3,'Usuário Teste','teste@zapchat.com','$2b$12$WshlBuV8xr/DGG31d3F.jukRQMjWvvTaBNMgd1r/NE3o4Z2tMpSSK','2026-03-04 14:03:47');
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

-- Dump completed on 2026-03-09 11:30:52
