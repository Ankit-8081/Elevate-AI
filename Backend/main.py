from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import List
import sqlite3
import shutil
import uuid
import os
import whisper
import json


import base64
from Roadmap import Roadmap
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
from pydantic import Field
from fastapi import Form
from fastapi.staticfiles import StaticFiles

from interview_ai import generate_question, evaluate_answer
from models import InterviewStart, InterviewAnswer

from chatbot_service import ask_bot
from web_scraping import LinkedInScraper, NaukriScraper, SerpApiScraper

app = FastAPI()
roadmap_engine = Roadmap()
app.mount("/images", StaticFiles(directory="profile_images"), name="images")
load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0
)

PROFILE_DIR = "profile_images"
os.makedirs(PROFILE_DIR, exist_ok=True)

class MarketReadiness(BaseModel):
    key_strengths: List[str] = Field(description="Top strengths")
    critical_gaps: List[str] = Field(description="Major missing qualifications")
    missing_keywords: List[str] = Field(description="Missing ATS keywords")
    ai_suggestion: str = Field(description="Strategic advice")
    market_readiness: str = Field(description="High, Medium, or Low readiness")
    skills: List[str] = Field(description="List of technical skills extracted from the resume")

class RoadmapRequest(BaseModel):
    topic: str
    experience_level: str
    learning_style: str
    limit: int = 5

class ProfileUpdate(BaseModel):
    name: str
    username: str
    phone: str
    bio: str
    current_role: str
    target_role: str
    professional_links: list

structured_llm = llm.with_structured_output(MarketReadiness)

def get_db():
    conn = sqlite3.connect("users.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

async def analyze_resume(pdf_bytes: bytes, target_role: str):

    pdf_data = base64.b64encode(pdf_bytes).decode("utf-8")

    message = HumanMessage(
        content=[
                {
                "type": "text",
                "text": f"""
Analyze this resume for the role: {target_role}.

Return:
- key strengths
- critical gaps
- missing keywords
- extracted technical skills
- a short improvement suggestion

Also determine the candidate's market readiness.

Market readiness must be:
High → strong match
Medium → partially aligned
Low → major skill gaps

Extract **5–10 core technical skills from the resume**.
"""},
            {
                "type": "media",
                "mime_type": "application/pdf",
                "data": pdf_data
            }
        ]
    )

    result = structured_llm.invoke([message])
    return result.model_dump()

# ---------------- CORS ---------------- #

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- DATABASE ---------------- #
def init_db():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        username TEXT,
        email TEXT UNIQUE,
        password TEXT,
        phone TEXT,
        bio TEXT,
        linkedin TEXT,
        current_role TEXT,
        target_role TEXT,
        professional_links TEXT,
        profile_image TEXT,
        cover_image TEXT,
        market_readiness TEXT,
        skills TEXT
    )
    """)

    conn.commit()
    conn.close()


init_db()

# ---------------- AUTH CONFIG ---------------- #

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ---------------- REQUEST MODELS ---------------- #

class SignupRequest(BaseModel):
    name: str
    linkedin: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class JobSearchRequest(BaseModel):
    query: str
    location: str
    sources: List[str]

class ChatRequest(BaseModel):
    message: str

# ---------------- PASSWORD UTILS ---------------- #

def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)


# ---------------- JWT UTILS ---------------- #

def create_token(user_id: str):

    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["user_id"]

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- AUTH ROUTES ---------------- #

@app.post("/signup")
def signup(data: SignupRequest):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (data.email,))
    existing_user = cursor.fetchone()

    if existing_user:
        conn.close()
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(data.password)

    cursor.execute(
        "INSERT INTO users (username, linkedin, email, password) VALUES (?, ?, ?, ?)",
        (data.name, data.linkedin, data.email, hashed)
    )

    conn.commit()
    conn.close()

    return {"message": "User created"}


@app.post("/login")
def login(data: LoginRequest):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT name, linkedin, email, password FROM users WHERE email = ?",
        (data.email,)
    )

    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    name, linkedin, email, password_hash = user

    if not verify_password(data.password, password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(email)

    return {
        "token": token,
        "user": {
            "name": name,
            "linkedin": linkedin,
            "email": email
        }
    }


@app.get("/dashboard")
def dashboard(credentials: HTTPAuthorizationCredentials = Depends(security)):

    token = credentials.credentials
    user_id = verify_token(token)

    return {
        "message": "Access granted",
        "user": user_id
    }

@app.post("/roadmap")
def generate_roadmap(data: RoadmapRequest):

    try:
        roadmap = roadmap_engine.get_roadmap(
            topic=data.topic,
            experience_level=data.experience_level,
            learning_style=data.learning_style,
            upper_limit=data.limit
        )

        return roadmap

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/me")
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):

    token = credentials.credentials
    email = verify_token(token)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "name": user["name"],
        "username": user["username"],
        "email": user["email"],
        "phone": user["phone"],
        "bio": user["bio"],
        "linkedin": user["linkedin"],
        "current_role": user["current_role"],
        "target_role": user["target_role"],
        "profile_image": user["profile_image"],
        "cover_image": user["cover_image"],
        "professional_links": json.loads(user["professional_links"]) if user["professional_links"] else [],
        "market_readiness": user["market_readiness"],
        "skills": json.loads(user["skills"]) if user["skills"] else []
    }


@app.post("/profile/update")
def update_profile(
    data: ProfileUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials
    email = verify_token(token)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE users
        SET name=?,
            username=?,
            phone=?,
            bio=?,
            current_role=?,
            target_role=?,
            professional_links=?
        WHERE email=?
    """, (
        data.name,
        data.username,
        data.phone,
        data.bio,
        data.current_role,
        data.target_role,
        json.dumps(data.professional_links),
        email
    ))

    conn.commit()
    conn.close()

    return {"message": "Profile updated"}


