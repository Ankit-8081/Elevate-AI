from chatbot import PersistentChatbot
import json
bot = PersistentChatbot()

sessions = {}

def get_user_session(user_id: str):
    if user_id not in sessions:
        sessions[user_id] = bot.generate_session_id()
    return sessions[user_id]

import sqlite3

conn = sqlite3.connect("users.db", check_same_thread=False)
cursor = conn.cursor()

def ask_bot(user_email: str, message: str):

    # fetch user profile
    cursor.execute(
        "SELECT username, market_readiness, skills FROM users WHERE email = ?",
        (user_email,)
    )

    user = cursor.fetchone()

    if user:
        name, readiness, skills = user
        skills = json.loads(skills) if skills else []
    else:
        name = "User"
        readiness = "Unknown"
        skills = []

    # build context for LLM
    context = f"""
User Profile:
Name: {name}
Market Readiness: {readiness}
Skills: {", ".join(skills) if skills else "None"}

Use this information to personalize your advice.
"""

    full_prompt = f"""
{context}

User Question:
{message}
"""

    response = bot.ask(full_prompt, session_id=user_email)

    return response