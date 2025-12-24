# AGI-Memory (QuixiAI/agi-memory) — Debug Session Summary (Matrix)

_Date:_ 2025-12-21/22 (local)  
_System:_ “Matrix” (Windows 11; Docker Desktop; PostgreSQL in container `agi_brain`; DB `agi_db`)

## Why we did this
You had AGI-Memory running end-to-end, but the **heartbeat worker** was throwing SQL/runtime errors during heartbeat updates and reflection application. You also had **live hotfixes** applied via pgAdmin that were not yet captured in versioned schema/migrations.

The goals were:
- Stabilize the **heartbeat loop** so it can complete reliably.
- Stop “hotfix drift” by exporting the DB changes and committing them as a migration.
- Create a **safe rollback path** via a full database backup.

## What we observed

### Heartbeat scheduling behavior
You tried to “force” a heartbeat by setting `next_heartbeat_at` in the past, but nothing fired immediately.  
Root cause: `should_run_heartbeat()` gates on:

- `is_agent_configured()` must be true
- `is_paused` must be false
- `last_heartbeat_at + interval_minutes` must be <= `CURRENT_TIMESTAMP`

It does **not** rely on `next_heartbeat_at`.

### Recurring errors seen earlier (examples)
- Embedding service 422s (earlier)
- Invalid UUID casts during reflection apply (strings treated like UUIDs)
- SQL syntax errors from malformed data / bracket issues (historical)
- “Cannot generate embedding for empty or null text” (newer)

### Schema mismatch / missing columns
A query failed because `external_calls` did not have a `created_at` column (schema drift vs queries/docs).

## Fixes we implemented (live DB → then “immortalized”)

### 1) UUID safety hardening in reflection apply
**Problem:** reflection outputs sometimes supply strings where the DB expects UUIDs, causing errors like:
- `invalid input syntax for type uuid: "Connection is essential for wellbeing"`

**Fix:** Introduced/used `public.try_uuid(text)` and replaced direct `::uuid` casts with safe parsing in:
- `public.process_reflection_result(uuid,jsonb)`
  - worldview update IDs
  - contradiction memory IDs
  - other UUID-prone fields

### 2) Guard against embedding empty or null memory text
**Problem:** heartbeat worker error:
- `Failed to get embedding: Cannot generate embedding for empty or null text`

**Fix:** Added a guard in `create_semantic_memory(...)` (or upstream) so empty content does not proceed to embedding creation.

### 3) Exported patched functions into a migration
To end pgAdmin-only hotfix drift, we exported the authoritative function definitions from the live DB into:

- `db/migrations/010_hotfixes.sql`

Containing:
- `public.try_uuid(text)`
- `public.create_semantic_memory(...)`
- `public.process_reflection_result(uuid,jsonb)`

## Backup created (critical safety net)
We created a **binary-safe** full DB backup by dumping inside the container then `docker cp` out to Windows, avoiding PowerShell encoding pitfalls. Example:
- `backups/agi_db_full_20251221_214632.dump` (~2.6MB)

## Making rebuilds deterministic (Docker init path)
Your DB image bakes schema into `/docker-entrypoint-initdb.d/`. We updated `Dockerfile` so schema runs first, then migrations:

```dockerfile
COPY schema.sql /docker-entrypoint-initdb.d/001_init.sql
COPY db/migrations/ /docker-entrypoint-initdb.d/
```

Note: init scripts run only when the PGDATA directory is empty (first init).

## Git commit captured
Committed only:
- `Dockerfile`
- `db/migrations/010_hotfixes.sql`

Commit message:
- “Bake DB hotfix migration into init scripts”

## High-level architecture notes (top-down)
AGI-Memory is a **local cognitive substrate** with three loops:
1) ingestion (Claude Desktop ↔ DB)
2) heartbeat (timed autonomous loop)
3) maintenance (cleanup/consolidation)

The value is already strong in **store + retrieve**; the most brittle part is the heartbeat’s dependence on perfectly shaped structured outputs.

## Recommended next steps
- Run a **safe rebuild test** using a new Docker volume name (so you never touch your real memory corpus).
- Add tighter guardrails and validation on LLM outputs feeding the DB (to reduce schema/type drift).
