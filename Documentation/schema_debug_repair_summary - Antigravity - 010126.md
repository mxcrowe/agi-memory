# Schema Debug & Repair Summary

**Date:** 2026-01-02
**Issue:** Maintenance worker (MX) never executed successfully

---

## Root Cause

The function `cleanup_working_memory_with_stats()` was **accidentally deleted** from `schema.sql` at some point after the initial design. This function is called by `run_subconscious_maintenance()`, causing every maintenance tick to fail silently.

### Evidence

- `maintenance_state.last_maintenance_at` was NULL
- Manual execution of `SELECT run_subconscious_maintenance();` produced:
  ```
  ERROR: function cleanup_working_memory_with_stats(double precision, integer) does not exist
  ```

### Discovery Method

Searched codebase for function definition:

```bash
grep -r "cleanup_working_memory_with_stats" .
```

Found in backup files (`schema_original.sql`, `schema_dump.sql`) but **missing from main `schema.sql`**.

---

## Repairs Applied

### 1. Restored Missing Function

**File:** `schema.sql` (around line 2056)

```sql
CREATE OR REPLACE FUNCTION cleanup_working_memory_with_stats(
    p_min_importance_to_promote FLOAT DEFAULT 0.75,
    p_min_accesses_to_promote INT DEFAULT 3
)
RETURNS JSONB AS $$
DECLARE
    promoted UUID[] := ARRAY[]::uuid[];
    rec RECORD;
    deleted_count INT := 0;
BEGIN
    FOR rec IN
        SELECT id, importance, access_count, promote_to_long_term
        FROM working_memory
        WHERE expiry < CURRENT_TIMESTAMP
    LOOP
        IF COALESCE(rec.promote_to_long_term, false)
           OR COALESCE(rec.importance, 0) >= COALESCE(p_min_importance_to_promote, 0.75)
           OR COALESCE(rec.access_count, 0) >= COALESCE(p_min_accesses_to_promote, 3)
        THEN
            promoted := array_append(promoted, promote_working_memory_to_episodic(rec.id, rec.importance));
        END IF;
    END LOOP;

    WITH deleted AS (
        DELETE FROM working_memory
        WHERE expiry < CURRENT_TIMESTAMP
        RETURNING 1
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;

    RETURN jsonb_build_object(
        'deleted_count', COALESCE(deleted_count, 0),
        'promoted_count', COALESCE(array_length(promoted, 1), 0),
        'promoted_ids', COALESCE(to_jsonb(promoted), '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql;
```

**Live DB Injection:** ✅ Applied via pgAdmin

---

### 2. Added Maintenance Logging

**File:** `schema.sql` (after `maintenance_state` table)

```sql
CREATE TABLE maintenance_log (
    id SERIAL PRIMARY KEY,
    ran_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    neighborhoods_recomputed INT DEFAULT 0,
    embedding_cache_deleted INT DEFAULT 0,
    working_memory_deleted INT DEFAULT 0,
    working_memory_promoted INT DEFAULT 0,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);

CREATE INDEX idx_maintenance_log_ran_at ON maintenance_log (ran_at DESC);
```

**Live DB Injection:** ✅ Applied via pgAdmin

---

### 3. Updated `run_subconscious_maintenance()` to Log

**File:** `schema.sql` (around line 3020)

Added INSERT after maintenance operations:

```sql
-- Log the maintenance run for dashboard
INSERT INTO maintenance_log (
    ran_at,
    neighborhoods_recomputed,
    embedding_cache_deleted,
    working_memory_deleted,
    working_memory_promoted,
    success
) VALUES (
    CURRENT_TIMESTAMP,
    COALESCE(recomputed, 0),
    COALESCE(cache_deleted, 0),
    COALESCE(NULLIF(wm_stats->>'deleted_count', '')::int, 0),
    COALESCE(NULLIF(wm_stats->>'promoted_count', '')::int, 0),
    true
);
```

**Live DB Injection:** ✅ Applied via pgAdmin

---

## Verification

After repairs, maintenance runs successfully:

```sql
SELECT run_subconscious_maintenance();
```

Returns:

```json
{
  "ran_at": "2026-01-02T02:45:27+00:00",
  "success": true,
  "working_memory": {
    "deleted_count": 0,
    "promoted_count": 0,
    "promoted_ids": []
  },
  "neighborhoods_recomputed": 10,
  "embedding_cache_deleted": 0
}
```

Dashboard now displays:

- Last Tick: Just now
- Neighbors: 10
- Cache: 0
- WM Del: 0
- WM Promo: 0

---

## Impact Assessment

| Concern                  | Status                                    |
| ------------------------ | ----------------------------------------- |
| **Memories lost?**       | No — 169 long-term memories intact        |
| **Working memory lost?** | None existed (count was 0)                |
| **Neighborhoods stale?** | Yes, but catching up now (10 per MX tick) |
| **Graph relationships?** | Intact, neighborhoods refreshing          |
| **Need DB reset?**       | No — data is recoverable                  |

---

## Prevention

1. Added comment to critical function: `-- CRITICAL: This function is called by run_subconscious_maintenance()`
2. `maintenance_log` table now provides visibility into MX operations
3. Dashboard displays maintenance stats for monitoring
