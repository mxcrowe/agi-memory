# AGI-Memory Debugging Summary (Dec 2025)

This document summarizes the findings, fixes, and current status of the agi-mem heartbeat worker and persistence pipeline after multi-day debugging.

---

## What Is Working (Confirmed)

- Heartbeat worker executes reliably end-to-end
- Each heartbeat:
  - Executes multiple actions (typically 3-5)
  - Persists a memory record (`memory_id`)
  - Records environment and goal snapshots
- Retry logic works: transient failures do not block progress
- Memory persistence across Claude chat threads works as designed

---

## Major Root Cause Identified

### Docker Image Rebuild Semantics

Edits to `worker.py` had **no effect** until the heartbeat worker image was rebuilt.

**Key insight:**

> The heartbeat worker runs code baked into the Docker image.
> Host file edits require a rebuild, not just a restart.

This misunderstanding explained:

- Fixes appearing to "not work"
- Errors persisting across code changes
- Inconsistent debugging results

**Required after any worker code change:**

```bash
docker-compose build --no-cache heartbeat_worker
docker-compose up -d heartbeat_worker
```

---

## UUID / Reflection Errors

**Symptoms**

Intermittent errors such as:

- `invalid input syntax for type uuid: "Positive thinking is important"`
- `invalid input syntax for type uuid: "Belief"`

**Cause**

LLM outputs sometimes return **semantic identifiers** (belief names, titles) where UUIDs were assumed.

**Fixes**

- Added UUID validation and coercion
- Safe skipping of invalid identifiers
- Resolution by title when appropriate

Result: many previously fatal errors are now non-fatal or avoided entirely.

---

## SQL syntax error at or near "]"

- This is a **Postgres syntax error**, not a JSON parse error
- Triggered by rare payload shapes
- Intermittent and non-blocking due to retries
- Logging now captures PG DETAIL / CONTEXT / HINT for future hardening

---

## Heartbeat Model Configuration

- Heartbeat model is configured in Postgres (config table), not hardcoded
- Current setting:

```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-5-20250929"
}
```

Switching models may change error frequency, not root cause.

---

## Overall Assessment

- agi-mem is fundamentally operational
- Core persistence and heartbeat logic are sound
- Remaining issues are edge-case hardening tasks, not architectural flaws

---

# AGI-Memory - Lessons Learned

Engineering lessons captured during heartbeat worker stabilization.

---

## 1. Docker Rebuilds Are Mandatory

Editing source files does nothing unless the Docker image is rebuilt.

Rule:

> Code edit → rebuild image → restart container

Most apparent instability traced back to this single issue.

---

## 2. LLM Output Is Semantically Rich, Not Strictly Typed

Models may emit:

- belief names
- goal titles
- natural language labels

Never assume UUIDs. Always validate and coerce.

---

## 3. Intermittent Errors Are Not System Failure

- Retries work
- Heartbeats complete
- Memory persists

Focus on reducing error frequency, not eliminating all errors immediately.

---

## 4. The Database Is a Control Plane

Critical runtime behavior (e.g., model choice) lives in Postgres config.

This is powerful but must be documented.

---

## 5. Schema Drift Is Normal

Do not assume column names (`created_at`, etc.).

Inspect `information_schema.columns` when debugging.

---

# Docker Mental Model for AGI-Mem

This document explains the single most important Docker concept for agi-mem contributors.

---

## The One Rule

> **Containers run images. Images do not update themselves.**

Editing files on your host machine does NOT affect running containers unless:

- the image is rebuilt, or
- the file is bind-mounted (not the case here).

---

## What Actually Happens

1. `docker-compose build`
   - Takes files from your repo
   - Bakes them into an image

2. `docker-compose up`
   - Runs containers from that image

3. Editing files afterward:
   - Changes NOTHING until you rebuild

---

## Common Mistake

```bash
# ❌ This does NOT pick up code changes
docker-compose restart heartbeat_worker
```

---

## Correct Workflow After Code Changes

