import logging
import bcrypt
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Boolean, create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Optional
import bcrypt



# FastAPI app
app = FastAPI()

#  requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["GET", "POST","PUT", "DELETE"],  
    allow_headers=["Content-Type"],
)

#  PostgreSQL connection
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:root1@localhost/rct"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# SQLAlchemy models
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    completed = Column(Boolean, default=False)
    color = Column(String) 
    tags = Column(String) 
    

Base.metadata.create_all(bind=engine)

# Pydantic models 
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str
    

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

#signup 
@app.post("/signup/")
def create_user(user: UserCreate):
    db = SessionLocal()
    try:
        db_user = db.query(User).filter(User.username == user.name).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = hash_password(user.password)  # Hash the password before storing
        db_user = User(username=user.name, email=user.email, password=hashed_password)
        db.add(db_user)
        db.commit()
        return {"message": "User created successfully"}
    except Exception as e:
        print(f"Error during user creation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        db.close()

#login
@app.post("/login/")
def user_login(user_data: UserLogin):
    db = SessionLocal()
    try:
        
        db_user = db.query(User).filter(User.username == user_data.username).first()
        if db_user:
          
            if verify_password(user_data.password, db_user.password):
                return {"message": "Login successful"}
            else:
               
                raise HTTPException(status_code=401, detail="Invalid username or password")
        else:
            
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        print(f"Error during login: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        db.close()




# Pydantic model
class TaskCreate(BaseModel):
    title: str
    description: str
    completed: bool = False
    color: str = '#ffffff' 
    tags: Optional[str] = None 

class TaskUpdate(TaskCreate):  
    pass

#add new task
@app.post("/tasks/")
def create_task(task: TaskCreate):
    db = SessionLocal()
    try:
        db_task = Task(title=task.title, description=task.description,color=task.color,completed=task.completed,tags=task.tags)
        db.add(db_task)
        db.commit()
        return {"message": "Task created successfully", "task": task}
    except Exception as e:
        print(f"Error creating task: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        db.close()

# fetch all tasks
@app.get("/tasks/")
def get_tasks(status: Optional[str] = None, tag: Optional[str] = None):
    db = SessionLocal()
    try:
        if status:
            tasks = db.query(Task).filter(Task.completed == (status.lower() == "completed")).all()
        elif tag:
            tasks = db.query(Task).filter(Task.tags.ilike(f"%{tag}%")).all()  
        else:
            tasks = db.query(Task).all()
        return tasks
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        db.close()

#updating
@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate):
    db = SessionLocal()
    try:
        
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if db_task:
            
            if hasattr(task, 'title') and task.title is not None:
                db_task.title = task.title  
            if hasattr(task, 'description') and task.description is not None:
                db_task.description = task.description 
            
            if hasattr(task, 'completed') and task.completed is not None:
                db_task.completed = not db_task.completed

            if hasattr(task, 'tags') and task.tags is not None:
                db_task.tags = task.tags

            
            db.commit()
            return {"message": "Task updated successfully"}
        else:
            
            raise HTTPException(status_code=404, detail="Task not found")
    except Exception as e:
        
        print(f"Error updating task: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
    
        db.close()



#delete a task
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    db = SessionLocal()
    try:
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if db_task:
            db.delete(db_task)
            db.commit()
            return {"message": "Task deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Task not found")
    except Exception as e:
        print(f"Error deleting task: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        db.close()

