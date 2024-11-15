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
from datetime import datetime

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

# Connect to the MySQL database
connection = sqltor.connect(
    host="localhost",
    user="root", 
    password=os.getenv("SQL_PSWD"),
    database="SCHEDULER"
)

# Check if the connection is established
if connection.is_connected():
    print("Connected to MySQL database")
else:
    print("Failed to connect to the database")

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
    
class TimeslotRequest(BaseModel):
    id: str
    role: str
    datetime: datetime

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
    
    return {
  "name": result['Name'],
  "id": result['faculty_id'] if user.user_type == 'interviewer' else result['candidate_id'],
  "message": f"Welcome back {result['Name']}"
}

async def signup_logic(user: UserSignup, resume: UploadFile):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    cursor = connection.cursor(dictionary=True)
    print("Something works!")

@app.post('/signup/')
async def signup(    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    phone: str = Form(...),
    user_type: str = Form(...),
    gender: str = Form(...),
    department: str = None,
    resume: Optional[UploadFile] = File(None)):
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

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
                INSERT INTO candidate (Name, Phone, password, email, Gender, Education, Experience, Skills, Publications)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query_insert, (name, phone, password, email, gender, education, experience, skills, publications))

        connection.commit()
        return {"message": f"User {name} created successfully"}

    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        cursor.close()



async def timeslot(timeslot_request: TimeslotRequest):
    # Extract datetime
    datetime_value = timeslot_request.datetime
    date_value = datetime_value.date() 
    time_value = datetime_value.time() 
    
    return {
        "message": f"Timeslot booked for {date_value} at {time_value}"
    }




@app.post('/resume/')
async def resumexd(file: UploadFile):
    return {"filename": file.filename}