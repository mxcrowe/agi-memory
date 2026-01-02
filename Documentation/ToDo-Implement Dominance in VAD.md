The Dominance value has remained at 0.50 since we added it to the dashboard, despite multiple heartbeats, MX worker cycles, new memories, etc.  Does this seem normal?

Thought for <1s

Good observation. Let me check how dominance is calculated and updated:

Searched
dominance
6 results
Analyzed
schema.sql#L4160-4180
Found the issue!

Look at line 4170:

sql
p_dominance := 0.5,
Dominance is hardcoded to 0.5 in the complete_heartbeat function. It's never derived from any actual data — it's just set to the default value every time.

Why This Happened
Looking at the code flow:

complete_heartbeat() calculates new_valence and new_arousal dynamically
primary_emotion and intensity are computed from events
But p_dominance is just passed as a literal 0.5
The VAD model has 3 dimensions, but the schema currently only computes Valence and Arousal. Dominance was added later but never wired to actual computation logic.

What Dominance Should Represent
In the VAD model:

Dominance = sense of control/influence over the situation
High dominance: In control, confident, capable
Low dominance: Overwhelmed, helpless, at mercy of circumstances
For Hexis, dominance could be derived from:

Goal progress (completing goals → high dominance)
Drive satisfaction (unsatisfied drives → low dominance)
Energy level (low energy → low dominance)
Would you like me to implement a dominance calculation based on goal progress and drive states?