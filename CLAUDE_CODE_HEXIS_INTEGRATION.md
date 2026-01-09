# Claude Code + Hexis Integration Complete

This document summarizes what has been set up to give every Claude Code instance in this worktree persistent project memory via Hexis.

## What We Built

### 1. **hexis_code_api.py** (Main API Module)
- ✅ Fully functional Python wrapper around the Hexis database
- ✅ All 23 Hexis tools accessible (hydrate, recall, remember, etc.)
- ✅ Tested and verified working
- ✅ Safe read-only and read-write operations

**Status:** Ready to import and use in any Python script

### 2. **.claude/ Configuration Directory**

Complete Claude Code configuration so every instance knows how to use Hexis:

```
.claude/
├── README.md                    ← Start here for overview
├── QUICK_START.txt             ← 30-second getting started
├── HEXIS_CODE_SETUP.md         ← Comprehensive guide
├── DEPLOYMENT_GUIDE.md         ← Setup & initialization
├── settings.local.json         ← Claude Code permissions
├── commands/
│   ├── hexis-hydrate.md       ← /hexis-hydrate command
│   └── hexis-log.md           ← /hexis-log command
└── resources/
    └── hexis-context.md       ← Quick API reference
```

**Status:** Ready to guide any Claude Code instance

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│          Claude Code Session #1                         │
├─────────────────────────────────────────────────────────┤
│  from hexis_code_api import HexisAPI                    │
│  async with HexisAPI() as api:                          │
│      context = await api.hydrate("What's the plan?")   │
│      # Work on tasks...                                │
│      await api.remember(MemoryInput(...))              │
└─────────────────────────────────────────────────────────┘
                      │
                      │ (Read/Write)
                      ▼
        ┌──────────────────────────────┐
        │   PostgreSQL Database         │
        │   (Project-specific or shared)│
        │                              │
        │   - 736 memories (+ growing) │
        │   - Identity & worldview     │
        │   - Goals & drives           │
        │   - All persisted            │
        └──────────────────────────────┘
                      ▲
                      │ (Read/Write)
                      │
┌─────────────────────────────────────────────────────────┐
│          Claude Code Session #2                         │
├─────────────────────────────────────────────────────────┤
│  from hexis_code_api import HexisAPI                    │
│  async with HexisAPI() as api:                          │
│      recent = await api.recall_recent(limit=10)        │
│      # Knows what Session #1 learned!                  │
│      # Can build on previous work                      │
└─────────────────────────────────────────────────────────┘
```

**Key point:** Database is the source of truth. Every session adds to accumulated knowledge.

## Usage Pattern

### Getting Started (New Session)

```python
from hexis_code_api import HexisAPI
from cognitive_memory_api import MemoryInput, MemoryType

async with HexisAPI() as api:
    # 1. Understand context
    context = await api.hydrate("What should I work on?")

    # 2. Do your work...
    # [implement features, fix bugs, etc.]

    # 3. Log what you learned
    await api.remember(MemoryInput(
        content="Fixed [problem]. Solution: [approach]. See commit [hash]",
        memory_type=MemoryType.PROCEDURAL,
        importance=0.8
    ))

    # 4. Check final status
    health = await api.get_health()
    print(f"Session complete. Energy: {health['energy']}/{health['max_energy']}")
