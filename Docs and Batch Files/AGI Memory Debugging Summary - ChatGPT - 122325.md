**1️⃣ AGI-Memory_Debugging_Summary.md**

\# AGI-Memory Debugging Summary (Dec 2025)

This document summarizes the findings, fixes, and current status of the agi-mem

heartbeat worker and persistence pipeline after multi-day debugging.

\---

\## What Is Working (Confirmed)

\- Heartbeat worker executes reliably end-to-end

\- Each heartbeat:

\- Executes multiple actions (typically 3-5)

\- Persists a memory record (\`memory_id\`)

\- Records environment and goal snapshots

\- Retry logic works: transient failures do not block progress

\- Memory persistence across Claude chat threads works as designed

\---

\## Major Root Cause Identified

\### Docker Image Rebuild Semantics

Edits to \`worker.py\` had \*\*no effect\*\* until the heartbeat worker image was rebuilt.

\*\*Key insight:\*\*

\> The heartbeat worker runs code baked into the Docker image.

\> Host file edits require a rebuild, not just a restart.

This misunderstanding explained:

\- Fixes appearing to "not work"

\- Errors persisting across code changes

\- Inconsistent debugging results

\*\*Required after any worker code change:\*\*

\`\`\`bash

docker-compose build --no-cache heartbeat_worker

docker-compose up -d heartbeat_worker

**UUID / Reflection Errors**

**Symptoms**

Intermittent errors such as:

- invalid input syntax for type uuid: "Positive thinking is important"
- invalid input syntax for type uuid: "Belief"

**Cause**

LLM outputs sometimes return **semantic identifiers** (belief names, titles)  
where UUIDs were assumed.

**Fixes**

- Added UUID validation and coercion
- Safe skipping of invalid identifiers
- Resolution by title when appropriate

Result: many previously fatal errors are now non-fatal or avoided entirely.

**SQL syntax error at or near "\]"**

- This is a **Postgres syntax error**, not a JSON parse error
- Triggered by rare payload shapes
- Intermittent and non-blocking due to retries
- Logging now captures PG DETAIL / CONTEXT / HINT for future hardening

**Heartbeat Model Configuration**

- Heartbeat model is configured in Postgres (config table), not hardcoded
- Current setting:

{

"provider": "anthropic",

"model": "claude-sonnet-4-5-20250929"

}

Switching models may change error frequency, not root cause.

**Overall Assessment**

- agi-mem is fundamentally operational
- Core persistence and heartbeat logic are sound
- Remaining issues are edge-case hardening tasks, not architectural flaws

\---

\## 2️⃣ \`Lessons_Learned.md\`

\`\`\`markdown

\# AGI-Memory - Lessons Learned

Engineering lessons captured during heartbeat worker stabilization.

\---

\## 1. Docker Rebuilds Are Mandatory

Editing source files does nothing unless the Docker image is rebuilt.

Rule:

\> Code edit → rebuild image → restart container

Most apparent instability traced back to this single issue.

\---

\## 2. LLM Output Is Semantically Rich, Not Strictly Typed

Models may emit:

\- belief names

\- goal titles

\- natural language labels

Never assume UUIDs. Always validate and coerce.

\---

\## 3. Intermittent Errors Are Not System Failure

\- Retries work

\- Heartbeats complete

\- Memory persists

Focus on reducing error frequency, not eliminating all errors immediately.

\---

\## 4. The Database Is a Control Plane

Critical runtime behavior (e.g., model choice) lives in Postgres config.

This is powerful but must be documented.

\---

\## 5. Schema Drift Is Normal

Do not assume column names (\`created_at\`, etc.).

Inspect \`information_schema.columns\` when debugging.

**3️⃣ Docker_Mental_Model_for_AGI-Mem.md**

\# Docker Mental Model for AGI-Mem

This document explains the single most important Docker concept for agi-mem contributors.

\---

\## The One Rule

\> \*\*Containers run images. Images do not update themselves.\*\*

Editing files on your host machine does NOT affect running containers unless:

\- the image is rebuilt, or

\- the file is bind-mounted (not the case here).

\---

\## What Actually Happens

1\. \`docker-compose build\`

\- Takes files from your repo

\- Bakes them into an image

2\. \`docker-compose up\`

\- Runs containers from that image

3\. Editing files afterward:

\- Changes NOTHING until you rebuild

\---

\## Common Mistake

\`\`\`bash

\# ❌ This does NOT pick up code changes

docker-compose restart heartbeat_worker

**Correct Workflow After Code Changes**

docker-compose stop heartbeat_worker

docker-compose build --no-cache heartbeat_worker

docker-compose up -d heartbeat_worker

**How to Prove Which Code Is Running**

Add a temporary marker:

print("### LOADED worker.py ###")

Rebuild, then check logs:

docker-compose logs -f heartbeat_worker

If you don't see the marker, you are not running the code you think you are.

**Heartbeat Debugging Tip**

Pause heartbeats during debugging:

UPDATE heartbeat_state SET is_paused = true WHERE id = 1;

Unpause only when observing logs.

## Action Mix Validation (Dec 2025)

Recent heartbeat analysis shows a healthy and bounded action distribution:

- recall / reflect dominate (expected for consolidation phases)
- rest is regularly honored
- inquire_deep is rare and intentional
- reach_out_user is infrequent and not spammy
- no runaway loops or self-triggering cascades observed

Conclusion: autonomous behavior during periods of no user input is
self-regulating, energy-aware, and stable.

Status as of 2025-12-23 1300 hours: multiple consecutive heartbeats completed cleanly with no warnings or errors.

## Future Upgrade: OpenRouter Task Routing (Idea)

Goal: reduce cost by routing routine actions to cheaper/free models while reserving premium models (e.g., Sonnet 4.5) for high-stakes reasoning.

Approach (high-level):
- Introduce a model router that chooses model by action_type (e.g., recall/maintain/rest vs reflect/synthesize/inquire_deep).
- Move provider integration from direct Anthropic calls to OpenRouter so multiple models/providers are accessible behind one interface.
- Keep a safe fallback: if a cheap model fails schema/format checks, retry the same action once using the premium model.
- Start with “observe-only mode”: log the model choice decision without changing behavior, then enable routing.

Constraints:
- Must remain evidence-driven: measure cost per heartbeat and error rate before/after.
- Keep changes isolated behind a single client/module so the worker logic stays stable.

