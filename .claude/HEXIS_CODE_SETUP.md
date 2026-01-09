# Hexis for Claude Code — Setup & Usage Guide

This directory contains configuration that allows any Claude Code instance to access Hexis project memory using persistent database context.

## Overview

**Problem:** Claude Code built-in context window is limited. Each session loses history.

**Solution:** Project-specific Hexis database stores:
- Project decisions and rationale
- Code patterns and architectural choices
- Bug fixes and lessons learned
- Session progress and blockers
- Relationships between concepts

Any Claude Code instance can query this DB to understand project context before starting work.

## Quick Start

### For Users (Invoking Claude Code)

1. **Initialize the project Hexis DB** (one time):
   ```bash
   python hexis_code_api.py --init-project
   ```
   This creates a separate project-specific database.

2. **In any Claude Code session**, you can immediately call:
   ```python
   from hexis_code_api import HexisAPI

   async with HexisAPI() as api:
       context = await api.hydrate("What are the architectural decisions for this project?")
       print(context)
   ```

3. **Throughout your session**, store what you learn:
   ```python
   await api.remember(
       MemoryInput(
           content="Fixed race condition in async worker by using lock",
           memory_type=MemoryType.PROCEDURAL,
           importance=0.8
       )
   )
   ```

### For Claude Code Instances

When Claude Code starts in this worktree, it has access to:

**Available Tools:**
- `hydrate(query)` — Get context for a question
- `recall(query, limit=10)` — Search memories
- `remember(content, type, importance)` — Store findings
- `get_goals()`, `get_identity()`, `get_health()` — Query system state
- `find_causes(memory_id)` — Trace causal chains
- `find_contradictions()` — Find inconsistencies

**Pre-configured connection:**
- Database: `agi_db` (or project-specific)
- Host: `localhost:5432`
- User: `agi_user`
- No setup needed — just import and use

## Architecture

```
├── hexis_code_api.py          ← Main API (already working!)
├── cognitive_memory_api.py    ← Database client
├── schema.sql                 ← Database schema
├── .claude/
│   ├── HEXIS_CODE_SETUP.md   ← This file
│   ├── commands/
│   │   └── hexis-demo.md     ← Example slash command
│   └── resources/
│       ├── hexis-context.md  ← Injected context
│       └── memory-types.md   ← Memory type reference
└── docker-compose.yml        ← Local DB + services
```

## Memory Types & Best Practices

### MemoryType Enum

| Type | Use For | Example |
|------|---------|---------|
| `EPISODIC` | Specific events, sessions, interactions | "Fixed bug X in session Y" |
| `SEMANTIC` | Factual knowledge, architecture, patterns | "Async workers use asyncpg pools" |
| `PROCEDURAL` | How-to, steps, algorithms | "Steps to debug race conditions" |
| `STRATEGIC` | Heuristics, rules of thumb, learnings | "Always validate at system boundaries" |

### Importance Score

| Score | Meaning |
|-------|---------|
| 0.9-1.0 | Critical decisions, major bugs, architecture |
| 0.7-0.8 | Important patterns, common fixes |
| 0.5-0.7 | Useful context, minor learnings |
| 0.3-0.5 | Nice to know, edge cases |

### Example Memory Entries

```python
# After fixing a bug
await api.remember(MemoryInput(
    content="Race condition in heartbeat_worker: async tasks weren't awaited. Fixed by wrapping in gather(). See commit abc123.",
    memory_type=MemoryType.PROCEDURAL,
    importance=0.85,
    tags=["bug-fix", "concurrency"]
))

# After understanding architecture
await api.remember(MemoryInput(
    content="Hexis architecture: database owns all state/logic. Python worker is stateless. This inversion avoids restart losses.",
    memory_type=MemoryType.SEMANTIC,
    importance=0.9,
    tags=["architecture", "design-principle"]
))

# After learning a pattern
await api.remember(MemoryInput(
    content="When adding new memory types, always add to schema.sql first, then update cognitive_memory_api.py, then tests.",
    memory_type=MemoryType.PROCEDURAL,
    importance=0.7,
    tags=["development-process"]
))
```

## Environment Variables

The system reads from your Claude Desktop MCP config:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=agi_db          # Change to project-specific DB
POSTGRES_USER=agi_user
POSTGRES_PASSWORD=agi_password
```

To use a **project-specific database**, set in `.env`:
```env
POSTGRES_DB=project_hexis_db
```

## Workflow Example

**Session 1: Understand Project**
```python
# At start of session
context = await api.hydrate("What's the current architecture?")
goals = await api.get_goals()

# Do work...
# At end
await api.remember(MemoryInput(
    content="Refactored memory clustering to use K-means instead of DBSCAN. 40% faster.",
    memory_type=MemoryType.EPISODIC,
    importance=0.8
))
```

**Session 2: Leverage Previous Context**
```python
# Start fresh, but database remembers
recent = await api.recall_recent(limit=5)
# Gets: clustering refactor, previous decisions, patterns

# Ask specific questions
causes = await api.find_causes(some_memory_id)
# Traces: "What led to this decision?"

# Continue work...
```

## Troubleshooting

**Error: "function get_health() does not exist"**
- Database schema not initialized
- Run: `docker-compose up -d && python -m agi_cli init`

**Error: "Connection refused"**
- PostgreSQL not running
- Run: `docker-compose up -d db`

**Error: "asyncpg module not found"**
- Install: `pip install asyncpg`

**Slow recall searches**
- Embeddings not generated yet
- First hydrate call will trigger embedding generation
- Subsequent calls are fast (cached)

## For New Claude Code Instances

When you invoke a new Claude Code in this worktree, it will:

1. ✅ Have access to `hexis_code_api.py` automatically
2. ✅ Can import and use `HexisAPI` class
3. ✅ Can call all 23 Hexis tools
4. ✅ Has persistent project context

No configuration needed. Just:
```python
from hexis_code_api import HexisAPI

async with HexisAPI() as api:
    health = await api.get_health()
    print(f"Project status: {health}")
```

## Next Steps

- [ ] Create project-specific database (see Docker setup)
- [ ] Seed initial knowledge (architecture, decisions, guardrails)
- [ ] Set up automatic memory logging for each session
- [ ] Create custom slash commands for common queries
- [ ] Build Claude Code-specific prompts that reference Hexis context

---

**Status:** ✅ Ready to use
**Created:** 2026-01-08
**Last Updated:** 2026-01-08
**Maintained by:** Claude Code instances in this worktree
