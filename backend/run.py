from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict

app = FastAPI()

# Simulating a database with a dictionary
users_db: Dict[str, str] = {}
# we have to establish database connection here and use that only for both signup and login

class User(BaseModel):
    username: str
    password: str
    email: str
    phone: int


@app.get('/')
async def landing():
    return 'Hello'

@app.post('/login/')
async def login(user: User):
    if user.username not in users_db or users_db[user.username] != user.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"message": f"Welcome back, {user.username}!"}

@app.post('/signup/')
async def signup(user: User):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    users_db[user.username] = user.password
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Account with the same Email ID already exists")
    if user.phone in users_db:
        raise HTTPException(status_code=400, detail="Account with the same Phone Number already exists")

    return {"message": f"User {user.username} created successfully"}