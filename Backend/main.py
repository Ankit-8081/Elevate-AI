# ─────────────────────────────────────────────
# IMPORTS
# ─────────────────────────────────────────────
import os
import json
import uuid
import time
import base64
import tempfile
import traceback
import asyncio
import uvicorn

from typing import List, Literal
from datetime import datetime
from pydantic import BaseModel, Field

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from dotenv import load_dotenv

# ── Internal modules ──
from Roadmap import Roadmap
from interview_ai import generate_question, evaluate_answer, analyze_video
from models import InterviewStart
from chatbot_service import ask_bot
from web_scraping import LinkedInScraper, NaukriScraper, SerpApiScraper
from agentic_workflow.resume_builder_agent.main import generate_resume

# ── Auth router + shared utilities ──
from auth import (
    router as auth_router,
    verify_token,
    security,
    get_db,
    get_next_milestone,
)

load_dotenv()

# ─────────────────────────────────────────────
# DIRECTORIES
# ─────────────────────────────────────────────
UPLOAD_DIR = "uploads"
PROFILE_DIR = "profile_images"
RESUME_DIR = "resume"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROFILE_DIR, exist_ok=True)
os.makedirs(RESUME_DIR, exist_ok=True)

# ─────────────────────────────────────────────
# APP INIT
# ─────────────────────────────────────────────
app = FastAPI()
roadmap_engine = Roadmap()

app.mount("/images", StaticFiles(directory=PROFILE_DIR), name="images")
app.mount("/resume-files", StaticFiles(directory=RESUME_DIR), name="resume-files")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register auth router ──
app.include_router(auth_router)

# ─────────────────────────────────────────────
# AI / LLM SETUP
# ─────────────────────────────────────────────
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise Exception("GOOGLE_API_KEY not set")

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", api_key=GOOGLE_API_KEY, temperature=0)

asr_pipeline = None

def get_asr_pipeline():
    global asr_pipeline
    if asr_pipeline is None:
        print("🚀 Loading Whisper model...")
        import torch
        from transformers import pipeline
        asr_pipeline = pipeline(
            "automatic-speech-recognition",
            model="openai/whisper-small",
            device=0 if torch.cuda.is_available() else -1,
        )
    return asr_pipeline

# ─────────────────────────────────────────────
# PYDANTIC MODELS
# ─────────────────────────────────────────────
class BestJobRole(BaseModel):
    best_role: str = Field(description="Most suitable job role for the candidate")
    confidence: int = Field(description="Confidence score (0-100)")
    reasoning: str = Field(description="Why this role is suitable")

class WeakLineFeedback(BaseModel):
    weak_line: str = Field(description="The weakest or poorly written line from the resume")
    improved_version: str = Field(description="AI suggested improved version of that line")

class MarketReadiness(BaseModel):
    score: int = Field(description="Percentage Readiness of User")
    market_readiness: Literal[
        "Very weak resume", "Early stage candidate", "Moderate readiness",
        "Strong candidate", "Highly competitive candidate",
    ] = Field(description="User's Overall Job Market Readiness")
    key_strengths: List[str] = Field(description="Top professional strengths found")
    critical_gaps: List[str] = Field(description="Major missing qualifications")
    missing_keywords: List[str] = Field(description="Specific technical terms missing")
    weakest_line: WeakLineFeedback = Field(description="Weakest resume line with improved AI suggestion")
    skills: List[str] = Field(description="List of skills found in Resume")
    projects: List[str] = Field(description="List of projects found in resume")
    certifications: List[str] = Field(description="List certifications found in resume")

class RoadmapRequest(BaseModel):
    topic: str
    experience_level: str
    learning_style: str
    limit: int = 5
    language: str = "en"

class ProfileUpdate(BaseModel):
    name: str
    username: str
    phone: str
    bio: str
    current_role: str
    target_role: str
    linkedin: str
    professional_links: list

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

class AddComment(BaseModel):
    comment: str

