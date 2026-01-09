# Memory Clustering Adaptive Threshold - 2026-01-10

## Summary
Clustering was present but effectively inert: `assign_memory_to_clusters()` used a fixed 0.7 similarity threshold and was never called during memory creation. We enabled automatic assignment on creation and added an adaptive threshold that calibrates from the current embedding/centroid distribution.

## Changes
- Added `cluster_config` table to store adaptive clustering parameters:
  - `similarity_threshold`, `similarity_percentile`, `similarity_sample_size`, `similarity_max_age_hours`
- Added helper functions:
  - `refresh_cluster_similarity_threshold(...)`
  - `get_cluster_similarity_threshold(...)`
- Updated `assign_memory_to_clusters()` to use adaptive threshold.
- Updated `create_memory()` to call `assign_memory_to_clusters()` when centroids exist.

## Phase IV Backfill Notes (pgAdmin)
- Rebuilt centroids from cluster metadata (name/description/keywords).
- Batched assignments in 100–200 memory chunks.
- Temporarily pinned `similarity_threshold` for backfill, then returned to adaptive mode.
- End state (approx): 612 distinct memories clustered, 154 left unclustered for quality.

## Recommended Steady-State Settings
- `similarity_percentile` set to 0.6
- `similarity_sample_size` set to 200
- `similarity_max_age_hours` set to 24

## Verification Queries
```sql
SELECT COUNT(*) FROM memory_cluster_members;
SELECT COUNT(DISTINCT memory_id) FROM memory_cluster_members;
```

```sql
SELECT key, value FROM cluster_config
WHERE key IN ('similarity_threshold','similarity_percentile');
```
