DROP DATABASE IF EXISTS acts;
CREATE DATABASE acts;
USE acts;

/******************************************* TABLE *********************************************/

CREATE TABLE person (-- 1
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` NVARCHAR(50) NOT NULL,
    birthDate DATE,CONSTRAINT CH_person_birthdayLimit CHECK(birthDate>'1900-1-1'),
    isMale BIT(1),
    createdDatetime DATETIME DEFAULT NOW() 
);
INSERT INTO person(`name`,birthDate,isMale) VALUES ('احمد الكاف', '2000-1-24', TRUE);
INSERT INTO person(`name`,birthDate,isMale) VALUES ('Ali', '1995-1-24', TRUE);
INSERT INTO person(`name`,birthDate,isMale) VALUES ('Hdar', '2000-3-24', TRUE);
INSERT INTO person(`name`,birthDate,isMale) VALUES ('Salem', '1995-1-24', TRUE);
INSERT INTO person(`name`,birthDate,isMale) VALUES ('Mohammed', '2001-9-24', TRUE);
INSERT INTO person(`name`,birthDate,isMale) VALUES ('Sara', '1995-1-24', FALSE);
INSERT INTO person(`name`,birthDate,isMale) VALUES ('Abdullah', '2002-5-24', TRUE);
INSERT INTO person(`name`,birthDate,isMale) VALUES ('Noor', '2008-1-24', FALSE);
INSERT INTO person(`name`,birthDate,isMale) VALUES ('Omer', '2009-1-24', TRUE);
INSERT INTO person(`name`,birthDate,isMale) VALUES ('Khaled', '1999-6-3', TRUE);
INSERT INTO person(`name`,isMale) VALUES ('Omar', TRUE);
INSERT INTO person(`name`,birthDate) VALUES ('Mansour', '1999-6-3');
INSERT INTO person(`name`) VALUES ('Nothing');


CREATE TABLE `account`( -- 2
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	username NVARCHAR(32) NOT NULL UNIQUE,
	`password` CHAR(60) NOT NULL, -- Hashed password and salt concatenated in base64 format
	personId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_account_personId FOREIGN KEY (personId) REFERENCES person(id) ON DELETE CASCADE
);
INSERT INTO `account`(username,`password`,personId) values ('Alkaf-11','$2a$10$KssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',1);
INSERT INTO `account`(username,`password`,personId) values ('parent','$2a$10$gl0bK61ShEoBpYPXJ5yRauwbT53t23xPDpgwOfVH4L21Fe.vqDg4m',2);
INSERT INTO `account`(username,`password`,personId) values ('hdar-11','$2a$10$KssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',3);
INSERT INTO `account`(username,`password`,personId) values ('teacher','$2a$10$gl0bK61ShEoBpYPXJ5yRauwbT53t23xPDpgwOfVH4L21Fe.vqDg4m',4);
INSERT INTO `account`(username,`password`,personId) values ('hd','$2a$10$gl0bK61ShEoBpYPXJ5yRauwbT53t23xPDpgwOfVH4L21Fe.vqDg4m',5);
INSERT INTO `account`(username,`password`,personId) values ('sara','$2a$10$kssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',6);
INSERT INTO `account`(username,`password`,personId) values ('admin','$2a$10$gl0bK61ShEoBpYPXJ5yRauwbT53t23xPDpgwOfVH4L21Fe.vqDg4m',7);
INSERT INTO `account`(username,`password`,personId) values ('asdf','$2a$10$gl0bK61ShEoBpYPXJ5yRauwbT53t23xPDpgwOfVH4L21Fe.vqDg4m',10);-- person id 8 and 9 are children that why they don't have account
INSERT INTO `account`(username,`password`,personId) values ('qwer','$2a$10$7zIdK8cdup.QYobNCMM9.OyQExUFPdwYzFW8vC8V34A0qqSr2daui',11);
INSERT INTO `account`(username,`password`,personId) values ('zxcv','$2a$10$kssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',12);

CREATE TABLE parent( -- 3
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	phone1 VARCHAR(15),
    phone2 VARCHAR(15),
    phone3 VARCHAR(15),
    phone4 VARCHAR(15),
    phone5 VARCHAR(15),
    phone6 VARCHAR(15),
    phone7 VARCHAR(15),
    phone8 VARCHAR(15),
    phone9 VARCHAR(15),
    phone10 VARCHAR(15),
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
INSERT INTO teacher(accountId) values (7); -- accountId 7 and 8 are admin by insert them in teacher and head of department tables
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
	parentsKinship NVARCHAR(512),
-- registerDate DATE DEFAULT (curdate()), You can drive this from person.createdDatetime
	diagnosticDate DATE,
	pregnancyState NVARCHAR(512),
	birthState NVARCHAR(512),
	growthState	NVARCHAR(512),
	diagnostic	NVARCHAR(512),
	medicine NVARCHAR(512),
	behaviors NVARCHAR(512),
	prioritySkills	NVARCHAR(512),
	parentId INT UNSIGNED, CONSTRAINT FK_child_parentId FOREIGN KEY (parentId) REFERENCES parent(id) ON DELETE SET NULL, -- if parent deleted don't delete the child
	personId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_child_personId FOREIGN KEY (personId) REFERENCES person(id) ON DELETE CASCADE
);
INSERT INTO child(femaleFamilyMembers,maleFamilyMembers,birthOrder,parentsKinship,
	diagnosticDate,pregnancyState,birthState,growthState,diagnostic,medicine,
    behaviors,prioritySkills,parentId,personId) values (2,2,3,'they are cousin','2018-5-2',
    'normal pregnancy','born in the seventh month','grow normal','diagnostied with autism',
    'Antibiotic','very quite','learn speaking and social intraction',2,8);
INSERT INTO child(personId) values (9);


CREATE TABLE teacher_child( -- 7
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	assignDatetime DATETIME DEFAULT NOW(),
	teacherId INT UNSIGNED NOT NULL, CONSTRAINT FK_teacherChild_teacherId FOREIGN KEY (teacherId) REFERENCES teacher(id) ON DELETE CASCADE,
	childId INT UNSIGNED NOT NULL, CONSTRAINT FK_teacherChild_childId FOREIGN KEY (childId) REFERENCES child(id) ON DELETE CASCADE
);
INSERT INTO teacher_child(teacherId,childId) VALUES (1,1);
INSERT INTO teacher_child(teacherId,childId) VALUES (1,2);
INSERT INTO teacher_child(teacherId,childId) VALUES (2,2);

-- select * from teacher 
-- join teacher_child on teacher_child.teacherId = teacher.id
-- join child on teacher_child.childId = child.id; -- teacher *--many-to-many--* child


CREATE TABLE program( -- 8
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` NVARCHAR(50) NOT NULL UNIQUE,
	createdDatetime	DATETIME DEFAULT NOW()
);
INSERT INTO program(name) values ('Portage');
INSERT INTO program(name) values ('Other Program');


