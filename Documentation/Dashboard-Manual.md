# Hexis Dashboard Instruction Manual

A comprehensive guide to every element on each tab of the Hexis Dashboard.

---

## Navigation

The Dashboard has four main tabs accessible via the header navigation:

| Tab        | Description                                 |
| ---------- | ------------------------------------------- |
| **Status** | Real-time cognitive architecture monitoring |
| **Memory** | Memory exploration and visualization        |
| **Chat**   | Direct communication with Hexis             |
| **Config** | System configuration settings               |

---

## Status Tab

The primary monitoring view showing Hexis's current operational state.

### System Vitality Section

#### Pulse Indicator

A visual heartbeat symbol showing system health:

- **Pulsing green**: System active and healthy
- **Static/dimmed**: System paused or encountering issues

#### Mail Indicator (Envelope Icon)

Shows unseen outbound messages from Hexis:

- **Red pulsing + count**: Hexis has sent messages you haven't acknowledged
- **Gray static**: No new messages
- **Click to acknowledge**: Marks all messages as seen

#### Heartbeat Index (#xxx)

The sequential count of heartbeat cycles since system initialization.

#### VitalityMetrics (Three Stat Cards)

| Card                | Description                                     | Source                              |
| ------------------- | ----------------------------------------------- | ----------------------------------- |
| **Beats Last 24hr** | Number of heartbeat cycles in the past 24 hours | `heartbeat_log`                     |
| **Next Beat Due**   | Countdown timer to next scheduled heartbeat     | `heartbeat_state.next_heartbeat_at` |
| **Active Goals**    | Count of goals currently being pursued          | `goals` table                       |

---

### Current Status Panel

Shows Hexis's identity and current state.

#### Status Badge

- **active**: Normal operation
- **idle**: Awaiting next heartbeat
- **sleeping**: Paused state
- **error**: System issue detected

#### Emotional State Section

| Metric        | Range    | Description                                                    |
| ------------- | -------- | -------------------------------------------------------------- |
| **Feeling**   | Text     | Primary emotion (curious, calm, focused, etc.)                 |
| **Valence**   | -1 to +1 | Pleasantness: Negative=unpleasant, Positive=pleasant           |
| **Arousal**   | 0 to 1   | Activation level: Low=calm, High=energized                     |
| **Intensity** | 0 to 1   | Emotional strength (calculated: \|valence\|×0.6 + arousal×0.4) |

Trend arrows (↑↓) indicate direction of change (currently disabled pending schema update).

#### Energy Bar

Shows current energy level out of maximum:

- Energy depletes when performing actions
- Energy recharges slowly over time
- Low energy limits available actions

#### Quick Stats Grid

| Stat              | Description                                      |
| ----------------- | ------------------------------------------------ |
| **Memories**      | Total active memories in long-term storage       |
| **Clusters**      | Semantic groupings of related memories           |
| **Avg Trust**     | Average trust level across all memories (0-1)    |
| **Last Activity** | Time since most recent memory creation or access |

---

### Goals Panel

Displays active goals with progress tracking.

#### Header

- **Goals**: Panel title
- **Blocked Badge** (red): Count of goals marked as blocked

#### Goal List

Each goal shows:

- **Title**: Goal name
- **Progress bar**: Visual completion indicator (0-100%)
- **Target date** (if set): When goal should be completed

---

### Drives Panel

Shows the four fundamental drives that motivate Hexis behavior.

#### For Each Drive

| Element        | Description                                                       |
| -------------- | ----------------------------------------------------------------- |
| **Drive Name** | Connection, Mastery, Autonomy, or Purpose                         |
| **Icon**       | Visual indicator for the drive type                               |
| **Urgency %**  | How urgently this drive needs satisfaction (shown in drive color) |
| **Level Bar**  | Current drive level (0-1.0)                                       |
| **Level %**    | Numerical drive level                                             |

When urgency exceeds threshold, Hexis prioritizes satisfying that drive.

---

