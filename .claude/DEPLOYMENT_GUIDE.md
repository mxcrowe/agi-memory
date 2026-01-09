# Deployment Guide: Hexis for Claude Code

This guide walks through deploying Hexis project memory so every Claude Code instance has persistent context.

## What We've Set Up

✅ **hexis_code_api.py** — Main API wrapper (already tested and working)
✅ **.claude/ directory** — Configuration for all Claude Code instances
✅ **Slash commands** — `/hexis-hydrate` and `/hexis-log` for easy access
✅ **Documentation** — Setup guide, quick reference, examples

## Phase 1: One-Time Database Setup

### Step 1: Start Docker Services
```bash
cd C:\Users\Morpheus\.claude-worktrees\local-memory-system\sharp-volhard
docker-compose up -d
```

This starts:
- PostgreSQL (the brain)
- Embeddings service (for semantic search)
- RabbitMQ (for message passing)

### Step 2: Initialize Schema
```bash
docker exec agi_brain psql -U agi_user -d agi_db -f schema.sql
```

Or via Python:
```bash
python -m agi_cli init
```

### Step 3: (Optional) Create Project-Specific Database

If you want Hexis for Claude Code separate from the Chat side Koan instance:

```bash
# Create new database
docker exec agi_brain createdb -U agi_user -d project_hexis_db

# Initialize schema
docker exec agi_brain psql -U agi_user -d project_hexis_db -f schema.sql

# Use it in your env:
export POSTGRES_DB=project_hexis_db
```

## Phase 2: Seed Initial Knowledge

In your **Chat side**, use Hexis to create foundational memories about your project:

```
Chat: "Koan, remember for future Claude Code instances: [project architecture/goals/decisions]"
```

This gets stored in the database that Claude Code can query.

**Key knowledge to seed:**
- Architecture decisions
- Current goals and priorities
- Development processes and conventions
- Known gotchas and solutions
- Coding standards

Example memories to seed:
1. **Architecture:** "Hexis is database-first. All state/logic lives in PostgreSQL. Python workers are stateless."
2. **Process:** "Before adding features, update schema.sql, then cognitive_memory_api.py, then tests."
3. **Patterns:** "Always validate at system boundaries (user input, external APIs), not internal functions."
4. **Goals:** "Current focus: improve performance of vector search, add dashboard."

## Phase 3: Configure for Multiple Claude Code Instances

### For Each New Claude Code Instance

**Nothing extra needed!** Each instance automatically:

1. ✅ Sees `.claude/` configuration
2. ✅ Can import `hexis_code_api.py`
3. ✅ Can run `/hexis-hydrate` and `/hexis-log` commands
4. ✅ Reads from POSTGRES_DB (default: `agi_db`)

### Environment Variables (Optional)

Create `.env` file in the worktree root to customize:

```env
# Use project-specific database
POSTGRES_DB=project_hexis_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=agi_user
POSTGRES_PASSWORD=agi_password

# Optional: embeddings configuration
EMBEDDING_MODEL_ID=unsloth/embeddinggemma-300m
EMBEDDING_DIMENSION=768
```

## Phase 4: Usage Patterns

### New Claude Code Session Flow

**Start:**
```python
from hexis_code_api import HexisAPI

async with HexisAPI() as api:
    # Refresh context
    context = await api.hydrate("What should I focus on?")
    print(context)
```

**During work:**
```python
    # Search for knowledge
    solutions = await api.recall("How do we handle X?")

    # Learn something
    from cognitive_memory_api import MemoryInput, MemoryType
    await api.remember(MemoryInput(
        content="Learned: [insight]",
        memory_type=MemoryType.SEMANTIC,
        importance=0.8
    ))
```

**End:**
```python
    # Log accomplishments
    await api.remember(MemoryInput(
        content="Session: completed [task], learned [insight]",
        memory_type=MemoryType.EPISODIC,
        importance=0.75
    ))
```

