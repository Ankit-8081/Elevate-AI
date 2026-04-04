from langgraph.graph import StateGraph, START, END
from typing import List, Dict, TypedDict, Annotated
from operator import add
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0
)

SYSTEM_PROMPT = """You are an expert resume designer and HTML developer.

Your task is to convert the user's resume data into a clean, professional, single-page resume using HTML and inline CSS.

Requirements:

The resume must fit within a single A4 page when exported or printed.
Use clean and minimal styling suitable for professional resumes.
Use semantic HTML structure (sections, headings, lists).
Keep the layout well aligned and visually balanced.
Use clear sections for:
Use bullet points for experience and projects if any.
Ensure the resume is ATS-friendly:
Avoid complex graphics
Avoid tables unless necessary
Use readable fonts (Arial, Helvetica, or similar).
Keep spacing tight so the content fits neatly on one page without looking crowded.
The name should appear prominently at the top.

Output Rules:

Return only the complete HTML code.
Include inline CSS styling inside a
<style>

tag.
Do not include explanations or comments outside the HTML.
The HTML must be ready to render in a browser and printable to PDF.
The user will provide structured resume data. Convert it into a professional single-page HTML resume."""
class ResumeState(TypedDict):
    messages: Annotated[List[dict], add]
    user_input: Dict


def generate_html_code(state: ResumeState):
    messages = state["messages"]
    user_data = state["user_input"]
    messages = messages + [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"Generate a resume using this data:\n{user_data}"
        }
    ]
    response = llm.invoke(messages)
    return {
        "messages": [
            {"role": "assistant", "content": response.content}
        ]
    }
def build_graph():
    builder = StateGraph(ResumeState)
    builder.add_node("generate_html_code", generate_html_code)
    builder.add_edge(START, "generate_html_code")
    builder.add_edge("generate_html_code", END)
    return builder.compile()