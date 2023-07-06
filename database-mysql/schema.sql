-- Init database
DROP DATABASE IF EXISTS `acts_typeorm`;
CREATE DATABASE `acts_typeorm`;
USE `acts_typeorm`;

-- Table structure for table `person_entity`
DROP TABLE IF EXISTS `person_entity`;
CREATE TABLE `person_entity` (
  `name` varchar(100) NOT NULL,
  `birthDate` date DEFAULT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `createdDatetime` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `image` varchar(120) DEFAULT NULL,
  UNIQUE KEY `IDX_983277fd47c770fe55104f9f6a` (`image`),
  PRIMARY KEY (`id`)
) ;

-- Table structure for table `account_entity`
DROP TABLE IF EXISTS `account_entity`;
CREATE TABLE `account_entity` (
  `username` varchar(32) NOT NULL,
  `password` char(60) NOT NULL,
  `personId` int(10) unsigned NOT NULL,
  `address` varchar(64) DEFAULT NULL,
  `phone0` varchar(15) DEFAULT NULL,
  `phone1` varchar(15) DEFAULT NULL,
  `phone2` varchar(15) DEFAULT NULL,
  `phone3` varchar(15) DEFAULT NULL,
  `phone4` varchar(15) DEFAULT NULL,
  `phone5` varchar(15) DEFAULT NULL,
  `phone6` varchar(15) DEFAULT NULL,
  `phone7` varchar(15) DEFAULT NULL,
  `phone8` varchar(15) DEFAULT NULL,
  `phone9` varchar(15) DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_b3b2774feaf52239dd28e4c5e8` (`username`),
  UNIQUE KEY `IDX_c31869655cec5678710797a21d` (`personId`),
  UNIQUE KEY `REL_c31869655cec5678710797a21d` (`personId`),
  CONSTRAINT `FK_c31869655cec5678710797a21d1` FOREIGN KEY (`personId`) REFERENCES `person_entity` (`id`) ON DELETE CASCADE
);

-- Table structure for table `role_entity`
DROP TABLE IF EXISTS `role_entity`;
CREATE TABLE `role_entity` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(16) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_61db0b4faa9a193b713c7f952e` (`name`)
);

-- Table structure for table `account_entity_roles_entities_role_entity`
DROP TABLE IF EXISTS `account_entity_roles_entities_role_entity`;
CREATE TABLE `account_entity_roles_entities_role_entity` (
  `accountEntityId` int(10) unsigned NOT NULL,
  `roleEntityId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`accountEntityId`,`roleEntityId`),
  KEY `IDX_168c8b7d81b25a81f2ffa93de0` (`accountEntityId`),
  KEY `IDX_a61d3d0b0d1e95d95aae004334` (`roleEntityId`),
  CONSTRAINT `FK_168c8b7d81b25a81f2ffa93de05` FOREIGN KEY (`accountEntityId`) REFERENCES `account_entity` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_a61d3d0b0d1e95d95aae004334a` FOREIGN KEY (`roleEntityId`) REFERENCES `role_entity` (`id`)
) ;