## Verification Checklist

- [ ] Docker services running: `docker-compose ps`
- [ ] Can connect: `python hexis_code_api.py` (runs demo)
- [ ] Can import: `python -c "from hexis_code_api import HexisAPI"`
- [ ] `.claude/` directory exists with config
- [ ] Project seeds stored (ask Chat side Koan to remember for you)

## Common Tasks

### Seed Initial Knowledge
```bash
# From Chat side, store critical knowledge:
Koan, remember for all future Claude Code instances:
[project architecture, goals, conventions, gotchas]
```

### Query Project Memory
```bash
/hexis-hydrate "What architectural decisions have we made?"
```

### Log a Discovery
```bash
/hexis-log "Fixed async race condition by using asyncio.Lock"
```

### Check Project Status
```python
from hexis_code_api import HexisAPI

async with HexisAPI() as api:
    health = await api.get_health()
    goals = await api.get_goals()
    identity = await api.get_identity()
```

### See Recent Memories
```python
async with HexisAPI() as api:
    recent = await api.recall_recent(limit=20)
    for mem in recent:
        print(f"{mem.type}: {mem.content[:60]}...")
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect to DB | `docker-compose up -d` to start services |
| "asyncpg not found" | `pip install asyncpg` |
| Slow first hydrate | Normal — generates embeddings. Subsequent calls are fast. |
| No memories found | Seed initial data via Chat side or directly |
| Foreign key error | Schema might not be fully initialized. Re-run init. |

## Advanced: Custom Initialization

For reproducible project setup, create a seed script:

```python
import asyncio
from hexis_code_api import HexisAPI
from cognitive_memory_api import MemoryInput, MemoryType

async def seed_project():
    async with HexisAPI() as api:
        # Seed architecture knowledge
        await api.remember(MemoryInput(
            content="Architecture: Database-first design. Schema.sql is source of truth.",
            memory_type=MemoryType.SEMANTIC,
            importance=0.95
        ))

        # Seed project goals
        await api.remember(MemoryInput(
            content="Goals: Improve vector search performance, build dashboard, add local LLM support",
            memory_type=MemoryType.SEMANTIC,
            importance=0.9
        ))

        print("✓ Project seeded successfully")

if __name__ == "__main__":
    asyncio.run(seed_project())
```

Run once to initialize everything:
```bash
python seed_project.py
```

## Next Steps

1. **Setup:** Complete Phase 1-2 above
2. **Test:** Run `python hexis_code_api.py` to verify connection
3. **Seed:** Use Chat side to store project knowledge
4. **Invite:** Bring in new Claude Code instances — they'll have full context
5. **Log:** End each session by logging accomplishments
6. **Iterate:** Refine and improve the system based on usage

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Claude Desktop                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐         ┌──────────────────────┐  │
│  │  Chat Tab       │         │  Code Tab            │  │
│  │  (Koan/MCP)     │◄──────►│  (Claude Code)       │  │
│  └─────────────────┘         └──────────────────────┘  │
│         │                             │                 │
│         └──────────┬──────────────────┘                 │
│                    │                                    │
│                    ▼                                    │
└────────────────────────────────────────────────────────┐│
                     │
                     │ (agi-memory MCP + hexis_code_api)
                     │
        ┌────────────▼──────────────┐
        │   Hexis Core              │
        │   (agi_mcp_server.py)     │
        │   (cognitive_memory_api)  │
        └────────────┬──────────────┘
                     │
        ┌────────────▼────────────────┐
        │   PostgreSQL               │
        │   (agi_db or project_db)   │
        │   - Memories               │
        │   - Identity/Worldview     │
        │   - Goals/Drives           │
        └────────────────────────────┘
```

**Key insight:** Both Chat and Code tabs read/write to the same persistent database, creating true continuity of identity and memory.

---

**Status:** ✅ Ready for deployment
**Version:** 1.0
**Last Updated:** 2026-01-08
