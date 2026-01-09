# Claude Code Configuration

This directory contains configuration that helps Claude Code instances in this worktree maintain persistent project context using Hexis.

## What's Here

```
.claude/
├── README.md                    ← You are here
├── HEXIS_CODE_SETUP.md         ← Detailed setup & usage guide
├── commands/
│   ├── hexis-hydrate.md        ← /hexis-hydrate command (get context)
│   └── hexis-log.md            ← /hexis-log command (store learnings)
└── resources/
    └── hexis-context.md        ← Quick reference for Hexis API
```

## Quick Start for Claude Code

Every Claude Code instance in this worktree can immediately use Hexis:

```python
from hexis_code_api import HexisAPI

async with HexisAPI() as api:
    # Get context
    context = await api.hydrate("What should I work on?")

    # Do your work...

    # Log learnings
    await api.remember(MemoryInput(
        content="Accomplished: [what you did]",
        memory_type=MemoryType.EPISODIC,
        importance=0.8
    ))
```

## Key Files

| File | Purpose |
|------|---------|
| `../hexis_code_api.py` | Main API module (import and use) |
| `HEXIS_CODE_SETUP.md` | Full setup guide, architecture, troubleshooting |
| `resources/hexis-context.md` | Cheat sheet for common operations |
| `commands/hexis-hydrate.md` | Slash command: query project context |
| `commands/hexis-log.md` | Slash command: store session work |

## The Vision

**Problem:** Each Claude Code session loses context. No memory of previous work.

**Solution:** Project-specific Hexis database that any Claude Code instance can query:
- Understand project architecture and decisions
- Find solutions to common problems
- Log learnings so future instances benefit
- Build up project knowledge over time

## For New Claude Code Instances

When invoked in this worktree, you automatically have access to:

1. **Hexis API** — `from hexis_code_api import HexisAPI`
2. **Quick commands** — `/hexis-hydrate` and `/hexis-log`
3. **Documentation** — `HEXIS_CODE_SETUP.md` and `resources/hexis-context.md`

No setup required. Just start using it.

## Next Steps

1. **Set up project DB** (one-time):
   ```bash
   cd .. && docker-compose up -d
   ```

2. **Seed initial knowledge** using your Chat side Hexis instance, then query here in Code

3. **Start logging** your sessions so future Claude Code instances have context

4. **Create custom commands** as needed for your workflow

## Troubleshooting

- **Can't connect?** → Is Docker running? `docker-compose ps`
- **Missing imports?** → `pip install asyncpg`
- **Slow first hydrate?** → Normal. First call generates embeddings.

## More Info

- Full guide: `HEXIS_CODE_SETUP.md`
- API reference: `resources/hexis-context.md`
- Available commands: `commands/`

---

**Status:** ✅ Ready to use
**Last Updated:** 2026-01-08
