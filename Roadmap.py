import os
import json
from typing import List , Literal
from pydantic import BaseModel, Field 
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage , SystemMessage
from langchain_tavily import TavilySearch
load_dotenv()

class Concept(BaseModel):
    title: str = Field(..., description="The name of a specific, technical concept")
    toughness:Literal['Easy','Medium','Hard'] = Field(...,description="Toughness level of the technical concept")
    learning_link: str | None = None # This will be filled by Tavily
    search_query: str = Field(..., description="A specific search query to find a tutorial for this concept")

class LearningRoadmap(BaseModel):
    """Structured curriculum for technical mastery."""
    basic: List[Concept] = Field(..., description="Foundational and prerequisite concepts")
    core: List[Concept] = Field(..., description="Essential day-to-day professional skills")
    advanced: List[Concept] = Field(..., description="Specialized, high-scale, or research-level concepts")

class Roadmap:
    def __init__(self, api_key: str | None = None, model_name: str = "llama-3.3-70b-versatile"):
        actual_key = api_key if api_key is not None else os.getenv("GROQ_API_KEY")
        self.llm = ChatGroq(
            model=model_name,
            api_key=actual_key,
            temperature=0
        )
        self.structured_llm = self.llm.with_structured_output(LearningRoadmap)
        self.tavily = TavilySearch(max_results=1)

    def generate_roadmap(self, topic: str, upper_limit: int = 5):
        """
    Generate a structured learning roadmap for a given technical topic.

    This function uses an LLM to create a roadmap divided into three levels:
    basic, core, and advanced.After generating the roadmap, the function
    queries Tavily search for each concept and attaches a relevant learning
    resource URL.

    Args:
        topic (str):
            The technical domain or subject for which the roadmap should be generated
            (e.g., "Machine Learning", "Operating Systems", "React").

        upper_limit (int, optional):
            Number of concepts to include in each roadmap category
            (basic, core, advanced). Default is 5.

    Returns:
        dict:
            A dictionary representation of the roadmap containing three keys:
            - "basic": List of beginner-level concepts with learning links.
            - "core": List of intermediate/core concepts with learning links.
            - "advanced": List of advanced concepts with learning links.
    """
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are a Technical Educator. Your ONLY task is to generate a structured "
                "learning roadmap using the provided tool. Do not ask follow-up questions. "
                "Limit each category (basic, core, advanced) to exactly {upper_limit} items."
            )),
            ("human", "Generate a mastery roadmap for the following technical domain: {topic}")
        ])

        chain = prompt | self.structured_llm
        response = chain.invoke({
            "topic": topic,
            "upper_limit": upper_limit
        })
        print("Fetching learning links via Tavily")
        for category in ['basic', 'core', 'advanced']:
            concepts = getattr(response,category)
            for concept in concepts:
                search_result = self.tavily.invoke({"query": concept.search_query})
                concept.learning_link =search_result['results'][0]['url']

        return response.model_dump()

#Usage Example - 
R = Roadmap()
print(R.generate_roadmap(topic = "Software Devlopment"))