-- Table structure for table `program_entity`
DROP TABLE IF EXISTS `program_entity`;
CREATE TABLE `program_entity` (
  `name` varchar(50) NOT NULL,
  `createdDatetime` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_e755daabe3cea3495db18bef49` (`name`)
);

-- Table structure for table `field_entity`
DROP TABLE IF EXISTS `field_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `field_entity` (
  `name` varchar(50) NOT NULL,
  `createdDatetime` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_87e02134f534f3c7d1c0e12b0b` (`name`)
);

-- Table structure for table `child_entity`
DROP TABLE IF EXISTS `child_entity`;
CREATE TABLE `child_entity` (
  `femaleFamilyMembers` tinyint(4) DEFAULT NULL,
  `maleFamilyMembers` tinyint(4) DEFAULT NULL,
  `birthOrder` tinyint(4) DEFAULT NULL,
  `parentsKinship` varchar(512) DEFAULT NULL,
  `diagnosticDate` date DEFAULT NULL,
  `pregnancyState` varchar(512) DEFAULT NULL,
  `birthState` varchar(512) DEFAULT NULL,
  `growthState` varchar(512) DEFAULT NULL,
  `diagnostic` varchar(512) DEFAULT NULL,
  `medicine` varchar(512) DEFAULT NULL,
  `behaviors` varchar(512) DEFAULT NULL,
  `prioritySkills` varchar(512) DEFAULT NULL,
  `isArchive` tinyint(4) NOT NULL DEFAULT 0,
  `parentId` int(10) unsigned DEFAULT NULL,
  `personId` int(10) unsigned NOT NULL,
  `programId` int unsigned DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_84b3068951084bf06c493b9531` (`personId`),
  UNIQUE KEY `REL_84b3068951084bf06c493b9531` (`personId`),
  KEY `FK_e3f3dd63be322a51911149555c9` (`parentId`),
  KEY `FK_995c7e161eaa66ff793668c359f` (`programId`),
  CONSTRAINT `FK_84b3068951084bf06c493b95316` FOREIGN KEY (`personId`) REFERENCES `person_entity` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_e3f3dd63be322a51911149555c9` FOREIGN KEY (`parentId`) REFERENCES `account_entity` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_995c7e161eaa66ff793668c359f` FOREIGN KEY (`programId`) REFERENCES `program_entity` (`id`) ON DELETE SET NULL
) ;

-- Table structure for table `account_entity_teaches_child_entity`
DROP TABLE IF EXISTS `account_entity_teaches_child_entity`;
CREATE TABLE `account_entity_teaches_child_entity` (
  `accountEntityId` int(10) unsigned NOT NULL,
  `childEntityId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`accountEntityId`,`childEntityId`),
  KEY `IDX_a40114b436e56e70f2be42de0b` (`accountEntityId`),
  KEY `IDX_c6367f9ae0e9b7aae7c96a6d6f` (`childEntityId`),
  CONSTRAINT `FK_a40114b436e56e70f2be42de0be` FOREIGN KEY (`accountEntityId`) REFERENCES `account_entity` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_c6367f9ae0e9b7aae7c96a6d6ff` FOREIGN KEY (`childEntityId`) REFERENCES `child_entity` (`id`) ON DELETE CASCADE
);

-- Table structure for table `activity_entity`
DROP TABLE IF EXISTS `activity_entity`;
CREATE TABLE `activity_entity` (
  `name` varchar(512) NOT NULL,
  `minAge` tinyint(3) unsigned DEFAULT NULL,
  `maxAge` tinyint(3) unsigned DEFAULT NULL,
  `fieldId` int(10) unsigned DEFAULT NULL,
  `programId` int(10) unsigned DEFAULT NULL,
  `createdDatetime` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f239aa9335a4c0b44b8f3102b6` (`name`),
  KEY `FK_f21f0ea6313fbcdd088f2bf1aea` (`programId`),
  KEY `FK_4eba36848bf2c684d31d892af57` (`fieldId`),
  CONSTRAINT `FK_4eba36848bf2c684d31d892af57` FOREIGN KEY (`fieldId`) REFERENCES `field_entity` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_f21f0ea6313fbcdd088f2bf1aea` FOREIGN KEY (`programId`) REFERENCES `program_entity` (`id`) ON DELETE CASCADE
);

-- Table structure for table `goal_entity`
DROP TABLE IF EXISTS `goal_entity`;
CREATE TABLE `goal_entity` (
  `note` varchar(512) DEFAULT NULL,
  `assignDatetime` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `state` enum('continual','strength','completed') NOT NULL DEFAULT 'continual',
  `activityId` int(10) unsigned NOT NULL,
  `childId` int(10) unsigned NOT NULL,
  `teacherId` int(10) unsigned NOT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `FK_0c76fdef9e913898e100a12303f` (`activityId`),
  KEY `FK_79d3116bba3555e1d2afc90ef09` (`childId`),
  KEY `FK_0da49904ac82ab18ee972ae6d36` (`teacherId`),
  CONSTRAINT `FK_0c76fdef9e913898e100a12303f` FOREIGN KEY (`activityId`) REFERENCES `activity_entity` (`id`),
  CONSTRAINT `FK_0da49904ac82ab18ee972ae6d36` FOREIGN KEY (`teacherId`) REFERENCES `account_entity` (`id`),
  CONSTRAINT `FK_79d3116bba3555e1d2afc90ef09` FOREIGN KEY (`childId`) REFERENCES `child_entity` (`id`) ON DELETE CASCADE
) ;

-- Table structure for table `evaluation_entity`
DROP TABLE IF EXISTS `evaluation_entity`;
CREATE TABLE `evaluation_entity` (
  `description` varchar(512) NOT NULL,
  `mainstream` varchar(512) DEFAULT NULL,
  `note` varchar(512) DEFAULT NULL,
  `rate` enum('continual','excellent') NOT NULL,
  `evaluationDatetime` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `goalId` int(10) unsigned NOT NULL,
  `teacherId` int(10) unsigned NOT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `FK_3d11c659ea60467420b5189f2d0` (`goalId`),
  KEY `FK_37e0b71c2602f4508ccc6094453` (`teacherId`),
  CONSTRAINT `FK_37e0b71c2602f4508ccc6094453` FOREIGN KEY (`teacherId`) REFERENCES `account_entity` (`id`),
  CONSTRAINT `FK_3d11c659ea60467420b5189f2d0` FOREIGN KEY (`goalId`) REFERENCES `goal_entity` (`id`) ON DELETE CASCADE
) ;

-- Dumping 'asdf' account
INSERT INTO `role_entity` VALUES (1,'Admin'),(4,'HeadOfDepartment'),(2,'Parent'),(3,'Teacher');
INSERT INTO `person_entity` VALUES ('Prof. Asdf','2011-01-17','Male','2014-10-05 04:12:37.000000',1,NULL);
INSERT INTO `account_entity` VALUES ('asdf','$2b$10$fjYy8Y5t7UWcV8I7LF6bj..N.Ua9wer/mzFBNB7ieNWz8cror6vM6',1,'','4989200677','','','','','','','','','',1);
INSERT INTO `account_entity_roles_entities_role_entity` VALUES (1,1);

