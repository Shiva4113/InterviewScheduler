from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import mysql.connector as sqltor
from typing import Optional, List
from datetime import datetime
import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

# Database connection
connection = sqltor.connect(
    host="localhost",
    user=os.getenv('SQL_PSWD'),
    password="root",
    database="SCHEDULER"
)

# Check if the connection is established
if connection.is_connected():
    print("Connected to MySQL database")
else:
    print("Failed to connect to the database")

class User(BaseModel):
    email: str
    password: str
    confirm_password: str
    name: str
    phone: Optional[str] = None

@app.post('/signup/')
async def signup(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    phone: Optional[str] = Form(None),
    role: str = Form(...),  # 'interviewee' or 'interviewer'
    department: Optional[str] = Form(None),  # Required if role is 'interviewer'
    resume: Optional[UploadFile] = File(None)  # Required if role is 'interviewee'
):
    cursor = connection.cursor(dictionary=True)

    # Check if passwords match
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Check if email already exists in either table
    query_check = "SELECT * FROM users WHERE email = %s"
    cursor.execute(query_check, (email,))
    result = cursor.fetchone()
    
    if result:
        raise HTTPException(status_code=400, detail="Account with the same Email ID already exists")

    if role == 'interviewee':
        # Validate that resume file is uploaded
        if not resume:
            raise HTTPException(status_code=400, detail="Resume is required for interviewees")

        # Save the interviewee to the CANDIDATE table
        query_insert_candidate = """
            INSERT INTO CANDIDATE (Name, Phone, password, email)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query_insert_candidate, (name, phone, password, email))
        connection.commit()

        # Process resume file (e.g., save to file system or parse for additional info)

    elif role == 'interviewer':
        # Validate that department is provided
        if not department:
            raise HTTPException(status_code=400, detail="Department is required for interviewers")

        # Save the interviewer to the FACULTY table
        query_insert_faculty = """
            INSERT INTO FACULTY (Name, Phone, password, email, Department)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query_insert_faculty, (name, phone, password, email, department))
        connection.commit()
    else:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    cursor.close()
    return {"message": f"User {name} registered successfully as {role}"}

'''
# Additional functionality added previously
class FreeSlot(BaseModel):
    id: int
    date: str
    time: str

@app.get('/free-slots')
def get_free_slots():
    cursor = connection.cursor(dictionary=True)
    query = "SELECT schedule_id, DATE_FORMAT(date, '%Y-%m-%d') AS date, TIME_FORMAT(time, '%H:%i') AS time FROM faculty_schedule"
    cursor.execute(query)
    free_slots = cursor.fetchall()
    cursor.close()
    return free_slots

@app.post('/free-slots')
def create_free_slot(
    date: str = Form(...),
    time: str = Form(...)
):
    cursor = connection.cursor()
    query = "INSERT INTO faculty_schedule (date, time) VALUES (%s, %s)"
    values = (date, time)
    cursor.execute(query, values)
    connection.commit()
    slot_id = cursor.lastrowid
    cursor.close()
    return {"id": slot_id, "date": date, "time": time}

@app.delete('/free-slots/{slot_id}')
def delete_free_slot(slot_id: int):
    cursor = connection.cursor()
    query = "DELETE FROM faculty_schedule WHERE schedule_id = %s"
    cursor.execute(query, (slot_id,))
    connection.commit()
    cursor.close()
    return {"message": f"Free slot {slot_id} deleted successfully"}

# New functionality added
@app.get('/calendar')
def get_calendar_events(faculty_id: Optional[int] = None):
    cursor = connection.cursor(dictionary=True)
    if faculty_id:
        query = "SELECT schedule_id, DATE_FORMAT(date, '%Y-%m-%d') AS date, TIME_FORMAT(time, '%H:%i') AS time, faculty_id, IFNULL(CANDIDATE.Name, FACULTY.Name) AS name, IFNULL(CANDIDATE.Position, FACULTY.Department) AS position FROM faculty_schedule LEFT JOIN CANDIDATE ON faculty_schedule.faculty_id = CANDIDATE.candidate_id LEFT JOIN FACULTY ON faculty_schedule.faculty_id = FACULTY.faculty_id WHERE faculty_schedule.faculty_id = %s"
        cursor.execute(query, (faculty_id,))
    else:
        query = "SELECT schedule_id, DATE_FORMAT(date, '%Y-%m-%d') AS date, TIME_FORMAT(time, '%H:%i') AS time, faculty_id, IFNULL(CANDIDATE.Name, FACULTY.Name) AS name, IFNULL(CANDIDATE.Position, FACULTY.Department) AS position FROM faculty_schedule LEFT JOIN CANDIDATE ON faculty_schedule.faculty_id = CANDIDATE.candidate_id LEFT JOIN FACULTY ON faculty_schedule.faculty_id = FACULTY.faculty_id"
        cursor.execute(query)
    events = cursor.fetchall()
    cursor.close()
    return events

@app.post('/schedule-interview')
def schedule_interview(
    faculty_id: int = Form(...),
    date: str = Form(...),
    time: str = Form(...),
    candidate_id: int = Form(...)
):
    cursor = connection.cursor()
    query = "INSERT INTO faculty_schedule (faculty_id, date, time) VALUES (%s, %s, %s)"
    values = (faculty_id, date, time)
    cursor.execute(query, values)
    connection.commit()
    schedule_id = cursor.lastrowid
    
    # Update the CANDIDATE table with the scheduled interview
    query = "UPDATE CANDIDATE SET scheduled_interview = %s WHERE candidate_id = %s"
    cursor.execute(query, (schedule_id, candidate_id))
    connection.commit()
    
    cursor.close()
    return {"message": "Interview scheduled successfully"}

@app.post('/complete-interview')
def complete_interview(
    schedule_id: int = Form(...)
):
    cursor = connection.cursor()
    
    # Update the CANDIDATE table to mark the interview as completed
    query = "UPDATE CANDIDATE SET interview_completed = 1 WHERE scheduled_interview = %s"
    cursor.execute(query, (schedule_id,))
    connection.commit()
    
    # Remove the scheduled interview from the faculty_schedule table
    query = "DELETE FROM faculty_schedule WHERE schedule_id = %s"
    cursor.execute(query, (schedule_id,))
    connection.commit()
    
    cursor.close()
    return {"message": "Interview completed successfully"}
'''