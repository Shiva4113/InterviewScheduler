from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mysql.connector as sqltor
from typing import Optional

app = FastAPI()

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

class Login(BaseModel):
    username: str
    password: str

@app.get('/')
async def landing():
    return 'Hello'

@app.post('/login/')
async def login(user: Login):
    cursor = connection.cursor(dictionary=True)
    # Query to check if user exists with provided username and password
    query = "SELECT * FROM users WHERE username = %s AND password = %s"
    cursor.execute(query, (user.username, user.password))
    result = cursor.fetchone()
    cursor.close()

    if not result:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {"message": f"Welcome back, {user.username}!"}

@app.post('/signup/')
async def signup(user: User):
    cursor = connection.cursor(dictionary=True)
    
    # Check if the username, email, or phone already exists
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
    
    # Insert the new user into the database
    query_insert = "INSERT INTO users (username, password, email, phone) VALUES (%s, %s, %s, %s)"
    cursor.execute(query_insert, (user.username, user.password, user.email, user.phone))
    connection.commit()
    cursor.close()
    
    return {"message": f"User {user.username} created successfully"}
