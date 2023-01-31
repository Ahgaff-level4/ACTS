DROP DATABASE IF EXISTS acts;
CREATE DATABASE acts;
USE acts;

CREATE TABLE person (-- 1
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` NVARCHAR(50) NOT NULL,
    birthday DATE check(birthday>'1900-1-1'),
    isMale BIT(1),
    createdDate DATETIME DEFAULT NOW() 
);
INSERT INTO person(`name`,birthday,isMale) VALUES ('احمد الكاف', '2000-1-24', TRUE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Ali', '1995-1-24', TRUE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Hdar', '2000-3-24', TRUE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Salem', '1995-1-24', TRUE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Mohammed', '2001-9-24', TRUE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Sara', '1995-1-24', FALSE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Abdullah', '2002-5-24', TRUE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Noor', '2008-1-24', FALSE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Omer', '2009-1-24', TRUE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Khaled', '1999-6-3', TRUE);

CREATE TABLE `account`( -- 2
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	username NVARCHAR(32) NOT NULL UNIQUE,
	`password` CHAR(60) NOT NULL, -- Hashed password and salt concatenated in base64 format
	personId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_account_personId FOREIGN KEY (personId) REFERENCES person(id) ON DELETE CASCADE
);
INSERT INTO `account`(username,`password`,personId) values ('Alkaf-11','$2a$10$KssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',1);
INSERT INTO `account`(username,`password`,personId) values ('BinSheap-11','$2a$10$kssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',2);
INSERT INTO `account`(username,`password`,personId) values ('hdar-11','$2a$10$KssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',3);
INSERT INTO `account`(username,`password`,personId) values ('salem-11','$2a$10$kssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',4);
INSERT INTO `account`(username,`password`,personId) values ('hammody','$2a$10$kssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',5);
INSERT INTO `account`(username,`password`,personId) values ('sara','$2a$10$kssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',6);
INSERT INTO `account`(username,`password`,personId) values ('aboody','$2a$10$kssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',7);
INSERT INTO `account`(username,`password`,personId) values ('asdf','$2a$10$kssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',10);

CREATE TABLE parent( -- 3
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	phone1 VARCHAR(15),
    phone2 VARCHAR(15),
    phone3 VARCHAR(15),
    phone4 VARCHAR(15),
    phone5 VARCHAR(15),
	address	NVARCHAR(64),
	accountId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_parent_accountId FOREIGN KEY (accountId) REFERENCES account(id) ON DELETE CASCADE
);
INSERT INTO parent(phone1,phone2,address,accountId) values ('775544489','735487872','Bin sena',1);
INSERT INTO parent(phone1,address,accountId) values ('78454456','Masakin',2);

CREATE TABLE teacher( -- 4
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    accountId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_teacher_accountId FOREIGN KEY (accountId) REFERENCES account(id) ON DELETE CASCADE
);
INSERT INTO teacher(accountId) values (3);
INSERT INTO teacher(accountId) values (4);
INSERT INTO teacher(accountId) values (7); -- accountId 7 and 10 are admin by insert them in teacher and head of department tables
INSERT INTO teacher(accountId) values (8);

CREATE TABLE hd( -- 5
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	accountId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_headOfDepartment_accountId FOREIGN KEY (accountId) REFERENCES account(id) ON DELETE CASCADE
);
INSERT INTO hd(accountId) values (5);
INSERT INTO hd(accountId) values (6);
INSERT INTO hd(accountId) values (7);
INSERT INTO hd(accountId) values (8);

CREATE TABLE child( -- 6
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	femaleFamilyMembers	TINYINT,
	maleFamilyMembers TINYINT,
	birthOrder TINYINT,
	parentsKinship NVARCHAR(256),
	registerDate DATE default now(),
	diagnosticDate DATE,
	pregnancyState NVARCHAR(256),
	birthState NVARCHAR(256),
	growthState	NVARCHAR(256),
	diagnostic	NVARCHAR(256),
	medicine NVARCHAR(256),
	behaviors NVARCHAR(512),
	prioritySkills	NVARCHAR(512),
	parentId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_child_parentId FOREIGN KEY (parentId) REFERENCES parent(id) ON DELETE NO ACTION, -- if parent deleted don't delete the child
	personId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_child_personId FOREIGN KEY (personId) REFERENCES person(id) ON DELETE CASCADE
);
INSERT INTO child(accountId) values (8);
INSERT INTO child(accountId) values (9);






