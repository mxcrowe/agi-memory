# Hexis Dashboard

A real-time web dashboard for monitoring and interacting with your Hexis AGI cognitive architecture system.

![Dashboard Preview](https://placeholder.svg?height=400&width=800&query=Hexis+Dashboard+Interface)

## Overview

This dashboard provides a comprehensive interface for your Hexis fork, allowing you to:

- **Monitor Agent Status**: View real-time memory counts, energy levels, and system health
- **Explore Memory Systems**: Browse episodic and semantic memories with timeline visualization
- **Visualize Identity & Worldview**: Examine identity aspects and worldview beliefs
- **Interact via Chat**: Communicate with your AGI agent (coming soon)
- **Manage Configuration**: Adjust system parameters and goals

## Quick Start

### 1. Prerequisites

- Your Hexis system running with PostgreSQL (via Docker Compose)
- Node.js 18+ installed
- Database connection details

### 2. Installation

```bash
# Install dependencies
npm install
```

### 3. Database Configuration

Create a `.env.local` file:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local` and add your Hexis database connection:

```env
DATABASE_URL=postgresql://hexis:hexis_password@localhost:5432/hexis
```

**Finding Your Connection String:**

Check your Hexis `docker-compose.yml` for the PostgreSQL settings:
- **Username**: Usually `hexis` or `postgres`
- **Password**: Check `POSTGRES_PASSWORD` environment variable
- **Host**: `localhost` (if running locally)
- **Port**: `5432` (default PostgreSQL port)
- **Database**: Usually `hexis`

### 4. Start the Dashboard

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view your dashboard.

### 5. Verify Connection

Visit [http://localhost:3000/api/health](http://localhost:3000/api/health) to check database connectivity.

**Expected Response (Healthy):**
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "tables": {
      "memories": 42,
      "episodes": 8,
      "clusters": 15
    }
  }
}
```

## Features

### Agent Status Dashboard (`/`)

Real-time monitoring of your Hexis agent:
- Total memory count by type (episodic, semantic, procedural, strategic)
- Energy budget tracking
- Heartbeat cycle visualization (OODA loop phases)
- Active goals and progress
- System vitality metrics

### Memory Explorer (`/memory`)

Deep dive into your agent's memory systems:
- **Episodic Timeline**: Chronological view of experiences and events
- **Semantic Concepts**: Knowledge graph of facts and beliefs
- **Identity Panel**: Core identity aspects and their stability
- **Worldview Grid**: Belief systems organized by category
- **3D Knowledge Graph**: Interactive visualization of concept relationships

### Chat Interface (`/chat`)

Interact with your Hexis agent:
- Real-time conversation with energy cost tracking
- Conversation history with relationship context
- Trust level monitoring

### Configuration Management (`/config`)

Adjust system parameters:
- Heartbeat intervals and energy budgets
- Memory consolidation thresholds
- LLM provider and model selection
- Goal management
- Guardrails and safety constraints

## Architecture

### Technology Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with pgvector and Apache AGE (from Hexis)
- **Database Client**: @neondatabase/serverless
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **UI Components**: Radix UI + shadcn/ui

### Project Structure

```
hexis-dashboard/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes (database queries)
│   ├── chat/                 # Chat interface
│   ├── config/               # Configuration management
│   ├── memory/               # Memory explorer
│   └── page.tsx              # Main dashboard
├── components/               # React components
│   ├── agent-status-card.tsx
│   ├── energy-chart.tsx
│   ├── knowledge-graph-3d.tsx
│   ├── memory-timeline.tsx
│   └── ...
├── lib/
│   ├── db.ts                 # Database connection
│   ├── db-queries.ts         # SQL queries
│   ├── db-types.ts           # TypeScript types matching Hexis schema
│   └── mock-data.ts          # Mock data for development
└── SETUP.md                  # Detailed setup guide
```

## Customization

### Adding New Metrics

1. Add query function to `lib/db-queries.ts`
2. Create API route in `app/api/your-metric/route.ts`
3. Create UI component in `components/`
4. Import and use in relevant page

### Modifying Queries

All database queries are in `lib/db-queries.ts`. Modify them to match your Hexis fork's schema changes.

### Styling

The dashboard uses a dark "Data-Centric Futurism" theme. To customize:
- Edit `app/globals.css` for color tokens
- Modify component styles in each `.tsx` file
- Update Tailwind configuration in `globals.css`

## Troubleshooting

### Database Connection Errors

**Error**: `Failed to fetch agent status`

**Solutions**:
1. Verify PostgreSQL is running: `docker ps`
2. Test connection: `psql $DATABASE_URL -c "SELECT 1;"`
3. Check firewall/port forwarding
4. Ensure DATABASE_URL is correct in `.env.local`

### Empty Dashboard

If your dashboard loads but shows no data, your Hexis database might be empty. This is normal for new installations. The dashboard will populate as your Hexis system creates memories.

### Port Conflicts

If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

## Development

### Adding Database Migrations

When you add tables or columns to your Hexis schema:

1. Update types in `lib/db-types.ts`
2. Add/modify queries in `lib/db-queries.ts`
3. Update API routes as needed

### Testing with Mock Data

If you want to develop without a database connection, the original mock data is still available in `lib/mock-data.ts`.

## Deployment

### Local Production Build

```bash
npm run build
npm start
```

### Deploy to Vercel

This dashboard can be deployed to Vercel and connect to your local Hexis database via Vercel's secure tunneling:

1. Push to GitHub
2. Import to Vercel
3. Add `DATABASE_URL` environment variable
4. Deploy

**Note**: Your local PostgreSQL must be accessible from the internet. Consider using a hosted database (Supabase, Neon) for production deployments.

## Roadmap

- [ ] Real-time heartbeat tracking from Hexis OODA loop
- [ ] Energy budget history and predictions
- [ ] Goal creation and management UI
- [ ] Chat interface with memory integration
- [ ] Graph visualization using Apache AGE queries
- [ ] Memory consolidation monitoring
- [ ] MCP Bridge status monitoring
- [ ] Export/backup functionality

## Contributing

This is a fork-specific dashboard for Hexis. Customize it to match your cognitive architecture modifications!

## License

This dashboard inherits the license from your Hexis fork.

## Support

For issues specific to:
- **This Dashboard**: Open an issue in your fork
- **Hexis Core**: See the main Hexis repository
- **Database Schema**: Check your `schema.sql` file

---

Built with ❤️ for AGI development
