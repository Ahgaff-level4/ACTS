DROP DATABASE IF EXISTS acts;
CREATE DATABASE acts;
USE acts;

DROP TABLE IF EXISTS person;
CREATE TABLE person (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` NVARCHAR(50) NOT NULL,
    birthday DATE,
    isMale BIT(1),
    createdDate DATETIME DEFAULT NOW()
);

INSERT INTO person(`name`,birthday,isMale) VALUES ('احمد الكاف', '2000-1-24',true);
INSERT INTO person(`name`,birthday,isMale) VALUES ('Ali', '1995-1-24',FALSE);
-- select * from person;
UPDATE person set `name`= 'hello there',
 birthday='1929-4-20', isMale=true where id=2;
 delete from person where id=1;
 select * from person;