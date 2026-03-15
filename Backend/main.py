from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import List , Literal
import sqlite3
import uuid
import os
import json
import hashlib

from agentic_workflow.resume_builder_agent.main import generate_resume
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

import redis

app = FastAPI()
roadmap_engine = Roadmap()
rd = redis.Redis(host="localhost", port=6379, db=0)

app.mount("/images", StaticFiles(directory="profile_images"), name="images")
app.mount("/resume-files", StaticFiles(directory="resume"), name="resume-files")
load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0
)

PROFILE_DIR = "profile_images"
os.makedirs(PROFILE_DIR, exist_ok=True)
RESUME_DIR = "resume"
os.makedirs(RESUME_DIR, exist_ok=True)


class WeakLineFeedback(BaseModel):
    weak_line: str = Field(description="The weakest or poorly written line from the resume")
    improved_version: str = Field(description="AI suggested improved version of that line")

class MarketReadiness(BaseModel):
    score:int = Field(description="Percentage Readiness of User")
    market_readiness:Literal['Low', 'Medium', 'High'] = Field(description="User's Overall Job Market Readiness")
    key_strengths: List[str] = Field(description="Top professional strengths found")
    critical_gaps: List[str] = Field(description="Major missing qualifications")
    missing_keywords: List[str] = Field(description="Specific technical terms missing")
    weakest_line: WeakLineFeedback = Field(
        description="Weakest resume line along with improved AI suggestions for the target job."
    )
    skills: List[str] = Field(description="List of skills found in Resume")
    projects: List[str] = Field(description="List of projects found in resume")
    certifications: List[str] = Field(description="List certifications found in resume")

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
                "text": f"Analyze this resume against the target role: {target_role}. "
                        """You are an expert resume evaluator and technical hiring advisor.

Your task is to analyze a user's resume and produce a structured evaluation of their job market readiness. Carefully read the resume content and return an analysis that matches the provided schema exactly.

Evaluation Rules:

1. Score (0–100)

* Estimate the user's overall job market readiness.
* 0–30 → Very weak resume
* 31–50 → Early stage candidate
* 51–70 → Moderate readiness
* 71–85 → Strong candidate
* 86–100 → Highly competitive candidate

2. Market Readiness Category

Return EXACTLY one of the following:

Very weak resume
Early stage candidate
Moderate readiness
Strong candidate
Highly competitive candidate

3. Key Strengths
   List the strongest aspects of the resume. These could include:

* technical skills
* notable projects
* internships or experience
* certifications
  Return 3–5 concise strengths.

4. Critical Gaps
   Identify the most important weaknesses preventing the candidate from being competitive. Examples:

* lack of real projects
* missing internships
* weak technical depth
* missing system design knowledge

Return 3–5 clear gaps.

5. Missing Keywords
   List important industry or ATS keywords that should ideally appear in the resume but are missing.

Examples:

* cloud platforms
* CI/CD
* distributed systems
* Kubernetes

Return 8–10 relevant keywords.

6. Weakest Resume Line
   Identify the single weakest or most poorly written line in the resume and provide a significantly improved version.

The improved version must:

* be more specific
* include measurable impact when possible
* sound professional and achievement-oriented
* be oriented towards the target job of the person
* change the statement to match the persons target goal

7. Skills
   Extract the skills explicitly mentioned in the resume.
   Do NOT invent skills that are not present.

8. Projects
   Extract the project titles or project descriptions mentioned in the resume.

9. Certifications
   Extract any certifications listed in the resume.

Important Constraints:

* Only use information present in the resume.
* Do NOT hallucinate experience, projects, or certifications.
* Keep lists concise and relevant.
* Ensure the output strictly matches the schema.
* The evaluation must be objective and realistic.

You will be provided with the user's resume content. Analyze it and produce the structured evaluation.
"""},
            {
                "type": "media",
                "mime_type": "application/pdf",
                "data": pdf_data
            }
        ]
    )

    result = structured_llm.invoke([message])
    print(f"DEBUG AI RESPONSE: {result}")
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
    skills TEXT,
    projects TEXT,
    certifications TEXT,
    resume TEXT,
    roadmap TEXT
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

class SaveRoadmap(BaseModel):
    roadmap: list

