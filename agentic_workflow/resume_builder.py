from langgraph.graph import StateGraph, START, END
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from typing import List, Dict, Any, TypedDict
import os
from dotenv import load_dotenv
load_dotenv()

