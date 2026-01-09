# Hexis Context for Claude Code

Quick reference for using Hexis project memory in your Claude Code sessions.

## One-Liner Setup

```python
from hexis_code_api import HexisAPI

async with HexisAPI() as api:
    # Your code here
```

## Common Operations

### Get Project Context
```python
# Understand what this project is about
context = await api.hydrate("What is this project's purpose and current state?")
print(context)

# Understand recent work
recent = await api.recall_recent(limit=10)

# Check health
health = await api.get_health()
print(f"Energy: {health['energy']}/{health['max_energy']}")
print(f"Active goals: {health['active_goals']}")
```

### Search for Specific Knowledge
```python
# Find how to do something
procedures = await api.recall("How do we handle async database connections?", limit=5)

# Find related decisions
architectural = await api.recall("Database-first architecture", limit=10)

# Find what contradicts what we thought
contradictions = await api.find_contradictions(limit=5)
```

### Store What You Learn
```python
from cognitive_memory_api import MemoryInput, MemoryType

# After fixing a bug
await api.remember(MemoryInput(
    content="Fixed [problem]: [solution]. See commit [hash].",
    memory_type=MemoryType.PROCEDURAL,
    importance=0.8  # 0-1 scale
))

# After learning architecture
await api.remember(MemoryInput(
    content="Key insight about how the system works...",
    memory_type=MemoryType.SEMANTIC,
    importance=0.85
))
```

### Understand Project Goals
```python
# What are we trying to achieve?
goals = await api.get_goals()
for goal in goals:
    print(f"- {goal['title']} (priority: {goal['priority']})")

# What drives current work?
drives = await api.get_drives()
```

### Connect Ideas
```python
# Show that memory A influenced memory B
await api.connect(
    MemoryInput(memory_id_a),
    MemoryInput(memory_id_b),
    RelationshipType.CAUSES
)
```

## Import Reference

```python
from cognitive_memory_api import (
    MemoryType,      # EPISODIC, SEMANTIC, PROCEDURAL, STRATEGIC
    GoalPriority,    # ACTIVE, QUEUED, BACKBURNER, COMPLETED
    RelationshipType # CAUSES, SUPPORTS, CONTRADICTS, etc.
)
```

## MemoryType Cheat Sheet

| Type | When to use |
|------|------------|
| **EPISODIC** | "Happened today: fixed race condition in worker" |
| **SEMANTIC** | "Database owns state. Workers are stateless." |
| **PROCEDURAL** | "To debug: check logs, query DB, trace execution" |
| **STRATEGIC** | "Always validate at system boundaries" |

## Common Patterns

### At Session Start
```python
async with HexisAPI() as api:
    # Refresh context
    print("=== PROJECT CONTEXT ===")
    health = await api.get_health()
    print(f"Energy: {health['energy']}, Emotion: {health['current_emotion']}")

    goals = await api.get_goals()
    print(f"Active goals: {len(goals)}")

    # Get context for what you're about to work on
    context = await api.hydrate("What should I know before starting?")
```

### During Work
```python
    # When you hit a blocker
    solutions = await api.recall("How do we handle [problem type]?")

    # When you learn something important
    await api.remember(MemoryInput(
        content="Learned: [insight]",
        memory_type=MemoryType.SEMANTIC,
        importance=0.7
    ))
```

### At Session End
```python
    # Log your accomplishment
    await api.remember(MemoryInput(
        content=f"Session work: {accomplishment_summary}",
        memory_type=MemoryType.EPISODIC,
        importance=0.75
    ))

    # Final status
    health = await api.get_health()
    print(f"Final energy: {health['energy']}")
```

## Performance Tips

- **First call might be slow** — Embeddings are generated on first `hydrate()` or `recall()`
- **Batch operations** — Use `recall_batch()` or `hydrate_batch()` for multiple queries
- **Limit results** — Default limit=10 is usually good. Increase only if needed.
- **Use specific queries** — More specific = better results from vector search

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Is Docker running? `docker-compose ps` |
| "asyncpg not found" | `pip install asyncpg` |
| "No memories found" | Seed initial data with `api.remember()` |
| "Slow searches" | First call generates embeddings. Be patient. |

## Example: Full Session Template

```python
import asyncio
from hexis_code_api import HexisAPI
from cognitive_memory_api import MemoryInput, MemoryType

async def main():
    async with HexisAPI() as api:
        # === START: Context ===
        print("Retrieving project context...")
        context = await api.hydrate("What should I focus on today?")

        # === WORK: Do your thing ===
        print("Starting work...")
        # ... your code ...

        # === LEARN: Store findings ===
        await api.remember(MemoryInput(
            content="Today: successfully implemented [feature]. Key learning: [insight]",
            memory_type=MemoryType.EPISODIC,
            importance=0.8
        ))

        # === END: Status ===
        health = await api.get_health()
        print(f"Session complete. Energy remaining: {health['energy']}/{health['max_energy']}")

if __name__ == "__main__":
    asyncio.run(main())
```

---

**Quick Start:** Copy any example above and adapt it to your task.
