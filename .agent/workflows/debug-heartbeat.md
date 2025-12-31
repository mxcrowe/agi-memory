---
description: Debug heartbeat worker issues
---

1. Check if heartbeat worker is running:

   ```bash
   docker compose ps heartbeat_worker
   ```

2. View recent heartbeat logs:

   ```bash
   docker compose logs heartbeat_worker --tail=50
   ```

3. Verify agent is configured (heartbeat is gated on this):

   ```sql
   SELECT * FROM config WHERE key = 'agent.is_configured';
   ```

4. Check for recent heartbeat entries in the database:

   - Review `worker.py` for the heartbeat logic
   - Check `cognitive_memory_api.py` for API calls

5. If heartbeat isn't firing, ensure:
   - Docker services are in "active" profile mode
   - `agent.is_configured` is set to `true`
   - No errors in worker logs