### Connection Health Panel

Shows status of external system connections:

- **Postgres**: Database connection status
- **LLM API**: Language model API availability

---

### Heartbeat Monitor Panel

Scrolling log of recent heartbeats showing:

- Heartbeat number
- Timestamp
- Status (completed, in_progress, failed)
- Actions taken during that heartbeat

---

### Subconscious Reflection Panel

Shows the background maintenance system activity.

#### Timing Grid

| Element       | Description                                  |
| ------------- | -------------------------------------------- |
| **Last Tick** | Time since last maintenance cycle ran        |
| **Interval**  | Configured maintenance interval (in seconds) |
| **Pending**   | External LLM calls waiting to complete       |

#### Memory Tiers

| Tier          | Description                                      |
| ------------- | ------------------------------------------------ |
| **Working**   | Short-term items awaiting processing (usually 0) |
| **Long-Term** | Total count of permanent memories                |
| **Semantic**  | Subset of long-term: consolidated knowledge      |

#### 24hr Activity

| Metric        | Description                                        |
| ------------- | -------------------------------------------------- |
| **Neighbors** | Neighborhood graph connections recomputed in 24h   |
| **Cache**     | Embedding cache entries cleaned in 24h             |
| **Discarded** | Working memory items that expired/were discarded   |
| **Promoted**  | Working memory items promoted to long-term storage |

---

### Decision Reasoning Panel

Shows the LLM-generated internal monologue from the most recent heartbeat, explaining Hexis's thought process and decision-making.

---

## Memory Tab

Exploration and visualization of Hexis's memory systems.

### Memory Dynamics Section

#### Semantic Density Map

Visual representation of memory clusters and their relative sizes. _(Currently using mock data)_

#### Insight Progress Bar

Shows progress toward the next insight consolidation. _(Currently using mock data)_

#### Memory Distribution by Type

Bar chart showing counts per memory type:

- **Episodic**: Personal experiences and events
- **Semantic**: Consolidated knowledge and facts
- **Procedural**: How-to knowledge and processes
- **Strategic**: Goals, plans, and intentions

Header shows: **Total count / Inactive count** (inactive shown in yellow if > 0)

---

### Memory Timeline

Chronological view of recent episodic memories. _(Currently using mock data)_

---

### Worldview Grid

Display of core beliefs and values. _(Currently using mock data)_

---

### Identity Panel

Shows aspects of Hexis's self-model. _(Currently using mock data)_

---

### Semantic Memories

List of semantic (factual) memories. _(Currently using mock data)_

---

### Relationship Graphing (Knowledge Graph)

3D visualization of entity relationships in the memory graph. _(Currently using mock data — positioned at bottom for future development)_

---

## Chat Tab

Direct asynchronous communication with Hexis.

### Chat Interface

#### Message Thread

Displays chronological conversation history:

- **Hexis messages** (left-aligned): Messages sent by Hexis
- **Your messages** (right-aligned): Your responses

Both persist across page refreshes.

#### Message Input

Text area at the bottom for composing messages:

- Type your message
- Press Send or Enter to submit
- Messages are processed on Hexis's next heartbeat

#### Refresh Button

Manually refreshes the message list (auto-refreshes every 15 minutes).

---

## Config Tab

System configuration settings. _(Placeholder for future implementation)_

---

## Data Sources Quick Reference

| Dashboard Element | Data Source                                     |
| ----------------- | ----------------------------------------------- |
| Heartbeat count   | `heartbeat_state.heartbeat_count`               |
| Energy            | `heartbeat_state.current_energy`                |
| Emotional state   | `heartbeat_state.affective_state` (JSONB)       |
| Goals             | `goals` table                                   |
| Drives            | `drives` table                                  |
| Memories          | `memories` table                                |
| Maintenance stats | `maintenance_log` table (24hr sum)              |
| Chat messages     | `outbox_messages` + `ag_catalog.inbox_messages` |

---

_Last updated: 2026-01-06_
