-- Run these two lines before running NestJs
/*
DROP DATABASE IF EXISTS acts_typeorm;
CREATE DATABASE acts_typeorm;
*/
-- After running NestJs run all script
USE acts_typeorm;

/******************************************* TABLE *********************************************/

-- CREATE TABLE person (-- 1
--     id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
--     `name` NVARCHAR(50) NOT NULL,
--     birthDate DATE,
--     gender enum('Male','Female') NOT NULL,
--     createdDatetime DATETIME DEFAULT NOW() 
-- );
INSERT INTO person_entity(`name`,birthDate,gender) VALUES ('احمد الكاف', '2000-1-24', 'Male');
INSERT INTO person_entity(`name`,birthDate,gender) VALUES ('Ali', '1995-1-24', 'Male');
INSERT INTO person_entity(`name`,birthDate,gender) VALUES ('Hdar', '2000-3-24', 'Male');
INSERT INTO person_entity(`name`,birthDate,gender) VALUES ('Salem', '1995-1-24', 'Male');
INSERT INTO person_entity(`name`,birthDate,gender) VALUES ('Mohammed', '2001-9-24', 'Male');
INSERT INTO person_entity(`name`,birthDate,gender) VALUES ('Sara', '1995-1-24', 'Female');
INSERT INTO person_entity(`name`,birthDate,gender) VALUES ('Abdullah', '2002-5-24', 'Male');
INSERT INTO person_entity(`name`,birthDate,gender) VALUES ('Noor', '2008-1-24', 'Female');
INSERT INTO person_entity(`name`,birthDate,gender,createdDatetime) VALUES ('Omer', '2009-1-24', 'Male', '2022-1-1');
INSERT INTO person_entity(`name`,birthDate,gender) VALUES ('Khaled', '1999-6-3', 'Male');
INSERT INTO person_entity(`name`,gender) VALUES ('Omar', 'Male');
INSERT INTO person_entity(`name`,birthDate,gender) VALUES ('Mansour', '1999-6-3','Male');
INSERT INTO person_entity(`name`,gender) VALUES ('Nothing','Female');


-- CREATE TABLE `account`( -- 2
-- 	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
-- 	username NVARCHAR(32) NOT NULL UNIQUE,
-- 	`password` CHAR(60) NOT NULL, -- Hashed password and salt concatenated in base64 format
-- 	personId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_account_personId FOREIGN KEY (personId) REFERENCES person(id) ON DELETE CASCADE

--  phone0 VARCHAR(15),	phone1 VARCHAR(15),phone2 VARCHAR(15),phone3 VARCHAR(15),phone4 VARCHAR(15),phone5 VARCHAR(15),phone6 VARCHAR(15),phone7 VARCHAR(15),phone8 VARCHAR(15),phone9 VARCHAR(15),
-- 	address	NVARCHAR(64),
-- );															-- if "Duplicate entry..." error then make sure to drop DB (Run first two lines)
INSERT INTO account_entity(username,`password`,personId,phone0,phone1,phone2,phone3,phone4,phone5,phone6,phone7,phone8,phone9,address) values ('Alkaf-11','$2a$10$KssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',1,'775544489','735487872','+966548498149','+966599219279','739651919','785154875','712345678','789456123','701234567','79999999999','Bin sena');
INSERT INTO account_entity(username,`password`,personId,phone0,address) values ('parent','$2a$10$gl0bK61ShEoBpYPXJ5yRauwbT53t23xPDpgwOfVH4L21Fe.vqDg4m',2,'78454456','Masakin');
INSERT INTO account_entity(username,`password`,personId) values ('hdar-11','$2a$10$KssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',3);
INSERT INTO account_entity(username,`password`,personId) values ('teacher','$2a$10$gl0bK61ShEoBpYPXJ5yRauwbT53t23xPDpgwOfVH4L21Fe.vqDg4m',4);
INSERT INTO account_entity(username,`password`,personId) values ('hd','$2a$10$gl0bK61ShEoBpYPXJ5yRauwbT53t23xPDpgwOfVH4L21Fe.vqDg4m',5);
INSERT INTO account_entity(username,`password`,personId) values ('sara','$2a$10$kssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',6);
INSERT INTO account_entity(username,`password`,personId) values ('admin','$2a$10$gl0bK61ShEoBpYPXJ5yRauwbT53t23xPDpgwOfVH4L21Fe.vqDg4m',7);
INSERT INTO account_entity(username,`password`,personId) values ('asdf','$2a$10$gl0bK61ShEoBpYPXJ5yRauwbT53t23xPDpgwOfVH4L21Fe.vqDg4m',10);-- person id 8 and 9 are children that why they don't have account INSERT INTO account (username,`password`,personId) values ('qwer','$2a$10$7zIdK8cdup.QYobNCMM9.OyQExUFPdwYzFW8vC8V34A0qqSr2daui',11);
INSERT INTO account_entity(username,`password`,personId) values ('zxcv','$2a$10$kssILxWNR6k62B7yiX0GAe2Q7wwHlrzhF3LqtVvpyvHZf0MwvNfVu',12);


