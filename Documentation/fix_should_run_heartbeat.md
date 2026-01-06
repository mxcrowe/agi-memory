# Fix: `should_run_heartbeat()` Single Source of Truth

**Date:** 2026-01-05
**Author:** Cael (with Michael)

## Problem

The `should_run_heartbeat()` function calculated heartbeat timing independently from the `next_heartbeat_at` column, leading to inconsistencies:

- **Dashboard** showed `next_heartbeat_at` value
- **Worker** used `last_heartbeat_at + config_interval` calculation
- When heartbeats failed or configs changed, these could drift apart

### Symptom

Dashboard showed "Next Beat Due: Now" but heartbeats weren't running because the function calculated a different due time internally.

## Solution

Modified `should_run_heartbeat()` to check `next_heartbeat_at` directly instead of recalculating:

```sql
-- Old: Recalculated from config (could drift)
RETURN CURRENT_TIMESTAMP >= state_record.last_heartbeat_at + (interval_minutes || ' minutes')::INTERVAL;

-- New: Uses scheduled column directly (single source of truth)
RETURN CURRENT_TIMESTAMP >= state_record.next_heartbeat_at;
```

## Benefits

- Dashboard and worker now use the same timing source
- Manually fixing `next_heartbeat_at` immediately fixes scheduling
- Simpler function (removed unused config lookup)

## Files Changed

- `schema.sql`: `should_run_heartbeat()` function (lines 3045-3070)

## Migration

Function was applied live via pgAdmin, then schema.sql updated to match.

## Recovery SQL

If timing gets out of sync in the future:

```sql
UPDATE heartbeat_state
SET next_heartbeat_at = last_heartbeat_at +
    ((SELECT value FROM heartbeat_config WHERE key = 'heartbeat_interval_minutes') || ' minutes')::INTERVAL
WHERE id = 1;
```
