import postgres from "postgres";

const globalForDb = globalThis as unknown as { legalDb?: ReturnType<typeof postgres> };

function createConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está configurada.");
  }
  return postgres(process.env.DATABASE_URL, {
    ssl: "require",
    max: process.env.NODE_ENV === "development" ? 3 : 5,
    idle_timeout: 20,
    connect_timeout: 20,
    prepare: false,
  });
}

export const db = globalForDb.legalDb ?? createConnection();
if (process.env.NODE_ENV !== "production") globalForDb.legalDb = db;
