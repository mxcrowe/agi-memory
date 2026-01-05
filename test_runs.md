# Test Runs Log

## 2026-01-04 Phase 1 (DB in-place)
- fast_recall: `pytest test.py -k "fast_recall" -q` -> 5 passed, 228 deselected
- episodes/neighborhoods: `pytest test.py -k "episode or neighborhood" -q` -> 16 passed, 217 deselected
- concept layer: `pytest test.py -k "concept" -q` -> 6 passed, 227 deselected
- boundaries: `pytest test.py -k "boundary" -q` -> 3 passed, 231 deselected
- heartbeat action plumbing: `pytest test.py -k "execute_heartbeat_action or reflect_action or external_call" -q` -> 6 passed, 228 deselected

## 2026-01-04 Phase 2 (DB in-place)
- memory creation functions: `pytest test.py -k "create_memory or create_episodic_memory or create_semantic_memory or create_procedural_memory or create_strategic_memory" -q` -> 14 passed, 220 deselected
- graph operations: `pytest test.py -k "graph or relationship or cypher or find_contradictions or find_causal_chain" -q` -> 14 passed, 220 deselected
- identity/worldview: `pytest test.py -k "identity or worldview" -q` -> 12 passed, 222 deselected
- maintenance functions: `pytest test.py -k "cleanup_working_memory or cleanup_embedding_cache" -q` -> 3 passed, 231 deselected

## 2026-01-04 Phase 3 (DB in-place)
- view tests: `pytest test.py -k "view" -q` -> 25 passed, 209 deselected
- embedding service: `pytest test.py -k "embedding" -q` -> 28 passed, 206 deselected (2m11s)
