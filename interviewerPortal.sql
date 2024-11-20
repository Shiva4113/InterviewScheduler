CREATE DATABASE scheduler;
USE scheduler;

-- Table: candidate
CREATE TABLE candidate (
    candidate_id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    password VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    Gender VARCHAR(10) NOT NULL,
    Education TEXT NOT NULL,
    Experience TEXT NOT NULL,
    Skills TEXT NOT NULL,
    Publications TEXT NOT NULL,
    department VARCHAR(100) NOT NULL
);

-- Table: faculty
CREATE TABLE faculty (
    faculty_id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    password VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    Gender VARCHAR(10) NOT NULL,
    Department VARCHAR(100) NOT NULL
);

-- Table: faculty_schedule
CREATE TABLE faculty_schedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id INT,
    date DATE,
    time TIME,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
);

-- Table: interview_schedule
CREATE TABLE interview_schedule (
    interview_id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id INT,
    candidate_id INT,
    interview_date DATE,
    interview_time TIME,
    round_no INT,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id),
    FOREIGN KEY (candidate_id) REFERENCES candidate(candidate_id)
);

-- Table: interview_results
CREATE TABLE interview_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT NOT NULL,
    faculty_id INT NOT NULL,
    candidate_id INT NOT NULL,
    result ENUM('PASS', 'FAIL') NOT NULL,
    remarks TEXT,
    round_no INT NOT NULL,
    FOREIGN KEY (interview_id) REFERENCES interview_schedule(interview_id),
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id),
    FOREIGN KEY (candidate_id) REFERENCES candidate(candidate_id)
);


CREATE USER 'interviewee_user'@'localhost' IDENTIFIED BY 'password1';
CREATE USER 'interviewer_user'@'localhost' IDENTIFIED BY 'password2';


-- Grant privileges to interviewee_user
GRANT SELECT, INSERT, UPDATE ON scheduler.candidate TO 'interviewee_user'@'localhost';
GRANT SELECT ON scheduler.faculty TO 'interviewee_user'@'localhost';
GRANT SELECT, INSERT, UPDATE ON scheduler.interview_schedule TO 'interviewee_user'@'localhost';
GRANT SELECT ON scheduler.faculty_schedule TO 'interviewee_user'@'localhost';
GRANT SELECT ON scheduler.interview_results TO 'interviewee_user'@'localhost';
GRANT EXECUTE ON PROCEDURE scheduler.login_user TO 'interviewee_user'@'localhost';

-- Grant privileges to interviewer_user
GRANT SELECT, INSERT, UPDATE ON scheduler.faculty TO 'interviewer_user'@'localhost';
GRANT SELECT ON scheduler.candidate TO 'interviewer_user'@'localhost';
GRANT SELECT, INSERT, UPDATE ON scheduler.interview_schedule TO 'interviewer_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON scheduler.faculty_schedule TO 'interviewer_user'@'localhost';
GRANT SELECT, INSERT, UPDATE ON scheduler.interview_results TO 'interviewer_user'@'localhost';
GRANT EXECUTE ON PROCEDURE scheduler.login_user TO 'interviewer_user'@'localhost';

FLUSH PRIVILEGES;


--TRIGGERS:
DELIMITER $$

CREATE TRIGGER InterviewScheduleInsert
AFTER INSERT ON Interview_Schedule
FOR EACH ROW
BEGIN
     DELETE FROM Faculty_Schedule
    WHERE faculty_id = NEW.faculty_id
      AND date = NEW.interview_date
      AND time = NEW.interview_time;
END $$

DELIMITER ;


--PROCEDURES:
DELIMITER //
CREATE PROCEDURE login_user(IN user_email VARCHAR(100), IN user_password VARCHAR(50), IN user_type VARCHAR(20))
BEGIN
    IF user_type = 'interviewer' THEN
        SELECT * FROM FACULTY WHERE email = user_email AND password = user_password;
    ELSE
        SELECT * FROM CANDIDATE WHERE email = user_email AND password = user_password;
    END IF;
END //
DELIMITER ;