from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mysql.connector as sqltor
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your React app's URL
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

# User data model
class User(BaseModel):
    username: str
    password: str
    email: str
    phone: int
    role: str

class Login(BaseModel):
    email: str
    password: str
    role: str

@app.get('/')
async def landing():
    return 'Hello'

@app.post('/login/')
async def login(user: Login):
    role = 'FACULTY' if user.role == 'interviewer' else 'CANDIDATE'
    cursor = connection.cursor(dictionary=True)
    # Updated query to use email instead of username
    query = f"SELECT * FROM {role} WHERE email = %s AND password = %s"
    cursor.execute(query, (user.email, user.password))
    result = cursor.fetchone()
    cursor.close()

    if not result:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {"message": f"Welcome back, {result['email']}!"}

@app.post('/signup/')
async def signup(user: User):
    cursor = connection.cursor(dictionary=True)
    if user.role == 'interviewee':
        role = 'CANDIDATE'
        
    else:
        role = 'FACULTY'
    # Check if the username, email, or phone already exists
    query_check = f"SELECT * FROM {role} WHERE name = %s OR email = %s OR phone = %s"
    cursor.execute(query_check, (user.username, user.email, user.phone))
    result = cursor.fetchone()

    if result:
        if result['name'] == user.username:
            raise HTTPException(status_code=400, detail="Username already exists")
        elif result['email'] == user.email:
            raise HTTPException(status_code=400, detail="Account with the same Email ID already exists")
        elif result['phone'] == user.phone:
            raise HTTPException(status_code=400, detail="Account with the same Phone Number already exists")
    
    # Insert the new user into the database
    query_insert = f"INSERT INTO {role} (name, password, email, phone) VALUES (%s, %s, %s, %s)"
    cursor.execute(query_insert, (user.username, user.password, user.email, user.phone))
    connection.commit()
    cursor.close()
    
    return {"message": f"User {user.username} created successfully"}
