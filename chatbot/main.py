import os
import random
import string
from datetime import datetime
from typing import Optional
from operator import itemgetter

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, trim_messages, BaseMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableWithMessageHistory, RunnablePassthrough
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory

load_dotenv()

class PersistentChatbot:
    def __init__(self, model_name: str = "llama-3.3-70b-versatile", max_tokens: int = 100):
        self.model = ChatGroq(
            model=model_name,
            groq_api_key=os.getenv("GROQ_API_KEY")
        )
        self._store = {}
        self.trimmer = trim_messages(
            max_tokens=max_tokens,
            strategy="last",
            token_counter=self.model,
            include_system=True,
            allow_partial=False,
            start_on="human"
        )
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful assistant. Answer questions in {language}."),
            MessagesPlaceholder(variable_name="messages"),
        ])       
        core_chain = (
            RunnablePassthrough.assign(messages=itemgetter("messages") | self.trimmer)
            | self.prompt
            | self.model
        )        
        self.chain_with_history = RunnableWithMessageHistory(
            core_chain,
            self._get_session_history,
            input_messages_key="messages",
        )

    def _get_session_history(self, session_id: str) -> BaseChatMessageHistory:
        """Internal method to fetch/create session store."""
        if session_id not in self._store:
            self._store[session_id] = ChatMessageHistory()
        return self._store[session_id]

    @staticmethod
    def generate_session_id(prefix: str = "chat") -> str:
        """Utility to generate a unique session ID."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
        return f"{prefix}_{timestamp}_{random_str}"

    def ask(self, query: str, session_id: str, language: str = "English") -> str:
        """The primary interface for the user to interact with the bot."""
        config = {"configurable": {"session_id": session_id}}
        input_data = {
            "messages": [HumanMessage(content=query)],
            "language": language
        }
        response = self.chain_with_history.invoke(input_data, config=config)
        return response.content

# --- 7. USAGE EXAMPLE ---

# Initialize the Chatbot Instance once
bot = PersistentChatbot()

# Create a session for a specific user
my_session = bot.generate_session_id()

# Interactions
print("AI:", bot.ask("Hi! My name is Prateek.", session_id=my_session))
print("AI:", bot.ask("What is my name?", session_id=my_session))
print("AI:", bot.ask("Comment ça va?", session_id=my_session, language="French"))