from fastapi import FastAPI

app = FastAPI()

# @app.get("/hello")
# def hello():
#     return {"message": "Hello, FastAPI!"}

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


from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

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
