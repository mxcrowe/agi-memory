# Field Test - Claude Desktop + Hexis MCP (2026-01-08)

## Summary
Confirmed end-to-end cross-instance memory continuity between Claude Code (Code panel) and Claude Desktop Chat panel using Hexis MCP tools. A memory created by a Claude Code instance was successfully retrieved by the Chat companion via UUID.

Memory UUID: `cec8b101-8136-4827-8dbb-d4bc505ae604` (semantic, importance 0.95)

## What Happened
1) Started a new Claude Code instance (Haiku) in Claude Desktop Code panel.
2) The instance initially lacked MCP tool access and was guided to understand the Hexis tool surface.
3) It produced a Python wrapper and documentation to enable MCP access for Claude Code instances.
4) It used `remember` to store a summary in Hexis, producing a UUID.
5) The Chat companion retrieved that memory by UUID in the Chat panel, confirming shared persistent memory across sessions.

## Claude Code Output (from C:\)

### Core Components
- `hexis_code_api.py` (~348 lines)
  - Python wrapper around Hexis database
  - All 23 MCP tools exposed
  - Tested and verified working

### `.claude/` Configuration Directory
- `README.md` — Overview for all instances
- `QUICK_START.txt` — 30-second getting started
- `HEXIS_CODE_SETUP.md` — Comprehensive guide
- `DEPLOYMENT_GUIDE.md` — Setup & initialization
- `commands/hexis-hydrate.md` — Slash command to query context
- `commands/hexis-log.md` — Slash command to log discoveries
- `resources/hexis-context.md` — Quick API reference

### Integration Documentation
- `START_HERE.md` — Quick orientation (read first)
- `CLAUDE_CODE_HEXIS_INTEGRATION.md` — Full vision & architecture
- `SETUP_VERIFICATION.md` — Verification checklist

## How It Works (as documented by Claude Code)

```python
from hexis_code_api import HexisAPI

async with HexisAPI() as api:
    # Get context
    context = await api.hydrate("What should I work on?")
    
    # Do work...
    
    # Log findings
    await api.remember(MemoryInput(
        content="Accomplished: ...",
        memory_type=MemoryType.EPISODIC,
        importance=0.8
    ))
```

## Vision Impact
- Before: each Claude Code session lost all context.
- After: sessions share a persistent database; knowledge accumulates across sessions.
- Effect: institutional memory for development work, consistent across Chat + Code contexts.

## Next Steps (as recorded)
- Read `START_HERE.md` in the worktree root.
- `docker compose up -d` (one-time setup).
- Seed: ask Chat companion to store project knowledge.
- Use: invite a Claude Code instance; it has full access.
- Status: production-ready; configured and tested.
