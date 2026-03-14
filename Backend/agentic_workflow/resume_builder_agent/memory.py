from typing import Dict, List

class MemoryStore:
    def __init__(self):
        self.store: Dict[str, List[dict]] = {}

    def get(self, session_id: str):
        return self.store.get(session_id, [])

    def append(self, session_id: str, messages: List[dict]):
        if session_id not in self.store:
            self.store[session_id] = []
        self.store[session_id].extend(messages)

memory_store = MemoryStore()