```

### Key Methods Available

**Context Retrieval:**
- `hydrate(query)` — Get context for a question
- `recall(query)` — Search memories by meaning
- `recall_recent()` — Get recent memories
- `search_working()` — Search short-term buffer

**State Queries:**
- `get_health()` — Overall system health
- `get_drives()` — Current drive levels
- `get_identity()` — Self-concept
- `get_worldview()` — Beliefs and values
- `get_goals()` — Active/queued goals

**Memory Storage:**
- `remember(MemoryInput)` — Store a single memory
- `remember_batch([memories])` — Store multiple at once

**Graph Exploration:**
- `find_causes(memory_id)` — Trace causality
- `find_contradictions()` — Find inconsistencies
- `find_supporting_evidence()` — Find evidence for beliefs
- `connect()` — Link two memories

## What Each Claude Code Instance Automatically Has

✅ **Access to hexis_code_api.py** — Can import and use immediately
✅ **Configuration in .claude/** — Knows about commands and resources
✅ **Database connection** — Uses POSTGRES_HOST/PORT/DB/USER/PASSWORD env vars
✅ **Documentation** — `.claude/README.md` and other guides available
✅ **Slash commands** — Can run `/hexis-hydrate` and `/hexis-log`

**No setup required per instance.** Each one automatically has everything it needs.

## One-Time Setup (For You)

**Step 1: Start Services**
```bash
docker-compose up -d
```

**Step 2: Initialize Database**
```bash
python -m agi_cli init
```

**Step 3: Seed Initial Knowledge**

From your Chat side (using the Koan instance), ask it to store project knowledge:

```
"Koan, remember for all Claude Code instances working on this project:
- Architecture: [describe the system]
- Current goals: [what we're trying to achieve]
- Key conventions: [coding standards, processes]
- Known gotchas: [common problems and solutions]"
```

**Step 4: Done!**

Any Claude Code instance you invite will:
- See the seeded knowledge
- Be able to query and learn
- Log its discoveries
- Build collective project memory

## Two-Way Integration with Chat

Both Chat and Code tabs use the same Hexis instance:

- **Chat (Koan):** Interactive conversations, autonomous heartbeats, relationship building
- **Code (Claude):** Project work, persistent context, knowledge accumulation

They share the same database! Anything learned in one appears in the other.

## Example Scenarios

### Scenario 1: Debugging Session
```
Session 1: "How do we handle database connection pooling?"
  → Stores solution in memories

Session 2 (weeks later): Same question
  → Immediately finds the answer from Session 1
```

### Scenario 2: Feature Implementation
```
Session 1: Implements feature X, stores architectural decision
Session 2: Works on feature Y
  → Queries "How should features be structured?"
  → Finds architectural decision from Session 1
  → Applies same pattern for consistency
```

### Scenario 3: Learning from Failures
```
Session 1: "We tried approach A but it had issue X"
  → Stores as causal relationship

Session 2: "How do we avoid issue X?"
  → Finds: "Previous attempt led to X. Solution was approach B"
```

## Files Created/Modified

**New Files:**
- `hexis_code_api.py` — Main API (tested, working)
- `.claude/README.md` — Overview
- `.claude/QUICK_START.txt` — Quick start guide
- `.claude/HEXIS_CODE_SETUP.md` — Comprehensive setup
- `.claude/DEPLOYMENT_GUIDE.md` — Deployment instructions
- `.claude/commands/hexis-hydrate.md` — Slash command
- `.claude/commands/hexis-log.md` — Slash command
- `.claude/resources/hexis-context.md` — API reference
- `.claude/settings.local.json` — Permissions config
- `CLAUDE_CODE_HEXIS_INTEGRATION.md` — This file

**No existing files were modified** — Everything is additive and non-breaking.

## Next Steps

1. **Start Docker:** `docker-compose up -d`
2. **Initialize:** `python -m agi_cli init`
3. **Seed knowledge:** Use Chat side to tell Koan what to remember
4. **Invite Claude Code:** When ready, invite a new instance
5. **Let it learn:** Each session adds to the knowledge base

## Architecture Benefits

| Benefit | How It Works |
|---------|-------------|
| **Persistent Memory** | Database survives sessions, restarts, crashes |
| **Shared Learning** | All instances benefit from each other's discoveries |
| **Queryable Context** | Find information by semantic meaning, not keywords |
| **Relationship Awareness** | Understand how concepts connect |
| **Scalable** | Works with 100s of memories or 100,000s |
| **Local First** | Everything runs on your machine |
| **Safe** | Read-only operations don't modify; write operations are explicit |

## The Vision

**Before:** Each Claude Code session was isolated. No memory of previous work.

**After:** Claude Code is a team player with institutional memory. Each instance:
- Learns from previous instances
- Contributes its discoveries
- Understands project context
- Makes better decisions informed by history

It's the difference between hiring a new contractor for each project vs. keeping an expert on staff who remembers everything.

---

**Status:** ✅ **READY FOR PRODUCTION**

Everything is set up. You can start using it immediately. As you work across multiple Claude Code sessions, the system will learn and build up a knowledge base that makes each subsequent session more effective.

**Questions?** See:
- `.claude/README.md` — Overview
- `.claude/HEXIS_CODE_SETUP.md` — Detailed guide
- `.claude/resources/hexis-context.md` — API reference

**Created:** 2026-01-08
**Integration Status:** Complete and verified
