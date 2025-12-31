---
description: Apply schema changes safely
---

## For Development (destructive reset)

> [!CAUTION]
> This section DESTROYS ALL DATA. Never auto-run. Always confirm with user first.

1. Make changes to `schema.sql`

2. **CONFIRM WITH USER**, then reset the database to apply:

   ```bash
   docker compose down -v && docker compose up -d
   ```

3. Re-run `agi init` to reconfigure

4. Run tests to verify nothing broke:
   ```bash
   pytest test.py -q
   ```

## For Production (migrations)

1. Create a migration file in `migrations/` with:

   - Descriptive filename with date prefix
   - Idempotent SQL (use IF NOT EXISTS, etc.)
   - Both UP and DOWN sections if possible

2. Apply migration manually or via deployment process

3. Update `schema.sql` to match the new state (schema.sql is source of truth for fresh installs)
