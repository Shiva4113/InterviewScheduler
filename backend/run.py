from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import mysql.connector as sqltor
from typing import Optional
import os
from fastapi.middleware.cors import CORSMiddleware
from parse import process_resume
from processing_utils import get_embed_model, get_llm
from passlib.hash import bcrypt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to the MySQL database
connection = sqltor.connect(
    host="localhost",
    user="root", 
    password="root",
    database="SCHEDULER"
)

# Check if the connection is established
if connection.is_connected():
    print("Connected to MySQL database")
else:
    print("Failed to connect to the database")

llm = get_llm()
embed_model = get_embed_model()
class User(BaseModel):
    email: str
    password: str
    confirm_password: str
    phone: str  
    user_type: str  
    name: str
    department : Optional[str] = None
    gender: str

class Login(BaseModel):
    email: str
    password: str
    user_type: str

@app.get('/')
async def landing():
    return 'Hello'

@app.post('/login/')
async def login(user: Login):
    user_type = 'FACULTY' if user.user_type == 'interviewer' else 'CANDIDATE'
    cursor = connection.cursor(dictionary=True)
    query = f"SELECT * FROM {user_type} WHERE email = %s AND password = %s"
    cursor.execute(query, (user.email, user.password))
    result = cursor.fetchone()
    cursor.close()

    if not result:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {"message": f"Welcome back, {result['email']}!"}

@app.post('/signup/')
async def signup(user: User, resume: Optional[UploadFile] = File(None)):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    cursor = connection.cursor(dictionary=True)
    try:
        # Check if the user already exists
        query_check = "SELECT * FROM {} WHERE email = %s OR Phone = %s"
        table = 'faculty' if user.user_type == 'interviewer' else 'candidate'
        cursor.execute(query_check.format(table), (user.email, user.phone))
        result = cursor.fetchone()

        if result:
            if result['email'] == user.email:
                raise HTTPException(status_code=400, detail="Account with this email already exists")
            elif result['Phone'] == user.phone:
                raise HTTPException(status_code=400, detail="Account with this phone number already exists")

        # Process resume for interviewees
        education = experience = skills = publications = None
        if user.user_type == 'interviewee':
            if not resume:
                raise HTTPException(status_code=400, detail="Resume is required for interviewees")
            resume_content = await resume.read()
            parsed_data = process_resume(resume_content,llm,embed_model)
            education = parsed_data.get('education', '')
            experience = parsed_data.get('experience', '')
            skills = parsed_data.get('skills', '')
            publications = parsed_data.get('publications', '')
            print(publications)
        # Insert the new user into the database
        if user.user_type == 'interviewer':
            query_insert = """
                INSERT INTO faculty (Name, Phone, password, email, Gender, Department)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query_insert, (user.name, user.phone, user.password, user.email, user.gender, user.department))
        else:
            query_insert = """
                INSERT INTO candidate (Name, Phone, password, email, Gender, Education, Experience, Skills, Publications)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query_insert, (user.name, user.phone, user.password, user.email, user.gender, education, experience, skills, publications))

        connection.commit()
        return {"message": f"User {user.name} created successfully"}

    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        cursor.close()















# @app.post('/signup/')
# async def signup(
#     user: User,
#     # resume: Optional[UploadFile] = File(None)
# ):
#     resume = None
#     # Password validation
#     if user.password != user.confirm_password:
#         raise HTTPException(status_code=400, detail="Passwords do not match")
    
#     # Hash password before storing
#     hashed_password = bcrypt.hash(user.password)
    
#     # Database setup
#     try:
#         cursor = connection.cursor(dictionary=True)
#         table = 'FACULTY' if user.user_type == 'interviewer' else 'CANDIDATE'

#         # Check for existing user
#         query_check = f"SELECT * FROM {table} WHERE email = %s OR phone = %s"
#         cursor.execute(query_check, (user.email, user.phone))
#         result = cursor.fetchone()

#         if result:
#             if result['email'] == user.email:
#                 raise HTTPException(status_code=400, detail="Account with this email already exists")
#             elif result['phone'] == user.phone:
#                 raise HTTPException(status_code=400, detail="Account with this phone number already exists")

#         # Validate requirements based on user type
#         if user.user_type == 'interviewer' and not user.department:
#             raise HTTPException(status_code=400, detail="Department is required for interviewers")
#         elif user.user_type == 'candidate' and not resume:
#             raise HTTPException(status_code=400, detail="Resume is required for candidates")

#         # Create resumes directory if it doesn't exist
#         if not os.path.exists('resumes'):
#             os.makedirs('resumes')

#         # Save resume file if provided
#         resume_path = None
#         if resume:
#             # Sanitize filename
#             safe_filename = ''.join(c for c in resume.filename if c.isalnum() or c in ('-', '_', '.'))
#             resume_path = f"resumes/{user.email}_{safe_filename}"
            
