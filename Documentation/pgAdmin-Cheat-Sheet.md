# AGI Memory - pgAdmin SQL Cheat Sheet

## Connection Info
- Database: `agi_db`
- User: `agi_user`
- Password: `agi_password`
- Host: `localhost`
- Port: `5432`

---

## Quick Status Checks

### Check if Resonance is configured and ready
```sql
SELECT is_agent_configured();
```

### Check if heartbeat should run
```sql
SELECT should_run_heartbeat();
```

### View heartbeat schedule and energy
```sql
SELECT 
    current_energy,
    last_heartbeat_at,
    next_heartbeat_at,
    is_paused,
    heartbeat_count
FROM heartbeat_state 
WHERE id = 1;
```

---

## Viewing Resonance's Goals

### See all active goals
```sql
SELECT id, title, description, priority, source, last_touched
FROM goals
WHERE priority = 'active'
ORDER BY last_touched DESC;
```

### See all goals (any status)
```sql
SELECT id, title, description, priority, source, last_touched
FROM goals
ORDER BY 
    CASE priority
        WHEN 'active' THEN 1
        WHEN 'queued' THEN 2
        WHEN 'backburner' THEN 3
    END,
    last_touched DESC;
```

### Count goals by priority
```sql
SELECT priority, COUNT(*) as count
FROM goals
GROUP BY priority;
```

---

## Viewing Memories

### Recent memories (last 10)
```sql
SELECT id, type, content, importance, created_at
FROM memories
ORDER BY created_at DESC
LIMIT 10;
```

### High-importance memories
```sql
SELECT id, type, content, importance, created_at
FROM memories
WHERE importance >= 0.9
ORDER BY importance DESC, created_at DESC
LIMIT 20;
```

### Search memories by content
```sql
SELECT id, type, content, importance, created_at
FROM memories
WHERE content ILIKE '%search term%'
ORDER BY created_at DESC
LIMIT 20;
```

### Memories by type
```sql
SELECT type, COUNT(*) as count, AVG(importance) as avg_importance
FROM memories
GROUP BY type
ORDER BY count DESC;
```

---

## Viewing Heartbeat History

### Recent heartbeats (last 5)
```sql
SELECT 
    id,
    heartbeat_number,
    started_at,
    energy_start,
    energy_end,
    narrative,
    emotional_valence
FROM heartbeat_log
ORDER BY started_at DESC
LIMIT 5;
```

### Latest autonomous reasoning
```sql
SELECT 
    output->>'reasoning' as reasoning,
    output->'decision'->'emotional_assessment'->>'primary_emotion' as emotion,
    output->'decision'->>'actions' as actions
FROM external_calls
WHERE call_type = 'think'
  AND heartbeat_id IS NOT NULL
ORDER BY requested_at DESC
LIMIT 1;
```

---

## Checking Drive Status

### View all drives and urgency
```sql
SELECT 
    name,
    current_level,
    baseline,
    urgency_threshold,
    is_urgent,
    ROUND(urgency_percent::numeric, 1) as urgency_percent,
    last_satisfied
FROM drive_status
ORDER BY urgency_percent DESC;
```

---

## Configuration

### View current heartbeat interval
```sql
SELECT key, value 
FROM heartbeat_config 
WHERE key = 'heartbeat_interval_minutes';
```

### View LLM configuration
```sql
SELECT key, value 
FROM config 
WHERE key IN ('llm.heartbeat', 'llm.chat');
```

### View agent objectives
```sql
SELECT value->'objectives' as objectives
FROM config
WHERE key = 'agent.profile';
```

---

## Pause/Unpause Heartbeats

### Pause autonomous thinking
```sql
UPDATE heartbeat_state 
SET is_paused = true 
WHERE id = 1;
```

### Unpause autonomous thinking
```sql
UPDATE heartbeat_state 
SET is_paused = false 
WHERE id = 1;
```

---

## Change Heartbeat Interval

### Set to 1 hour
```sql
UPDATE heartbeat_config 
SET value = 60 
WHERE key = 'heartbeat_interval_minutes';
```

### Set to 2 hours (current setting)
```sql
UPDATE heartbeat_config 
SET value = 120 
WHERE key = 'heartbeat_interval_minutes';
```

### Set to 4 hours
```sql
UPDATE heartbeat_config 
SET value = 240 
WHERE key = 'heartbeat_interval_minutes';
```

## Change Subconscious Maintenance Interval

### Set to 5-15 minutes - 11 minutes for off-cycle updates (value is in seconds)
```sql
UPDATE maintenance_config 
SET value = 660 
WHERE key = 'maintenance_interval_seconds';
```

---

## Switch LLM Models

### Use Claude 3.5 Haiku (current - cheapest capable model)
```sql
UPDATE config 
SET value = '{"model": "claude-3-5-haiku-20241022", "endpoint": "", "provider": "anthropic", "api_key_env": ""}'::jsonb
WHERE key IN ('llm.chat', 'llm.heartbeat');
```

### Use Claude Sonnet 4 (most capable, expensive)
```sql
UPDATE config 
SET value = '{"model": "claude-sonnet-4-20250514", "endpoint": "", "provider": "anthropic", "api_key_env": ""}'::jsonb
WHERE key IN ('llm.chat', 'llm.heartbeat');
```

**After changing models, restart the worker:**
```bash
docker-compose restart heartbeat_worker
```

---

## Cognitive Health Dashboard

### Overall system health
```sql
SELECT * FROM cognitive_health;
```

### Emotional trend (last 24 hours)
```sql
SELECT * FROM emotional_trend
WHERE hour >= NOW() - INTERVAL '24 hours'
ORDER BY hour DESC;
```

---

## Advanced: View Full Heartbeat Decision

### Get complete reasoning from latest heartbeat
```sql
SELECT 
    ec.id as call_id,
    hb.heartbeat_number,
    hb.started_at,
    ec.output->'decision'->>'reasoning' as reasoning,
    ec.output->'decision'->'emotional_assessment' as emotion,
    ec.output->'decision'->'actions' as actions,
    hb.narrative
FROM external_calls ec
JOIN heartbeat_log hb ON ec.heartbeat_id = hb.id
WHERE ec.call_type = 'think'
ORDER BY hb.started_at DESC
LIMIT 1;
```

---

## Troubleshooting

### Check for errors in recent heartbeats
```sql
SELECT id, error_message, requested_at
FROM external_calls
WHERE error_message IS NOT NULL
ORDER BY requested_at DESC
LIMIT 10;
```

### View pending/failed calls
```sql
SELECT id, call_type, status, error_message, requested_at
FROM external_calls
WHERE status != 'completed'
ORDER BY requested_at DESC;
```

---

## Notes

- Always restart the heartbeat_worker after changing LLM config
- Changing intervals takes effect on the NEXT heartbeat
- Memories with importance >= 0.9 are considered highly significant
- Drive urgency above 80% indicates strong motivational pressure
- Check `cognitive_health` for a quick system overview

---

**Pro Tips:**
- Use Ctrl+F in pgAdmin to search this cheat sheet
- Save frequently-used queries as pgAdmin "Snippets"
- Export query results to CSV for analysis in Excel
- The `output` field in `external_calls` contains full JSON reasoning

### Editing Key Python Files
If you edit worker.py you must rebuild:

docker-compose build --no-cache heartbeat_worker
docker-compose up -d heartbeat_worker

Restart alone is not enough.
