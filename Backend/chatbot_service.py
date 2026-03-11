from chatbot import PersistentChatbot

bot = PersistentChatbot()

sessions = {}

def get_user_session(user_id: str):
    if user_id not in sessions:
        sessions[user_id] = bot.generate_session_id()
    return sessions[user_id]

def ask_bot(user_id: str, message: str):
    session_id = get_user_session(user_id)
    return bot.ask(message, session_id=session_id)