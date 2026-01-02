import postgres from "postgres"

// Get database connection from environment variable
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return url
}

// Create SQL client for local PostgreSQL
export const sql = postgres(getDatabaseUrl(), {
  ssl: false, // No SSL for local Docker connection
  max: 10,    // Connection pool size
})

// Helper to check if database is connected
export async function checkDatabaseConnection() {
  try {
    await sql`SELECT 1`
    return { connected: true, error: null }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
