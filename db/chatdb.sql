-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: chatdb
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `conversation_members`
--

DROP TABLE IF EXISTS `conversation_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation_members` (
  `conversation_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `alias` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('member','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'member',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`conversation_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `conversation_members_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversation_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_members`
--

LOCK TABLES `conversation_members` WRITE;
/*!40000 ALTER TABLE `conversation_members` DISABLE KEYS */;
INSERT INTO `conversation_members` VALUES ('02295a60-14cb-4864-bbbb-7532d0ae83dc','0ab9e025-21d3-4a83-b63b-8bb78585c1b6',NULL,'member','2025-10-28 15:34:05',NULL),('02295a60-14cb-4864-bbbb-7532d0ae83dc','38459dca-a546-11f0-8cd4-0250e620fdfd',NULL,'member','2025-10-28 15:34:05',NULL),('02295a60-14cb-4864-bbbb-7532d0ae83dc','a95fef11-1535-41f1-b83c-3d1e08d6f9e5',NULL,'admin','2025-10-28 15:34:05',NULL),('070c9098-f5fa-4161-a51b-70bd9cab5c1f','1c19c44b-f958-4d38-bfbc-a2e19e37d62a',NULL,'admin','2025-11-05 05:30:20',NULL),('070c9098-f5fa-4161-a51b-70bd9cab5c1f','a95fef11-1535-41f1-b83c-3d1e08d6f9e5',NULL,'member','2025-11-05 05:30:20',NULL),('877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a',NULL,'member','2025-10-17 11:44:34',NULL),('877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','a95fef11-1535-41f1-b83c-3d1e08d6f9e5',NULL,'admin','2025-10-17 11:44:34',NULL),('8d8281ff-084c-4d85-b2ce-16bb05312285','12ba5199-8a9c-40b7-a223-c002bef5a84f',NULL,'member','2025-10-28 15:34:45',NULL),('8d8281ff-084c-4d85-b2ce-16bb05312285','a95fef11-1535-41f1-b83c-3d1e08d6f9e5',NULL,'admin','2025-10-28 15:34:45',NULL),('b382bd9c-f469-4e17-bfe2-a95d8eb2ae70','0ab9e025-21d3-4a83-b63b-8bb78585c1b6',NULL,'member','2025-10-23 03:54:03',NULL),('b382bd9c-f469-4e17-bfe2-a95d8eb2ae70','12ba5199-8a9c-40b7-a223-c002bef5a84f',NULL,'member','2025-10-23 03:54:03',NULL),('b382bd9c-f469-4e17-bfe2-a95d8eb2ae70','1c19c44b-f958-4d38-bfbc-a2e19e37d62a',NULL,'admin','2025-10-23 03:54:03',NULL),('b382bd9c-f469-4e17-bfe2-a95d8eb2ae70','3846fdb3-a546-11f0-8cd4-0250e620fdfd',NULL,'member','2025-10-23 03:54:03',NULL);
/*!40000 ALTER TABLE `conversation_members` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_member_insert_online` AFTER INSERT ON `conversation_members` FOR EACH ROW BEGIN

  UPDATE conversations

  SET online_count = (

    SELECT COUNT(*)

    FROM conversation_members cm

    JOIN users u ON cm.user_id = u.id

    WHERE cm.conversation_id = NEW.conversation_id

      AND u.status = 'online'

  )

  WHERE id = NEW.conversation_id;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_member_delete_online` AFTER DELETE ON `conversation_members` FOR EACH ROW BEGIN

  UPDATE conversations

  SET online_count = (

    SELECT COUNT(*)

    FROM conversation_members cm

    JOIN users u ON cm.user_id = u.id

    WHERE cm.conversation_id = OLD.conversation_id

      AND u.status = 'online'

  )

  WHERE id = OLD.conversation_id;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('inbox','group') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `avatar_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `online_count` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_conversation_type` (`type`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES ('02295a60-14cb-4864-bbbb-7532d0ae83dc','group','test 1234','a95fef11-1535-41f1-b83c-3d1e08d6f9e5','2025-10-28 15:34:05',NULL,'2025-11-05 11:07:58',0),('070c9098-f5fa-4161-a51b-70bd9cab5c1f','inbox','admin','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','2025-11-05 05:30:20',NULL,'2025-11-05 11:19:21',0),('877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','inbox','test online ','a95fef11-1535-41f1-b83c-3d1e08d6f9e5','2025-10-17 11:44:34',NULL,'2025-11-05 11:19:21',0),('8d8281ff-084c-4d85-b2ce-16bb05312285','inbox','k','a95fef11-1535-41f1-b83c-3d1e08d6f9e5','2025-10-28 15:34:45',NULL,'2025-11-05 11:07:58',0),('b382bd9c-f469-4e17-bfe2-a95d8eb2ae70','group','test','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','2025-10-23 03:54:03',NULL,'2025-11-05 11:19:21',0);
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_files`
--

DROP TABLE IF EXISTS `media_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_files` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `s3_key` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `s3_url` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_media_user` (`user_id`),
  CONSTRAINT `fk_media_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_files`
--

LOCK TABLES `media_files` WRITE;
/*!40000 ALTER TABLE `media_files` DISABLE KEYS */;
INSERT INTO `media_files` VALUES ('0fca9930-5fc0-484b-ac9c-07b36dcf143d','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','gk1.jpg','image/jpeg',296922,'uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761823824192_gk1.jpg','https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761823824192_gk1.jpg','2025-10-30 11:30:24'),('36bdcd31-bdea-498d-b014-760e9039ef20','a95fef11-1535-41f1-b83c-3d1e08d6f9e5','gk2.jpg','image/jpeg',629027,'uploads/a95fef11-1535-41f1-b83c-3d1e08d6f9e5/1761979777254_gk2.jpg','https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/a95fef11-1535-41f1-b83c-3d1e08d6f9e5/1761979777254_gk2.jpg','2025-11-01 06:49:38'),('5608d103-0ae6-4167-8bed-927980ff9459','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','gk6.jpg','image/jpeg',533768,'uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761823403895_gk6.jpg','https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761823403895_gk6.jpg','2025-10-30 11:23:24'),('a5039b68-5ccb-4d8d-a18f-3407e864055b','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','gk1.jpg','image/jpeg',296922,'uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761824027134_gk1.jpg','https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761824027134_gk1.jpg','2025-10-30 11:33:47'),('a959e634-2e95-4762-9ec2-bea96086a736','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','gk1.jpg','image/jpeg',296922,'uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761823266366_gk1.jpg','https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761823266366_gk1.jpg','2025-10-30 11:21:06'),('be88a474-f34e-4e3c-8740-be8dd3b6d9ec','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','gk2.jpg','image/jpeg',629027,'uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761932223126_gk2.jpg','https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761932223126_gk2.jpg','2025-10-31 17:37:04'),('e3ad8145-8442-4308-a8c9-d47eaf5889c1','a95fef11-1535-41f1-b83c-3d1e08d6f9e5','Street Corner Renaissance - Life Could Be A Dream.mp4','video/mp4',18707945,'uploads/a95fef11-1535-41f1-b83c-3d1e08d6f9e5/1761836008634_Street Corner Renaissance - Life Could Be A Dream.mp4','https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/a95fef11-1535-41f1-b83c-3d1e08d6f9e5/1761836008634_Street Corner Renaissance - Life Could Be A Dream.mp4','2025-10-30 14:53:34'),('e4e5b88b-ea45-490e-85ea-7e2b015b6e05','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','gk2.jpg','image/jpeg',629027,'uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761823545642_gk2.jpg','https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761823545642_gk2.jpg','2025-10-30 11:25:46'),('e54a5aaa-8f2d-4d06-b6b9-9071b84c5716','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','gk4.jpg','image/jpeg',696172,'uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761822831906_gk4.jpg','https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761822831906_gk4.jpg','2025-10-30 11:13:52'),('efd265c7-6f2b-4a19-8db9-7fc465c51ee8','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','gk3.jpg','image/jpeg',641425,'uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761822907726_gk3.jpg','https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761822907726_gk3.jpg','2025-10-30 11:15:08');
/*!40000 ALTER TABLE `media_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `conversation_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sender_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('text','media','file','system') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'text',
  `text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `attachment_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `attachment_meta` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `idx_conv_time` (`conversation_id`,`created_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES ('03c80d5e-a229-4c9f-93bb-70b3e8c1442d','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','media',NULL,'blob:http://localhost:5173/b78f44ae-8410-4e48-844e-f452317e0c1e','{\"file_name\": \"gk3.jpg\", \"file_size\": 641425, \"file_type\": \"image/jpeg\"}','2025-10-31 17:27:05'),('085f0aef-b997-41c1-8ab6-04efe6eda475','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','text','shut up',NULL,'null','2025-10-31 16:26:39'),('08b9453f-cabf-4fab-8530-03748600d066','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','media',NULL,'blob:http://localhost:5173/b5c24799-43a8-4ffc-924a-f8ee8a30cfd5','{\"file_name\": \"gk2.jpg\", \"file_size\": 629027, \"file_type\": \"image/jpeg\"}','2025-10-31 17:27:54'),('1beec38b-f3aa-47e2-ae89-17001e0dbe1d','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','media',NULL,'blob:http://localhost:5173/2d528d89-cce8-4343-9706-c60f64067bce','{\"file_name\": \"gk4.jpg\", \"file_size\": 696172, \"file_type\": \"image/jpeg\"}','2025-10-31 17:24:05'),('2882e564-cde4-4277-bb04-5278aca4a40f','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','a95fef11-1535-41f1-b83c-3d1e08d6f9e5','text','hey',NULL,'null','2025-10-17 12:07:25'),('3408b728-0e34-4ec9-9a7d-5dae614ee3e8','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','a95fef11-1535-41f1-b83c-3d1e08d6f9e5','text','dssadsa',NULL,'null','2025-10-28 16:39:50'),('4f21e11d-5000-4a2f-8d86-029d27de25cb','b382bd9c-f469-4e17-bfe2-a95d8eb2ae70','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','text','d',NULL,'null','2025-10-31 16:06:19'),('682a1979-376e-4423-8e53-468f6dfa2e78','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','media',NULL,'https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761823266366_gk1.jpg','{\"file_name\": \"gk1.jpg\", \"file_size\": 296922, \"file_type\": \"image/jpeg\"}','2025-10-30 11:21:07'),('6bc2a660-946e-4288-bd99-4f288bb6356c','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','media',NULL,'https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761823545642_gk2.jpg','{\"file_name\": \"gk2.jpg\", \"file_size\": 629027, \"file_type\": \"image/jpeg\"}','2025-10-30 11:25:46'),('6d393d41-4bf8-48b3-84ff-d770e9ace751','b382bd9c-f469-4e17-bfe2-a95d8eb2ae70','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','text','áds',NULL,'null','2025-10-31 16:22:16'),('718c8155-effa-40fd-9cd1-66544b1faad1','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','media',NULL,'https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761932223126_gk2.jpg','{\"file_name\": \"gk2.jpg\", \"file_size\": 629027, \"file_type\": \"image/jpeg\"}','2025-10-31 17:37:04'),('7202ce00-4679-4424-9d99-e217436cbb72','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','a95fef11-1535-41f1-b83c-3d1e08d6f9e5','media',NULL,'https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/a95fef11-1535-41f1-b83c-3d1e08d6f9e5/1761836008634_Street Corner Renaissance - Life Could Be A Dream.mp4','{\"file_name\": \"Street Corner Renaissance - Life Could Be A Dream.mp4\", \"file_size\": 18707945, \"file_type\": \"video/mp4\"}','2025-10-30 14:53:34'),('782de741-0e06-43d3-81de-9320b31b9ca1','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','a95fef11-1535-41f1-b83c-3d1e08d6f9e5','text','dfdf',NULL,'null','2025-10-28 16:32:35'),('7d3092db-db5b-409f-90e0-93b4b7ade21e','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','media',NULL,'https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761823824192_gk1.jpg','{\"file_name\": \"gk1.jpg\", \"file_size\": 296922, \"file_type\": \"image/jpeg\"}','2025-10-30 11:30:24'),('89569cff-919a-4d31-978f-f78fbab3c86e','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','a95fef11-1535-41f1-b83c-3d1e08d6f9e5','text','asdasd',NULL,'null','2025-11-01 06:56:24'),('98144d82-dd8b-4490-a324-e0cf2fe37757','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','a95fef11-1535-41f1-b83c-3d1e08d6f9e5','text','hahaha',NULL,'null','2025-10-27 15:32:22'),('98276e2f-8c16-4c2f-802c-03420c99691a','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','a95fef11-1535-41f1-b83c-3d1e08d6f9e5','text','dsafa',NULL,'null','2025-10-28 16:37:42'),('a39b4750-b5d4-4080-8322-23e50dd1203a','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','text','âdsdadas',NULL,'null','2025-10-28 16:40:56'),('a487e95e-5fce-47eb-8cc2-8cd082beee67','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','text','dfsa',NULL,'null','2025-10-28 16:39:42'),('aa48ed8c-1ea2-4b41-a87e-832e34f41980','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','text','hallo',NULL,'null','2025-10-30 11:31:04'),('b5baff7d-c66e-4779-b189-78caa7783253','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','text','d',NULL,'null','2025-10-23 03:51:08'),('b7c29a32-1ff0-43c5-ba68-c38871a8c5ee','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','text','Sounds good. Also, please review the latest patient files I sent.Sounds good. Also, please review the latest patient files I sent.',NULL,'null','2025-10-31 14:20:40'),('ba227da6-e2fd-41e0-a5f7-12eb69676c4a','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','text','haha',NULL,'null','2025-10-30 09:51:47'),('bb3ef4e5-24f6-41b3-a290-b8b489450e02','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','a95fef11-1535-41f1-b83c-3d1e08d6f9e5','media',NULL,'https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/a95fef11-1535-41f1-b83c-3d1e08d6f9e5/1761979777254_gk2.jpg','{\"file_name\": \"gk2.jpg\", \"file_size\": 629027, \"file_type\": \"image/jpeg\"}','2025-11-01 06:49:38'),('da4b86aa-318a-4aed-94da-aff11f75b7ea','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','media',NULL,'https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761824027134_gk1.jpg','{\"file_name\": \"gk1.jpg\", \"file_size\": 296922, \"file_type\": \"image/jpeg\"}','2025-10-30 11:33:47'),('de591809-1f3c-4943-b729-a310c14edf95','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','text','sadfsadf',NULL,'null','2025-10-28 16:38:44'),('e187058f-56b5-4bb9-9d5e-3cf8e172972c','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','media',NULL,'https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761823403895_gk6.jpg','{\"file_name\": \"gk6.jpg\", \"file_size\": 533768, \"file_type\": \"image/jpeg\"}','2025-10-30 11:23:24'),('ef3ff4e5-5981-409f-9351-6c0392252352','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','media','https://chat-app-hieu.s3.ap-southeast-1.amazonaws.com/uploads/1c19c44b-f958-4d38-bfbc-a2e19e37d62a/1761822907726_gk3.jpg',NULL,'null','2025-10-30 11:15:08'),('f55b40e6-0123-4796-b4ed-1bb0310373a4','877d3d59-efb6-4aa8-b41d-ebbb5b7f9364','1c19c44b-f958-4d38-bfbc-a2e19e37d62a','text','dff',NULL,'null','2025-10-23 02:19:24');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fullname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `avatar_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('online','offline','away') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'offline',
  `last_active` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `phonenumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deactivated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('0ab9e025-21d3-4a83-b63b-8bb78585c1b6','hieu123471','1234',NULL,'$2b$10$WXHcIGbL3cWWxpy2QPMlLu6td9Oo30V8U9CpJgasGkKBZVDkc9PuK',NULL,NULL,'offline','2025-10-13 07:10:35','2025-10-13 07:10:35','2025-10-13 07:10:35','12345',NULL),('12ba5199-8a9c-40b7-a223-c002bef5a84f','kaakDDD','kaka',NULL,'$2b$10$kx4JTNzccXROdxzorgb7judMxXuyxiIwqeXOh5YVLwwjKcTUPiZWK','src/assets/default_avatar.png',NULL,'offline','2025-10-13 07:18:30','2025-10-13 07:18:30','2025-10-13 07:18:30','KAAK',NULL),('1c19c44b-f958-4d38-bfbc-a2e19e37d62a','hieu123478','hieuvip','john.doe@example.com','$2b$10$4YsscT6DrDm4DOrDG4PjqeihCstqXpyUZjLw9ANLrZ119r70hwLv6',NULL,NULL,'offline','2025-10-09 11:40:09','2025-10-09 11:40:09','2025-11-05 11:19:21','1234',NULL),('38459dca-a546-11f0-8cd4-0250e620fdfd','hieu0','Liam Johnson','hieu0@example.com','123456','src/assets/avatar.png',NULL,'offline','2025-10-09 19:29:05','2025-10-09 19:29:05','2025-10-09 19:29:05','0912345670',NULL),('3846fdb3-a546-11f0-8cd4-0250e620fdfd','hieu1','Olivia Smith','hieu1@example.com','123456','src/assets/avatar1.png',NULL,'offline','2025-10-09 19:29:05','2025-10-09 19:29:05','2025-10-09 19:29:05','0987654321',NULL),('3847012b-a546-11f0-8cd4-0250e620fdfd','hieu2','Noah Williams','hieu2@example.com','123456','src/assets/avatar2.png',NULL,'offline','2025-10-09 19:29:05','2025-10-09 19:29:05','2025-10-09 19:29:05','0905123456',NULL),('3847027b-a546-11f0-8cd4-0250e620fdfd','hieu3','Emma Brown','hieu3@example.com','123456','src/assets/avatar3.png',NULL,'offline','2025-10-09 19:29:05','2025-10-09 19:29:05','2025-10-09 19:29:05','0978123456',NULL),('3847032e-a546-11f0-8cd4-0250e620fdfd','hieu4','James Miller','hieu4@example.com','123456','src/assets/avatar4.png',NULL,'offline','2025-10-09 19:29:05','2025-10-09 19:29:05','2025-10-09 19:29:05','0923456789',NULL),('384703e9-a546-11f0-8cd4-0250e620fdfd','hieu5','Ava Davis','hieu5@example.com','123456','src/assets/avatar5.png',NULL,'offline','2025-10-09 19:29:05','2025-10-09 19:29:05','2025-10-17 10:23:47','0934567890',NULL),('38470492-a546-11f0-8cd4-0250e620fdfd','hieu6','Lucas Garcia','hieu6@example.com','123456','src/assets/avatar6.png',NULL,'offline','2025-10-09 19:29:05','2025-10-09 19:29:05','2025-10-09 19:29:05','0945678901',NULL),('38470527-a546-11f0-8cd4-0250e620fdfd','hieu7','Sophia Martinez','hieu7@example.com','123456','src/assets/avatar7.png',NULL,'offline','2025-10-09 19:29:05','2025-10-09 19:29:05','2025-10-09 19:29:05','0956789012',NULL),('384705b9-a546-11f0-8cd4-0250e620fdfd','hieu8','Ethan Anderson','hieu8@example.com','123456','src/assets/avatar8.png',NULL,'offline','2025-10-09 19:29:05','2025-10-09 19:29:05','2025-10-09 19:29:05','0967890123',NULL),('45d9bfaa-2b07-4f51-a2f7-e3c7d307ed6f','ahaha','hahaha',NULL,'$2b$10$MKEA0erLY9z.KJSvJH3Kh.S916SG15M1yrCz56YCC8XYP4bkvzD32',NULL,NULL,'offline','2025-10-13 07:13:17','2025-10-13 07:13:17','2025-10-13 07:13:17','hahaah',NULL),('6b61efc2-2fad-4e0d-9408-f208d76bf679','hieu123456','hieuvip',NULL,'$2b$10$QR0f6eqdwOlJv9nVk/t5/eo6UCB.BpzlA3xCg6.P6lgDI/c9NeOZm',NULL,NULL,'offline','2025-10-10 15:27:55','2025-10-10 15:27:55','2025-10-10 15:27:55','1234',NULL),('a95fef11-1535-41f1-b83c-3d1e08d6f9e5','hieu2411','adminvippor','22028289@vnu.edu.vn','$2b$10$g366UuGstQMF68f3N/XSJOUsM1OvaoQBSpcYJmdP4ymQzwphM9AfG',NULL,NULL,'offline','2025-10-10 09:53:06','2025-10-10 09:53:06','2025-11-05 11:07:58','0763492222',NULL),('bf05c559-135f-480c-9046-c4bd39fc4730','hieu12347','hieuvip7',NULL,'$2b$10$H4620Jey7.0NV5KDMtoc5O95gswHeyFyYKw9tubV/OcyDH8u2Hmq6',NULL,NULL,'offline','2025-10-13 06:49:56','2025-10-13 06:49:56','2025-10-13 06:49:56','1234567',NULL),('c7690581-e3a2-434c-b297-c9f7fd43de7e','dddssd','dddd',NULL,'$2b$10$IMni.zAZ/Bd0xLegAnd/8eIdkwoxKCN7YgzT5tvI3dUnewrxx1UOm',NULL,NULL,'offline','2025-10-13 07:14:57','2025-10-13 07:14:57','2025-10-13 07:14:57','ddddd',NULL),('cc7ffb2d-821d-43ca-9c66-a570bec43ec9','kaak','kaka',NULL,'$2b$10$v8ybK6S3F1Ip8vbf6tLZSOU73ARAmNHG2SDIO/IfyULhDoB.MbZdC','src/assets/default_avatar.png',NULL,'offline','2025-10-13 07:17:35','2025-10-13 07:17:35','2025-10-13 07:17:35','KAAK',NULL),('ebe3d277-f33b-4770-8ea6-d1ad0e8320c1','hieu1234','hieuvip','22028279@vnu.edu.vn','$2b$10$mftNnd/Q0WjPxNMFPGJvBeT4TsowxhFghw30ZfXVn9Rn1bidFPMna',NULL,NULL,'offline','2025-10-09 11:45:02','2025-10-09 11:45:02','2025-10-10 18:40:49','12345',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_user_status_update` AFTER UPDATE ON `users` FOR EACH ROW BEGIN

  

  IF OLD.status <> NEW.status THEN

    

    UPDATE conversations

    SET online_count = (

      SELECT COUNT(*)

      FROM conversation_members cm

      JOIN users u ON cm.user_id = u.id

      WHERE cm.conversation_id = conversations.id

        AND u.status = 'online'

    )

    WHERE id IN (

      SELECT conversation_id FROM conversation_members WHERE user_id = NEW.id

    );

  END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping events for database 'chatdb'
--

--
-- Dumping routines for database 'chatdb'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-01 20:52:32
