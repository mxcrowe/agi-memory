# AGI-Memory (QuixiAI/agi-memory) — Debug Session Summary (Matrix)

_Date:_ 2025-12-21/22 (local)  
_System:_ “Matrix” (Windows 11; Docker Desktop; PostgreSQL in container `agi_brain`; DB `agi_db`)

## Why we did this
You had AGI-Memory running end-to-end, but the **heartbeat worker** was throwing SQL/runtime errors during heartbeat updates and reflection application. You also had **live hotfixes** applied via pgAdmin that were not yet captured in versioned schema/migrations.

The goals for the session were:
- Stabilize the **heartbeat loop** so it can complete reliably.
- Stop “hotfix drift” by exporting the DB changes and committing them as a migration.
- Create a **safe rollback path** via a full database backup.

---

## What we observed

### A) Heartbeat scheduling behavior
You tried to “force” a heartbeat by setting `next_heartbeat_at` in the past, but nothing fired immediately.  
Root cause: `should_run_heartbeat()` **ignores** `next_heartbeat_at` and instead gates on:

- `is_agent_configured()` must be true
- `is_paused` must be false
- `last_heartbeat_at + interval_minutes` must be <= `CURRENT_TIMESTAMP`

So the lever for “force now” is effectively `last_heartbeat_at` (or waiting until interval elapses).

**Function body (key line):**
```sql
RETURN CURRENT_TIMESTAMP >= state_record.last_heartbeat_at + (interval_minutes || ' minutes')::INTERVAL;
```

### B) Recurring errors seen earlier
From logs (examples you shared):
- Embedding service errors / 422s (earlier)  
- Invalid UUID casts during reflection apply (e.g. `"Connection is essential for wellbeing"` treated like a UUID)
- SQL syntax errors from malformed data / bracket issues (historical)
- “Cannot generate embedding for empty or null text” (newer)

### C) DB schema mismatch / missing columns
A DB query failed because `external_calls` did not have a `created_at` column (suggesting either:
- schema drift vs docs/queries, or
- the query was written for a different version).

---

## Fixes we implemented (in the live DB, then “immortalized”)

### 1) UUID safety hardening in reflection apply
**Problem:** Reflection outputs sometimes supply strings where the DB expects UUIDs, causing errors like:
- `invalid input syntax for type uuid: "Connection is essential for wellbeing"`

**Fix:** Introduced/used a safe-cast helper and replaced direct `::uuid` casts with safe parsing:
- `public.try_uuid(text)` (returns NULL if invalid)
- Patched `process_reflection_result(...)` to use `try_uuid(...)` for:
  - worldview update IDs
  - contradiction memory IDs
  - (and any other UUID-ish fields prone to LLM “human string” output)

Result: UUID-cast warnings/errors stopped appearing in the successful heartbeat run.

---

### 2) Guard against embedding empty or null memory text
**Problem:** Heartbeat worker error:
- `Failed to get embedding: Cannot generate embedding for empty or null text`

**Fix:** Added a guard in **`create_semantic_memory(...)`** (or equivalent call path) so that empty content does not proceed to embedding creation.

Result: The next heartbeat completed cleanly.

---

### 3) “Hotfix drift” resolved: exported patched functions into a migration
You had hotfixes applied via pgAdmin and needed them captured in version control for deterministic rebuilds.

We exported the authoritative function definitions from the live DB and created:
- `db/migrations/010_hotfixes.sql`

This migration contains the **exact `CREATE OR REPLACE FUNCTION ...`** blocks for:
- `public.try_uuid(text)`
- `public.create_semantic_memory(...)`
- `public.process_reflection_result(uuid,jsonb)`

---

## Validation: what worked after the fixes

A heartbeat ran successfully without warnings/errors:

```
Heartbeat started: 126976fe-0699-40e7-9708-bfa0ab40603b
Processing think call: c51efdb7-a2cf-4f34-9783-cad979f353ed
... HTTP 200 OK ...
Heartbeat ... completed. Memory: b9a50bff-af96-4dee-92ca-f6aea337a23d
```

---

## Operational changes made

### Heartbeats paused for safety
You paused heartbeats to prevent churn and token spend while exporting/committing:

```sql
UPDATE heartbeat_state
SET is_paused = TRUE
WHERE id = 1;
```

---

## Backup created (critical safety net)
Because PowerShell line-ending/encoding pipelines can corrupt binary dumps, we used a **binary-safe** method:

1) Create dump in container
2) `docker cp` it out

Resulting file (example you reported):
- `backups/agi_db_full_20251221_214632.dump` (≈ 2.6MB)

This preserves your entire populated memory DB.

---

## Making rebuilds deterministic (Docker init path)

Your `docker-compose.yml` indicates schema is **baked into the DB image** (not bind-mounted).  
In `Dockerfile` you had:

```dockerfile
# Run schema/init on first database startup.
COPY schema.sql /docker-entrypoint-initdb.d/init.sql
```

We updated the plan so init order is deterministic and migrations run on first init:

### Dockerfile edits
Change:
```dockerfile
COPY schema.sql /docker-entrypoint-initdb.d/init.sql
```

To:
```dockerfile
COPY schema.sql /docker-entrypoint-initdb.d/001_init.sql
COPY db/migrations/ /docker-entrypoint-initdb.d/
```

This ensures that on a **fresh / empty Postgres volume**, init runs in order:
1) `001_init.sql` (schema)
2) `010_hotfixes.sql` (hotfix functions)

**Important:** scripts in `/docker-entrypoint-initdb.d/` run only when the PGDATA directory is empty (i.e., first init). This is good: it won’t re-run against your existing populated volume.

---

## Git commit captured
You committed only the two intended files:

- `Dockerfile`
- `db/migrations/010_hotfixes.sql`

Commit:
- `Bake DB hotfix migration into init scripts`

(Line-ending warning about LF→CRLF for the SQL file is normal on Windows.)

---

## High-level architecture notes (top-down view)

### What AGI-Memory is doing in practice
It’s a **local cognitive substrate** with three loops:

1) **Ingestion loop (user ↔ Claude Desktop ↔ DB)**  
   Claude Desktop (via MCP) reads/writes structured memories into Postgres.  
   Embeddings enable semantic retrieval.

2) **Heartbeat loop (autonomous / timed)**  
   Worker decides when to run (`should_run_heartbeat()`), calls Anthropic, and writes results back.

3) **Maintenance loop (background)**  
   Cleanup/consolidation and graph hygiene.

### Key brittleness we saw
- The system assumes **structured outputs**, but LLMs can output human-friendly strings that violate DB types.
- DB hotfixes done manually become “invisible” unless exported and versioned.
- Heartbeats can “self-churn” (token spend + drift) if not constrained by policy.

---

## Recommended next steps

### Priority: safe rebuild test (optional, but high value)
Create a **new** Postgres volume name (do not touch your real memory volume) and run:

- `docker compose up -d --build`

Then verify the hotfix functions exist in the fresh DB.

This proves your “schema + migration” path is deterministic.

### Medium-term: guardrails for heartbeat autonomy
Decide what you want Resonance to do when you’re asleep:
- nothing
- light consolidation
- active research
- bounded journaling

Then align:
- prompt constraints
- parsing/validation
- DB tolerance
- scheduling rules (and possibly honoring `next_heartbeat_at` if you want a force-run lever)

---

## Artifacts created
- Full DB backup: `backups/agi_db_full_*.dump`
- Migration: `db/migrations/010_hotfixes.sql`
- Dockerfile updated to bake init + migrations
- Git commit with those two files
