from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import mysql.connector as sqltor
from typing import Optional
import os
from fastapi.middleware.cors import CORSMiddleware
from parse import process_resume
from processing_utils import get_embed_model, get_llm
from passlib.hash import bcrypt
from passlib.context import CryptContext
import tempfile
from pathlib import Path
import nest_asyncio
from dotenv import load_dotenv
from datetime import datetime, date, time

nest_asyncio.apply()
app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = get_llm()
embed_model = get_embed_model()

class UserSignup(BaseModel):
    name: str
    email: str
    password: str
    confirm_password: str
    phone: str  
    user_type: str
    gender: str

class Login(BaseModel):
    email: str
    password: str
    user_type: str

class TimeSlot(BaseModel):
    id: str
    role: str
    date: date
    time: time

def get_connection(user_type=None):
    # Default to root user
    db_user = 'root'
    db_password = os.getenv("SQL_PSWD")  # Your root password

    if user_type == 'interviewee':
        db_user = 'interviewee_user'
        db_password = 'password1'  # Replace with actual password
    elif user_type == 'interviewer':
        db_user = 'interviewer_user'
        db_password = 'password2'  # Replace with actual password

    return sqltor.connect(
        host="localhost",
        user=db_user,
        password=db_password,
        database="SCHEDULER"
    )

@app.get('/')
async def landing():
    return 'Hello'

@app.post('/login/')
async def login(user: Login):
    cursor = None
    try:
        connection = get_connection(user.user_type)
        # Close any unread results first
        if connection.unread_result:
            connection.consume_results()
            
        cursor = connection.cursor(dictionary=True)
        cursor.callproc("login_user", (user.email, user.password, user.user_type))
        
        # Fetch stored results
        for result in cursor.stored_results():
            user_data = result.fetchone()
            if user_data:
                return {
                    "name": user_data['Name'],
                    "id": user_data['faculty_id'] if user.user_type == 'interviewer' else user_data['candidate_id'],
                    "message": f"Welcome back {user_data['Name']}"
                }
        
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        connection.close()

@app.post('/signup/')
async def signup(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    phone: str = Form(...),
    user_type: str = Form(...),
    gender: str = Form(...),
    department: str = Form(...),
    resume: Optional[UploadFile] = File(None)
):
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    connection = get_connection(user_type)
    cursor = connection.cursor(dictionary=True)
    try:
        # Check if the user already exists
        query_check = "SELECT * FROM {} WHERE email = %s OR Phone = %s"
        table = 'faculty' if user_type == 'interviewer' else 'candidate'
        cursor.execute(query_check.format(table), (email, phone))
        result = cursor.fetchone()

        if result:
            if result['email'] == email:
                raise HTTPException(status_code=400, detail="Account with this email already exists")
            elif result['Phone'] == phone:
                raise HTTPException(status_code=400, detail="Account with this phone number already exists")

        # Process resume for interviewees
        education = experience = skills = publications = None
        if user_type == 'interviewee':
            if not resume:
                raise HTTPException(status_code=400, detail="Resume is required for interviewees")
            
            # Create temp directory if not exists
            temp_dir = Path("temp_resumes")
            temp_dir.mkdir(exist_ok=True)
            
            # Generate unique filename
            temp_file = temp_dir / f"resume_{email}_{resume.filename}"
            
            try:
                # Save uploaded file
                with open(temp_file, "wb") as buffer:
                    content = await resume.read()
                    buffer.write(content)
                
                # Process resume with filepath
                parsed_data = await process_resume(str(temp_file), llm, embed_model)
                education = parsed_data[0]
                experience = parsed_data[1]
                skills = parsed_data[2]
                publications = parsed_data[3]
            
            finally:
                # Cleanup temp file
                if temp_file.exists():
                    temp_file.unlink()
                    
        # Insert the new user into the database
        if user_type == 'interviewer':
            query_insert = """
                INSERT INTO faculty (Name, Phone, password, email, Gender, Department)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query_insert, (name, phone, password, email, gender, department))
        else:
            query_insert = """
                INSERT INTO candidate (Name, Phone, password, email, Gender, Education, Experience, Skills, Publications, department)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query_insert, (name, phone, password, email, gender, education, experience, skills, publications, department))

        connection.commit()
        return {"message": f"User {name} created successfully"}

    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@app.post('/add_timeslot')
async def timeslot(slot: TimeSlot):
    connection = get_connection('interviewer')  # Only interviewer can add timeslots
    try:
        cursor = connection.cursor(dictionary=True)
        
        query = """
            INSERT INTO faculty_schedule (faculty_id, date, time)
            VALUES (%s, %s, %s)
        """
        
        values = (slot.id, slot.date, slot.time)
        cursor.execute(query, values)
        connection.commit()
        
        return {"message": "Time slot created successfully"}
    
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.post('/resume/')
async def resumexd(file: UploadFile):
    return {"filename": file.filename}