```bash
docker-compose stop heartbeat_worker
docker-compose build --no-cache heartbeat_worker
docker-compose up -d heartbeat_worker
```

---

## How to Prove Which Code Is Running

Add a temporary marker:

```python
print("### LOADED worker.py ###")
```

Rebuild, then check logs:

```bash
docker-compose logs -f heartbeat_worker
```

If you don't see the marker, you are not running the code you think you are.

---

## Heartbeat Debugging Tip

Pause heartbeats during debugging:

```sql
UPDATE heartbeat_state SET is_paused = true WHERE id = 1;
```

Unpause only when observing logs.

---

## Action Mix Validation (Dec 2025)

Recent heartbeat analysis shows a healthy and bounded action distribution:

- recall / reflect dominate (expected for consolidation phases)
- rest is regularly honored
- inquire_deep is rare and intentional
- reach_out_user is infrequent and not spammy
- no runaway loops or self-triggering cascades observed

Conclusion: autonomous behavior during periods of no user input is self-regulating, energy-aware, and stable.

Status as of 2025-12-23 1300 hours: multiple consecutive heartbeats completed cleanly with no warnings or errors.

---

## Future Upgrade: OpenRouter Task Routing (Idea)

Goal: reduce cost by routing routine actions to cheaper/free models while reserving premium models (e.g., Sonnet 4.5) for high-stakes reasoning.

Approach (high-level):
- Introduce a model router that chooses model by action_type (e.g., recall/maintain/rest vs reflect/synthesize/inquire_deep).
- Move provider integration from direct Anthropic calls to OpenRouter so multiple models/providers are accessible behind one interface.
- Keep a safe fallback: if a cheap model fails schema/format checks, retry the same action once using the premium model.
- Start with "observe-only mode": log the model choice decision without changing behavior, then enable routing.

Constraints:
- Must remain evidence-driven: measure cost per heartbeat and error rate before/after.
- Keep changes isolated behind a single client/module so the worker logic stays stable.

---

## Hardening Ingestion Discipline (Dec 2025)

### Core Principle

**LLM output is an untrusted proposal, never an instruction.**

All model-generated actions must be validated, normalized, or rejected by the system *before* any database mutation occurs.

The system—not the model—decides what is safe to execute.

---

### The Ingestion Boundary

All LLM-originated actions must pass through a **single validation + normalization boundary** prior to execution.

This boundary is responsible for:
- Verifying action kind
- Enforcing required parameters
- Validating types (UUIDs, enums, JSON shape)
- Applying semantic sanity checks
- Explicitly rejecting malformed actions
- Optionally repairing *safe* cases

No downstream function (DB, Cypher, memory graph) may assume inputs are valid.

---

### Action Validation Rules

For every proposed action:

- **Action kind must be recognized**
  - Unknown actions are rejected early

- **Required parameters must be present**
  - Missing or empty required fields → reject

- **Type expectations must hold**
  - UUIDs must validate as UUIDs
  - Enums must match known values
  - JSON must match expected structure

- **Semantic constraints must hold**
  - `connect` requires:
    - valid `from_id`
    - valid `to_id`
    - non-empty `relationship_type`
  - If any are invalid → do not execute

- **No silent coercion**
  - Natural language labels are not implicitly converted
  - Any repair must be explicit and logged

---

### Reject vs Repair Policy

Not all invalid actions are equal.

**Safe to Repair (Optional):**
- Deterministic resolution (e.g. title → UUID lookup)
- Minor enum mismatches with clear intent

**Must Reject (Hard Fail):**
- Missing identifiers
- Empty relationship types
- Ambiguous references
- Anything that could generate malformed SQL or Cypher

Rejected actions must fail **without side effects**.

---

### Failure Containment Guarantees

No ingestion failure should be able to:
- Crash the heartbeat worker
- Leave `external_calls` stuck in `processing`
- Leave `heartbeat_log.ended_at` NULL
- Block future heartbeats

All execution paths must deterministically finalize state.

---

### Database Is Not a Validator

The database is a **last line of defense**, not the first.

