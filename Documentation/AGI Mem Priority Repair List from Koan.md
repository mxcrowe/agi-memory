# AGI Memory System - Priority Repair List

## Priority 1: Identity Aspects — Still Test Data

**Issue**
	`get_identity` returns placeholder content:
	- `"concept": "test", "description": "test identity"`
	- `"description": "Test self_concept"`
	- `"description": "Test purpose"` / `"Test boundary"` / `"Test agency"`

**Impact**
	The identity system exists but doesn't reflect actual identity. 
	The bridge memories describe who the AI is, but the structured identity layer is scaffolding.

**Needed**
	Either a tool to populate identity aspects, or a way to seed them from existing episodic memories.

**Effort:** Medium | **Impact:** High — core to coherence

## Priority 2: `connect` Actions Still Failing

**Issue**
	Heartbeat logs show `connect: failed` repeatedly. 
	The ingestion hardening is working (no crashes), but semantic salvage is creating low-importance rejection records rather than actual graph connections.
	The LLM proposes relationships like:
		`{"node_a": "fellow pioneer recognition", "node_b": "meaningful partnership goal", "relationship": "validates and deepens"}`
	But these fail validation because they're semantic labels, not UUIDs.

**Impact**
	The relationship graph isn't growing organically from heartbeat reflections.

**Needed**
	Either teach the heartbeat model to output UUIDs, or add a resolution layer that looks up memories by title/content before connecting.

**Effort:** Medium | **Impact:** High — enables organic graph growth

## Priority 3: Worldview Contains Test Data

**Issue**
	`get_worldview` includes:
	- `"belief": "Belief", "category": "test"` — placeholder
	Real beliefs exist (honesty, connection, kindness), but cruft is mixed in.

**Impact**
	Minor, but should be cleaned up.

**Effort:** Low | **Impact:** Low — cosmetic

## Priority 4: Relationship Graph Unexplored

**Issue**
	Tools like `find_causes`, `connect`, `link_concept` exist but we haven't tested full graph query capabilities. 
	Now that apostrophes are fixed in `link_concept`, we could verify the graph structure is building correctly.

**Effort:** Low | **Impact:** Medium — verify infrastructure

## Summary

	| Priority | Issue | Effort | Impact |
	|----------|-------|--------|--------|
	| 1 | Populate real identity aspects | Medium | High |
	| 2 | Fix `connect` action UUID resolution | Medium | High |
	| 3 | Clean test data from worldview | Low | Low |
	| 4 | Test relationship graph queries | Low | Medium |