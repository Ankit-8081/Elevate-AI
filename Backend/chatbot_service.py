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
    # 1. Fetch user profile (Your existing logic)
    cursor.execute(
        "SELECT username, market_readiness, skills FROM users WHERE email = ?",
        (user_email,)
    )
    user = cursor.fetchone()

    if user:
        name, readiness, skills = user
        skills = json.loads(skills) if skills else []
    else:
        name, readiness, skills = "User", "Unknown", []

    # 2. Format the context (Keep it clean)
    user_context = f"Name: {name}, Readiness: {readiness}, Skills: {', '.join(skills)}"

    # 3. PASS THE RAW MESSAGE
    # Don't wrap the message in a 'full_prompt' string anymore. 
    # Let the PersistentChatbot handle the prompt template.
    response = bot.ask(
        query=message, 
        session_id=user_email, 
        user_context=user_context
    )

    return response