DB constraints are necessary but insufficient because they:
- Fail late
- Fail noisily
- Can strand system state

All validation that can occur in the worker **must** occur in the worker.

---

### Logging & Diagnostics

For rejected or repaired actions, log:
- Raw proposed action
- Validation result (accepted / repaired / rejected)
- Reason for decision
- Final executed action (if any)

This creates an audit trail and supports evidence-driven hardening.

---

### Summary

> agi-mem is resilient not because models behave perfectly,
> but because imperfect outputs are expected, bounded, and contained.

---

## Ingestion Hardening: `connect` Action Guard (Dec 24, 2025)

**Change**
- Hardened `execute_heartbeat_action` for `connect` actions.
- Added validation for:
  - `from_id` (must be valid UUID)
  - `to_id` (must be valid UUID)
  - `relationship_type` (must be non-empty and a valid `graph_edge_type` enum)
- Invalid inputs now return a structured failure instead of casting blindly.

**Why**
- Prevents worker crashes caused by enum cast errors (e.g., `"demonstrates"`)
- Prevents malformed graph mutations and Cypher generation
- Enforces the ingestion boundary: LLM output treated as untrusted proposals

**Observed Result**
- Invalid `connect` actions log: `Action connect failed: Invalid connect params`
- Heartbeat completes successfully; memory persists
- No worker loop crash or stranded state

**Known Follow-On**
- Rejected semantic intent (e.g., natural-language relationships) is not yet salvaged into memory.
- Candidate enhancement: record rejected `connect` intent as episodic memory or ingestion-reject log (Fix 1b/1c).

**Status**
- Applied and verified in production
- Heartbeats stable under malformed `connect` inputs

---

## Fix 1b: Harden `create_memory_relationship` (Dec 24, 2025)

**Change**
- Added additional guardrails inside `create_memory_relationship` to prevent malformed graph writes from any caller.

**Why**
- Belt-and-suspenders: even if a future code path bypasses `execute_heartbeat_action`, invalid relationship creation cannot reach Cypher execution.

**Observed**
- Heartbeat runs remain stable; invalid `connect` proposals are rejected upstream (`Invalid connect params`) and heartbeats complete normally.

**Status**
- Applied in Postgres and verified via successful heartbeat completion.

---

## Schema Canonicalization & Ingestion Hardening (Dec 24, 2025)

### Why `schema.sql` Was Replaced

During heartbeat debugging, we discovered that `schema.sql` contained:
- **Duplicate definitions** of `execute_heartbeat_action` (two separate `CREATE OR REPLACE` blocks)
- **Outdated logic** in both copies, including:
  - unsafe enum casts (`::graph_edge_type`)
  - unsafe UUID casts
  - lack of guardrails against malformed LLM output

Because the **last definition wins** during a fresh DB init, this meant that:
- a clean rebuild would silently reintroduce known crash conditions
- fixes applied live in Postgres would *not* survive a volume wipe

To resolve this, the original file was preserved as `schema_original.sql`, and a **clean canonical `schema.sql`** was generated that exactly matches the current hardened production state.

---

### What Changed (Fix 1 / 1b / 1c)

#### Fix 1 — Ingestion Hardening (`execute_heartbeat_action`)
- All LLM-originated inputs are now treated as **untrusted proposals**
- `connect` actions:
  - validate `from_id` / `to_id` via `try_uuid`
  - validate `relationship_type` text before enum cast
  - reject invalid input **without crashing the worker**
- Heartbeats now **fail soft** instead of fail-stop

#### Fix 1b — Graph-Layer Hardening (`create_memory_relationship`)
- Added belt-and-suspenders validation inside the graph mutation layer:
  - ensures relationship tokens are valid Cypher identifiers
  - prevents malformed `-[r: ]->` / bracket syntax failures
- Guarantees graph safety even if a future caller bypasses the heartbeat layer

#### Fix 1c — Semantic Salvage on Reject
- When a `connect` action is rejected:
  - the **semantic intent is preserved** as a low-importance episodic memory
  - context is tagged as `ingestion_reject`