#             try:
#                 with open(resume_path, "wb") as buffer:
#                     content = await resume.read()
#                     buffer.write(content)
#             except Exception as e:
#                 raise HTTPException(status_code=500, detail=f"Error saving resume: {str(e)}")

#         # Insert new user
#         try:
#             if user.user_type == 'interviewer':
#                 query_insert = f"""
#                     INSERT INTO {table} 
#                     (name, email, password, phone, department) 
#                     VALUES (%s, %s, %s, %s, %s)
#                 """
#                 values = (user.name, user.email, hashed_password, user.phone, user.department)
#             else:
#                 query_insert = f"""
#                     INSERT INTO {table} 
#                     (name, email, password, phone, resume_path) 
#                     VALUES (%s, %s, %s, %s, %s)
#                 """
#                 values = (user.name, user.email, hashed_password, user.phone, resume_path)
            
#             cursor.execute(query_insert, values)
#             connection.commit()
#             return {"message": "Signup successful"}

#         except Exception as e:
#             # If database insert fails, clean up the uploaded file
#             if resume_path and os.path.exists(resume_path):
#                 os.remove(resume_path)
#             raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
    
#     finally:
#         if 'cursor' in locals():
#             cursor.close()

# @app.get('/calendar')
# def get_calendar_events(faculty_id: Optional[int] = None):
#     cursor = connection.cursor(dictionary=True)
#     try:
#         if faculty_id:
#             query = """
#                 SELECT 
#                     schedule_id, 
#                     DATE_FORMAT(date, '%Y-%m-%d') AS date, 
#                     TIME_FORMAT(time, '%H:%i') AS time, 
#                     faculty_id, 
#                     IFNULL(CANDIDATE.name, FACULTY.name) AS name,
#                     IFNULL(CANDIDATE.position, FACULTY.department) AS position 
#                 FROM faculty_schedule 
#                 LEFT JOIN CANDIDATE ON faculty_schedule.faculty_id = CANDIDATE.candidate_id 
#                 LEFT JOIN FACULTY ON faculty_schedule.faculty_id = FACULTY.faculty_id 
#                 WHERE faculty_schedule.faculty_id = %s
#             """
#             cursor.execute(query, (faculty_id,))
#         else:
#             query = """
#                 SELECT 
#                     schedule_id, 
#                     DATE_FORMAT(date, '%Y-%m-%d') AS date, 
#                     TIME_FORMAT(time, '%H:%i') AS time, 
#                     faculty_id, 
#                     IFNULL(CANDIDATE.name, FACULTY.name) AS name,
#                     IFNULL(CANDIDATE.position, FACULTY.department) AS position 
#                 FROM faculty_schedule 
#                 LEFT JOIN CANDIDATE ON faculty_schedule.faculty_id = CANDIDATE.candidate_id 
#                 LEFT JOIN FACULTY ON faculty_schedule.faculty_id = FACULTY.faculty_id
#             """
#             cursor.execute(query)
#         return cursor.fetchall()
#     finally:
#         cursor.close()

# @app.post('/schedule-interview')
# async def schedule_interview(
#     faculty_id: int = Form(...),
#     date: str = Form(...),
#     time: str = Form(...),
#     candidate_id: int = Form(...)
# ):
#     cursor = connection.cursor()
#     try:
#         # First check if the slot is available
#         check_query = "SELECT * FROM faculty_schedule WHERE faculty_id = %s AND date = %s AND time = %s"
#         cursor.execute(check_query, (faculty_id, date, time))
#         if cursor.fetchone():
#             raise HTTPException(status_code=400, detail="This time slot is already booked")

#         # Schedule the interview
#         query = "INSERT INTO faculty_schedule (faculty_id, date, time) VALUES (%s, %s, %s)"
#         cursor.execute(query, (faculty_id, date, time))
#         schedule_id = cursor.lastrowid
        
#         # Update candidate's scheduled interview
#         query = "UPDATE CANDIDATE SET scheduled_interview = %s WHERE candidate_id = %s"
#         cursor.execute(query, (schedule_id, candidate_id))
        
#         connection.commit()
#         return {"message": "Interview scheduled successfully"}
#     except Exception as e:
#         connection.rollback()
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         cursor.close()

# @app.post('/complete-interview')
# async def complete_interview(schedule_id: int = Form(...)):
#     cursor = connection.cursor()
#     try:
#         # Mark interview as completed
#         query = "UPDATE CANDIDATE SET interview_completed = 1 WHERE scheduled_interview = %s"
#         cursor.execute(query, (schedule_id,))
        
#         # Remove from schedule
#         query = "DELETE FROM faculty_schedule WHERE schedule_id = %s"
#         cursor.execute(query, (schedule_id,))
        
#         connection.commit()
#         return {"message": "Interview marked as completed"}
#     except Exception as e:
#         connection.rollback()
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         cursor.close()