# ─────────────────────────────────────────────
# DATABASE INIT
# ─────────────────────────────────────────────
def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY, name TEXT, username TEXT,
        email TEXT UNIQUE, password TEXT, phone TEXT, bio TEXT,
        linkedin TEXT, "current_role" TEXT, "target_role" TEXT,
        best_job_role TEXT, professional_links TEXT,
        profile_image TEXT, cover_image TEXT,
        market_readiness TEXT, skills TEXT, projects TEXT,
        certifications TEXT, resume TEXT, resume_analysis TEXT,
        roadmap TEXT, created_at TEXT, last_active_date TEXT,
        learning_streak INTEGER DEFAULT 0, profile_views INTEGER DEFAULT 0,
        login_streak INTEGER DEFAULT 1, last_login_date TEXT
    )""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY, user_email TEXT, "role" TEXT,
        message TEXT, response_time REAL, created_at TEXT
    )""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS direct_messages (
        id SERIAL PRIMARY KEY, sender_id INTEGER, receiver_id INTEGER,
        message TEXT, created_at TEXT,
        deleted_for_sender INTEGER DEFAULT 0,
        deleted_for_receiver INTEGER DEFAULT 0,
        is_read INTEGER DEFAULT 0,
        file_url TEXT, file_type TEXT, file_name TEXT
    )""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feed_posts (
        id SERIAL PRIMARY KEY, user_email TEXT, content TEXT,
        type TEXT, tags TEXT, image TEXT, created_at TEXT
    )""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS post_likes (
        id SERIAL PRIMARY KEY, post_id INTEGER, user_email TEXT,
        UNIQUE(post_id, user_email)
    )""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS post_comments (
        id SERIAL PRIMARY KEY, post_id INTEGER,
        user_email TEXT, comment TEXT, created_at TEXT
    )""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS friend_requests (
        id SERIAL PRIMARY KEY, sender_id INTEGER, receiver_id INTEGER,
        status TEXT DEFAULT 'pending', created_at TEXT
    )""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profile_views_log (
        viewer_id INTEGER, viewed_id INTEGER, viewed_at TEXT
    )""")

    conn.commit()
    conn.close()

init_db()

# ─────────────────────────────────────────────
# AI HELPERS
# ─────────────────────────────────────────────
job_role_llm = llm.with_structured_output(BestJobRole)
structured_llm = llm.with_structured_output(MarketReadiness)

def predict_best_job_role(skills, projects, certifications):
    message = HumanMessage(content=f"""
You are an expert technical recruiter.
Given the following candidate profile:
Skills: {skills}
Projects: {projects}
Certifications: {certifications}

Your task:
- Identify the SINGLE most suitable job role for this candidate
- Be realistic (entry-level vs experienced matters)
- Prefer industry-standard roles

Return: best_role, confidence (0-100), reasoning
Rules:
- Do NOT invent skills
- Be precise (avoid vague roles like "Engineer")
- Match role to actual skill depth
""")
    return job_role_llm.invoke([message]).model_dump()

async def analyze_resume(pdf_bytes: bytes, target_role: str):
    pdf_data = base64.b64encode(pdf_bytes).decode("utf-8")
    message = HumanMessage(content=[
        {
            "type": "text",
            "text": f"Analyze this resume against the target role: {target_role}. "
                    "You are an expert resume evaluator. Analyze the resume and return a structured evaluation matching the schema exactly. "
                    "Score 0-100, extract key_strengths (3-5), critical_gaps (3-5), missing_keywords (8-10), weakest_line with improvement, skills, projects, certifications. "
                    "Only use information present in the resume. Do not hallucinate.",
        },
        {"type": "media", "mime_type": "application/pdf", "data": pdf_data},
    ])
    result = structured_llm.invoke([message])
    return result.model_dump()

def translate_text(text, target_lang):
    if target_lang == "en":
        return text
    message = HumanMessage(content=f"Translate the following text into {target_lang}.\n\nText:\n{text}\n\nRules:\n- Keep technical meaning accurate\n- Do not translate URLs\n- Keep concise")
    return llm.invoke([message]).content

def transcribe_audio(file_path, language=None):
    pipe = get_asr_pipeline()
    result = pipe(file_path, generate_kwargs={"task": "transcribe", "max_new_tokens": 200})
    return result["text"]

# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────

# ── Audio ────────────────────────────────────
@app.post("/audio/process")
async def process_audio(file: UploadFile = File(...), language: str = Form(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            content = await file.read()
            tmp.write(content)
            path = tmp.name

        transcription = await asyncio.to_thread(transcribe_audio, path, language)
        os.remove(path)

        return {"original_language": language, "transcription": transcription}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Dashboard ─────────────────────────────────
@app.get("/dashboard")
def dashboard(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = verify_token(credentials.credentials)
    return {"message": "Access granted", "user": user_id}


# ── Roadmap ───────────────────────────────────
@app.post("/roadmap")
def generate_roadmap(data: RoadmapRequest):
    try:
        roadmap = roadmap_engine.get_roadmap(
            topic=data.topic,
            experience_level=data.experience_level,
            learning_style=data.learning_style,
            upper_limit=data.limit,
        )
        if data.language != "en":
            all_titles = [
                item["title"]
                for section in ["basic", "core", "advanced"]
                for item in roadmap.get(section, [])
                if item.get("title")
            ]
            translated = translate_text("\n".join(all_titles), data.language).split("\n")
            i = 0
            for section in ["basic", "core", "advanced"]:
                for item in roadmap.get(section, []):
                    if item.get("title") and i < len(translated):
                        item["title"] = translated[i]
                        i += 1
        return roadmap
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/roadmap/user")
def get_user_roadmap(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT roadmap FROM users WHERE email=%s", (email,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {"roadmap": json.loads(row["roadmap"]) if row["roadmap"] else []}


@app.post("/roadmap/save")
def save_roadmap(data: SaveRoadmap, credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET roadmap=%s WHERE email=%s", (json.dumps(data.roadmap), email))
    conn.commit()
    conn.close()
    return {"message": "Roadmap saved"}


@app.post("/roadmap/reset")
def reset_roadmap_streak(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET learning_streak=0, last_active_date=NULL WHERE email=%s", (email,))
    conn.commit()
    conn.close()
    return {"message": "Streak reset"}


# ── Profile ───────────────────────────────────
@app.post("/profile/update")
def update_profile(data: ProfileUpdate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE users SET name=%s, username=%s, phone=%s, bio=%s,
           "current_role"=%s, "target_role"=%s, linkedin=%s, professional_links=%s
           WHERE email=%s""",
        (data.name, data.username, data.phone, data.bio,
         data.current_role, data.target_role, data.linkedin,
         json.dumps(data.professional_links), email),
    )
    conn.commit()
    conn.close()
    return {"message": "Profile updated"}


