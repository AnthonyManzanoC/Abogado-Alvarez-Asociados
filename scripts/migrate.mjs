import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL no está configurada.");

const sql = postgres(connectionString, {
  ssl: "require",
  max: 1,
  prepare: false,
  connect_timeout: 20,
});

try {
  const migration = await fs.readFile(path.join(process.cwd(), "database", "schema.sql"), "utf8");
  await sql.unsafe(migration);
  const [{ lawyers, articles, practices }] = await sql`
    select
      (select count(*)::int from public.lawyers) as lawyers,
      (select count(*)::int from public.articles) as articles,
      (select count(*)::int from public.practice_areas) as practices
  `;
  console.log(`Migración aplicada: ${lawyers} perfil(es), ${articles} artículo(s), ${practices} área(s).`);
} finally {
  await sql.end({ timeout: 5 });
}