@app.get('/free_slots/{candidate_id}')
async def free_slots(candidate_id: str):
    connection = get_connection('interviewee')  # Assuming interviewee accesses this
    try:
        cursor = connection.cursor(dictionary=True)
        
        if candidate_id == '0':
            query = """
                SELECT date, time
                FROM faculty_schedule 
                ORDER BY date, time
            """
            cursor.execute(query)  # No parameters needed
        else:
            query = """
                SELECT date, time
                FROM faculty_schedule 
                WHERE faculty_id = %s
                ORDER BY date, time
            """
            cursor.execute(query, (candidate_id,))
            
        slots = cursor.fetchall()
        datetime_array = [
            (f"{slot['date']}", f"{slot['time']}") 
            for slot in slots
        ]
        
        return datetime_array

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.delete('/delete_slot/{faculty_id}/{date}/{time}')
async def delete_slot(faculty_id: str, date: str, time: str):
    connection = get_connection('interviewer')  # Only interviewer can delete slots
    try:
        cursor = connection.cursor(dictionary=True)
        
        query = """
            DELETE FROM faculty_schedule 
            WHERE faculty_id = %s 
            AND date = %s 
            AND time = %s
        """
        
        cursor.execute(query, (faculty_id, date, time))
        connection.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Slot not found")
            
        return {"message": "Slot deleted successfully"}
        
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.get('/choose_slot/{candidate_id}/{faculty_id}/{date}/{time}')
def choose_slot(candidate_id: str, faculty_id: str, date: date, time: time):
    connection = get_connection('interviewee')  # Interviewee chooses slots
    try:
        cursor = connection.cursor(dictionary=True)
        
        query = """
            INSERT INTO interview_schedule (candidate_id, faculty_id, interview_date, interview_time)
            VALUES (%s, %s, %s, %s)
        """
        
        cursor.execute(query, (candidate_id, faculty_id, date, time))
        connection.commit()
        
        return {"message": "Slot booked successfully"}
    
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        cursor.close()
        connection.close()

@app.get('/fetch_interviews/{faculty_id}')
async def fetch_interviews(faculty_id: str):
    connection = get_connection('interviewer')  # Interviewer fetches interviews
    try:
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT 
                i.candidate_id, 
                c.name,   
                i.interview_date, 
                i.interview_time,
                c.department,
                c.education,
                c.skills,
                c.publications,
                c.experience,
                i.round_no,
                i.interview_id
            FROM interview_schedule i
            JOIN candidate c ON i.candidate_id = c.candidate_id  
            WHERE i.faculty_id = %s
            ORDER BY i.interview_date, i.interview_time
        """
        
        cursor.execute(query, (faculty_id,))
        interviews = cursor.fetchall()
        
        formatted_interviews = [
            {
                "candidate_id": str(interview['candidate_id']),
                "name": str(interview['name']),
                "interview_date": str(interview['interview_date']),
                "interview_time": str(interview['interview_time']),
                "department": str(interview['department']),
                "education": str(interview['education']),
                "skills": str(interview['skills']),
                "publications": str(interview['publications']),
                "experience": str(interview['experience']),
                "round_no": str(interview.get('round_no')),
                'interview_id' : str(interview.get('interview_id'))
            }
            for interview in interviews
        ]
        
        return formatted_interviews

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        connection.close()

@app.get('/available_slots/{candidate_id}')
async def get_available_slots(candidate_id: str):
    connection = get_connection('interviewee')  # Interviewee accesses available slots
    try:
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT fs.faculty_id, fs.date, fs.time
            FROM faculty_schedule fs
            INNER JOIN faculty f ON fs.faculty_id = f.faculty_id
            WHERE f.Department = (
                SELECT department 
                FROM candidate 
                WHERE candidate_id = %s
            )
            ORDER BY fs.date, fs.time
        """
        
        cursor.execute(query, (candidate_id,))
        slots = cursor.fetchall()
        
        datetime_array = [
            (f"{slot['date']}", f"{slot['time']}", f"{slot['faculty_id']}")
            for slot in slots
        ]
        
        return datetime_array

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.get('/booked_slot/{candidate_id}')
async def get_booked_slot(candidate_id: str):
    connection = get_connection('interviewee')  # Interviewee views booked slot
    try:
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT i.interview_date, i.interview_time, f.faculty_id, i.round_no
            FROM interview_schedule i
            JOIN faculty f ON i.faculty_id = f.faculty_id
            WHERE i.candidate_id = %s
        """
        cursor.execute(query, (candidate_id,))
        slot = cursor.fetchone()
        
        if slot:
            return {
                "date": str(slot['interview_date']),
                "time": str(slot['interview_time']),
                "faculty_id": str(slot['faculty_id']),
                "round_no": str(slot['round_no'])
            }
        return None
    finally:
        cursor.close()
        connection.close()

@app.get('/add_result/{interview_id}/{faculty_id}/{candidate_id}/{result}/{remarks}/{round_no}')
async def add_interview_result(
    interview_id: str,
    faculty_id: str,
    candidate_id: str,
    result: str,
    remarks: str,
    round_no: int
):
    connection = get_connection('interviewer')  # Interviewer adds results
    try:
        cursor = connection.cursor(dictionary=True)
        query = """
            INSERT INTO interview_results 
            (interview_id, faculty_id, candidate_id, result, remarks, round_no)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            interview_id,
            faculty_id,
            candidate_id,
            result,
            remarks,
            round_no
        ))
        connection.commit()
        return {"message": "Result added successfully"}
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        connection.close()

@app.get('/current_round/{candidate_id}')
async def get_current_round(candidate_id: str):
    connection = get_connection('interviewee')  # Interviewee checks current round
    try:
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT COALESCE(MAX(round_no), 0) + 1 as next_round
            FROM interview_results
            WHERE candidate_id = %s
        """
        cursor.execute(query, (candidate_id,))
        result = cursor.fetchone()
        return {"next_round": result['next_round']}
    finally:
        cursor.close()
        connection.close()