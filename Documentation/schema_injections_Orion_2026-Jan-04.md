# Schema Injections & Fixes (2026-Jan-04)

## Summary
Documenting live DB injections and matching `schema.sql` updates applied during Phase IV testing.

## Live DB Injections (pgAdmin)

### Working memory promotion utilities
Added to restore maintenance + promotion behavior.

```sql
CREATE OR REPLACE FUNCTION touch_working_memory(p_ids UUID[])
RETURNS VOID AS $$
BEGIN
    IF p_ids IS NULL OR array_length(p_ids, 1) IS NULL THEN
        RETURN;
    END IF;

    UPDATE working_memory
    SET access_count = access_count + 1,
        last_accessed = CURRENT_TIMESTAMP
    WHERE id = ANY(p_ids);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION promote_working_memory_to_episodic(
    p_working_memory_id UUID,
    p_importance FLOAT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    wm RECORD;
    new_id UUID;
    affect JSONB;
    v_valence FLOAT;
BEGIN
    SELECT * INTO wm FROM working_memory WHERE id = p_working_memory_id;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    affect := get_current_affective_state();
    BEGIN
        v_valence := NULLIF(affect->>'valence', '')::float;
    EXCEPTION
        WHEN OTHERS THEN
            v_valence := 0.0;
    END;
    v_valence := LEAST(1.0, GREATEST(-1.0, COALESCE(v_valence, 0.0)));

    new_id := create_memory_with_embedding(
        'episodic'::memory_type,
        wm.content,
        wm.embedding,
        COALESCE(p_importance, wm.importance, 0.4),
        wm.source_attribution,
        wm.trust_level
    );

    INSERT INTO episodic_memories (memory_id, action_taken, context, result, emotional_valence, verification_status, event_time)
    VALUES (
        new_id,
        NULL,
        jsonb_build_object(
            'from_working_memory_id', wm.id,
            'promoted_at', CURRENT_TIMESTAMP,
            'working_memory_created_at', wm.created_at,
            'working_memory_expiry', wm.expiry,
            'source_attribution', wm.source_attribution
        ),
        NULL,
        v_valence,
        NULL,
        wm.created_at
    )
    ON CONFLICT (memory_id) DO NOTHING;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;
```

## Matching Schema Updates

### `schema.sql`
Added function definitions to keep schema consistent on clean DB rebuilds:
- `touch_working_memory(UUID[])`
- `promote_working_memory_to_episodic(UUID, FLOAT)`

## Prior Schema Change (2026-01-03)

### Boundary keyword matching fix
Updated `check_boundaries()` to avoid substring false positives (e.g., `client` matching `lie`).

**Change:** keyword matching now uses word-boundary regex instead of `ILIKE '%...%'`:

```sql
WHERE p_content ~* (E'\\m' || pat.p || E'\\M')
```