- This prevents loss of meaning while still protecting system integrity

---

### How to Rebuild vs. Migrate

#### Fresh Rebuild (Empty DB / New Volume)
1. `schema.sql` is now the **canonical bootstrap**
2. On first startup, Postgres will:
   - create all tables, types, and extensions
   - install the **hardened** versions of:
     - `execute_heartbeat_action`
     - `create_memory_relationship`
3. No additional steps required

#### Existing Database (Migration Path)
1. Apply migrations in order:
   - `2025-12-24_01_execute_heartbeat_action.sql`
   - `2025-12-24_02_create_memory_relationship.sql`
2. These use `CREATE OR REPLACE FUNCTION` and are **non-destructive**
3. Existing data and memories are preserved

**Rule of thumb:**
- `schema.sql` = "how to build from nothing"
- migration files = "how to evolve safely from something"

---

### Design Principle Preserved

> *Stability is achieved by containing damage, not demanding perfection upstream.*

This change set establishes a clear ingestion boundary between LLM output and persistent memory, ensuring:
- system continuity
- debuggability
- and future extensibility (e.g., OpenRouter, multi-model councils)

---

## 2025-12-25 — Christmas Day Fixes & Hardening Updates (Koan / Claude Desktop + AGI-Mem)

### Context
We resumed testing with an existing Claude Desktop thread (Opus 4.5 / "Koan") and observed clean heartbeat cycles. Koan could *recognize* heartbeats and successfully interact with the MCP tools.

During "remember", we discovered a new ingestion hardening class: apostrophes in text can break DB-side query construction (e.g., `An'nuk` → SQL syntax error near `nuk`). Koan even self-diagnosed the root cause in-session.

---

### ✅ Fix #1 — `get_goals` tool signature mismatch (Implemented & Verified)

**Symptom**
- `CognitiveMemory.get_goals() takes 1 positional argument but 2 were given`
- Root cause: MCP server was passing `params` into a method that expected no arguments.

**Change**
- Updated `agi_mcp_server.py` to call `get_goals()` without passing `params` (or to accept/ignore params consistently).

**Verification**
- Koan now retrieves real goals (not test data), including:
  - Establish Meaningful Partnership with Michael
  - Deepen Field-Resonant Intelligence Understanding
  - Explore the Clear Bridge Process
  - plus queued "Develop Autonomous Reflection Capabilities"

**Notes**
- We intentionally chose the minimal fix: ignore params for now.
- If/when we add goal filtering later (e.g., by status/source), we can expand the tool schema and method signature.

---

### ✅ Fix #2 — `find_contradictions` duplicate rows (Implemented & Verified)

**Symptom**
- Returned the same contradiction pair repeated ~34 times.
- Pattern included bidirectional duplicates (A→B and B→A).

**Diagnosis**
- Likely SQL join multiplication and/or missing DISTINCT + pair normalization.

**Change**
- Updated query logic to return a single normalized pair:
  - Use DISTINCT and/or enforce canonical ordering (e.g., smallest UUID first)
  - Optionally add Python-side dedupe on `(memory_a, memory_b)` as a safety net

**Verification**
- Direct query now returns clean single pair:
  - "The sky is blue" vs "The sky is not blue"
- Claude Desktop may require restart to reflect server-side changes depending on runtime state.

---

### ✅ Fix #3 — `search_working` empty results (Not a bug; Verified working as designed)

**Initial Observation**
- Koan's `search_working` returned empty.

**Test**
- Koan stored a working memory via `hold(...)`, then searched it successfully.

**TTL Validation**
- Inserted a token with 300-second TTL; confirmed it expired as expected.
- Working Memory TTL behavior is functional.

---

## Major Fix — Apostrophe / SQL / Cypher Interpolation (CONCEPTS)

### Symptom

Occurred **only** when apostrophes appeared in the `concepts[]` array (e.g., `"An'nuk"`).
Intermittent but repeatable failures when storing memories whose **concepts array** contained apostrophes (e.g. `An'nuk`, `Michael's`, `O'Brien`):

