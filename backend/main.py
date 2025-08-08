from fastapi import FastAPI, Depends, HTTPException, Header, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
security = HTTPBearer()
SECRET_KEY = "secret"
ALGORITHM = "HS256"
fake_users = {"alice": "password123", "bob": "secret"}
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class LoginRequest(BaseModel):
    username: str
    password: str
@app.post("/login")
def login(request: LoginRequest):
    if fake_users.get(request.username) != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode(
        {"sub": request.username, "exp": datetime.utcnow() + timedelta(hours=1)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me")
def get_me(credentials: HTTPAuthorizationCredentials = Security(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return {"username": payload["sub"]}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# @app.get("/me")
# def get_me(authorization: str = Header(...)):
#     try:
#         scheme, token = authorization.split()
#         if scheme.lower() != "bearer":
#             raise ValueError("Invalid auth scheme")
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return {"username": payload["sub"]}
#     except (JWTError, ValueError):
#         raise HTTPException(status_code=401, detail="Invalid or expired token")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    tasks: List["Task"] = Relationship(back_populates="owner")

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    done: bool = False
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")
    owner: Optional[User] = Relationship(back_populates="tasks")

from sqlmodel import Session, create_engine

engine = create_engine("sqlite:///database.db")
SQLModel.metadata.create_all(engine)

@app.post("/tasks")
def create_task(task: Task):
    with Session(engine) as session:
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

@app.get("/tasks")
def get_tasks():
    with Session(engine) as session:
        return session.query(Task).all()

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if task:
            session.delete(task)
            session.commit()
            return {"message": "deleted"}

@app.get("/hello")
def hello():
    return {"message": "Hello, FastAPI!"}

# @app.get("/ping")
# def ping():
#     return {"pong": True}

# from pydantic import BaseModel

# class Task(BaseModel):
#     id: int
#     title: str
#     done: bool = False

# tasks = []  # タスク一覧（メモリに保持）

# @app.get("/tasks")
# def get_tasks():
#     return tasks

# @app.post("/tasks")
# def create_task(task: Task):
#     tasks.append(task)
#     return task

# @app.delete("/tasks/{task_id}")
# def delete_task(task_id: int):
#     global tasks
#     tasks = [t for t in tasks if t.id != task_id]
#     return {"message": "deleted"}
