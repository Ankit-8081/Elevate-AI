from typing import TypedDict, List, Optional
from pydantic import BaseModel

class ResumeState(TypedDict):
    raw_latex: str #raw_latex to feed the agent everytime
    sections: dict  # Parsed sections: {'experience': '...', 'skills': '...'}
    user_request: str #to store the user request
    history: List[str]
    current_version: int #current version after the update in Resume
    modified_latex: Optional[str] # Result
    errors: List[str] # for looping for incorrect syntax

class SectionAnalysis(BaseModel):
    section_name: str
    content: str
    action: str # "update", "delete", "add", "none"