import { execSync, spawn } from "child_process";
import { config } from "dotenv";
import path from "path";
import { Client } from "pg";
import process from "process";

const mode = process.argv[2] || "development";

const envPath = `.env.${mode === "production" ? "production" : mode === "local" ? "local" : "development"}`;
console.log(`🔧 Starting in "${mode}" mode using environment file: ${envPath}`);
config({ path: path.resolve(process.cwd(), envPath) });

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4455;

async function ensureDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not defined in the environment variables.");
    process.exit(1);
  }

  console.log("🔎 Checking database connection...");

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log("✅ Database connection successful.");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function setupPrisma() {
  console.log("⚙️ Generating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });

  if (mode === "production") {
    console.log("🚀 Deploying Prisma migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  } else {
    console.log("🚧 Running Prisma dev migrations...");
    try {
      execSync("npx prisma migrate dev --name init", { stdio: "inherit" });
    } catch (error) {
      console.warn("⚠️ Prisma migrate dev failed (probably because DB already up-to-date). Continuing...");
    }
  }
}

async function startApp() {
  const isProduction = mode === "production";
  const cmd = isProduction
    ? `npx next start -p ${PORT}`
    : `npx next dev -p ${PORT}`;

  console.log(`🚀 Starting Next.js app with command: ${cmd}`);
  
  // חשוב: משתמשים ב-spawn במקום execSync כדי שהשרת יישאר פתוח
  const child = spawn(cmd, {
    shell: true,
    stdio: "inherit",
  });

  child.on("close", (code) => {
    console.log(`🔴 App exited with code ${code}`);
    process.exit(code ?? 1);
  });
}

async function main() {
  await ensureDatabaseConnection();
  await setupPrisma();
  await startApp(); 
}

main().catch((error) => {
  console.error("❌ Application startup failed:", error);
  process.exit(1);
});
