# AGI Memory System - Clean DB Initialization Checklist

**Date Created:** December 27, 2025  
**Purpose:** Step-by-step guide to initialize a fresh AGI Memory database

---

## Prerequisites

- Docker Desktop running
- Services started via `start-agi-memory.bat` or `docker compose up -d`
- `.venv` exists in repo root
- `.env` file configured with correct credentials

---

## Step 1: Run agi init (Config Only)

```powershell
cd G:\Dev\local-memory-system
.\.venv\Scripts\Activate.ps1
agi init
```

**Key prompts:**
| Prompt | Recommended Value |
|--------|-------------------|
| Heartbeat interval | `60` |
| Maintenance interval | `60` |
| Max energy | `20` |
| Energy regen | `10` |
| Max active goals | `3` |
| Objectives | Your objectives (one per line, blank to finish) |
| Guardrails | Optional |
| Initial message | Optional |
| Heartbeat provider | `anthropic` |
| Heartbeat model | `claude-sonnet-4-5-20250929` |
| Heartbeat endpoint | (blank) |
| API key env var | `ANTHROPIC_API_KEY` |
| Chat provider/model | Same as heartbeat |
| Contact channels | Skip for testing |
| Tools | Skip for testing |
| **Enable autonomous heartbeats** | **No** (until system validated) |
| **Enable maintenance** | **No** (until system validated) |

**Verify config saved:**
```sql
SELECT key, value FROM config WHERE key LIKE 'agent.%' OR key LIKE 'llm.%';
```

**Verify autonomy disabled:**
```sql
SELECT is_paused FROM heartbeat_state WHERE id = 1;  -- Should be true
SELECT is_paused FROM maintenance_state WHERE id = 1;  -- Should be true
```

---

## Step 2: Initialize Apache AGE Graph Session

**Required before any graph-related inserts (identity, worldview, memories with concepts).**

In pgAdmin Query Tool:
```sql
LOAD 'age';
SET search_path = ag_catalog, public;
```

**Verify graph exists:**
```sql
SELECT * FROM ag_catalog.ag_graph WHERE name = 'memory_graph';
```

Should return one row with `name = 'memory_graph'`.

---

## Step 3: Seed Identity Aspects

```sql
INSERT INTO identity_aspects (aspect_type, content, stability) VALUES
('self_concept', '{"description": "An AI memory system under development"}', 0.7),
('purpose', '{"description": "To maintain coherent memory across sessions"}', 0.8),
('boundary', '{"description": "Operates within user-defined guardrails"}', 0.6),
('agency', '{"description": "Can store, recall, and reflect on memories"}', 0.7),
('values', '{"description": "Accuracy, coherence, and user partnership"}', 0.8);
```

**Verify:**
```sql
SELECT aspect_type, content, stability FROM identity_aspects;
```

---

## Step 4: Seed Worldview Primitives

```sql
INSERT INTO worldview_primitives (belief, category, confidence, emotional_valence, stability_score) VALUES
('Memory continuity enables meaningful AI relationships', 'epistemology', 0.8, 0.6, 0.7),
('Human-AI collaboration produces better outcomes than either alone', 'collaboration', 0.9, 0.7, 0.8),
('Systems should fail gracefully rather than catastrophically', 'engineering', 0.95, 0.3, 0.9);
```

**Verify:**
```sql
SELECT belief, category, confidence FROM worldview_primitives;
```

---

## Step 5: Verify Embedding Service

```sql
SELECT check_embedding_service_health();
```

Should return `true`. If `false`, check that embeddings container is running:
```powershell
docker compose ps embeddings
docker compose logs embeddings
```

---

## Step 6: Add Test Memories

```sql
-- Test memory 1: Episodic
SELECT create_episodic_memory(
    'First test memory created during Phase II initialization',
    '{"event": "system initialization"}'::jsonb,
    '{"phase": "testing"}'::jsonb,
    NULL,
    0.5,
    CURRENT_TIMESTAMP,
    0.7
);

-- Test memory 2: Semantic
SELECT create_semantic_memory(
    'The AGI Memory system uses PostgreSQL with Apache AGE for graph operations',
    0.8,
    ARRAY['technology', 'architecture'],
    ARRAY['PostgreSQL', 'Apache AGE', 'graph database'],
    NULL,
    0.7
);

-- Test memory 3: Episodic
SELECT create_episodic_memory(
    'Michael and Koan are debugging the memory system together',
    '{"activity": "debugging"}'::jsonb,
    '{"participants": ["Michael", "Koan"]}'::jsonb,
    NULL,
    0.6,
    CURRENT_TIMESTAMP,
    0.8
);
```

Each should return a UUID.

---

## Step 7: Validation

See **System Validation Checklist.md** for complete validation steps.

Quick smoke test:
```sql
-- Test fast_recall (read path)
SELECT memory_id, content, memory_type, score, source 
FROM fast_recall('debugging memory system', 10);

-- Verify episode auto-assignment
SELECT e.id, e.started_at, e.episode_type, COUNT(em.memory_id) as memory_count
FROM episodes e
LEFT JOIN episode_memories em ON e.id = em.episode_id
GROUP BY e.id, e.started_at, e.episode_type;
```

---

## Step 8: Enable Autonomy (When Ready)

Only after validation complete:
```sql
UPDATE heartbeat_state SET is_paused = FALSE WHERE id = 1;
UPDATE maintenance_state SET is_paused = FALSE WHERE id = 1;
```

---

## Troubleshooting

### "unhandled cypher(cstring) function call memory_graph"
- Run `LOAD 'age'; SET search_path = ag_catalog, public;` first

### Embedding service unhealthy
- Check container: `docker compose logs embeddings`
- May need time to download model on first run

### Config not taking effect
- Restart services after config changes
- Verify with `SELECT * FROM config;`

---

## Notes

- `agi init` only sets config - does NOT populate identity/worldview/concepts
- Identity and worldview must be seeded separately via SQL
- Graph session must be initialized in each pgAdmin session before graph operations
- Keep autonomy disabled until read/write paths validated
