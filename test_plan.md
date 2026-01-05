# New Test Cases Plan for AGI Memory System (Prioritized)

** Updated by Orion (Codex 5.2) on 5 Jan 2026

Based on review of `schema.sql`, `architecture.md`, and recent changes (boundary matching + heartbeat synthesize flow), the following test gaps remain. This version prioritizes a smaller Phase 1 subset to validate core correctness before expanding.

## Phase 1 (Must-Do) — Core Correctness

### A. fast_recall Hot Path (High Priority)
Currently untested (the main hot-path function):

```python
async def test_fast_recall_basic(db_pool):
    """Test fast_recall() primary retrieval:
    - Returns memories with similarity scores
    - Respects limit parameter
    - Only returns active memories
    """

async def test_fast_recall_neighborhood_expansion(db_pool):
    """Test association expansion via precomputed neighborhoods:
    - Seed memories expand via neighbors JSONB
    - Non-stale neighborhoods contribute to score
    """

async def test_fast_recall_temporal_context(db_pool):
    """Test temporal context component:
    - Memories in same episode get temporal boost
    """

async def test_fast_recall_source_attribution(db_pool):
    """Test source field correctly identifies retrieval source:
    - 'vector' for direct similarity matches
    - 'association' for neighborhood expansion
    - 'temporal' for episode context
    """
```

### B. Acceleration Layer (Episodes + Neighborhoods) (High Priority)

### Episodes & Temporal Segmentation
Currently untested or minimally tested:

```python
async def test_episodes_table_structure(db_pool):
    """Test episodes table with time_range TSTZRANGE generated column"""

async def test_auto_episode_assignment_trigger(db_pool):
    """Test trg_auto_episode_assignment trigger:
    - Creates new episode when first memory inserted
    - Continues episode within 30-minute gap
    - Closes old episode and creates new one after 30-minute gap
    - Correctly sets sequence_order in episode_memories
    - Initializes memory_neighborhoods record
    """

async def test_episode_summary_view(db_pool):
    """Test episode_summary view calculations:
    - memory_count
    - first_memory_at / last_memory_at
    """

async def test_episode_time_range_gist_index(db_pool):
    """Test GiST index on episodes.time_range for temporal queries"""
```

### Memory Neighborhoods (Precomputed Spreading Activation)
Currently untested:

```python
async def test_memory_neighborhoods_initialization(db_pool):
    """Test that memory_neighborhoods record is created on memory insert"""

async def test_neighborhoods_staleness_trigger(db_pool):
    """Test trg_neighborhood_staleness marks neighborhoods stale:
    - On importance change
    - On status change
    """

async def test_stale_neighborhoods_view(db_pool):
    """Test stale_neighborhoods view shows correct memories"""

async def test_neighborhoods_gin_index(db_pool):
    """Test GIN index on neighbors JSONB works correctly"""
```

### Activation Cache (Unlogged Table)
Currently untested:

```python
async def test_activation_cache_unlogged(db_pool):
    """Test activation_cache is UNLOGGED (fast writes, transient data)"""

async def test_activation_cache_session_isolation(db_pool):
    """Test activation levels are isolated by session_id"""
```

### C. Concept Layer (High Priority)

Currently untested:

```python
async def test_concepts_table(db_pool):
    """Test concepts table with:
    - Unique name constraint
    - Flattened ancestors array
    - path_text hierarchy string
    - depth tracking
    """

async def test_memory_concepts_junction(db_pool):
    """Test memory_concepts many-to-many relationship"""

async def test_link_memory_to_concept_function(db_pool):
    """Test link_memory_to_concept():
    - Creates concept if not exists
    - Creates relational link in memory_concepts
    - Creates INSTANCE_OF edge in graph
    """

async def test_concept_hierarchy(db_pool):
    """Test concept hierarchy with ancestors and path_text:
    - Build hierarchy: Entity -> Organism -> Animal -> Dog
    - Verify ancestors array flattening
    - Verify depth calculation
    """

async def test_concepts_ancestors_gin_index(db_pool):
    """Test GIN index on concepts.ancestors for hierarchy queries"""
```

### D. Boundary + Action Execution (High Priority)
New/critical regression coverage:

```python
async def test_boundary_keyword_word_boundary(db_pool):
    """check_boundaries():
    - 'client-server' should NOT match no_deception
    - 'lie' should match no_deception
    """

async def test_execute_heartbeat_action_synthesize_with_sources(db_pool):
    """Synthesize should persist content + sources, with boundaries checked."""
```

### E. Heartbeat Synthesize Follow-On (Worker Integration)
Validate that synthesize uses recall results (not placeholder content):

```python
async def test_worker_synthesize_uses_recall_results():
    """Integration: recall -> synthesize produces non-placeholder content
    and references recall memory ids in sources."""
```

## Phase 2 (Should-Do) — Schema Completeness

### 1. Core Functions Tests

#### search_similar_memories Function
Partially tested, needs more coverage:

```python
async def test_search_similar_memories_type_filter(db_pool):
    """Test p_memory_types filtering works correctly"""

async def test_search_similar_memories_importance_filter(db_pool):
    """Test p_min_importance filtering works correctly"""
```

#### search_working_memory Function
Partially tested:

```python
async def test_search_working_memory_auto_cleanup(db_pool):
    """Test that search_working_memory calls cleanup_working_memory()"""
```

### 2. Memory Creation Functions (Medium Priority)

