import os
import json
import psycopg2
import psycopg2.extras

from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from pydantic import BaseModel
from dotenv import load_dotenv

from fastapi import HTTPException, Depends, APIRouter
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv()

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ─────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    conn.cursor_factory = psycopg2.extras.RealDictCursor
    return conn

# ─────────────────────────────────────────────
# PASSWORD UTILS
# ─────────────────────────────────────────────
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)

# ─────────────────────────────────────────────
# JWT UTILS
# ─────────────────────────────────────────────
def create_token(email: str):
    payload = {
        "user_id": email,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["user_id"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ─────────────────────────────────────────────
# HELPER
# ─────────────────────────────────────────────
def get_next_milestone(roadmap):
    if not roadmap:
        return None
    for stage in roadmap:
        for skill in stage["skills"]:
            if skill["status"] != "Completed":
                return {"stage": stage["title"], "skill": skill["name"]}
    return None

# ─────────────────────────────────────────────
# REQUEST MODELS
# ─────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    linkedin: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# ─────────────────────────────────────────────
# ROUTER
# ─────────────────────────────────────────────
router = APIRouter()

# ── Signup ──────────────────────────────────
@router.post("/signup")
def signup(data: SignupRequest):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = %s", (data.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(data.password)
    today = datetime.utcnow().date().isoformat()

    cursor.execute(
        """
        INSERT INTO users (
            name, username, linkedin, email, password,
            phone, bio, "current_role", "target_role",
            professional_links, created_at, last_active_date,
            learning_streak, login_streak, last_login_date
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            data.name, data.name, data.linkedin, data.email, hashed,
            "", "", "", "",
            json.dumps([]), today, today,
            0, 1, today,
        ),
    )

    conn.commit()
    conn.close()
    return {"message": "User created"}


# ── Login ────────────────────────────────────
@router.post("/login")
def login(data: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, name, username, linkedin, email, password,
               last_active_date, learning_streak, login_streak, last_login_date
        FROM users WHERE email = %s
        """,
        (data.email,),
    )
    user = cursor.fetchone()

    if not user or not verify_password(data.password, user["password"]):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    today = datetime.utcnow().date()
    login_streak = user["login_streak"] or 0
    last_login = user["last_login_date"]

    if last_login:
        last_date = datetime.strptime(last_login, "%Y-%m-%d").date()
        diff = (today - last_date).days
        if diff == 1:
            login_streak += 1
        elif diff > 1:
            login_streak = 1
    else:
        login_streak = 1

    cursor.execute(
        "UPDATE users SET last_login_date=%s, login_streak=%s WHERE email=%s",
        (today.isoformat(), login_streak, user["email"]),
    )
    conn.commit()
    conn.close()

    token = create_token(user["email"])

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "username": user["username"],
            "linkedin": user["linkedin"],
            "email": user["email"],
            "login_streak": login_streak,
        },
    }


# ── Get Current User (/me) ───────────────────
@router.get("/me")
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    resume_analysis = json.loads(user["resume_analysis"]) if user["resume_analysis"] else None
    roadmap = json.loads(user["roadmap"]) if user["roadmap"] else []

    completed_modules = sum(
        1
        for stage in roadmap
        for skill in stage["skills"]
        if skill["status"] == "Completed"
    )
    total_modules = sum(len(stage["skills"]) for stage in roadmap)

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
        "resume_analysis": resume_analysis,
        "professional_links": (
            json.loads(user["professional_links"]) if user["professional_links"] else []
        ),
        "market_readiness": user["market_readiness"],
        "skills": json.loads(user["skills"]) if user["skills"] else [],
        "projects": json.loads(user["projects"]) if user["projects"] else [],
        "certifications": (
            json.loads(user["certifications"]) if user["certifications"] else []
        ),
        "roadmap": roadmap,
        "next_milestone": get_next_milestone(roadmap),
        "modules_completed": completed_modules,
        "modules_total": total_modules,
        "learning_streak": user["learning_streak"],
        "login_streak": user["login_streak"],
    }


# ── Change Password ──────────────────────────
@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    email = verify_token(credentials.credentials)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT password FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(data.current_password, user["password"]):
        conn.close()
        raise HTTPException(status_code=400, detail="Incorrect current password")

    cursor.execute(
        "UPDATE users SET password=%s WHERE email=%s",
        (hash_password(data.new_password), email),
    )
    conn.commit()
    conn.close()

    return {"message": "Password updated successfully"}


# ── Delete Account ───────────────────────────
@router.delete("/profile/delete")
def delete_account(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user["id"]

    # Delete all related data (no FK cascades in schema)
    cursor.execute("DELETE FROM chat_messages WHERE user_email=%s", (email,))
    cursor.execute("DELETE FROM post_likes WHERE user_email=%s", (email,))
    cursor.execute("DELETE FROM post_comments WHERE user_email=%s", (email,))

    # Delete posts + their likes/comments
    cursor.execute("SELECT id FROM feed_posts WHERE user_email=%s", (email,))
    post_ids = [row["id"] for row in cursor.fetchall()]
    for pid in post_ids:
        cursor.execute("DELETE FROM post_likes WHERE post_id=%s", (pid,))
        cursor.execute("DELETE FROM post_comments WHERE post_id=%s", (pid,))
    cursor.execute("DELETE FROM feed_posts WHERE user_email=%s", (email,))

    cursor.execute(
        "DELETE FROM direct_messages WHERE sender_id=%s OR receiver_id=%s",
        (user_id, user_id),
    )
    cursor.execute(
        "DELETE FROM friend_requests WHERE sender_id=%s OR receiver_id=%s",
        (user_id, user_id),
    )
    cursor.execute(
        "DELETE FROM profile_views_log WHERE viewer_id=%s OR viewed_id=%s",
        (user_id, user_id),
    )

    cursor.execute("DELETE FROM users WHERE email=%s", (email,))

    conn.commit()
    conn.close()

    return {"message": "Account deleted successfully"}
