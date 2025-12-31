---
description: Start the AGI Memory Docker stack
---

// turbo-all

## Passive Mode (db + embeddings only)

```bash
docker compose up -d
```

## Active Mode (includes heartbeat + maintenance workers)

```bash
docker compose --profile active up -d
```

## Verify services are running

```bash
docker compose ps
```

After starting, the heartbeat worker requires `agent.is_configured=true` (set via `agi init`) before it will begin processing.