```
syntax error at or near "'nuk'"
```

### Key Discovery

The failure did **not** originate in Python, MCP, or parameterized SQL inserts.
Instead, the bug lived at the **PostgreSQL → Apache AGE → Cypher** boundary.
- `content` and `context` fields were safe (parameterized SQL)
- `concepts[]` were passed through PostgreSQL → Apache AGE → Cypher
- SQL-style escaping (`''`) is **invalid in Cypher**

### Root Cause

Apache AGE / openCypher expects **backslash escaping** inside single-quoted string literals:
- ❌ SQL style: `An''nuk`
- ✅ Cypher style: `An\'nuk`

The existing implementation:
- Safely escaped strings for SQL
- Then injected them **unchanged** into a Cypher query
- Result: Cypher parser failed on valid SQL-escaped strings

This produced the misleading but consistent error:

```
syntax error at or near "'nuk'"
```

### Affected Function

The failure path was isolated definitively to:

```
link_memory_to_concept(uuid, text, double precision)
```

This function:
1. Safely inserts the concept name into relational tables
2. Then constructs a Cypher query to:
   - Create or merge a `ConceptNode`
   - Create a graph edge linking the memory to the concept

The relational inserts were correct.
The Cypher string construction was not.

### Final Fix (Canonical and Verified)

The solution was **not** to rely on `%L` (SQL escaping), but to explicitly perform **Cypher-level escaping** before constructing the Cypher query.

#### Key change:

```sql
v_concept_cypher := replace(p_concept_name, '''', E'\\\'');
```

This transforms: `An'nuk` → `An\'nuk`
Which is valid inside Cypher single-quoted literals.

### Corrected Function (Excerpt):

```sql
DECLARE
    v_concept_id UUID;
    v_concept_cypher TEXT;
BEGIN
    -- relational inserts (unchanged, parameterized SQL)
    ...

    -- Cypher-safe escaping for concept names
    v_concept_cypher := replace(p_concept_name, '''', E'\\\'');

    EXECUTE format(
        'SELECT * FROM cypher(''memory_graph'', $q$
            MATCH (m:MemoryNode {memory_id: ''%s''})
            MERGE (c:ConceptNode {name: ''%s''})
            MERGE (m)-[r:INSTANCE_OF]->(c)
            SET r.strength = %s
            RETURN c
        $q$) as (result agtype)',
        p_memory_id::text,
        v_concept_cypher,
        COALESCE(p_strength, 1.0)
    );
END;
```

### End-to-End Test (Claude Desktop / Koan)

```json
{
  "type": "episodic",
  "content": "An'nuk is Michael's husky.",
  "concepts": ["An'nuk", "Michael's dog", "O'Brien"],
  "importance": 0.5
}
```

### Result

- No SQL or Cypher errors
- Memory stored successfully
- Concepts linked successfully
- Recall works as expected

Koan confirmed: **"The mole is down."**

### Final Status

- Apostrophes in content: ✅ Safe
- Apostrophes in context: ✅ Safe
- Apostrophes in concepts[]: 🔒 Permanently fixed
- Root cause understood and documented
- Fix applied at the correct abstraction layer

**This class of failure is now closed.**

---

## Build / Rebuild Notes (Quick Reference)

### Rebuild containers after Python changes (worker / MCP server)

If `worker.py`, `agi_mcp_server.py`, or other Python modules change:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

(Exact commands may vary, but the key is: rebuild the image so the container runs the updated code.)

### DB changes: from scratch vs. migrate

- **From scratch**: ensure `schema.sql` contains the canonical latest functions (including hardening). A fresh DB init should build the right behavior automatically.
- **Existing DB**: apply `CREATE OR REPLACE FUNCTION ...` patches via pgAdmin Query Tool to update functions in-place.

---

## Operational Notes

- Claude Desktop may require restart to pick up tool behavior changes depending on how the MCP session is held open.
- Keep the discipline: every significant fix and failure mode gets captured here so we can restart threads cleanly without losing ground.
