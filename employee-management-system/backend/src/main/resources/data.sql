-- Seed data, re-applied on every restart (ddl-auto=create-drop, see
-- application-mysql.properties / application-h2.properties).

INSERT INTO departments (name, location) VALUES ('Engineering', 'Bengaluru');
INSERT INTO departments (name, location) VALUES ('Human Resources', 'Mumbai');
INSERT INTO departments (name, location) VALUES ('Sales', 'Delhi');
INSERT INTO departments (name, location) VALUES ('Finance', 'Hyderabad');

INSERT INTO employees (first_name, last_name, email, phone, designation, salary, date_of_joining, department_id) VALUES ('Aditi', 'Sharma', 'aditi.sharma@ems.com', '9876500001', 'Software Engineer', 65000, '2022-03-14', 1);
INSERT INTO employees (first_name, last_name, email, phone, designation, salary, date_of_joining, department_id) VALUES ('Rohan', 'Verma', 'rohan.verma@ems.com', '9876500002', 'Senior Software Engineer', 95000, '2020-07-01', 1);
INSERT INTO employees (first_name, last_name, email, phone, designation, salary, date_of_joining, department_id) VALUES ('Priya', 'Nair', 'priya.nair@ems.com', '9876500003', 'HR Manager', 80000, '2019-11-20', 2);
INSERT INTO employees (first_name, last_name, email, phone, designation, salary, date_of_joining, department_id) VALUES ('Karan', 'Malhotra', 'karan.malhotra@ems.com', '9876500004', 'Sales Executive', 55000, '2023-01-09', 3);
INSERT INTO employees (first_name, last_name, email, phone, designation, salary, date_of_joining, department_id) VALUES ('Sneha', 'Iyer', 'sneha.iyer@ems.com', '9876500005', 'Financial Analyst', 70000, '2021-06-15', 4);

-- Demo logins (see docs/API_REFERENCE.md):
--   admin / Admin@123  -> ROLE_ADMIN (full read/write access)
--   jdoe  / User@123   -> ROLE_USER  (read-only access)
INSERT INTO users (username, email, password, role) VALUES ('admin', 'admin@ems.com', '$2b$10$WURBRW61IDhbE14J71/vt.QDBtan.IHP.u0/fMQEEb3FL4pwNksZq', 'ROLE_ADMIN');
INSERT INTO users (username, email, password, role) VALUES ('jdoe', 'jdoe@ems.com', '$2b$10$UI2fCrlINWdr7wXK02x.w.CKr6d.oOkmBqFNyhMyM0xPthj/V5v9.', 'ROLE_USER');
