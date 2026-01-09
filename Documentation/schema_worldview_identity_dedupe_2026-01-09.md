# Worldview/Identity Dedupe + Reflection Upsert (2026-01-09)

## Context
- Symptom: `reflect` was repeatedly inserting identical worldview beliefs and identity updates each heartbeat, causing duplicates.
- Root cause: `process_reflection_result` inserted rows without dedupe/upsert safeguards.

## pgAdmin Injection (one-time cleanup)
- Cleaned duplicate `worldview_primitives` by keeping the highest-confidence (or oldest) row per `(category, belief)` and remapping influences.
- Cleaned duplicate `identity_aspects` by keeping one row per `(aspect_type, change)` and remapping resonance links.
- Verified no duplicates remained after cleanup queries.

## Permanent Schema Fixes
- Added unique indexes:
  - `worldview_primitives (category, belief)`
  - `identity_aspects (aspect_type, (content->>'change'))`
- Updated `process_reflection_result` to:
  - `ON CONFLICT DO NOTHING` for `identity_updates`
  - Insert/update `worldview_new` via `(category, belief)` upsert

## Verification
- Forced a `reflect` heartbeat and re-ran duplicate checks.
- Result: no duplicate worldview or identity rows returned.
