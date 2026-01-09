#!/usr/bin/env python3
"""
Safe read-only test script to connect to Hexis database
and retrieve health information without modifying anything.
"""

import asyncio
import asyncpg
import json
from typing import Any, Dict

# Database connection parameters from Claude Desktop MCP server config
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "agi_db",
    "user": "agi_user",
    "password": "agi_password",
}


async def get_health() -> Dict[str, Any]:
    """
    Safely retrieve health metrics from the database.
    This is a read-only operation - no modifications are made.
    """
    conn = await asyncpg.connect(**DB_CONFIG)

    try:
        # Call the get_health function from schema.sql
        # This is the same function the MCP server calls
        result = await conn.fetchrow("SELECT * FROM get_health();")

        if result:
            # Convert asyncpg Record to dict for JSON serialization
            health_data = dict(result)
            return health_data
        else:
            return {"error": "No health data returned"}

    finally:
        await conn.close()


async def main():
    """Main entry point - fetch and display health data."""
    print("Connecting to Hexis database...")
    print(f"Host: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print(f"Database: {DB_CONFIG['database']}")
    print()

    try:
        health = await get_health()
        print("✓ Successfully retrieved health data!")
        print()
        print("Health Metrics:")
        print(json.dumps(health, indent=2))

    except asyncpg.InvalidPasswordError:
        print("✗ Authentication failed - check credentials")
    except ConnectionRefusedError:
        print("✗ Connection refused - is PostgreSQL running?")
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {e}")


if __name__ == "__main__":
    asyncio.run(main())