-- export class RoleEntity {
-- 	public id: number;

-- 	@Column({ type: 'enum', nullable: false, unique: true, enum: ['Admin', 'HeadOfDepartment', 'Teacher', 'Parent'] })
-- 	public name: Role;

-- 	@ManyToMany(() => AccountEntity, (account) => account.roles)
-- 	public accounts: IAccountEntity
-- }
INSERT INTO role_entity(`name`) VALUES('Admin'); -- 1
INSERT INTO role_entity(`name`) VALUES('HeadOfDepartment'); -- 2
INSERT INTO role_entity(`name`) VALUES('Teacher'); -- 3
INSERT INTO role_entity(`name`) VALUES('Parent'); -- 4

-- Admin
INSERT INTO account_entity_roles_entities_role_entity(accountEntityId, roleEntityId) values (7,1);
INSERT INTO account_entity_roles_entities_role_entity(accountEntityId, roleEntityId) values (8,1);

-- HeadOfDepartment
INSERT INTO account_entity_roles_entities_role_entity(accountEntityId, roleEntityId) values (5,2);
INSERT INTO account_entity_roles_entities_role_entity(accountEntityId, roleEntityId) values (6,2);

-- Teacher
INSERT INTO account_entity_roles_entities_role_entity(accountEntityId, roleEntityId) values (3,3);
INSERT INTO account_entity_roles_entities_role_entity(accountEntityId, roleEntityId) values (4,3);

-- Parent
INSERT INTO account_entity_roles_entities_role_entity(accountEntityId, roleEntityId) values (1,4);
INSERT INTO account_entity_roles_entities_role_entity(accountEntityId, roleEntityId) values (2,4);


-- CREATE TABLE child( -- 6
-- 	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
-- 	femaleFamilyMembers	TINYINT,
-- 	maleFamilyMembers TINYINT,
-- 	birthOrder TINYINT,
-- 	parentsKinship NVARCHAR(512),
-- -- registerDate DATE DEFAULT (curdate()), You can drive this from person.createdDatetime
-- 	diagnosticDate DATE,
-- 	pregnancyState NVARCHAR(512),
-- 	birthState NVARCHAR(512),
-- 	growthState	NVARCHAR(512),
-- 	diagnostic	NVARCHAR(512),
-- 	medicine NVARCHAR(512),
-- 	behaviors NVARCHAR(512),
-- 	prioritySkills	NVARCHAR(512),
--     isArchive BOOL DEFAULT FALSE,
-- 	parentId INT UNSIGNED, CONSTRAINT FK_child_parentId FOREIGN KEY (parentId) REFERENCES parent(id) ON DELETE SET NULL, -- if parent deleted don't delete the child
-- 	personId INT UNSIGNED NOT NULL UNIQUE, CONSTRAINT FK_child_personId FOREIGN KEY (personId) REFERENCES person(id) ON DELETE CASCADE
-- );
INSERT INTO child_entity(femaleFamilyMembers,maleFamilyMembers,birthOrder,parentsKinship,
	diagnosticDate,pregnancyState,birthState,growthState,diagnostic,medicine,
    behaviors,prioritySkills,parentId,personId) values (2,2,3,'they are cousin','2018-5-2',
    'normal pregnancy','born in the seventh month','grow normal','diagnostied with autism',
    'Antibiotic','very quite','learn speaking and social intraction',2,8);
INSERT INTO child_entity(personId) values (9);
INSERT INTO child_entity(isArchive,personId) values (true, 13);



