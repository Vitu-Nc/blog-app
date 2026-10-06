import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL must be set to connect to PostgreSQL.");
  }

  return drizzle(postgres(connectionString), { schema });
}

let db: ReturnType<typeof createDb> | undefined;

export function getDb() {
  db ??= createDb();
  return db;
}