### create_memory Base Function
Needs testing for graph node creation:

```python
async def test_create_memory_creates_graph_node(db_pool):
    """Test create_memory() creates MemoryNode in graph"""

async def test_create_memory_graph_node_properties(db_pool):
    """Test MemoryNode has correct properties:
    - memory_id
    - type
    - created_at
    """
```

### Specialized Creation Functions
Need graph node verification:

```python
async def test_create_episodic_memory_function(db_pool):
    """Test create_episodic_memory() full workflow:
    - Creates base memory with embedding
    - Creates episodic_memories detail record
    - Creates graph node
    """

async def test_create_semantic_memory_function(db_pool):
    """Test create_semantic_memory() with all parameters"""

async def test_create_procedural_memory_function(db_pool):
    """Test create_procedural_memory() with steps and prerequisites"""

async def test_create_strategic_memory_function(db_pool):
    """Test create_strategic_memory() with pattern and evidence"""
```

### 3. Maintenance Functions (Medium Priority)

```python
async def test_cleanup_working_memory_function(db_pool):
    """Test cleanup_working_memory() returns count of deleted items"""

async def test_cleanup_embedding_cache_function(db_pool):
    """Test cleanup_embedding_cache() with custom interval"""
```

### 4. Graph Operations (Medium Priority)

### ConceptNode Operations
Currently untested:

```python
async def test_concept_node_creation(db_pool):
    """Test ConceptNode creation in graph"""

async def test_instance_of_edge(db_pool):
    """Test INSTANCE_OF edge between MemoryNode and ConceptNode"""

async def test_parent_of_edge(db_pool):
    """Test PARENT_OF edge for concept hierarchy in graph"""
```

### Graph Edge Types
Need complete coverage of all graph_edge_type enum values:

```python
async def test_temporal_next_edge(db_pool):
    """Test TEMPORAL_NEXT edge for narrative sequence"""

async def test_causes_edge(db_pool):
    """Test CAUSES edge for causal reasoning"""

async def test_derived_from_edge(db_pool):
    """Test DERIVED_FROM edge for episodic->semantic transformation"""

async def test_contradicts_edge(db_pool):
    """Test CONTRADICTS edge for dialectical tension"""

async def test_supports_edge(db_pool):
    """Test SUPPORTS edge for evidence relationship"""
```

### 5. Identity & Worldview (Medium Priority)

### Identity Aspects
Need more complete testing:

```python
async def test_identity_aspects_types(db_pool):
    """Test all aspect_type values:
    - self_concept
    - purpose
    - boundary
    - agency
    - values
    """

async def test_identity_memory_resonance_integration_status(db_pool):
    """Test integration_status field values and transitions"""
```

### Worldview Memory Influences
Need influence_type coverage:

```python
async def test_worldview_influence_types(db_pool):
    """Test different influence_type values on worldview_memory_influences"""

async def test_connected_beliefs_relationships(db_pool):
    """Test connected_beliefs UUID array in worldview_primitives"""
```

## Phase 3 (Nice-to-Have) — Performance + Views

### 1. Index Performance Tests (Low Priority)

```python
async def test_hnsw_index_memories_embedding(db_pool):
    """Test HNSW index on memories.embedding for vector search"""

async def test_hnsw_index_clusters_centroid(db_pool):
    """Test HNSW index on memory_clusters.centroid_embedding"""

async def test_hnsw_index_episodes_summary(db_pool):
    """Test HNSW index on episodes.summary_embedding"""

async def test_hnsw_index_working_memory(db_pool):
    """Test HNSW index on working_memory.embedding"""

async def test_gin_index_content_trgm(db_pool):
    """Test GIN trigram index on memories.content for text search"""
```

### 2. View Tests (Low Priority)

```python
async def test_memory_health_view_aggregations(db_pool):
    """Test memory_health view calculates correct aggregations"""

async def test_cluster_insights_view_ordering(db_pool):
    """Test cluster_insights view ordered by importance_score DESC"""

async def test_episode_summary_view_completeness(db_pool):
    """Test episode_summary includes all required fields"""
```

### 3. Embedding Service Integration Tests (Low Priority)

```python
async def test_get_embedding_caching(db_pool):
    """Test get_embedding() caches results in embedding_cache table"""

async def test_get_embedding_cache_hit(db_pool):
    """Test get_embedding() returns cached embedding on second call"""

async def test_get_embedding_response_formats(db_pool):
    """Test get_embedding() handles different response formats:
    - embeddings array
    - embedding object
    - data array with embedding
    - direct array
    """

async def test_check_embedding_service_health_function(db_pool):
    """Test check_embedding_service_health() returns boolean"""
```

## Priority Summary

| Phase | Focus | Approx. Tests |
|-------|-------|---------------|
| Phase 1 | fast_recall + Acceleration + Concepts + Boundaries + Synthesize | ~20 |
| Phase 2 | Core functions + Memory creation + Graph + Identity/Worldview | ~20 |
| Phase 3 | Performance + Views + Embeddings | ~10 |

**Total: ~50–60 new test cases**

## Implementation Notes

1. Tests requiring embedding service should mock the HTTP call or use the existing mock pattern from current tests
2. Episode tests need careful timing control for the 30-minute gap detection
3. Graph tests should verify both relational and AGE graph state
4. Performance tests should use EXPLAIN ANALYZE to verify index usage
5. Worker synthesize integration test can be a lightweight harness that stubs `_call_llm_json`