-- CREATE TABLE teacher_child( -- 7
-- 	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
-- 	assignDatetime DATETIME DEFAULT NOW(),
-- 	teacherId INT UNSIGNED NOT NULL, CONSTRAINT FK_teacherChild_teacherId FOREIGN KEY (teacherId) REFERENCES teacher(id) ON DELETE CASCADE,
-- 	childId INT UNSIGNED NOT NULL, CONSTRAINT FK_teacherChild_childId FOREIGN KEY (childId) REFERENCES child(id) ON DELETE CASCADE
-- );
-- INSERT INTO teacher_child(teacherId,childId) VALUES (1,1);
-- INSERT INTO teacher_child(teacherId,childId) VALUES (1,2);
-- INSERT INTO teacher_child(teacherId,childId) VALUES (2,2);

-- select * from teacher 
-- join teacher_child on teacher_child.teacherId = teacher.id
-- join child on teacher_child.childId = child.id; -- teacher *--many-to-many--* child


-- CREATE TABLE program( -- 8
-- 	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
--     `name` NVARCHAR(50) NOT NULL UNIQUE,
-- 	createdDatetime	DATETIME DEFAULT NOW()
-- );
INSERT INTO program_entity(name) values ('Portage');
INSERT INTO program_entity(name) values ('Other Program');


-- CREATE TABLE `field`( -- 9
-- 	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
-- 	`name` NVARCHAR(50)	NOT NULL UNIQUE,
-- 	createdDatetime	DATETIME DEFAULT NOW()
-- );
INSERT INTO field_entity(name) values ('Social');
INSERT INTO field_entity(name) values ('Knowledge');
INSERT INTO field_entity(name) values ('Self-care');
INSERT INTO field_entity(name) values ('Speaking');


-- CREATE TABLE activity( -- 10
-- 	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
-- 	`name` NVARCHAR(512) NOT NULL UNIQUE,
-- 	minAge TINYINT UNSIGNED,
-- 	maxAge TINYINT UNSIGNED, CONSTRAINT CH_activity_minAgeLessThanMaxAge CHECK(minAge <= maxAge),
--     CONSTRAINT CH_activity_minAgeMaxAgeAreNullOrNot CHECK((minAge IS NULL AND maxAge IS NULL)||(minAge IS NOT NULL AND maxAge IS NOT NULL)),
-- 	CONSTRAINT CH_activity_maxAgeLessThan100 CHECK( maxAge < 100),
-- 	createdDatetime DATETIME DEFAULT NOW(),
-- 	fieldId	INT UNSIGNED, CONSTRAINT FK_activity_fieldId FOREIGN KEY (fieldId) REFERENCES field(id) ON DELETE SET NULL,
-- 	programId INT UNSIGNED, CONSTRAINT FK_activity_programId FOREIGN KEY (programId) REFERENCES program(id) ON DELETE CASCADE -- deleting program with activitys that not assigned is valid. But if there is goal depend on a activity it won't delete because goal has constraint with activity of NO ACTION
-- );
INSERT INTO activity_entity(name,minAge,maxAge,fieldId,programId) values ('Count to ten',5,7,2,1);
INSERT INTO activity_entity(name,minAge,maxAge,fieldId,programId) values ('Count to five',2,5,2,2);
INSERT INTO activity_entity(name,minAge,maxAge,fieldId,programId) values ('say la la la',4,6,4,1);
INSERT INTO activity_entity(name,minAge,maxAge,fieldId,programId) values ('hold the bottle',2,4,2,1);
INSERT INTO activity_entity(name,fieldId) values ('go to the bathroom by himself',3);
INSERT INTO activity_entity(name,minAge,maxAge,fieldId,programId) values ('Response to greeting',7,9,1,1);
INSERT INTO activity_entity(name,minAge,fieldId) values ('Response to "Peace upon you"',7,1);


-- CREATE TABLE goal( -- 11
-- 	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
-- 	note NVARCHAR(512),
-- 	assignDatetime DATETIME DEFAULT NOW(),
-- 	state ENUM('continual','strength','completed') NOT NULL,
-- 	activityId INT UNSIGNED NOT NULL, CONSTRAINT FK_goal_activityId FOREIGN KEY (activityId) REFERENCES activity(id) ON DELETE NO ACTION, -- prevent deleting activity, if there is a goal depends on it.
-- 	childId INT UNSIGNED NOT NULL, CONSTRAINT FK_goal_childId FOREIGN KEY (childId) REFERENCES child(id) ON DELETE CASCADE,
--     teacherId INT UNSIGNED NOT NULL, CONSTRAINT FK_goal_teacherId FOREIGN KEY (teacherId) REFERENCES teacher(id) ON DELETE NO ACTION
-- );
INSERT INTO goal_entity(note, state, activityId,childId,teacherId) values ('Evalute the child in the public','continual',1,1,1);
INSERT INTO goal_entity(state, activityId,childId,teacherId) values ('strength',2,1,2);
INSERT INTO goal_entity(note, state, activityId,childId,teacherId) values ('perform publicly','continual',3,2,3);
INSERT INTO goal_entity(note, state, activityId,childId,teacherId) values ('privately','continual',3,1,1);
INSERT INTO goal_entity(note, state, activityId,childId,teacherId) values ('With help','continual',5,1,1);


