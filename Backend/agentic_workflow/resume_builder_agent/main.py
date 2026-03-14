from agentic_workflow.resume_builder_agent.builder import build_graph
from agentic_workflow.resume_builder_agent.memory import memory_store

graph = build_graph()

def generate_resume(session_id: str, resume_data: dict):
    messages = memory_store.get(session_id)
    result = graph.invoke({
        "messages": messages,
        "user_input": resume_data
    })
    memory_store.append(session_id, result["messages"])
    return result["messages"][-1]["content"]