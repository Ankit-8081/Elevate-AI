import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

model = ChatGroq(
    model="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ-API-KEY")
)

question_prompt = ChatPromptTemplate.from_template(
"""
You are a senior FAANG interviewer.

Generate ONE technical interview question.

Role: {role}
Difficulty: {difficulty}

Return only the question.
"""
)

evaluation_prompt = ChatPromptTemplate.from_template(
"""
You are a senior software engineering interviewer.

Question:
{question}

Candidate Answer:
{answer}

Evaluate the answer.

Return in this format:

Score: /100
Technical Depth:
Communication:
Strengths:
Weaknesses:
Improvement Advice:
"""
)

def generate_question(role, difficulty):

    chain = question_prompt | model
    response = chain.invoke({
        "role": role,
        "difficulty": difficulty
    })

    return response.content


def evaluate_answer(question, answer):

    chain = evaluation_prompt | model

    response = chain.invoke({
        "question": question,
        "answer": answer
    })

    return response.content