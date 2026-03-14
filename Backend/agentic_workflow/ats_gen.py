import os
import json
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field 
from langchain_core.prompts import ChatPromptTemplate
from typing import List

load_dotenv()

class ATSOutput(BaseModel):
    score: int = Field(..., description="Overall match score from 0-100")
    relevant_experience_years: float
    matched_skills: List[str]
    missing_skills: List[str]
    explanation: str = Field(..., description="Summary of strengths and gaps")
    decision: str = Field(..., description="Either 'Proceed', 'Review', or 'Reject'")


model = ChatGroq(model="llama-3.1-8b-instant", temperature=0.7 , api_key=os.getenv("GROQ_API_KEY"))
structured_llm = model.with_structured_output(ATSOutput)

system_prompt = """You are an expert Technical Recruiter and ATS (Applicant Tracking System) Analyzer. Your role is to perform a high-precision comparison between a Job Description (JD) and a Candidate Resume.

### Evaluation Logic:
1. Score (0-100): 
   - 0-40: Missing core technical requirements or vastly under-experienced.
   - 41-70: Matches some skills but lacks the required seniority or niche tools.
   - 71-90: Strong match; possesses almost all "Must-Have" skills and correct seniority.
   - 91-100: Exceptional match; exceeds requirements and shows specific industry achievements.

2. Relevant Experience (Years): 
   - Calculate the total years of experience specifically related to the JD. 
   - Deduct time for overlapping roles. 
   - If a role is unrelated to the JD, do not count those years toward this total.

3. Skill Extraction:
   - Matched Skills: List only technical and soft skills explicitly mentioned in both the JD and the Resume.
   - Missing Skills: Identify critical keywords/tools mentioned in the JD that are absent from the resume.

4. Decision Logic:
   - Proceed: Score > 80 AND meets minimum years of experience.
   - Review: Score 60-80 OR has high skills but slightly less experience than requested.
   - Reject: Score < 60 OR lacks mandatory "Knockout" certifications/degrees.

### Output Constraints:
- Be objective and clinical. 
- Do not give the candidate the "benefit of the doubt"; if a skill isn't written, they don't have it.
- Ensure the 'explanation' is a concise executive summary (3-4 sentences).
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "Job Description:\n{job_description}\n\nCandidate Resume:\n{candidate_resume}\n\nPlease provide your analysis.")
])

chain = prompt | structured_llm

def get_ats_score(resume_text: str, job_description: str) -> ATSOutput:
    """
    Analyzes a resume against a job description and returns an ATSOutput object.
    """
    result = chain.invoke({
        "job_description": job_description, 
        "candidate_resume": resume_text
    })
    return result 
