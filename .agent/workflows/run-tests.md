---
description: Run the AGI Memory test suite
---

// turbo-all

1. Ensure Docker services are running:

   ```bash
   docker compose up -d
   ```

2. Wait a few seconds for services to be healthy.

3. Run the test suite:

   ```bash
   pytest test.py -q
   ```

4. Report any failures with file locations and error messages.
