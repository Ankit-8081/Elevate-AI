from chatbot import PersistentChatbot
import json
import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv

load_dotenv()

bot = PersistentChatbot()
sessions = {}

def get_user_session(user_id: str):
    if user_id not in sessions:
        sessions[user_id] = bot.generate_session_id()
    return sessions[user_id]

def get_db():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    conn.cursor_factory = psycopg2.extras.RealDictCursor
    return conn

def ask_bot(user_email: str, message: str):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        'SELECT username, market_readiness, skills FROM users WHERE email = %s',
        (user_email,)
    )
    user = cursor.fetchone()
    conn.close()

    if user:
        name = user["username"]
        readiness = user["market_readiness"]
        skills = json.loads(user["skills"]) if user["skills"] else []
    else:
        name, readiness, skills = "User", "Unknown", []

    user_context = f"Name: {name}, Readiness: {readiness}, Skills: {', '.join(skills)}"

    response = bot.ask(
        query=message,
        session_id=user_email,
        user_context=user_context
    )

    return response