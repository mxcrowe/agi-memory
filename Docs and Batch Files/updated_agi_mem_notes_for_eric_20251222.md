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


---

## New findings after the initial fix (2025-12-22)

### 1) Reflection pipeline still throws UUID cast warnings
**Symptom (heartbeat_worker log):**
`Failed to apply reflection result: invalid input syntax for type uuid: "Connection is essential for wellbeing"`

**Root cause:**
The reflection JSON sometimes emits **non-UUID strings** in fields that the DB expects to be UUIDs, e.g.
- `worldview_updates[].id` (should be a UUID of an existing `worldview_primitives` row)
- `contradictions_noted[].memory_a / memory_b` (should be UUIDs of existing `memories`)
- `discovered_relationships[].from_id / to_id` (should be UUIDs)

Example observed:
`worldview_updates: [{ id: "Connection is essential for wellbeing", new_confidence: 0.96, ... }]`

**Why it happens:**
The LLM is being asked to update existing worldview primitives by ID, but it often **does not have** the UUIDs in its prompt/context—so it “helpfully” uses the belief text as the ID.

**What to do (clean, durable fix):**
1) **Make the DB function defensive**: use `public.try_uuid(...)` anywhere a UUID is parsed from reflection JSON, and skip the update/link if parsing fails.  
2) **Adjust the reflection schema** so “new beliefs” do **not** require UUIDs.

Recommended reflection schema shape:

- `worldview_updates`: *ONLY for existing worldview primitives* (UUID required; omit if unknown)
- `worldview_new`: for new beliefs (no UUID needed; DB inserts a new worldview primitive)

### 2) Worker reflection prompt must strongly prohibit “invented IDs”
You want an explicit rule block inside the reflection system prompt, something like:

- **All fields named `id`, `*_id`, `from_id`, `to_id`, `memory_*`, `evidence_memory_id` must be UUID strings or null.**
- **Never invent an ID.**
- If you don’t have a UUID, **omit the item** (or use the `worldview_new` bucket).

Also: ensure your prompt text is not accidentally corrupted by editor/UI ellipses (e.g. `"s...gth"`). In your saved `worker.py`, confirm the string literally says `"strength"`.

### 3) Applying migrations to an *existing* DB volume
Your Dockerfile change (“bake init scripts”) only runs on **first boot** of a fresh PG data directory.  
If `postgres_data` already exists, you must apply migrations manually (or add a small “migration runner” container).

A simple manual apply (PowerShell 7):

```powershell
Get-Content -Raw "db\migrations\010_hotfixes.sql" | docker exec -i agi_brain psql -U agi_user -d agi_db -v ON_ERROR_STOP=1
```

### 4) A quick pgAdmin query pattern that matches your schema
Your `external_calls.call_type` enum appears to be only `think`.  
To isolate reflection calls, filter on the payload:

```sql
SELECT
  id,
  call_type,
  status,
  heartbeat_id,
  started_at,
  completed_at,
  response_payload_head
FROM external_calls
WHERE response_payload_head = 'reflect'
ORDER BY started_at DESC
LIMIT 50;
```

---

## Recommended next improvements (for Eric / upstream)

1) **Schema-versioned migrations** + an automated migration runner at startup (so existing volumes get upgraded).
2) **Sanitizer layer** in the worker: validate UUID-looking fields before calling DB apply; drop/route invalid entries.
3) **Create-memory guard**: prevent `create_memory()` from trying to embed empty/NULL content (either guard in SQL or in worker).
4) **Better “context provisioning”**: If you *want* worldview updates/relationship links, pass the model the actual candidate UUIDs in the reflect input (e.g., a small list of top-N worldview primitives and top-N memories from this heartbeat).