CREATE TABLE `field`( -- 9
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	`name` NVARCHAR(50)	NOT NULL UNIQUE,
	createdDatetime	DATETIME DEFAULT NOW()
);
INSERT INTO `field`(name) values ('Social');
INSERT INTO `field`(name) values ('Knowledge');
INSERT INTO `field`(name) values ('Self-care');
INSERT INTO `field`(name) values ('Speaking');


CREATE TABLE performance( -- 10
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	`name` NVARCHAR(512) NOT NULL UNIQUE,
	minAge TINYINT UNSIGNED,
	maxAge TINYINT UNSIGNED, CONSTRAINT CH_performance_minAgeLessThanMaxAge CHECK(minAge <= maxAge and maxAge < 50),
	createdDatetime DATETIME DEFAULT NOW(),
	fieldId	INT UNSIGNED, CONSTRAINT FK_performance_fieldId FOREIGN KEY (fieldId) REFERENCES field(id) ON DELETE SET NULL,
	programId INT UNSIGNED, CONSTRAINT FK_performance_programId FOREIGN KEY (programId) REFERENCES program(id) ON DELETE CASCADE -- deleting program with performances that not assigned is valid. But if there is goal depend on a performance it won't delete because goal has constraint with performance of NO ACTION
);
INSERT INTO performance(name,minAge,maxAge,fieldId,programId) values ('Count to ten',5,7,2,1);
INSERT INTO performance(name,minAge,maxAge,fieldId,programId) values ('Count to five',2,5,2,2);
INSERT INTO performance(name,minAge,maxAge,fieldId,programId) values ('say la la la',4,6,4,1);
INSERT INTO performance(name,minAge,maxAge,fieldId,programId) values ('hold the bottle',2,4,2,1);
INSERT INTO performance(name,fieldId) values ('go to the bathroom by himself',3);
INSERT INTO performance(name,minAge,maxAge,fieldId,programId) values ('Response to greeting',7,9,1,1);


