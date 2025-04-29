import { spawn } from "child_process";
import { config } from "dotenv";
import path from "path";
import { Client } from "pg";

const mode = process.argv[2] || "development";
const envPath = `.env.${mode === "production" ? "production" : mode === "local" ? "local" : "development"}`;

console.log(`🔧 Starting in "${mode}" mode using env file: ${envPath}`);
config({ path: path.resolve(process.cwd(), envPath) });

const PORT = process.env.PORT || "4455";

async function ensureDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is missing");
    process.exit(1);
  }

  console.log("🔎 Connecting to database...");
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log("✅ Database connection successful.");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function startNextApp() {
  const command = mode === "production"
    ? `npx next start -p ${PORT}`
    : `npx next dev -p ${PORT}`;

  console.log(`🚀 Starting Next.js with: ${command}`);

  const child = spawn(command, { shell: true, stdio: "inherit" });
  child.on("close", (code) => {
    console.log(`🔴 App exited with code ${code}`);
    process.exit(code ?? 1);
  });
}

async function main() {
  await ensureDatabaseConnection();
  await startNextApp();
}

main().catch((err) => {
  console.error("❌ App failed to start:", err);
  process.exit(1);
});
