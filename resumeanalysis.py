import os
import base64
from typing import List
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0
)

class MarketReadiness(BaseModel):
    market_readiness:int = Field(description="Percentage Readiness of User")
    key_strengths: List[str] = Field(description="Top professional strengths found")
    critical_gaps: List[str] = Field(description="Major missing qualifications")
    missing_keywords: List[str] = Field(description="Specific technical terms missing")
    ai_suggestion: str = Field(description="Strategic advice (max 100 words)")

structured_llm = llm.with_structured_output(MarketReadiness)

def analyze_resume_direct(pdf_path: str, target_role: str):
    with open(pdf_path, "rb") as f:
        pdf_data = base64.b64encode(f.read()).decode("utf-8")

    message = HumanMessage(
        content=[
            {
                "type": "text", 
                "text": f"Analyze this resume against the target role: {target_role}. "
                        "Return the key strengths, critical gaps, missing keywords, and a short AI suggestion."
            },
            {
                "type": "media",
                "mime_type": "application/pdf",
                "data": pdf_data
            }
        ]
    )

    # Invoke and return
    return structured_llm.invoke([message])

# --- Execution ---
if __name__ == "__main__":
    PATH = "my_resume.pdf"
    TARGET = "Senior Full Stack Developer"

    print("Sending PDF directly to Gemini...")
    report = analyze_resume_direct(PATH, TARGET)
    report = report.model_dump()
    print("### MARKET READINESS REPORT ###")
    print(f"Market Readiness: " , (report['market_readiness']))
    print(f"Key Strengths: {', '.join(report['key_strengths'])}")
    print(f"Critical Gaps: {', '.join(report['critical_gaps'])}")
    print(f"Missing Keywords: {', '.join(report['missing_keywords'])}")
    print(f"AI Suggestion: {report['ai_suggestion']}")