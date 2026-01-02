# Hexis Dashboard Changelog

Tracking modifications made during Antigravity AI pair programming sessions.

---

## [2026-01-02] Database & Live Data Integration

### Database Client Migration

- **Changed**: Replaced `@neondatabase/serverless` with `postgres` client
- **Reason**: Local Docker PostgreSQL compatibility (Neon client requires their serverless proxy)
- **Files Modified**: `lib/db.ts`

### Live Data Queries

Added real database queries replacing mock data:

- `getAgentStatus()` — Memory counts (episodic, semantic, procedural, strategic), cluster count
- `getHeartbeatState()` — Energy, heartbeat count, timing, pause status, affective state
- `getRecentHeartbeats()` — Heartbeat log entries with energy changes and narratives
- `getDriveStatus()` — All 5 drives with urgency percentages
- `getMaintenanceState()` — MX state, interval, memory tier counts, last run stats

**Files Modified**: `lib/db-queries.ts`, `app/page.tsx`

---

## [2026-01-02] New Components

### DriveStatus

Displays all 5 intrinsic drives (curiosity, coherence, connection, competence, rest) with:

- Urgency progress bars
- Threshold indicators
- Real-time values from `drive_status` view

**File**: `components/drive-status.tsx`

### Subconscious Reflection (merged into RuminationTicker)

Added maintenance monitoring to existing RuminationTicker:

- Active/Paused status badge
- Last Tick timing
- Interval display (660s)
- Memory Tiers (Working, Long-Term, Semantic counts)
- Last Run Stats (Neighbors, Cache, WM Del, WM Promo)

**File**: `components/rumination-ticker.tsx`

---

## [2026-01-02] UI Enhancements

### Agent Status Card

- Renamed title to "Current Status"
- Added Emotional State section with VAD model (Valence, Arousal, Dominance)
- Shows numeric values after descriptive labels

### Vitality Metrics

- Changed labels: "HB Interval" → "Heartbeat Interval", "MX Interval" → "Maintenance Interval"
- Changed "Uptime Since Init" → "Elapsed Time Since Init"

### Header

- Added current date/time display next to "Hexis Dashboard" title

---

## [2026-01-02] Page Reorganization

### Status Tab (`app/page.tsx`)

- Removed Memory Dynamics section (relocated to Memory tab)
- Now focused on operational status: heartbeat, drives, energy, subconscious

### Memory Tab (`app/memory/page.tsx`)

- Added Memory Dynamics section with:
  - Semantic Density Map
  - Insight Consolidation Progress
  - Memory Depth Chart

---

## [2026-01-02] Schema Fixes (Related)

> Full details in `schema_debug_repair_summary.md`

### Missing Function Restored

- `cleanup_working_memory_with_stats()` was accidentally deleted from `schema.sql`
- This caused all maintenance ticks to fail silently
- Function restored from backup files

### Maintenance Logging Added

- Created `maintenance_log` table to persist MX run stats
- Updated `run_subconscious_maintenance()` to log each run
- Dashboard now displays historical maintenance data

---

## Known Issues (Deferred)

- TypeScript lint warnings for placeholder data types (Goals, Ruminations)
- Some components still use mock data (Memory tab, Goals list)
- Chat and Config pages not yet wired to live data
