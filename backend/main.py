from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Relationship, Session, create_engine, select

security = HTTPBearer()
SECRET_KEY = "secret"
ALGORITHM = "HS256"

fake_users_db = {"alice": "password123", "bob": "secret"}

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

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    tasks: List["Task"] = Relationship(back_populates="owner")

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    done: bool = False
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")
    owner: Optional[User] = Relationship(back_populates="tasks")

class TaskCreate(BaseModel):
    title: str
    done: bool = False
    
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    done: Optional[bool] = None

engine = create_engine("sqlite:///database.db")

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        for username in fake_users_db.keys():
            user = session.exec(select(User).where(User.name == username)).first()
            if not user:
                session.add(User(name=username))
        session.commit()

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.post("/login")
def login(request: LoginRequest):
    if fake_users_db.get(request.username) != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode(
        {"sub": request.username, "exp": datetime.utcnow() + timedelta(hours=1)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer"}

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    with Session(engine) as session:
        user = session.exec(select(User).where(User.name == username)).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user

@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"username": current_user.name}

@app.post("/tasks", response_model=Task)
def create_task(task_data: TaskCreate, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        new_task = Task.from_orm(task_data)
        new_task.owner_id = current_user.id

        session.add(new_task)
        session.commit()
        session.refresh(new_task)
        return new_task

@app.get("/tasks", response_model=List[Task])
def get_tasks(current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        tasks = session.exec(select(Task).where(Task.owner_id == current_user.id)).all()
        return tasks

@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task_data: TaskUpdate, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        db_task = session.exec(
            select(Task).where(Task.id == task_id, Task.owner_id == current_user.id)
        ).first()

        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        update_data = task_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_task, key, value)

        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        task = session.exec(
            select(Task).where(Task.id == task_id, Task.owner_id == current_user.id)
        ).first()

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        session.delete(task)
        session.commit()
        return {"message": "deleted"}