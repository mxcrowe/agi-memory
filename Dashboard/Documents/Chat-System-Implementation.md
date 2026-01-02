# Dashboard Chat System Implementation

## Goal

Enable two-way communication between Michael and Hexis via the Dashboard instead of manual SQL injection.

---

## Current State

- `outbox_messages` table exists — Hexis queues messages here via `reach_out_user`
- Dashboard Chat page has UI but no backend
- User responses currently require manual `create_episodic_memory()` SQL

---

## Proposed Changes

### [NEW] Inbox Table (`schema.sql`)

```sql
CREATE TABLE inbox_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    in_reply_to UUID REFERENCES outbox_messages(id),
    from_user TEXT DEFAULT 'Michael',
    message TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    created_memory_id UUID REFERENCES memories(id)
);
```

### [NEW] `/api/outbox/route.ts`

GET endpoint to fetch pending/recent outbox messages for display.

### [NEW] `/api/chat/route.ts`

POST endpoint to:

1. Accept user response
2. Insert into `inbox_messages`
3. Create episodic memory (like the manual injection you did)
4. Mark outbox message as replied

### [MODIFY] `chat-interface.tsx`

- Poll `/api/outbox` for Hexis messages
- Send responses to `/api/chat`
- Display conversation history

### [MODIFY] `worker.py` (Optional)

Check `inbox_messages` at start of tick and include in context.

---

## Verification Plan

1. Hexis sends `reach_out_user` → appears in Dashboard chat
2. User types response → stored in inbox + memory created
3. Next heartbeat picks up the memory via `get_recent_context()`

---

## Questions

1. Should we auto-poll for new outbox messages, or manual refresh?
2. Should responses immediately create episodic memories, or go through a separate processing step?
