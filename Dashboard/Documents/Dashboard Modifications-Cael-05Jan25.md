feat(dashboard): Chat improvements, mail notifications, Memory page real data
Chat Tab:
- Wired chat history to real inbox/outbox data (replaced mock relationships)
- Removed Chat History sidebar panel (messages now show in main thread)
- User messages now persist across page refreshes
- Added date alongside time in chat message timestamps
- Fixed ag_catalog.process_inbox_message schema reference in /api/chat
Status Tab:
- Added clickable mail indicator with acknowledge functionality
- Pulses red for unseen messages, click to mark as seen
- Added seen_at column to outbox_messages table
Memory Tab:
- Moved Knowledge Graph Visualizer to bottom of page
- Wired Memory Distribution to real database counts
- Added total/inactive display format (e.g., "611 Total/2 Inactive")
Database:
- Added totalMemories, activeMemories, inactiveMemories to getAgentStatus()
- Created /api/outbox/acknowledge endpoint
- Updated query to count unseen sent messages
New files:
- components/mail-indicator.tsx
- app/api/outbox/acknowledge/route.ts
- app/api/chat-history/route.ts
Schema changes (apply manually):
- ALTER TABLE outbox_messages ADD COLUMN seen_at TIMESTAMPTZ DEFAULT NULL;