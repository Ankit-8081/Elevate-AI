import os
import json
from typing import List , Literal
from pydantic import BaseModel, Field 
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage , SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_tavily import TavilySearch
load_dotenv()

class Concept(BaseModel):
    title: str = Field(..., description="The name of a specific, technical concept")
    toughness:Literal['Easy','Medium','Hard'] = Field(...,description="Toughness level of the technical concept")
    learning_link: str | None = None # This will be filled by Tavily
    search_query: str = Field(..., description="A specific search query to find a tutorial for this concept")
    learning_time:str = Field(...,description="Learning time to Learn this concept")


class LearningRoadmap(BaseModel):
    """Structured curriculum for technical mastery."""
    basic: List[Concept] = Field(..., description="Foundational and prerequisite concepts")
    core: List[Concept] = Field(..., description="Essential day-to-day professional skills")
    advanced: List[Concept] = Field(..., description="Specialized, high-scale, or research-level concepts")

class TopicValidation(BaseModel):
    is_technical: bool = Field(..., description="Whether the topic is a valid technical or professional domain.")
    corrected_topic: str = Field(..., description="The corrected version of the topic (fixing typos) or a 'N/A'.")
    reason: str = Field(..., description="A short reason why the topic was accepted or rejected.")

class Roadmap:
    def __init__(self, api_key: str | None = None, model_name: str = "openai/gpt-oss-120b"):
        actual_key = api_key if api_key is not None else os.getenv("GROQ_API_KEY")
        self.llm = ChatGroq(model=model_name, temperature=0)
        self.structured_llm = self.llm.with_structured_output(LearningRoadmap)
        self.tavily = TavilySearch(max_results=1)

    def middleware(self, topic: str) -> tuple[bool, str]:
        """Validadates the input of the user before passing to model and Search Engine"""
        validator_llm = self.llm.with_structured_output(TopicValidation)
        
        system_msg = (
    "You are a Technical Domain Verifier. Your only job is to decide if an input "
    "is a field one can study or work in professionally. "
    "\n\nVALID EXAMPLES: 'Software Engineering', 'Python', 'Data Science', 'React', 'DevOps', 'Project Management'."
    "\nINVALID EXAMPLES: 'how to eat', 'I am bored', 'random gibberish', 'asdfghjkl'."
    "\n\nRULES:"
    "\n1. If it is a professional or technical field, set is_technical = True."
    "\n2. Fix minor typos (e.g., 'pythn' -> 'Python')."
    "\n3. Be lenient: if it's even remotely related to technology, engineering, or professional skills, accept it."
)
        
        llm = ChatGroq(model="llama-3.1-8b-instant",api_key=os.getenv("GROQ_API_KEY")) #using lighter model in less workforce step for less cost 
        llm = llm.with_structured_output(TopicValidation)
        check = llm.invoke([
            ("system", system_msg),
            ("human", f"Is '{topic}' a valid domain for a roadmap?")
        ])
        check = check.model_dump()          
        return check['is_technical'], check['corrected_topic']
        
    def generate_roadmap(self, topic: str, experience_level:str,learning_style:str,upper_limit: int = 5):
        #dont call this function , call get_roadmap
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
        
        system_content = (
            "You are a Senior Principal Technical Educator and Curriculum Architect with over 20 years of experience "
            "designing hyper-personalized learning paths for Fortune 500 engineers. Your goal is to construct a "
            "technical roadmap for '{topic}' that feels hand-crafted for the user's specific profile."
            "\n\nCRITICAL CALIBRATION GUIDELINES:"
            "\n1. EXPERIENCE LEVEL ({experience_level}): "
            "   - BEGINNER: Focus on 'The Why' and core mental models. Use analogies. Keep environment setup simple."
            "   - INTERMEDIATE: Focus on 'The How' of production. Emphasize testing, optimization, and common pitfalls."
            "   - ADVANCED: Focus on 'The Edge'. Deep dive into internals, distributed systems, and architectural trade-offs."
            "\n2. LEARNING STYLE ({learning_style}):"
            "   - PROJECT-BASED: Every concept must be tied to a small buildable component or feature."
            "   - THEORY FIRST: Prioritize deep conceptual understanding, whitepapers, and rigorous logic before implementation."
            "   - FAST TRACK: Deliver the 80/20 rule—maximum utility with minimum fluff. Focus on high-impact 'unlocks'."
            "   - DEEP DIVE: Leave no stone unturned. Focus on internals, memory management, and advanced nuances."
            "   - BALANCED: A steady mix of conceptual reading followed by a hands-on lab for every item."
            "\n\nOUTPUT REQUIREMENTS:"
            "\n- You must provide exactly {upper_limit} items per category (Basic, Core, Advanced)."
            "\n- For each concept, generate a 'search_query' designed to find the best documentation or community-vetted resources."
            "\n- Maintain strict technical accuracy. Do not include conversational filler. Strictly output the tool call."
        )
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_content),
            ("human", "Generate a {learning_style} roadmap for a {experience_level} level student in the domain of: {topic}.")
        ])
        chain = prompt | self.structured_llm
        response = chain.invoke({
            "topic": topic, 
            "experience_level": experience_level, 
            "learning_style": learning_style,
            "upper_limit": upper_limit
        })
        print("Fetching learning links via Tavily")
        for category in ['basic', 'core', 'advanced']:
            concepts = getattr(response,category)
            for concept in concepts:
                search_result = self.tavily.invoke({"query": concept.search_query})
                concept.learning_link =search_result['results'][0]['url']

        return response.model_dump()
    
    def get_roadmap(self, topic: str, experience_level: str, learning_style: str, upper_limit: int = 5):
        is_valid, corrected_topic = self.middleware(topic)
        if not is_valid:
            return {"error": f"Topic '{topic}' is not a valid technical domain. Please try again."}

        return self.generate_roadmap(corrected_topic, experience_level, learning_style, upper_limit)


