import os
import base64
from typing import List , Literal
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

class WeakLineFeedback(BaseModel):
    weak_line: str = Field(description="The weakest or poorly written line from the resume")
    improved_version: str = Field(description="AI suggested improved version of that line")

class MarketReadiness(BaseModel):
    score:int = Field(description="Percentage Readiness of User")
    market_readiness:Literal['Very Low','Low','Medium','High','Very High'] = Field(description="User's Overall Job Market Readiness")
    key_strengths: List[str] = Field(description="Top professional strengths found")
    critical_gaps: List[str] = Field(description="Major missing qualifications")
    missing_keywords: List[str] = Field(description="Specific technical terms missing")
    weakest_line: WeakLineFeedback = Field(
        description="Weakest resume line along with improved AI suggestions"
    )
    skills: List[str] = Field(description="List of skills found in Resume")
    projects: List[str] = Field(description="List of projects found in resume")
    certifications: List[str] = Field(description="List certifications found in resume")

structured_llm = llm.with_structured_output(MarketReadiness)

def analyze_resume_direct(pdf_path: str, target_role: str):
    with open(pdf_path, "rb") as f:
        pdf_data = base64.b64encode(f.read()).decode("utf-8")

    message = HumanMessage(
        content=[
            {
                "type": "text", 
                "text": f"Analyze this resume against the target role: {target_role}. "
                        """You are an expert resume evaluator and technical hiring advisor.

Your task is to analyze a user's resume and produce a structured evaluation of their job market readiness. Carefully read the resume content and return an analysis that matches the provided schema exactly.

Evaluation Rules:

1. Score (0–100)

* Estimate the user's overall job market readiness.
* 0–30 → Very weak resume
* 31–50 → Early stage candidate
* 51–70 → Moderate readiness
* 71–85 → Strong candidate
* 86–100 → Highly competitive candidate

2. Market Readiness Category
   Assign the category based on the score:

* Low → score ≤ 50
* Medium → score between 51 and 75
* High → score > 75

3. Key Strengths
   List the strongest aspects of the resume. These could include:

* technical skills
* notable projects
* internships or experience
* certifications
  Return 3–5 concise strengths.

4. Critical Gaps
   Identify the most important weaknesses preventing the candidate from being competitive. Examples:

* lack of real projects
* missing internships
* weak technical depth
* missing system design knowledge

Return 3–5 clear gaps.

5. Missing Keywords
   List important industry or ATS keywords that should ideally appear in the resume but are missing.

Examples:

* cloud platforms
* CI/CD
* distributed systems
* Kubernetes

Return 8–10 relevant keywords.

6. Weakest Resume Line
   Identify the single weakest or most poorly written line in the resume and provide a significantly improved version.

The improved version must:

* be more specific
* include measurable impact when possible
* sound professional and achievement-oriented

7. Skills
   Extract the skills explicitly mentioned in the resume.
   Do NOT invent skills that are not present.

8. Projects
   Extract the project titles or project descriptions mentioned in the resume.

9. Certifications
   Extract any certifications listed in the resume.

Important Constraints:

* Only use information present in the resume.
* Do NOT hallucinate experience, projects, or certifications.
* Keep lists concise and relevant.
* Ensure the output strictly matches the schema.
* The evaluation must be objective and realistic.

You will be provided with the user's resume content. Analyze it and produce the structured evaluation.
"""
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
    print(f"Key Strengths: {', '.join(report['key_strengths'])}")
    print(f"Critical Gaps: {', '.join(report['critical_gaps'])}")
    print(f"Missing Keywords: {', '.join(report['missing_keywords'])}")
    print(f"AI Suggestion: {report['weakest_line']}")