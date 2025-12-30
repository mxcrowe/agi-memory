# agi-mem Ingestion Boundary & Memory Safety

## Problem This Solves

Large Language Models do not guarantee:
- valid enum values
- valid UUIDs
- syntactically safe graph mutations
- consistency across calls

Treating LLM output as executable instructions leads to:
- database crashes
- stranded heartbeats
- corrupted graph state
- non-reproducible failures

agi-mem explicitly rejects this model.

---

## Core Design Principle

> **LLM output is a proposal, not an instruction.**

All proposals must pass through **explicit validation layers** before they are allowed to mutate persistent state.

---

## Ingestion Layers

### 1. Heartbeat Action Layer (`execute_heartbeat_action`)
Responsibilities:
- Validate identifiers (`try_uuid`)
- Validate enums (`graph_edge_type`)
- Enforce action contracts
- Fail soft (never crash the worker loop)

Invalid proposals:
- are rejected
- do not halt heartbeats
- do not poison state

### 2. Graph Mutation Layer (`create_memory_relationship`)
Responsibilities:
- Enforce Cypher-safe identifiers
- Prevent malformed edge creation
- Guarantee graph integrity even if upstream logic is bypassed

This is a **belt-and-suspenders layer**:  
graph safety does not depend on perfect callers.

---

## Semantic Salvage (Fix 1c)

When a proposal is rejected:
- its **semantic intent is preserved**
- stored as a low-importance episodic memory
- tagged as `ingestion_reject`

This ensures:
- learning without corruption
- observability of model behavior
- future re-interpretation or repair

Nothing meaningful is silently lost.

---

## Schema & Migration Strategy

- **`schema.sql`**
  - canonical bootstrap
  - used only for fresh database creation
  - must reflect the current hardened production state

- **Migration files**
  - evolve existing databases safely
  - always additive / replace-in-place
  - never destructive

Rule:
> *If a fix matters, it belongs in both a migration and the canonical schema.*

---

## Why This Matters Going Forward

This architecture enables:
- multi-model ingestion (Claude, GPT, OpenRouter, councils)
- safe experimentation with autonomy
- long-running memory without entropy
- deterministic rebuilds
- human + LLM co-development without fear

agi-mem does not assume perfection.  
It assumes **resilience**.