-- CREATE TABLE evaluation( -- 12
-- 	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
-- 	`description` NVARCHAR(512) NOT NULL,
--     mainstream NVARCHAR(512),
-- 	note NVARCHAR(512),
-- 	evaluationDatetime DATETIME DEFAULT NOW(),
--     rate ENUM('continual','excellent'),
-- 	goalId INT UNSIGNED NOT NULL, CONSTRAINT FK_evaluation_goalId FOREIGN KEY (goalId) REFERENCES goal(id) ON DELETE CASCADE,
-- 	teacherId INT UNSIGNED NOT NULL, CONSTRAINT FK_evaluation_teacherId FOREIGN KEY (teacherId) REFERENCES teacher(id) ON DELETE NO ACTION
-- );
INSERT INTO evaluation_entity(description,mainstream,note,evaluationDatetime,goalId,teacherId) 
	values ('show the child ten numbers','numbers are written in a paper','child struggle with number 8','2022-12-30',1,1);
INSERT INTO evaluation_entity(description,note,goalId,teacherId) values ('desc','child struggle at number 9',1,2);
INSERT INTO evaluation_entity(description,evaluationDatetime,goalId,teacherId) values ('ask the child to say after me: la la la','2022-12-29',3,2);
INSERT INTO evaluation_entity(description,goalId,teacherId) values ('I told her if so',5,1);
INSERT INTO evaluation_entity(description,goalId,teacherId) values ('I told the child to say: la la la',4,1);

/******************************************* VIEW *********************************************/

-- CREATE VIEW fieldView AS
-- 	SELECT `field`.`id`,field.name,field.createdDatetime,COUNT(activity.fieldId) AS activityCount
--     FROM field LEFT JOIN activity ON activity.fieldId=field.id GROUP BY field.id;

-- CREATE VIEW programView AS
-- 	SELECT program.id,program.name,program.createdDatetime,COUNT(activity.fieldId) AS activityCount
--     FROM program LEFT JOIN activity ON activity.programId=program.id GROUP BY program.id;


-- CREATE VIEW personView AS
-- 	SELECT id, name, birthDate, createdDatetime, gender,
-- 	TIMESTAMPDIFF(YEAR,birthDate,CURDATE()) AS age FROM person;

-- CREATE VIEW childView AS  -- To add registerDate
-- 	SELECT child.id,
-- 	child.femaleFamilyMembers,
-- 	child.maleFamilyMembers,
-- 	child.birthOrder,
-- 	child.parentsKinship,
-- 	child.diagnosticDate,
-- 	child.pregnancyState,
-- 	child.birthState,
-- 	child.growthState,
-- 	child.diagnostic,
-- 	child.medicine,
-- 	child.behaviors,
-- 	child.prioritySkills,
-- 	child.parentId,
-- 	child.personId,
-- 	(child.femaleFamilyMembers + child.maleFamilyMembers) AS familyMembers,
--     person.createdDatetime AS registerDate,
--     TIMESTAMPDIFF(minute,person.createdDatetime,CURDATE()) AS durationSpent
--     FROM child LEFT JOIN person on child.personId = person.id WHERE isArchive=false;


-- CREATE VIEW accountView AS -- Without passowrd
-- 	SELECT id,
-- 	username,
-- 	personId FROM account;


/******************************************* USER *********************************************/

DROP USER IF EXISTS 'nodejs'@'localhost';
CREATE USER 'nodejs'@'localhost' IDENTIFIED BY '12354678';
-- DELETE          Delete rows from a specific table
-- INSERT          Insert rows into a specific table
-- SELECT          Read a database
-- UPDATE          Update table rows
GRANT DELETE, INSERT, SELECT, UPDATE ON acts.* TO 'nodejs'@'localhost' WITH GRANT OPTION;
GRANT all ON acts_typeorm.* TO 'nodejs'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;