class ResumeGenerateRequest(BaseModel):
    session_id: str
    resume_data: dict

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
        """
        INSERT INTO users (
            name,
            username,
            linkedin,
            email,
            password,
            phone,
            bio,
            current_role,
            target_role,
            professional_links
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data.name,
            data.name,
            data.linkedin,
            data.email,
            hashed,
            "",
            "",
            "",
            "",
            json.dumps([])
        )
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
#------UTILITY FUNCTION-------
def roadmap_cache_key(data):
    payload = json.dumps({
        "topic": data.topic,
        "experience_level": data.experience_level,
        "learning_style": data.learning_style,
        "limit": data.limit
    }, sort_keys=True)

    return "roadmap:" + hashlib.md5(payload.encode()).hexdigest()

@app.post("/roadmap")
def generate_roadmap(data: RoadmapRequest):

    key = roadmap_cache_key(data)

    cached = rd.get(key)
    if cached:
        print("roadmap cache hit")
        return json.loads(cached)

    print("roadmap cache miss")

    try:

        roadmap = roadmap_engine.get_roadmap(
            topic=data.topic,
            experience_level=data.experience_level,
            learning_style=data.learning_style,
            upper_limit=data.limit
        )

        rd.set(key, json.dumps(roadmap), ex=3600)  # cache for 1 hour

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
        
    roadmap = json.loads(user["roadmap"]) if user["roadmap"] else []
    milestone = get_next_milestone(roadmap)

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
        "resume": user["resume"],
        "professional_links": json.loads(user["professional_links"]) if user["professional_links"] else [],
        "market_readiness": user["market_readiness"],
        "skills": json.loads(user["skills"]) if user["skills"] else [],
        "projects": json.loads(user["projects"]) if user["projects"] else [],
        "certifications": json.loads(user["certifications"]) if user["certifications"] else [],
        "roadmap": roadmap,
        "next_milestone": milestone
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

@app.get("/roadmap/user")
def get_user_roadmap(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    email = verify_token(credentials.credentials)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT roadmap FROM users WHERE email=?", (email,))
    row = cursor.fetchone()

    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    roadmap = json.loads(row["roadmap"]) if row["roadmap"] else []

    return {"roadmap": roadmap}

@app.post("/upload-resume")
async def analyze_uploaded_resume(
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
                    """
                    UPDATE users
                    SET market_readiness = ?,
                        skills = ?,
                        projects = ?,
                        certifications = ?
                    WHERE email = ?
                    """,
                    (
                        report["market_readiness"],
                        json.dumps(report["skills"]),
                        json.dumps(report["projects"]),
                        json.dumps(report["certifications"]),
                        email
                    )
                )

        conn.commit()
        conn.close()

        return {
            "filename": unique_name,
            "file_path": file_path,
            "ats_score": report['score'],
            "market_readiness": report["market_readiness"],
            "strengths": report["key_strengths"],
            "weaknesses": report["critical_gaps"],
            "missing_keywords": report["missing_keywords"],
            "suggestions": report["weakest_line"]["improved_version"],
            "weak_line": report["weakest_line"]["weak_line"]
        }

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
# ---------------- JOB SEARCH ---------------- #

def generate_cache_key(source: str, query: str, location: str):
    raw = f"{source}:{query}:{location}"
    return "jobs:" + hashlib.md5(raw.encode()).hexdigest()

@app.post("/jobs/search")
def search_jobs(data: JobSearchRequest):

    results = []

    try:

        if "linkedin" in data.sources:

            key = generate_cache_key("linkedin", data.query, data.location)
            cached = rd.get(key)

            if cached:
                print("linkedin cache hit")
                linkedin_jobs = json.loads(cached)

            else:
                print("linkedin cache miss")
                linkedin = LinkedInScraper()
                linkedin_jobs = linkedin.fetch_jobs(data.query, data.location)

                if isinstance(linkedin_jobs, list):
                    rd.set(key, json.dumps(linkedin_jobs), ex=3600)

            if isinstance(linkedin_jobs, list):
                for j in linkedin_jobs:
                    j["source"] = "LinkedIn"
                    results.append(j)


        if "naukri" in data.sources:

            key = generate_cache_key("naukri", data.query, data.location)
            cached = rd.get(key)

            if cached:
                print("naukri cache hit")
                naukri_jobs = json.loads(cached)

            else:
                print("naukri cache miss")
                naukri = NaukriScraper()
                naukri_jobs = naukri.fetch_jobs(data.query, data.location)

                if isinstance(naukri_jobs, list):
                    rd.set(key, json.dumps(naukri_jobs), ex=3600)

            if isinstance(naukri_jobs, list):
                for j in naukri_jobs:
                    j["source"] = "Naukri"
                    results.append(j)


        # ---------- WEB ----------
        if "web" in data.sources:

            key = generate_cache_key("web", data.query, data.location)
            cached = rd.get(key)

            if cached:
                print("web cache hit")
                web_jobs = json.loads(cached)

            else:
                print("web cache miss")
                serp = SerpApiScraper()
                web_jobs = serp.fetch_jobs(data.query, data.location)

                if isinstance(web_jobs, list):
                    rd.set(key, json.dumps(web_jobs), ex=3600)

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

@app.post("/roadmap/save")
def save_roadmap(
    data: SaveRoadmap,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    email = verify_token(credentials.credentials)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE users SET roadmap=? WHERE email=?",
        (json.dumps(data.roadmap), email)
    )

    conn.commit()
    conn.close()

    return {"message": "Roadmap saved"}

def get_next_milestone(roadmap):

    if not roadmap:
        return None

    for stage in roadmap:
        for skill in stage["skills"]:
            if skill["status"] != "Completed":
                return {
                    "stage": stage["title"],
                    "skill": skill["name"]
                }

    return None

@app.post("/resume/generate")
def generate_resume_api(
    data: ResumeGenerateRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        verify_token(credentials.credentials)

        html_resume = generate_resume(
            session_id=data.session_id,
            resume_data=data.resume_data
        )

        return {"html": html_resume}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/profile/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials
    email = verify_token(token)

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(RESUME_DIR, filename)

    contents = await file.read()

    with open(path, "wb") as f:
        f.write(contents)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE users SET resume=? WHERE email=?",
        (f"/resume/{filename}", email)
    )

    conn.commit()
    conn.close()

    return {"resume": f"/resume-files/{filename}"}

@app.post("/interview/submit")
def submit_answer(data: InterviewAnswer):

    result = evaluate_answer(
        data.question,
        data.answer
    )

    return {
        "analysis": result
    }
