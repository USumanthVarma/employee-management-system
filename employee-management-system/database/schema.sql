-- ============================================================
-- Reference schema for Module 4 (DBMS & SQL, Days 23-25).
--
-- Hibernate creates/updates these same tables automatically at
-- startup (see backend/src/main/resources/application-mysql.properties,
-- spring.jpa.hibernate.ddl-auto). This file is for study and for anyone
-- who wants to create the database by hand instead, e.g. in a MySQL
-- Workbench session, and to practice the DDL/DML/joins/views/stored
-- procedures the curriculum covers.
-- ============================================================

CREATE DATABASE IF NOT EXISTS ems_db;
USE ems_db;

-- ---------- DDL ----------

CREATE TABLE IF NOT EXISTS departments (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS employees (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name       VARCHAR(50)  NOT NULL,
    last_name        VARCHAR(50)  NOT NULL,
    email            VARCHAR(100) NOT NULL UNIQUE,
    phone            VARCHAR(15),
    designation      VARCHAR(50),
    salary           DOUBLE,
    date_of_joining  DATE,
    department_id    BIGINT,
    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS users (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50)  NOT NULL UNIQUE,
    email    VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role     VARCHAR(20)  NOT NULL
);

-- ---------- DML practice ----------

INSERT INTO departments (name, location) VALUES ('Engineering', 'Bengaluru');
INSERT INTO departments (name, location) VALUES ('Human Resources', 'Mumbai');

INSERT INTO employees (first_name, last_name, email, designation, salary, date_of_joining, department_id)
VALUES ('Aditi', 'Sharma', 'aditi.sharma@ems.com', 'Software Engineer', 65000, '2022-03-14', 1);

UPDATE employees SET salary = 68000 WHERE email = 'aditi.sharma@ems.com';

DELETE FROM employees WHERE email = 'someone.who.left@ems.com';

-- ---------- Joins ----------

-- Every employee with their department name
SELECT e.first_name, e.last_name, d.name AS department, e.salary
FROM employees e
JOIN departments d ON e.department_id = d.id
ORDER BY d.name, e.last_name;

-- Departments with no employees yet (LEFT JOIN + IS NULL)
SELECT d.name
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id
WHERE e.id IS NULL;

-- ---------- View ----------

CREATE OR REPLACE VIEW department_summary AS
SELECT
    d.id                AS department_id,
    d.name              AS department_name,
    COUNT(e.id)         AS headcount,
    ROUND(AVG(e.salary), 2) AS avg_salary
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id
GROUP BY d.id, d.name;

-- SELECT * FROM department_summary;

-- ---------- Stored procedure ----------

DELIMITER $$
CREATE PROCEDURE GetEmployeesByDepartment(IN dept_id BIGINT)
BEGIN
    SELECT id, first_name, last_name, designation, salary
    FROM employees
    WHERE department_id = dept_id;
END$$
DELIMITER ;

-- CALL GetEmployeesByDepartment(1);

-- ---------- Function ----------

DELIMITER $$
CREATE FUNCTION TotalPayroll(dept_id BIGINT)
RETURNS DOUBLE
DETERMINISTIC
BEGIN
    DECLARE total DOUBLE;
    SELECT COALESCE(SUM(salary), 0) INTO total
    FROM employees
    WHERE department_id = dept_id;
    RETURN total;
END$$
DELIMITER ;

-- SELECT TotalPayroll(1);
