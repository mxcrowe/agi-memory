# Hexis Dashboard Setup Guide

This dashboard connects to your local Hexis PostgreSQL database to visualize your AGI system's cognitive architecture.

## Prerequisites

1. **Hexis System Running**: Your Hexis fork with PostgreSQL database running via Docker Compose
2. **Node.js**: Version 18 or higher
3. **Database Access**: Connection details for your Hexis PostgreSQL instance

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database Connection

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your database connection string:

```
DATABASE_URL=postgresql://user:password@localhost:5432/hexis
```

**Finding Your Connection Details:**

If you're using the default Hexis Docker Compose setup, your connection string is likely:

```
DATABASE_URL=postgresql://hexis:hexis_password@localhost:5432/hexis
```

Check your `docker-compose.yml` file in your Hexis repository for the exact values.

### 3. Test Database Connection

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

If the dashboard loads without errors, you're connected! If you see errors, check:
- Is your PostgreSQL container running? (`docker ps`)
- Are the credentials correct?
- Is port 5432 accessible?

## Troubleshooting

### "Failed to fetch agent status"

**Problem**: Dashboard can't connect to database

**Solutions**:
1. Verify PostgreSQL is running: `docker ps | grep postgres`
2. Test connection manually:
   ```bash
   psql postgresql://user:password@localhost:5432/hexis -c "SELECT COUNT(*) FROM memories;"
   ```
3. Check firewall/network settings

### "Connection refused"

**Problem**: Port 5432 is blocked or PostgreSQL isn't exposed

**Solution**: Update your `docker-compose.yml` to expose the port:
```yaml
services:
  db:
    ports:
      - "5432:5432"
```

### Empty Dashboard

**Problem**: Database is empty (no memories yet)

**Solution**: This is normal for a new Hexis installation. The dashboard will populate as your Hexis system creates memories through interactions.

## What's Next?

Once connected, the dashboard will display:
- **Agent Status**: Real-time memory counts, clusters, and system health
- **Memory Explorer**: Browse episodic and semantic memories
- **Identity Panel**: View identity aspects and worldview beliefs
- **Knowledge Graph**: Interactive visualization of concept relationships
- **Chat Interface**: Interact with your Hexis agent (coming soon)

## Architecture

The dashboard uses:
- **Next.js 16** with App Router
- **@neondatabase/serverless** for PostgreSQL queries
- **Recharts** for data visualization
- **Tailwind CSS** for styling

All database queries are in `lib/db-queries.ts` - customize as needed for your fork!
