import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import re 
import cv2
import tempfile
import base64
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

load_dotenv()

model = ChatGroq(
    model="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
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

    text = response.content

    score_match = re.search(r"Score:\s*(\d+)", text)

    score = int(score_match.group(1)) if score_match else 50

    return {
        "analysis": text,
        "score": score
    }


vision_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0
)

def analyze_video(video_bytes):

    # save temporary video
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(video_bytes)
        video_path = tmp.name

    cap = cv2.VideoCapture(video_path)

    frames = []
    frame_count = 0

    # extract a few frames
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # take 1 frame every 30 frames
        if frame_count % 30 == 0:
            _, buffer = cv2.imencode(".jpg", frame)
            frames.append(base64.b64encode(buffer).decode("utf-8"))

        frame_count += 1

        if len(frames) >= 5:
            break

    cap.release()

    media_inputs = [
        {
            "type": "text",
            "text": """
You are an expert interview coach.

Analyze the candidate's interview posture and body language
from these frames.

Evaluate:

1. Confidence level
2. Eye contact with camera
3. Posture
4. Nervous habits
5. Professional presence

Return:

Confidence:
Eye Contact:
Body Language:
Posture:
Suggestions:
"""
        }
    ]

    for frame in frames:
        media_inputs.append({
            "type": "media",
            "mime_type": "image/jpeg",
            "data": frame
        })

    message = HumanMessage(content=media_inputs)

    response = vision_llm.invoke([message])

    return response.content