@app.post("/profile/upload-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    email = verify_token(credentials.credentials)
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(PROFILE_DIR, filename)
    with open(path, "wb") as f:
        f.write(await file.read())
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET profile_image=%s WHERE email=%s", (f"/images/{filename}", email))
    conn.commit()
    conn.close()
    return {"profile_image": f"/images/{filename}"}


@app.post("/profile/upload-cover")
async def upload_cover_image(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    email = verify_token(credentials.credentials)
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(PROFILE_DIR, filename)
    with open(path, "wb") as f:
        f.write(await file.read())
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET cover_image=%s WHERE email=%s", (f"/images/{filename}", email))
    conn.commit()
    conn.close()
    return {"cover_image": f"/images/{filename}"}


@app.post("/profile/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    email = verify_token(credentials.credentials)
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(RESUME_DIR, filename)
    with open(path, "wb") as f:
        f.write(await file.read())
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET resume=%s WHERE email=%s", (f"/resume-files/{filename}", email))
    conn.commit()
    conn.close()
    return {"resume": f"/resume-files/{filename}"}


# ── Resume ────────────────────────────────────
@app.post("/upload-resume")
async def analyze_uploaded_resume(
    file: UploadFile = File(...),
    target_job: str = Form(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        email = verify_token(credentials.credentials)
        os.makedirs("uploads", exist_ok=True)
        file_ext = file.filename.split(".")[-1]
        unique_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join("uploads", unique_name)
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        report = await analyze_resume(contents, target_job)
        best_job = predict_best_job_role(report["skills"], report["projects"], report["certifications"])

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE users SET market_readiness=%s, skills=%s, projects=%s,
               certifications=%s, "target_role"=%s, resume_analysis=%s, best_job_role=%s
               WHERE email=%s""",
            (report["market_readiness"], json.dumps(report["skills"]),
             json.dumps(report["projects"]), json.dumps(report["certifications"]),
             target_job, json.dumps(report), best_job["best_role"], email),
        )
        conn.commit()
        conn.close()

        return {
            "filename": unique_name,
            "file_path": file_path,
            "ats_score": report["score"],
            "market_readiness": report["market_readiness"],
            "strengths": report["key_strengths"],
            "weaknesses": report["critical_gaps"],
            "missing_keywords": report["missing_keywords"],
            "suggestions": report["weakest_line"]["improved_version"],
            "weak_line": report["weakest_line"]["weak_line"],
            "recommended_job": best_job["best_role"],
            "job_confidence": best_job["confidence"],
            "job_reasoning": best_job["reasoning"],
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/resume/generate")
def generate_resume_api(
    data: ResumeGenerateRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        verify_token(credentials.credentials)
        html_resume = generate_resume(session_id=data.session_id, resume_data=data.resume_data)
        return {"html": html_resume}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Jobs ──────────────────────────────────────
@app.post("/jobs/search")
def search_jobs(data: JobSearchRequest):
    results = []
    try:
        if "linkedin" in data.sources:
            for j in LinkedInScraper().fetch_jobs(data.query, data.location) or []:
                j["source"] = "LinkedIn"
                results.append(j)
        if "naukri" in data.sources:
            naukri_jobs = NaukriScraper().fetch_jobs(data.query, data.location)
            if isinstance(naukri_jobs, list):
                for j in naukri_jobs:
                    j["source"] = "Naukri"
                    results.append(j)
        if "web" in data.sources:
            for j in SerpApiScraper().fetch_jobs(data.query, data.location) or []:
                j["source"] = "Web"
                results.append(j)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"jobs": results}


@app.get("/jobs")
def get_jobs():
    return "Search to get job results"


@app.get("/user/best-job")
def get_best_job(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT best_job_role FROM users WHERE email=%s", (email,))
    row = cursor.fetchone()
    conn.close()
    return {"best_job_role": row["best_job_role"] if row else None}


# ── AI Chat ───────────────────────────────────
@app.post("/ai/chat")
def chat_ai(data: ChatRequest, credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    start = time.time()
    response = ask_bot(email, data.message)
    response_time = round(time.time() - start, 2)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO chat_messages (user_email, role, message, created_at) VALUES (%s, %s, %s, %s)",
        (email, "user", data.message, datetime.utcnow().isoformat()),
    )
    cursor.execute(
        "INSERT INTO chat_messages (user_email, role, message, response_time, created_at) VALUES (%s, %s, %s, %s, %s)",
        (email, "ai", response, response_time, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return {"reply": response, "response_time": response_time}


@app.get("/ai/history")
def get_chat_history(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT role, message, response_time FROM chat_messages WHERE user_email=%s ORDER BY id",
        (email,),
    )
    rows = cursor.fetchall()
    conn.close()
    return {
        "messages": [
            {"role": r["role"], "content": r["message"], "responseTime": r["response_time"]}
            for r in rows
        ]
    }


# ── Interview ─────────────────────────────────
INTERVIEW_SESSIONS = {}

@app.post("/interview/start")
def start_interview(data: InterviewStart):
    session_id = str(uuid.uuid4())
    question = generate_question(role=data.role, difficulty=data.difficulty)
    INTERVIEW_SESSIONS[session_id] = {
        "role": data.role, "difficulty": data.difficulty,
        "question_number": 1, "questions": [question], "answers": [],
    }
    return {"session_id": session_id, "question": question, "difficulty": data.difficulty, "question_number": 1}


@app.post("/interview/submit")
async def submit_answer(
    session_id: str = Form(...),
    answer: str = Form(...),
    video: UploadFile = File(None),
):
    if session_id not in INTERVIEW_SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    session = INTERVIEW_SESSIONS[session_id]
    question = session["questions"][-1]
    result = evaluate_answer(question, answer)
    score = result["score"]

    next_difficulty = "Hard" if score > 80 else "Easy" if score < 40 else "Medium"
    video_feedback = analyze_video(await video.read()) if video else None

    session["answers"].append(answer)
    next_question = generate_question(role=session["role"], difficulty=next_difficulty)
    session["difficulty"] = next_difficulty
    session["questions"].append(next_question)
    session["question_number"] += 1

    return {
        "analysis": result["analysis"],
        "video_feedback": video_feedback,
        "next_question": next_question,
        "difficulty": next_difficulty,
        "question_number": session["question_number"],
    }


# ── Streak ────────────────────────────────────
@app.post("/streak/update")
def update_streak(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT learning_streak, last_active_date FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    streak = user["learning_streak"] or 0
    last_active = user["last_active_date"]
    today = datetime.utcnow().date()

    if not last_active:
        streak = 1
    else:
        diff = (today - datetime.strptime(last_active, "%Y-%m-%d").date()).days
        if diff == 0:
            conn.close()
            return {"streak": streak}
        streak = streak + 1 if diff == 1 else 1

    cursor.execute("UPDATE users SET learning_streak=%s, last_active_date=%s WHERE email=%s",
                   (streak, today.isoformat(), email))
    conn.commit()
    conn.close()
    return {"streak": streak}


# ── Stats ─────────────────────────────────────
@app.get("/stats")
def get_stats():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]
    cursor.execute("SELECT projects, skills FROM users")
    rows = cursor.fetchall()
    total_projects = sum(len(json.loads(r["projects"])) for r in rows if r["projects"])
    total_skills = sum(len(json.loads(r["skills"])) for r in rows if r["skills"])
    conn.close()
    return {"totalUsers": total_users, "totalProjects": total_projects, "totalSkills": total_skills}


# ── User / Social ─────────────────────────────
@app.get("/user/{user_id}")
def get_user_profile(user_id: int, credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    current = cursor.fetchone()
    if not current:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    current_user_id = current["id"]

    cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    if current_user_id != user_id:
        cursor.execute(
            "SELECT viewed_at FROM profile_views_log WHERE viewer_id=%s AND viewed_id=%s ORDER BY viewed_at DESC LIMIT 1",
            (current_user_id, user_id),
        )
        last_view = cursor.fetchone()
        now = datetime.utcnow()
        if not last_view or (now - datetime.fromisoformat(last_view["viewed_at"])).seconds > 3600:
            cursor.execute(
                "INSERT INTO profile_views_log (viewer_id, viewed_id, viewed_at) VALUES (%s, %s, %s)",
                (current_user_id, user_id, now.isoformat()),
            )
            cursor.execute("UPDATE users SET profile_views = profile_views + 1 WHERE id=%s", (user_id,))

    roadmap = json.loads(user["roadmap"]) if user["roadmap"] else []
    conn.commit()
    conn.close()

    return {
        "id": user["id"],
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
        "next_milestone": get_next_milestone(roadmap),
        "learning_streak": user["learning_streak"],
        "login_streak": user["login_streak"],
    }


@app.get("/api/leaderboard")
def leaderboard(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    current_user_id = cursor.fetchone()["id"]

    cursor.execute('SELECT id, name, "current_role", skills, projects, roadmap, profile_image, profile_views FROM users')
    rows = cursor.fetchall()

    cursor.execute("SELECT sender_id, receiver_id FROM friend_requests WHERE status='accepted'")
    friendships = cursor.fetchall()
    conn.close()

    friend_set = set()
    for f in friendships:
        if f["sender_id"] == current_user_id:
            friend_set.add(f["receiver_id"])
        if f["receiver_id"] == current_user_id:
            friend_set.add(f["sender_id"])

    skill_counter = {}
    users = []

    for r in rows:
        skills = json.loads(r["skills"]) if r["skills"] else []
        projects = json.loads(r["projects"]) if r["projects"] else []
        roadmap = json.loads(r["roadmap"]) if r["roadmap"] else []
        modules_completed = sum(
            1 for stage in roadmap for s in stage.get("skills", []) if s.get("status") == "Completed"
        )
        for skill in skills:
            skill_counter[skill] = skill_counter.get(skill, 0) + 1
        users.append({
            "id": r["id"], "name": r["name"],
            "role": r["current_role"] or "Developer", "location": "Global",
            "profile_image": r["profile_image"],
            "projectsBuilt": len(projects), "modulesCompleted": modules_completed,
            "skillsMastered": len(skills),
            "profileViews": r["profile_views"] if "profile_views" in r.keys() else 0,
            "badges": ["Verified"], "isFriend": r["id"] in friend_set,
        })

    trending_skill = max(skill_counter, key=skill_counter.get) if skill_counter else ""
    return {"totalUsers": len(users), "trendingSkill": trending_skill, "users": users}


# ── Friends ───────────────────────────────────
@app.post("/friends/request/{receiver_id}")
def send_request(receiver_id: int, credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    sender = cursor.fetchone()
    if not sender:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    sender_id = sender["id"]

    if sender_id == receiver_id:
        conn.close()
        raise HTTPException(status_code=400, detail="Cannot send request to yourself")

    cursor.execute(
        "SELECT * FROM friend_requests WHERE ((sender_id=%s AND receiver_id=%s) OR (sender_id=%s AND receiver_id=%s)) AND status IN ('pending', 'accepted')",
        (sender_id, receiver_id, receiver_id, sender_id),
    )
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Request already sent")

    cursor.execute(
        "INSERT INTO friend_requests (sender_id, receiver_id, created_at) VALUES (%s, %s, %s)",
        (sender_id, receiver_id, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return {"message": "Request sent"}


@app.get("/friends/requests")
def get_requests(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    user_id = cursor.fetchone()["id"]
    cursor.execute(
        "SELECT fr.id, u.id as sender_id, u.name, u.profile_image FROM friend_requests fr JOIN users u ON fr.sender_id = u.id WHERE fr.receiver_id=%s AND fr.status='pending'",
        (user_id,),
    )
    requests = cursor.fetchall()
    conn.close()
    return [dict(r) for r in requests]


@app.post("/friends/respond/{request_id}")
def respond_request(request_id: int, action: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    user_id = cursor.fetchone()["id"]
    cursor.execute("SELECT receiver_id FROM friend_requests WHERE id=%s", (request_id,))
    req = cursor.fetchone()
    if not req:
        conn.close()
        raise HTTPException(status_code=404, detail="Request not found")
    if req["receiver_id"] != user_id:
        conn.close()
        raise HTTPException(status_code=403, detail="Not allowed")
    status = "accepted" if action == "accept" else "rejected"
    cursor.execute("UPDATE friend_requests SET status=%s WHERE id=%s", (status, request_id))
    conn.commit()
    conn.close()
    return {"message": f"Request {status}"}


@app.get("/friends")
def get_friends(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    user_id = cursor.fetchone()["id"]
    cursor.execute(
        "SELECT u.id, u.name, u.profile_image FROM friend_requests fr JOIN users u ON (u.id = fr.sender_id OR u.id = fr.receiver_id) WHERE fr.status='accepted' AND (fr.sender_id=%s OR fr.receiver_id=%s) AND u.id != %s",
        (user_id, user_id, user_id),
    )
    friends = cursor.fetchall()
    conn.close()
    return [dict(f) for f in friends]


@app.delete("/friends/remove/{user_id}")
def remove_friend(user_id: int, credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    current_user_id = cursor.fetchone()["id"]
    cursor.execute(
        "DELETE FROM friend_requests WHERE status='accepted' AND ((sender_id=%s AND receiver_id=%s) OR (sender_id=%s AND receiver_id=%s))",
        (current_user_id, user_id, user_id, current_user_id),
    )
    conn.commit()
    conn.close()
    return {"message": "Friend removed"}


# ── Feed ──────────────────────────────────────
@app.post("/feed/create")
async def create_post(
    content: str = Form(""),
    tags: str = Form("[]"),
    file: UploadFile = File(None),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    email = verify_token(credentials.credentials)
    image_path = None
    if file:
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        path = os.path.join("uploads", filename)
        with open(path, "wb") as f:
            f.write(await file.read())
        image_path = f"/uploads/{filename}"
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO feed_posts (user_email, content, type, tags, image, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
        (email, content, "POST", tags, image_path, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return {"message": "Post created"}


@app.get("/feed")
def get_feed(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT f.*, u.name, u.profile_image FROM feed_posts f JOIN users u ON f.user_email = u.email ORDER BY f.created_at DESC")
    posts = cursor.fetchall()
    result = []
    for p in posts:
        cursor.execute("SELECT COUNT(*) FROM post_likes WHERE post_id=%s", (p["id"],))
        likes = cursor.fetchone()[0]
        cursor.execute("SELECT 1 FROM post_likes WHERE post_id=%s AND user_email=%s", (p["id"], email))
        liked = cursor.fetchone() is not None
        cursor.execute("SELECT COUNT(*) FROM post_comments WHERE post_id=%s", (p["id"],))
        comments = cursor.fetchone()[0]
        result.append({
            "id": p["id"], "content": p["content"], "image": p["image"],
            "type": p["type"], "tags": json.loads(p["tags"]) if p["tags"] else [],
            "created_at": p["created_at"], "likes": likes, "liked": liked, "comments": comments,
            "author": {"name": p["name"], "avatar": p["profile_image"] or "👤", "email": p["user_email"]},
        })
    conn.close()
    return {"posts": result}


@app.post("/feed/like/{post_id}")
def like_post(post_id: int, credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM post_likes WHERE post_id=%s AND user_email=%s", (post_id, email))
    if cursor.fetchone():
        cursor.execute("DELETE FROM post_likes WHERE post_id=%s AND user_email=%s", (post_id, email))
        liked = False
    else:
        cursor.execute("INSERT INTO post_likes (post_id, user_email) VALUES (%s, %s)", (post_id, email))
        liked = True
    cursor.execute("SELECT COUNT(*) FROM post_likes WHERE post_id=%s", (post_id,))
    likes = cursor.fetchone()[0]
    conn.commit()
    conn.close()
    return {"liked": liked, "likes": likes}


@app.post("/feed/comment/{post_id}")
def add_comment(post_id: int, data: AddComment, credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO post_comments (post_id, user_email, comment, created_at) VALUES (%s, %s, %s, %s)",
        (post_id, email, data.comment, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return {"message": "Comment added"}


@app.delete("/feed/comment/{comment_id}")
def delete_comment(comment_id: int, credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT user_email FROM post_comments WHERE id=%s", (comment_id,))
    comment = cursor.fetchone()
    if not comment:
        conn.close()
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment["user_email"] != email:
        conn.close()
        raise HTTPException(status_code=403, detail="Not allowed")
    cursor.execute("DELETE FROM post_comments WHERE id=%s", (comment_id,))
    conn.commit()
    conn.close()
    return {"message": "Comment deleted"}


@app.delete("/feed/post/{post_id}")
def delete_post(post_id: int, credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT user_email FROM feed_posts WHERE id=%s", (post_id,))
    post = cursor.fetchone()
    if not post:
        conn.close()
        raise HTTPException(status_code=404, detail="Post not found")
    if post["user_email"] != email:
        conn.close()
        raise HTTPException(status_code=403, detail="Not allowed")
    cursor.execute("DELETE FROM post_likes WHERE post_id=%s", (post_id,))
    cursor.execute("DELETE FROM post_comments WHERE post_id=%s", (post_id,))
    cursor.execute("DELETE FROM feed_posts WHERE id=%s", (post_id,))
    conn.commit()
    conn.close()
    return {"message": "Post deleted"}


@app.get("/feed/comments/{post_id}")
def get_comments(post_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT c.*, u.name, u.profile_image FROM post_comments c JOIN users u ON c.user_email = u.email WHERE c.post_id=%s ORDER BY c.created_at DESC",
        (post_id,),
    )
    comments = cursor.fetchall()
    conn.close()
    return {"comments": [dict(c) for c in comments]}


# ── Messages ──────────────────────────────────
@app.post("/messages/send")
async def send_message(
    receiver_id: int = Form(...),
    message: str = Form(""),
    file: UploadFile = File(None),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    sender = cursor.fetchone()
    if not sender:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    sender_id = sender["id"]

    cursor.execute("SELECT id FROM users WHERE id=%s", (receiver_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Receiver not found")

    if sender_id == receiver_id:
        conn.close()
        raise HTTPException(status_code=400, detail="You cannot message yourself")

    cursor.execute(
        "SELECT * FROM friend_requests WHERE status='accepted' AND ((sender_id=%s AND receiver_id=%s) OR (sender_id=%s AND receiver_id=%s))",
        (sender_id, receiver_id, receiver_id, sender_id),
    )
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=403, detail="You can only message friends")

    if not message and not file:
        conn.close()
        raise HTTPException(status_code=400, detail="Message or file required")

    file_url = file_type = file_name = None
    if file:
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")
        allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf", "video/mp4", "audio/mpeg"]
        if file.content_type not in allowed:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        ext = file.filename.split(".")[-1].lower()
        if ext not in ["png", "jpg", "jpeg", "pdf", "mp4", "mp3"]:
            raise HTTPException(status_code=400, detail="Invalid file extension")
        filename = f"{uuid.uuid4()}.{ext}"
        with open(os.path.join("uploads", filename), "wb") as f:
            f.write(contents)
        file_url = f"/uploads/{filename}"
        file_type = file.content_type
        file_name = file.filename

    cursor.execute(
        "INSERT INTO direct_messages (sender_id, receiver_id, message, file_url, file_type, file_name, created_at, is_read) VALUES (%s, %s, %s, %s, %s, %s, %s, 0)",
        (sender_id, receiver_id, message, file_url, file_type, file_name, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return {"message": "sent successfully", "data": {"receiver_id": receiver_id, "text": message, "file": file_url}}


@app.get("/messages/inbox")
def get_inbox(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    user_id = cursor.fetchone()["id"]

    cursor.execute(
        "SELECT CASE WHEN sender_id=%s THEN receiver_id ELSE sender_id END as other_user_id, MAX(created_at) as last_time FROM direct_messages WHERE sender_id=%s OR receiver_id=%s GROUP BY other_user_id ORDER BY last_time DESC",
        (user_id, user_id, user_id),
    )
    rows = cursor.fetchall()
    conversations = []

    for r in rows:
        other_id = r["other_user_id"]
        cursor.execute("SELECT id, name, profile_image FROM users WHERE id=%s", (other_id,))
        user_data = cursor.fetchone()
        cursor.execute(
            "SELECT sender_id, message, file_url, file_type FROM direct_messages WHERE (sender_id=%s AND receiver_id=%s AND deleted_for_sender=0) OR (sender_id=%s AND receiver_id=%s AND deleted_for_receiver=0) ORDER BY created_at DESC LIMIT 1",
            (user_id, other_id, other_id, user_id),
        )
        last_msg = cursor.fetchone()
        if not last_msg:
            continue
        cursor.execute("SELECT COUNT(*) FROM direct_messages WHERE sender_id=%s AND receiver_id=%s AND is_read=0", (other_id, user_id))
        unread_count = cursor.fetchone()[0]
        conversations.append({
            "user_id": user_data["id"], "name": user_data["name"],
            "profile_image": user_data["profile_image"] or "",
            "last_message": last_msg["message"] if last_msg["message"] else f"📎 {last_msg['file_type'] or 'File'}",
            "last_sender_id": last_msg["sender_id"], "unread_count": unread_count,
        })

    conn.close()
    return conversations


@app.delete("/messages/conversation/{user_id}")
def delete_conversation(user_id: int, credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    current_user_id = cursor.fetchone()["id"]
    cursor.execute(
        """UPDATE direct_messages SET
           deleted_for_sender = CASE WHEN sender_id=%s THEN 1 ELSE deleted_for_sender END,
           deleted_for_receiver = CASE WHEN receiver_id=%s THEN 1 ELSE deleted_for_receiver END
           WHERE (sender_id=%s AND receiver_id=%s) OR (sender_id=%s AND receiver_id=%s)""",
        (current_user_id, current_user_id, current_user_id, user_id, user_id, current_user_id),
    )
    conn.commit()
    conn.close()
    return {"message": "Conversation deleted"}


@app.delete("/messages/{message_id}")
def delete_message(
    message_id: int,
    delete_for_everyone: bool = False,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    user_id = cursor.fetchone()["id"]
    cursor.execute("SELECT sender_id, receiver_id, file_url FROM direct_messages WHERE id=%s", (message_id,))
    msg = cursor.fetchone()
    if not msg:
        conn.close()
        raise HTTPException(status_code=404, detail="Message not found")

    if delete_for_everyone and user_id == msg["sender_id"]:
        cursor.execute("UPDATE direct_messages SET deleted_for_sender=1, deleted_for_receiver=1 WHERE id=%s", (message_id,))
        if msg["file_url"]:
            file_path = msg["file_url"].replace("/uploads/", "uploads/")
            if os.path.exists(file_path):
                os.remove(file_path)
    elif user_id == msg["sender_id"]:
        cursor.execute("UPDATE direct_messages SET deleted_for_sender=1 WHERE id=%s", (message_id,))
    elif user_id == msg["receiver_id"]:
        cursor.execute("UPDATE direct_messages SET deleted_for_receiver=1 WHERE id=%s", (message_id,))
    else:
        conn.close()
        raise HTTPException(status_code=403, detail="Not allowed")

    conn.commit()
    conn.close()
    return {"message": "deleted"}


@app.get("/messages/{user_id}")
def get_messages(user_id: int, credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    current_user_id = cursor.fetchone()["id"]
    if current_user_id == user_id:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid conversation")
    cursor.execute("UPDATE direct_messages SET is_read=1 WHERE sender_id=%s AND receiver_id=%s", (user_id, current_user_id))
    cursor.execute(
        "SELECT dm.*, u.profile_image, u.name as sender_name FROM direct_messages dm JOIN users u ON dm.sender_id = u.id WHERE (dm.sender_id=%s AND dm.receiver_id=%s AND dm.deleted_for_sender=0) OR (dm.sender_id=%s AND dm.receiver_id=%s AND dm.deleted_for_receiver=0) ORDER BY dm.created_at ASC",
        (current_user_id, user_id, user_id, current_user_id),
    )
    messages = cursor.fetchall()
    conn.commit()
    conn.close()
    return [dict(m) for m in messages]


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
