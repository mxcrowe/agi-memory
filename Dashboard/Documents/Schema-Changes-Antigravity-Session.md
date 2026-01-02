# Schema.sql Changes Summary (Antigravity Session)

Summary of all changes made to `schema.sql` during the Dashboard/Antigravity session.
Share this with Koan to avoid merge conflicts.

---

## Change 1: Restored Missing Function

**Location:** Lines ~2056-2095
**After:** The `maintenance_state` table section

```sql
-- Clean expired working memory (with optional consolidation before delete).
-- CRITICAL: This function is called by run_subconscious_maintenance()
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

---

## Change 2: Maintenance Log Table

**Location:** Lines ~2820-2830
**After:** maintenance_state table, before maintenance_config

```sql
-- Maintenance activity log for dashboard display
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

---

## Change 3: Updated run_subconscious_maintenance

**Location:** Lines ~3020-3035 (within the function)
**Added after:** `UPDATE maintenance_state SET last_maintenance_at...`

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

---

## Change 4: Inbox Messages Table (Chat System)

**Location:** Lines ~2845-2900
**After:** `outbox_messages` indexes

```sql
-- Inbox for user responses to outbox messages
CREATE TABLE inbox_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    in_reply_to UUID REFERENCES outbox_messages(id),
    from_user TEXT DEFAULT 'Michael',
    message TEXT NOT NULL,
    emotional_valence FLOAT DEFAULT 0.5,
    importance FLOAT DEFAULT 0.8,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    created_memory_id UUID
);

CREATE INDEX idx_inbox_messages_unprocessed ON inbox_messages (processed) WHERE processed = FALSE;
CREATE INDEX idx_inbox_messages_created ON inbox_messages (created_at DESC);

-- Process an inbox message: create episodic memory and mark as processed
CREATE OR REPLACE FUNCTION process_inbox_message(p_inbox_id UUID)
RETURNS UUID AS $$
DECLARE
    inbox_rec RECORD;
    memory_id UUID;
    outbox_msg JSONB;
BEGIN
    SELECT * INTO inbox_rec FROM inbox_messages WHERE id = p_inbox_id AND NOT processed;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    SELECT payload INTO outbox_msg FROM outbox_messages WHERE id = inbox_rec.in_reply_to;

    memory_id := create_episodic_memory(
        p_content := format('User message from %s: "%s"', inbox_rec.from_user, inbox_rec.message),
        p_context := jsonb_build_object(
            'source', 'user_message',
            'from', inbox_rec.from_user,
            'in_reply_to', inbox_rec.in_reply_to,
            'original_message', outbox_msg->>'message'
        ),
        p_emotional_valence := inbox_rec.emotional_valence,
        p_importance := inbox_rec.importance
    );

    UPDATE inbox_messages
    SET processed = TRUE,
        processed_at = CURRENT_TIMESTAMP,
        created_memory_id = memory_id
    WHERE id = p_inbox_id;

    RETURN memory_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Summary Table

| Change                              | Location    | Purpose                                             |
| ----------------------------------- | ----------- | --------------------------------------------------- |
| cleanup_working_memory_with_stats   | ~L2056-2095 | Restored missing function (was causing MX failures) |
| maintenance_log table               | ~L2820-2830 | Dashboard maintenance stats display                 |
| run_subconscious_maintenance update | ~L3020-3035 | Log each MX run to maintenance_log                  |
| inbox_messages table                | ~L2845-2900 | Dashboard chat system                               |

---

_Generated: 2026-01-02_
