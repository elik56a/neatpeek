import { execSync, spawn } from "child_process";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { Client } from "pg";
import process from "process";

// Accept mode as a command-line argument
const mode = process.argv[2] || "development";
const validModes = ["local", "development", "production"];

if (!validModes.includes(mode)) {
  console.error(`❌ Invalid mode "${mode}". Valid options are: ${validModes.join(", ")}`);
  process.exit(1);
}

// Load appropriate environment file
const envPath = `.env.${mode}`;
console.log(`🔧 Starting in "${mode}" mode using environment file: ${envPath}`);

// Check if env file exists
if (!fs.existsSync(path.resolve(process.cwd(), envPath))) {
  console.warn(`⚠️ Environment file ${envPath} not found. Falling back to .env`);
}

config({ path: path.resolve(process.cwd(), envPath) });

// Required environment variables
const requiredEnvVars = ["DATABASE_URL"];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4455;

/**
 * Ensures database connectivity before proceeding
 */
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
    await client.query("SELECT NOW()"); // Simple query to verify connectivity
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

/**
 * Sets up Prisma ORM and runs migrations according to environment
 */
async function setupPrisma() {
  console.log("⚙️ Generating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });

  if (mode === "production") {
    console.log("🚀 Deploying Prisma migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  } else {
    console.log("🚧 Running Prisma dev migrations...");
    try {
      execSync("npx prisma migrate dev", { stdio: "inherit" });
    } catch (error) {
      console.warn("⚠️ Prisma migrate dev failed (probably because DB already up-to-date). Continuing...");
    }
  }
}

/**
 * Starts the Next.js application with appropriate configuration
 */
async function startApp() {
  const isProduction = mode === "production";
  
  // In production, we use 'next start'
  // In development or local, we use 'next dev'
  const cmd = isProduction
    ? `npx next start -p ${PORT}`
    : `npx next dev -p ${PORT}`;

  console.log(`🚀 Starting Next.js app in ${mode} mode with command: ${cmd}`);
  
  // Using spawn instead of execSync to keep the server running
  const child = spawn(cmd, {
    shell: true,
    stdio: "inherit",
  });

  child.on("close", (code) => {
    console.log(`🔴 App exited with code ${code}`);
    process.exit(code ?? 1);
  });

  // Handle termination signals
  process.on("SIGINT", () => {
    console.log("👋 Gracefully shutting down...");
    child.kill("SIGINT");
  });
  
  process.on("SIGTERM", () => {
    console.log("👋 Gracefully shutting down...");
    child.kill("SIGTERM");
  });
}

/**
 * Main application startup sequence
 */
async function main() {
  try {
    await ensureDatabaseConnection();
    await setupPrisma();
    await startApp();
  } catch (error) {
    console.error("❌ Unexpected error during startup:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Application startup failed:", error);
  process.exit(1);
});