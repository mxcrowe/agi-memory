# Memory Clustering Gap - Finding Report

**Date:** 2026-01-09
**Discovered by:** Dashboard wiring exposed empty Semantic Density Map
**Priority:** Medium-High (affects semantic organization)

---

## Summary

Memory clustering exists in schema but **memories are never automatically assigned to clusters**. The `assign_memory_to_clusters()` function is defined but never called during memory creation.

---

## Evidence

| Metric                         | Value                 |
| ------------------------------ | --------------------- |
| Total memories                 | 786                   |
| Total clusters                 | 16                    |
| Clusters with members          | **4** (all test data) |
| Production cluster assignments | **0**                 |

---

## Root Cause

**`create_episodic_memory()`** and other memory creation functions do NOT call `assign_memory_to_clusters()`.

```sql
-- schema.sql line 1558
new_memory_id := create_memory('episodic', p_content, ...);
-- Missing: PERFORM assign_memory_to_clusters(new_memory_id);
```

---

## Affected Functions

| Function                     | Line | Issue                                |
| ---------------------------- | ---- | ------------------------------------ |
| `create_memory()`            | 1500 | Base function, no cluster assignment |
| `create_episodic_memory()`   | 1537 | No cluster assignment                |
| `create_semantic_memory()`   | 1573 | No cluster assignment                |
| `create_procedural_memory()` | 1617 | No cluster assignment                |
| `create_strategic_memory()`  | 1658 | No cluster assignment                |

---

## Existing Infrastructure

The clustering machinery exists:

```sql
-- schema.sql line 1955
CREATE OR REPLACE FUNCTION assign_memory_to_clusters(
    p_memory_id UUID,
    p_max_clusters INT DEFAULT 3
) RETURNS VOID AS $$
-- Compares memory embedding to cluster centroids
-- Assigns if similarity >= 0.7
-- Adds to memory_cluster_members junction table
```

---

## Additional Considerations

1. **Cluster centroids** — Many clusters may have NULL `centroid_embedding`. Check:

   ```sql
   SELECT COUNT(*) FROM memory_clusters WHERE centroid_embedding IS NOT NULL;
   ```

2. **Duplicate clusters** — "Human Connection" exists twice with different UUIDs

3. **Test data cleanup** — Several clusters are test artifacts ("Circular Cluster", "Insights order test")

---

## Recommended Fix

**Option A: Call during memory creation**

```sql
-- In create_memory() after INSERT:
PERFORM assign_memory_to_clusters(new_id);
```

**Option B: Batch assignment in maintenance**

```sql
-- In subconscious_maintenance_tick():
FOR mem_id IN SELECT id FROM memories
  WHERE id NOT IN (SELECT DISTINCT memory_id FROM memory_cluster_members)
  LIMIT 50
LOOP
  PERFORM assign_memory_to_clusters(mem_id);
END LOOP;
```

---

## Files to Modify

- `schema.sql` — Add cluster assignment calls
- Potentially `worker.py` — If batch approach is preferred

---

_This finding was discovered while wiring the Dashboard Semantic Density Map to real data._
