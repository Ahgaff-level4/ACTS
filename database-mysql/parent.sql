DROP DATABASE IF EXISTS acts;
CREATE DATABASE acts;
USE acts;

CREATE TABLE person (-- 1
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` NVARCHAR(50) NOT NULL,
    birthday DATE,
    isMale BIT(1),
    createdDate DATETIME DEFAULT NOW() 
);
INSERT INTO person(`name`,birthday,isMale) VALUES ('احمد الكاف', '2000-3-14', TRUE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Ali', '1995-5-30', TRUE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Hdar', '2000-3-24', TRUE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Salem', '1995-1-24', TRUE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Mohammed', '2001-9-24', TRUE);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Sara', '1995-1-24', FALSE);

CREATE TABLE `account`( -- 2
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	username NVARCHAR(32) NOT NULL UNIQUE,
	`password` CHAR(60) NOT NULL, -- Hashed password and salt concatenated in base64 format
	personId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_account_personId FOREIGN KEY (personId) REFERENCES person(id) ON DELETE CASCADE
);
INSERT INTO `account`(username,`password`,personId) values ('Alkaf-11','$2a$10$KssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',1);
INSERT INTO `account`(username,`password`,personId) values ('BinSheap-12','$2a$10$kssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',2);

CREATE TABLE parent( -- 3
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	phone1 VARCHAR(15),
	phone2 VARCHAR(15),
	phone3 VARCHAR(15),
	phone4 VARCHAR(15),
	phone5 VARCHAR(15),
	address	NVARCHAR(64),
	accountId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_parent_accountId FOREIGN KEY (accountId) REFERENCES `account`(id) ON DELETE CASCADE
);

CREATE TABLE teacher( -- 4
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    accountId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_teacher_accountId FOREIGN KEY (accountId) REFERENCES `account`(id) ON DELETE CASCADE
);



















