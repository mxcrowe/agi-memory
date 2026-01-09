# /hexis-log

Log your session work to Hexis project memory for future Claude Code instances to learn from.

Usage:
```
/hexis-log "Fixed race condition in async worker by using asyncio.Lock. See commit abc123"
/hexis-log "Refactored memory retrieval to use pgvector for 10x speedup"
/hexis-log "Learned: Always validate at system boundaries, not in internal functions"
```

This runs:
```python
import asyncio
from hexis_code_api import HexisAPI
from cognitive_memory_api import MemoryInput, MemoryType

async def main():
    content = "{message}"

    async with HexisAPI() as api:
        # Determine memory type based on content
        if any(word in content.lower() for word in ["fixed", "bug", "error", "issue"]):
            memory_type = MemoryType.PROCEDURAL
            importance = 0.85
        elif any(word in content.lower() for word in ["learned", "insight", "realized", "pattern"]):
            memory_type = MemoryType.STRATEGIC
            importance = 0.75
        elif any(word in content.lower() for word in ["session", "worked on", "refactored", "implemented"]):
            memory_type = MemoryType.EPISODIC
            importance = 0.70
        else:
            memory_type = MemoryType.SEMANTIC
            importance = 0.70

        # Store the memory
        memory = MemoryInput(
            content=content,
            memory_type=memory_type,
            importance=importance
        )

        await api.remember(memory)

        print(f"✓ Logged to project memory:")
        print(f"  Type: {memory_type}")
        print(f"  Importance: {importance}")
        print(f"  Content: {content}")

asyncio.run(main())
```

**Tips:**
- Log discoveries and learnings as you work
- Include commit hashes or file references when applicable
- Be specific: "Fixed X by doing Y" vs just "Fixed something"
- Future Claude Code instances will find this and learn from it
- **At session end**, log your accomplishments so context persists