CREATE TABLE goal( -- 11
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	note NVARCHAR(512),
	assignDatetime DATETIME DEFAULT NOW(),
	state ENUM('continuous','strength','completed') NOT NULL,
	performanceId INT UNSIGNED NOT NULL, CONSTRAINT FK_goal_performanceId FOREIGN KEY (performanceId) REFERENCES performance(id) ON DELETE NO ACTION, -- prevent deleting performance, if there is a goal depends on it.
	childId INT UNSIGNED NOT NULL, CONSTRAINT FK_goal_childId FOREIGN KEY (childId) REFERENCES child(id) ON DELETE CASCADE
);
INSERT INTO goal(note, state, performanceId,childId) values ('Evalute the child in the public','continuous',1,1);
INSERT INTO goal(state, performanceId,childId) values ('strength',2,1);
INSERT INTO goal(note, state, performanceId,childId) values ('perform publicly','completed',3,2);
INSERT INTO goal(note, state, performanceId,childId) values ('privately','continuous',3,1);
INSERT INTO goal(note, state, performanceId,childId) values ('With help','continuous',5,1);

-- select * from goal join performance on goal.performanceId = performance.id;

-- delete from goal where id = 2;
-- DELETE FROM program where id =2;

CREATE TABLE evaluation( -- 12
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	`description` NVARCHAR(512) NOT NULL,
    mainstream NVARCHAR(512),
	note NVARCHAR(512),
	evaluationDatetime DATETIME DEFAULT NOW(),
	goalId INT UNSIGNED NOT NULL, CONSTRAINT FK_evaluation_goalId FOREIGN KEY (goalId) REFERENCES goal(id) ON DELETE CASCADE,
	teacherId INT UNSIGNED NOT NULL, CONSTRAINT FK_evaluation_teacherId FOREIGN KEY (teacherId) REFERENCES teacher(id) ON DELETE NO ACTION
);
INSERT INTO evaluation(description,mainstream,note,evaluationDatetime,goalId,teacherId) 
	values ('show the child ten numbers','numbers are written in a paper','child struggle with number 8','2022-12-30',1,1);
INSERT INTO evaluation(description,note,goalId,teacherId) values ('desc','child struggle at number 9',1,2);
INSERT INTO evaluation(description,evaluationDatetime,goalId,teacherId) values ('ask the child to say after me: la la la','2022-12-29',3,2);
INSERT INTO evaluation(description,goalId,teacherId) values ('I told her if so',5,1);
INSERT INTO evaluation(description,goalId,teacherId) values ('I told the child to say: la la la',4,1);

/******************************************* VIEW *********************************************/

CREATE VIEW fieldView AS
	SELECT field.id,field.name,field.createdDatetime,COUNT(performance.fieldId) AS performanceCount
    FROM field LEFT JOIN performance ON performance.fieldId=field.id GROUP BY field.id;

CREATE VIEW programView AS
	SELECT program.id,program.name,program.createdDatetime,COUNT(performance.fieldId) AS performanceCount
    FROM program LEFT JOIN performance ON performance.programId=program.id GROUP BY program.id;


CREATE VIEW personView AS
	SELECT id,
    `name`,
    birthDate,
	(case isMale when 0 then false when 1 then true else null end) AS isMale,
    createdDatetime,
    TIMESTAMPDIFF(YEAR,birthDate,CURDATE()) AS age FROM person;-- int numbers


CREATE VIEW childView AS  -- To add registerDate
	SELECT child.id,
	child.femaleFamilyMembers,
	child.maleFamilyMembers,
	child.birthOrder,
	child.parentsKinship,
	child.diagnosticDate,
	child.pregnancyState,
	child.birthState,
	child.growthState,
	child.diagnostic,
	child.medicine,
	child.behaviors,
	child.prioritySkills,
	child.parentId,
	child.personId,
    person.createdDatetime AS registerDate FROM child LEFT JOIN person on child.personId = person.id;


CREATE VIEW accountView AS -- Without passowrd
	SELECT id,
	username,
	personId FROM account;


/******************************************* USER *********************************************/

DROP USER IF EXISTS 'nodejs'@'localhost';
CREATE USER 'nodejs'@'localhost' IDENTIFIED BY '12354678';
-- DELETE          Delete rows from a specific table
-- INSERT          Insert rows into a specific table
-- SELECT          Read a database
-- UPDATE          Update table rows
GRANT DELETE, INSERT, SELECT, UPDATE ON acts.* TO 'nodejs'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- select *,@var_person := personId as personId from account where id =8;
-- select * from personView where  id = @var_person;





