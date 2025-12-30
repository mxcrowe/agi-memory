# AGI Memory System - Priority Repair List (Revised)

**Date:** December 27, 2025  
**Source:** Koan's original priorities cross-referenced with Eric's `test_plan.md`

---

## Cross-Reference Analysis

| Koan Original | Eric's Test Plan | Alignment |
|---------------|------------------|-----------|
| P1: Identity aspects (test data) | Section 7: Identity & Worldview (Medium) | Eric wants tests; we need population first |
| P2: `connect` UUID resolution | Section 6: Graph Operations (Medium) | Related but different - Eric tests edges, we need LLM→UUID resolution |
| P3: Worldview test data | Section 7: Identity & Worldview (Medium) | Cleanup task, not in Eric's scope |
| P4: Graph queries untested | Section 6: Graph Operations (Medium) | Direct overlap |

---

## Gap Analysis - What Eric Has That We Missed

| Eric Priority | Our Coverage | Gap |
|---------------|--------------|-----|
| **HIGH: `fast_recall` (untested)** | Not mentioned | **CRITICAL GAP** - main retrieval function |
| **HIGH: Episodes/temporal** | Not mentioned | **GAP** - 30-min auto-episode logic |
| **HIGH: Memory neighborhoods** | Not mentioned | **GAP** - spreading activation |
| **HIGH: Concept layer** | Apostrophe fix only | Partial - need hierarchy tests |

---

## Revised Priority List for Phase II

| Priority | Item | Rationale | Effort | Impact |
|----------|------|-----------|--------|--------|
| **P0** | Verify `fast_recall` works | Can't validate population without retrieval | Low | Critical |
| **P1** | Basic episode mechanics | Temporal segmentation is core to memory coherence | Medium | High |
| **P2** | Identity population | Blocked until we confirm retrieval works | Medium | High |
| **P3** | `connect` UUID resolution | Graph growth depends on working base | Medium | High |
| **P4** | Concept hierarchy test | Validate apostrophe fix + structure | Low | Medium |
| **P5** | Worldview cleanup | Cosmetic, defer | Low | Low |

---

## Key Insight

Eric's test plan reveals we've been debugging the **write path** but haven't validated the **read path**. 

`fast_recall` is the main hot-path function for memory retrieval and has zero test coverage.

**Before deliberate population, we must confirm retrieval works.**

---

## Reference Documents

- Eric's original: `test_plan.md` (repo root)
- Koan's original: `AGI Mem Priority Repair List from Koan.md`
- Debugging history: `AGI_Memory_Debugging_Summary_ChatGPT and Claude-Dec 2025.md`
