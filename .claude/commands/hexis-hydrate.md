# /hexis-hydrate

Query Hexis project memory for context on a topic. Useful at the start of a session to understand current project state.

Usage:
```
/hexis-hydrate "What is the current architecture?"
/hexis-hydrate "What were the recent bug fixes?"
/hexis-hydrate "What are the active goals?"
```

This runs the following Python:
```python
import asyncio
from hexis_code_api import HexisAPI

async def main():
    async with HexisAPI() as api:
        # Get context for your query
        context = await api.hydrate(
            "{query}",
            memory_limit=10,
            include_identity=True,
            include_worldview=True,
            include_goals=True,
            include_drives=True
        )

        # Display results
        print("=== HYDRATED PROJECT CONTEXT ===\n")

        if context.get('memories'):
            print(f"Relevant Memories ({len(context['memories'])}):")
            for mem in context['memories'][:5]:
                print(f"  - [{mem.type}] {mem.content[:80]}...")

        if context.get('identity'):
            print(f"\nProject Identity:")
            for aspect in context['identity']:
                print(f"  - {aspect.get('type', 'unknown')}: {str(aspect.get('content', ''))[:60]}...")

        if context.get('goals'):
            print(f"\nActive Goals:")
            for goal in context['goals'][:3]:
                print(f"  - {goal.get('title', 'Untitled')} ({goal.get('priority')})")

        print("\n=== END CONTEXT ===")

asyncio.run(main())
```

**Tips:**
- Run this at the start of a session to prime your context
- Ask specific questions: "How do we handle [problem]?" works better than "Tell me everything"
- Results are ranked by relevance - most useful items appear first
