from pydantic import BaseModel


class InterviewStart(BaseModel):
    role: str
    difficulty: str


class InterviewAnswer(BaseModel):
    question: str
    answer: str