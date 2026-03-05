import os
import json
import asyncio
from typing import Annotated, List, Dict, Any, TypedDict
from langchain_community.tools.tavily_search import TavilySearchResults
from langgraph.graph import StateGraph, START, END
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq

# 1. Configuration & Clients
llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model = "llama-3.1-8b-instant",
    temperature=0.3
)

web_search_tool = TavilySearchResults(k=3)

# 2. State Definition
class RoadmapState(TypedDict):
    bookmarked_jobs: List[Dict[str, Any]]
    user_skills: List[str]
    current_job_index: int
    job_analysis: Dict[str, Any]
    roadmaps: Dict[str, List[Dict[str, Any]]]
    final_output: Dict[str, Any]

# 3. Helper Functions
async def fetch_learning_resources(skill: str):
    try:
        query = f"best courses tutorials learn {skill} 2025"
        results = await web_search_tool.ainvoke(query)
        resources = []
        for res in results:
            resources.append({
                "title": res['content'][:60] + "...",
                "url": res['url'],
                "description": res['content'][:150]
            })
        return resources
    except Exception as e:
        print(f"Error fetching resources for {skill}: {e}")
        return []

def create_fallback_roadmap(job: Dict, analysis: Dict):
    skill_gaps = analysis.get("skill_gaps", [])
    if not skill_gaps:
        return [{
            "step": 1,
            "title": "Advanced Development",
            "description": f"Mastering {job['title']} deep dives.",
            "estimatedDuration": "2 months",
            "skills": analysis.get("required_skills", [])[:3],
            "resources": [{"title": "Portfolio building", "url": "https://github.com"}]
        }]
    
    return [{
        "step": i + 1,
        "title": f"Learn {skill}",
        "description": f"Bridge the gap in {skill} for {job['title']}",
        "estimatedDuration": "1 month",
        "skills": [skill],
        "resources": [{"title": f"{skill} Search", "url": f"https://google.com/search?q={skill}"}]
    } for i, skill in enumerate(skill_gaps[:5])]

# 4. Nodes (Graph Logic)
async def analyze_job_requirements(state: RoadmapState):
    jobs = state["bookmarked_jobs"]
    idx = state["current_job_index"]
    
    if idx >= len(jobs):
        return state

    current_job = jobs[idx]
    prompt = f"""
    Analyze job: {current_job['title']} at {current_job['company']}.
    Return JSON only: {{"required_skills": [], "nice_to_have": []}}
    """
    
    response = await llm.ainvoke([
        ("system", "You are a job analyst. Return valid JSON."),
        ("user", prompt)
    ])

    try:
        # Simple cleanup in case of markdown blocks
        clean_content = response.content.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean_content)
    except:
        parsed = {"required_skills": [], "nice_to_have": []}

    req_skills = parsed.get("required_skills", [])
    user_skills_lower = [s.lower() for s in state["user_skills"]]
    
    skill_gaps = [
        s for s in req_skills 
        if not any(us in s.lower() or s.lower() in us for us in user_skills_lower)
    ]

    analysis = {
        "job_id": current_job.get("jobId"),
        "required_skills": req_skills,
        "skill_gaps": skill_gaps,
        "matching_skills": [s for s in req_skills if s not in skill_gaps]
    }
    
    return {**state, "job_analysis": analysis}

async def generate_job_roadmap(state: RoadmapState):
    job = state["bookmarked_jobs"][state["current_job_index"]]
    analysis = state["job_analysis"]
    
    prompt = f"Create a learning roadmap for {job['title']} focusing on these gaps: {analysis['skill_gaps']}. Return JSON array."
    
    response = await llm.ainvoke([
        ("system", "Expert career coach. Return ONLY a JSON array of steps."),
        ("user", prompt)
    ])

    try:
        clean_content = response.content.replace("```json", "").replace("```", "").strip()
        roadmap_array = json.loads(clean_content)
    except:
        roadmap_array = create_fallback_roadmap(job, analysis)

    # Attach resources to steps
    for step in roadmap_array:
        skills_to_search = step.get("skills", [])[:2]
        all_res = []
        for s in skills_to_search:
            res = await fetch_learning_resources(s)
            all_res.extend(res)
        step["resources"] = all_res[:4]

    updated_roadmaps = state["roadmaps"].copy()
    updated_roadmaps[job.get("jobId")] = roadmap_array
    
    return {**state, "roadmaps": updated_roadmaps}

def should_process_next_job(state: RoadmapState):
    if state["current_job_index"] < len(state["bookmarked_jobs"]) - 1:
        return "continue"
    return "end"

async def increment_index(state: RoadmapState):
    return {**state, "current_job_index": state["current_job_index"] + 1}

async def finalize_output(state: RoadmapState):
    return {**state, "final_output": state["roadmaps"]}

# 5. Build the Graph
workflow = StateGraph(RoadmapState)

workflow.add_node("analyze", analyze_job_requirements)
workflow.add_node("generate", generate_job_roadmap)
workflow.add_node("increment", increment_index)
workflow.add_node("finalize", finalize_output)

workflow.add_edge(START, "analyze")
workflow.add_edge("analyze", "generate")
workflow.add_edge("generate", "increment")

workflow.add_conditional_edges(
    "increment",
    should_process_next_job,
    {
        "continue": "analyze",
        "end": "finalize"
    }
)
workflow.add_edge("finalize", END)

app = workflow.compile()