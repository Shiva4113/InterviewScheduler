from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
import mysql.connector as sqltor
from typing import Optional

app = FastAPI()

connection = sqltor.connect(
    host="localhost",
    user="root",
    password="root",
    database="SCHEDULER"
)

if connection.is_connected():
    print("Connected to MySQL database")
else:
    print("Failed to connect to the database")

# User data model (added phone back)
class User(BaseModel):
    username: str
    password: str
    confirm_password: str
    email: str
    phone: int  
    user_type: str  # interviewer or interviewee

class Login(BaseModel):
    username: str
    password: str

@app.get('/')
async def landing():
    return 'Hello'

@app.post('/login/')
async def login(user: Login):
    cursor = connection.cursor(dictionary=True)
    query = "SELECT * FROM users WHERE username = %s AND password = %s"
    cursor.execute(query, (user.username, user.password))
    result = cursor.fetchone()
    cursor.close()

    if not result:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {"message": f"Welcome back, {user.username}!"}

@app.post('/signup/')
async def signup(user: User, resume: UploadFile = File(None)):
    cursor = connection.cursor(dictionary=True)

    query_check = "SELECT * FROM users WHERE username = %s OR email = %s OR phone = %s"
    cursor.execute(query_check, (user.username, user.email, user.phone))
    result = cursor.fetchone()

    if result:
        if result['username'] == user.username:
            raise HTTPException(status_code=400, detail="Username already exists")
        elif result['email'] == user.email:
            raise HTTPException(status_code=400, detail="Account with the same Email ID already exists")
        elif result['phone'] == user.phone:
            raise HTTPException(status_code=400, detail="Account with the same Phone Number already exists")
    

    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if user.user_type == "interviewee":
        if not resume:
            raise HTTPException(status_code=400, detail="Resume is required for interviewees")
        
        resume_filename = f"resumes/{user.username}_{resume.filename}"
        with open(resume_filename, "wb") as file:
            file.write(await resume.read())

    query_insert = "INSERT INTO users (username, password, email, phone, user_type) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(query_insert, (user.username, user.password, user.email, user.phone, user.user_type))
    connection.commit()
    cursor.close()
    
    return {"message": f"User {user.username} created successfully"}
