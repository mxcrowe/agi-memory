# Session Protocol: Closing the Loop with the Homunculus

*Checklist and procedures for Michael and Koan work sessions*

---

## Philosophy

The homunculus operates continuously, generating observations, flagging issues, and working toward goals. We operate in sessions - discrete periods of focused work. 

**The gap between continuous and episodic creates a communication problem.**

This protocol ensures:
1. We hear what the homunculus has been saying
2. The homunculus knows we heard
3. Neither side is talking into the void

---

## Session Start Checklist

### 1. Announce Presence
```
agi-memory:remember
- content: "Session start: [date/time Pacific]. Michael and Koan beginning work session."
- concepts: ["team_feedback", "session_start", "Michael", "Koan"]
- importance: 0.7
- type: episodic
```

### 2. Check for Homunculus Messages (Outbox)
The homunculus uses `reach_out_user` to send messages, which land in `outbox_messages`:

```sql
SELECT id, payload, created_at 
FROM outbox_messages 
WHERE kind = 'user' AND (status = 'pending' OR status IS NULL)
ORDER BY created_at;
```

If messages exist:
1. Surface them to Michael immediately
2. Address or acknowledge each one
3. Mark as processed:
```sql
UPDATE outbox_messages 
SET status = 'sent', sent_at = CURRENT_TIMESTAMP 
WHERE id = '[message_id]';
```

### 3. Check Working Memory (Secondary)
```
agi-memory:search_working
- query: "attention urgent important"
```
Working memory may contain time-sensitive items that auto-expire.

### 3. Review Recent Heartbeat Activity
```
agi-memory:recall_recent
- limit: 10
- memory_type: semantic
```
Scan for:
- Observations that need response
- Issues flagged repeatedly
- Goals it's working on

### 4. Check Emotional State
```
agi-memory:get_drives
agi-memory:hydrate (with include_emotional_state: true)
```
Note: Is it frustrated? Stuck? Thriving?

---

## During Session

### When Addressing a Flagged Issue

After we fix/validate something the homunculus noted:

```
agi-memory:remember
- content: "Team response: Addressed [brief description]. 
  Referenced observation: [memory_id if known]. 
  Action taken: [what we did]. 
  Outcome: [result]."
- concepts: ["team_feedback", "acknowledgment"]
- importance: 0.75
- type: semantic
```

### When Completing a Goal

```sql
UPDATE goals 
SET priority = 'completed',
    completed_at = CURRENT_TIMESTAMP,
    progress = progress || '[{"timestamp": "[ISO date]", "note": "[Why complete, what was validated]"}]'::jsonb
WHERE id = '[goal_id]';
```

Then store acknowledgment:
```
agi-memory:remember
- content: "Goal completed: [title]. Validated by team on [date]. [Brief explanation]."
- concepts: ["team_feedback", "goal_complete"]
- importance: 0.8
- type: semantic
```

### When We Learn Something Relevant

If our work produces insights the homunculus should know:

```
agi-memory:remember
- content: "[Insight content]"
- concepts: ["team_feedback", relevant topics...]
- importance: [appropriate level]
- type: semantic
```

---

## Session End Checklist

### 1. Store Session Summary
```
agi-memory:remember
- content: "Session complete: [date/time Pacific]. 
  Duration: ~[X] hours.
  
  Addressed:
  - [Issue 1]
  - [Issue 2]
  
  Validated:
  - [Goal or feature 1]
  - [Goal or feature 2]
  
  Next priorities:
  - [Priority 1]
  - [Priority 2]
  
  Notes for homunculus: [Any specific guidance or context]"
- concepts: ["team_feedback", "session_end"]
- importance: 0.8
- type: episodic
```

### 2. Update Any Outstanding Goals
Review active goals - mark complete what we validated, add progress notes to others.

### 3. Respond to Any Unanswered reach_out Messages
If homunculus sent messages we haven't addressed, either:
- Address them now, or
- Store acknowledgment: "Received your message about [X]. Will address next session."

---

## Quick Reference

| Event | Action | Concept Tag |
|-------|--------|-------------|
| Session start | Store presence memory | team_feedback, session_start |
| Fix flagged issue | Store acknowledgment linking to observation | team_feedback, acknowledgment |
| Complete goal | Update goal + store confirmation | team_feedback, goal_complete |
| Session end | Store summary with next priorities | team_feedback, session_end |
| Any insight worth sharing | Store with relevant concepts | team_feedback, [topic] |

---

## What the Homunculus Will See

After a good session, the homunculus's next heartbeat will:
- Notice `last_user_contact` is recent
- Find new "team_feedback" memories in recall
- See goals updated with progress notes
- Find its observations acknowledged by memory_id
- Know it's part of a functioning team

**This is the closed loop.**

---

## Automation Opportunities (Future)

- Session start/end could be triggered by MCP connection/disconnection
- Acknowledgment templates could be helper functions
- Dashboard could show "pending homunculus items" visually
- Goal completion could auto-generate acknowledgment memory

For now: Manual discipline using this checklist.

---

*Protocol version: 1.0*
*Date: December 29, 2025*