@app.post("/profile/upload-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials
    email = verify_token(token)

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(PROFILE_DIR, filename)

    contents = await file.read()

    with open(path, "wb") as f:
        f.write(contents)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
    "UPDATE users SET profile_image=? WHERE email=?",
    (f"/images/{filename}", email)
)

    conn.commit()
    conn.close()

    return {"profile_image": f"/images/{filename}"}


@app.post("/profile/upload-cover")
async def upload_cover_image(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials
    email = verify_token(token)

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(PROFILE_DIR, filename)

    contents = await file.read()

    with open(path, "wb") as f:
        f.write(contents)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
    "UPDATE users SET cover_image=? WHERE email=?",
    (f"/images/{filename}", email)
)

    conn.commit()
    conn.close()

    return {"cover_image": f"/images/{filename}"}


# ---------------- FILE UPLOAD ---------------- #

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)



@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    target_job: str = Form(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        # verify user
        token = credentials.credentials
        email = verify_token(token)

        # ensure uploads folder exists
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)

        # create unique filename
        file_ext = file.filename.split(".")[-1]
        unique_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(upload_dir, unique_name)

        # read uploaded file
        contents = await file.read()

        # save file
        with open(file_path, "wb") as f:
            f.write(contents)

        # run AI resume analysis
        report = await analyze_resume(contents, target_job)


        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            "UPDATE users SET market_readiness = ?, skills = ? WHERE email = ?",
            (report["market_readiness"], json.dumps(report["skills"]), email)
        )

        conn.commit()
        conn.close()

        return {
            "filename": unique_name,
            "file_path": file_path,
            "ats_score": 80,
            "market_readiness": report["market_readiness"],
            "strengths": report["key_strengths"],
            "weaknesses": report["critical_gaps"],
            "missing_keywords": report["missing_keywords"],
            "suggestions": [report["ai_suggestion"]]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# ---------------- JOB SEARCH ---------------- #

@app.post("/jobs/search")
def search_jobs(data: JobSearchRequest):

    results = []

    try:

        if "linkedin" in data.sources:
            linkedin = LinkedInScraper()
            linkedin_jobs = linkedin.fetch_jobs(data.query, data.location)

            if isinstance(linkedin_jobs, list):
                for j in linkedin_jobs:
                    j["source"] = "LinkedIn"
                    results.append(j)


        if "naukri" in data.sources:
            naukri = NaukriScraper()
            naukri_jobs = naukri.fetch_jobs(data.query, data.location)

            if isinstance(naukri_jobs, list):
                for j in naukri_jobs:
                    j["source"] = "Naukri"
                    results.append(j)


        if "web" in data.sources:
            serp = SerpApiScraper()
            web_jobs = serp.fetch_jobs(data.query, data.location)

            if isinstance(web_jobs, list):
                for j in web_jobs:
                    j["source"] = "Web"
                    results.append(j)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"jobs": results}

@app.get("/jobs")
def get_jobs():
    # raise RuntimeError

#     linkedin = LinkedInScraper()
#     naukri = NaukriScraper()
#     web = SerpApiScraper()

#     jobs = []

#     try:
#         linkedin_jobs = linkedin.fetch_jobs("", "India")
#         if isinstance(linkedin_jobs, list):
#             for j in linkedin_jobs:
#                 j["source"] = "LinkedIn"
#                 jobs.append(j)

#         naukri_jobs = naukri.fetch_jobs("", "India")
#         if isinstance(naukri_jobs, list):
#             for j in naukri_jobs:
#                 j["source"] = "Naukri"
#                 jobs.append(j)

#         web_jobs = web.fetch_jobs("", "India")
#         if isinstance(web_jobs, list):
#             for j in web_jobs:
#                 j["source"] = "Web"
#                 jobs.append(j)

#     except Exception as e:
#         print("Job fetch error:", e)

    return "Search to get job results"   

@app.post("/ai/chat")
def chat_ai(
    data: ChatRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials
    user_id = verify_token(token)
    print(user_id, data.message)
    response = ask_bot(user_id, data.message)

    return {
        "reply": response
    }

@app.post("/interview/start")
def start_interview(data: InterviewStart):

    question = generate_question(
        role=data.role,
        difficulty=data.difficulty
    )

    return {
        "question": question
    }


@app.post("/interview/submit")
def submit_answer(data: InterviewAnswer):

    result = evaluate_answer(
        data.question,
        data.answer
    )

    return {
        "analysis": result
    }
