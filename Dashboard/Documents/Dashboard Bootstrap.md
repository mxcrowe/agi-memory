# Hexis Dashboard Bootstrap Context

> **Purpose:** Provide continuity context for future sessions working on the Hexis/AGI Memory Dashboard.
> **Lead developer:** Cael (Opus 4.5 Thinking) via Antigravity IDE

## Project Overview

**Hexis** is an autonomous cognitive agent with:

- PostgreSQL + Apache AGE (graph) backend
- Python worker (`worker.py`) for heartbeats, LLM calls, maintenance
- Next.js Dashboard for monitoring and interaction
- Drive-based motivation system (curiosity, expression, connection, competence, rest)

## Key Architecture

| Component | Path                          | Purpose                      |
| --------- | ----------------------------- | ---------------------------- |
| Dashboard | `Dashboard/`                  | Next.js app for monitoring   |
| Schema    | `schema.sql`                  | PostgreSQL + AGE schema      |
| Worker    | `worker.py`                   | Background task processor    |
| Queries   | `Dashboard/lib/db-queries.ts` | All DB queries for dashboard |

## Completed Dashboard Work

### Status Tab (Main Page)

- **Drive Status**: Shows all 5 drives with urgency %, raw level, avg drive level in header
- **Current Status**: Valence/Arousal/Dominance with trend arrow placeholders (pending `affective_end` column)
- **Mail Icon**: Pulses red when `outbox_messages` has pending entries
- **Goals Panel**: Shows active/queued/blocked counts (blocked from `cognitive_health` view)
- **Vitality Metrics**: HB Interval, MX Interval, Next Beat Due, API Latency, Beats Last 24hr
- **Recent Actions**: Rich LLM output parsing for reflect/recall/inquire/synthesize/brainstorm
- **Subconscious Reflection**: WM counts, maintenance stats, pending external calls
- **Decision Reasoning**: Shows LLM's internal monologue from heartbeats

### Chat Tab

- **Chat Interface**: Send messages to Hexis via `ag_catalog.inbox_messages`
- **Chat History**: Replaced mock relationship data with real chat history
- **API**: `/api/chat` inserts to inbox and calls `ag_catalog.process_inbox_message()`
- **Date Display**: Chat messages show date + time

## Key Database Views/Functions

```sql
-- Consolidated health metrics
SELECT * FROM cognitive_health;
-- Returns: energy, max_energy, urgent_drives, avg_drive_level, active_goals,
--          blocked_goals, total_memories, stale_neighborhoods, current_valence,
--          current_emotion, heartbeats_24h, pending_calls, relationships_discovered_24h

-- Worker task queue status
SELECT * FROM worker_tasks;
```

## Known Schema Considerations

1. **Tables in `ag_catalog` schema**: `inbox_messages`, `process_inbox_message()` function
2. **No `affective_end` column** in `heartbeat_log` - trend arrows use 'flat' until added
3. **No `read_at` column** in `outbox_messages` - use `status = 'pending'` for unread
4. **Recently fixed**: `promote_working_memory_to_episodic()` and `touch_working_memory()` were missing

## Data Flow

### User → Hexis

1. User types in Chat → POST `/api/chat`
2. Insert into `ag_catalog.inbox_messages`
3. Call `ag_catalog.process_inbox_message()` → creates episodic memory
4. Next heartbeat may recall the memory via semantic similarity

### Hexis → User

1. Heartbeat chooses `reach_out_user` action (driven by Connection drive)
2. Insert into `outbox_messages` with payload
3. Dashboard polls `/api/outbox` and displays in Chat
4. Mail icon pulses if pending messages exist

## Files Modified This Session

### Dashboard Components

- `components/agent-status-card.tsx` - Trend arrow support
- `components/drive-status.tsx` - Avg level display, urgency visualization
- `components/goals-list.tsx` - Blocked count badge
- `components/vitality-metrics.tsx` - Next Beat Due, Beats 24hr
- `components/rumination-ticker.tsx` - Pending calls display
- `components/chat-history.tsx` - NEW: Real chat history
- `components/chat-message.tsx` - Date in timestamp

### API Routes

- `app/api/chat/route.ts` - Fixed schema prefix for `ag_catalog.process_inbox_message`
- `app/api/chat-history/route.ts` - NEW: Fetches combined inbox/outbox

### Database Queries

- `lib/db-queries.ts` - Added: getChatHistory, heartbeats24h, pendingCalls, blocked goals, avgDriveLevel

## Pending/Future Work

### Memory Tab

- Not yet enhanced - planned for next session
- Could display relationship_discoveries, stale_neighborhoods

### Trend Arrows

- Need `affective_end` JSONB column added to `heartbeat_log`
- Query ready in db-queries.ts, just returns 'flat' for now

### VAD Line Graph

- Plot valence/arousal/dominance over time
- Discussed but not implemented

## Quick Reference Queries

```sql
-- Recent outbox messages
SELECT id, created_at, payload->>'message' as msg FROM outbox_messages ORDER BY created_at DESC LIMIT 5;

-- Inbox messages (user → Hexis)
SELECT id, created_at, message, processed FROM ag_catalog.inbox_messages ORDER BY created_at DESC LIMIT 5;

-- Drives state
SELECT name, current_level, urgency_threshold,
       ROUND((current_level / urgency_threshold * 100)::numeric, 1) as urgency_pct
FROM drives ORDER BY current_level DESC;

-- Check if functions exist
\df promote_working_memory_to_episodic
\df ag_catalog.process_inbox_message
```

## Session Notes

- User name: Michael
- Key collaborator: Orion (fixing backend schema issues)
- Dashboard runs at: http://localhost:3000
- Docker container: `agi_brain` (PostgreSQL)
- Approach: Incremental changes, test after each edit, use `cognitive_health` view as data source
