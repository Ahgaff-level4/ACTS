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
INSERT INTO person(`name`,birthday,isMale) VALUES ('احمد الكاف', '2000-1-24',true);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Ali', '1995-1-24',FALSE);

CREATE TABLE `account`( -- 2
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	username NVARCHAR(32) NOT NULL UNIQUE,
	`password` CHAR(60) NOT NULL, -- Hashed password and salt concatenated in base64 format
	personId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_account_personId FOREIGN KEY (personId) REFERENCES person(id) ON DELETE CASCADE
);

INSERT INTO `account`(username,password,personId) values ('Alkaf-11','$2a$10$KssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',1);
INSERT INTO `account`(username,password,personId) values ('BinSheap-12','$2a$10$kssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',2);
-- select * from account right join person on account.personId = person.id;
-- select * from account join person on account.personId = person.id where BINARY password = '$2a$10$kssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu' -- WHERE SHOULD BE CASE SENSETIVE BY ADD `BINARY`
-- NOTICE: $2a$10$k is not ...$K

delete from person where id =1; -- assert ON DELETE CASCADE
select * from account;
select * from person left join account on person.id = account.personId





