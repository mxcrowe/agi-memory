---
description: Reset the database with fresh schema
---

> [!CAUTION]
> This workflow DESTROYS ALL DATA in the database. The `-v` flag removes Docker volumes.
> NEVER auto-run this workflow. Always confirm with the user first.

1. **CONFIRM WITH USER** before proceeding. This is destructive!

2. Stop and remove containers and volumes:

   ```bash
   docker compose down -v
   ```

3. Start services fresh:

   ```bash
   docker compose up -d
   ```

4. Wait for database to be ready (check logs if needed):

   ```bash
   docker compose logs db --tail=20
   ```

5. Re-initialize the agent configuration:

   ```bash
   python -m agi_cli init
   ```

6. Confirm schema was applied by checking a known table exists.
