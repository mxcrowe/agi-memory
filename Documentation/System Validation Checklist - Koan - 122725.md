# AGI Memory System - Validation Checklist

**Date Created:** December 27, 2025  
**Purpose:** Validate system functionality after clean DB initialization

**Prerequisite:** Complete "Clean DB Initialization Checklist.md" first

---

## Quick Validation (Smoke Test)

Run these after initialization to confirm core paths work:

### 1. Read Path - fast_recall
```sql
SELECT memory_id, content, memory_type, score, source 
FROM fast_recall('debugging memory system', 10);
```
✅ Should return test memories ranked by similarity

### 2. Episode Auto-Assignment
```sql
SELECT e.id, e.started_at, e.episode_type, COUNT(em.memory_id) as memory_count
FROM episodes e
LEFT JOIN episode_memories em ON e.id = em.episode_id
GROUP BY e.id, e.started_at, e.episode_type;
```
✅ Should show episode(s) with memory count matching inserted memories

### 3. Identity Retrieval
```sql
SELECT aspect_type, content, stability FROM identity_aspects;
```
✅ Should return 5 rows (self_concept, purpose, boundary, agency, values)

### 4. Worldview Retrieval
```sql
SELECT belief, category, confidence FROM worldview_primitives;
```
✅ Should return seeded beliefs

---

## Extended Validation

### 5. Concept Linking (Apostrophe Fix Validation)

```sql
-- Test with apostrophe in concept name
SELECT create_episodic_memory(
    'An''nuk is Michael''s husky who joined the family in November 2024',
    '{"event": "pet adoption"}'::jsonb,
    '{"subject": "An''nuk"}'::jsonb,
    NULL,
    0.7,
    CURRENT_TIMESTAMP,
    0.8
);
```

Then link concept with apostrophe:
```sql
SELECT link_memory_to_concept(
    (SELECT id FROM memories WHERE content LIKE '%An''nuk%' LIMIT 1),
    'An''nuk',
    1.0
);
```
✅ Should succeed without Cypher syntax errors

Verify:
```sql
SELECT c.name, mc.strength 
FROM concepts c
JOIN memory_concepts mc ON c.id = mc.concept_id
WHERE c.name = 'An''nuk';
```

### 6. Working Memory (TTL Validation)

```sql
-- Insert working memory with short TTL
SELECT add_working_memory(
    'Test working memory item',
    0.5,
    60  -- 60 second TTL
);

-- Should find it immediately
SELECT content, expiry FROM working_memory;

-- Search should work
SELECT * FROM search_working_memory('test working', 5);
```
✅ Should return the working memory item

After 60+ seconds:
```sql
SELECT cleanup_working_memory();
SELECT content, expiry FROM working_memory;
```
✅ Should be empty (expired)

### 7. Graph Relationships

```sql
-- Check graph nodes exist
SELECT * FROM cypher('memory_graph', $$
    MATCH (m:MemoryNode)
    RETURN count(m) as memory_nodes
$$) as (count agtype);

SELECT * FROM cypher('memory_graph', $$
    MATCH (w:WorldviewNode)
    RETURN count(w) as worldview_nodes
$$) as (count agtype);
```
✅ Counts should match inserted memories and worldview primitives

### 8. MCP Tools (via Claude Desktop)

If MCP server is configured, test from Claude Desktop:
- `get_identity` - should return identity aspects
- `get_worldview` - should return worldview primitives  
- `recall` with query - should return relevant memories
- `remember` with new content - should create memory
- `get_drives` - should return drive states

---

## Validation Summary

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| fast_recall | Returns memories with scores | | ⬜ |
| Episode assignment | Memories grouped in episode | | ⬜ |
| Identity retrieval | 5 aspect types | | ⬜ |
| Worldview retrieval | Seeded beliefs | | ⬜ |
| Concept linking (apostrophe) | No Cypher errors | | ⬜ |
| Working memory TTL | Expires correctly | | ⬜ |
| Graph node counts | Match inserts | | ⬜ |
| MCP tools | All return data | | ⬜ |

---

## If Validation Fails

### fast_recall returns empty
- Check embedding service: `SELECT check_embedding_service_health();`
- Verify memories have embeddings: `SELECT id, embedding IS NOT NULL FROM memories;`

### Episode not created
- Check trigger exists: `SELECT tgname FROM pg_trigger WHERE tgname = 'trg_auto_episode_assignment';`

### Cypher errors on concept/worldview
- Ensure AGE loaded: `LOAD 'age'; SET search_path = ag_catalog, public;`

### MCP tools fail
- Restart Claude Desktop
- Check `.venv` exists and MCP server configured in claude_desktop_config.json
