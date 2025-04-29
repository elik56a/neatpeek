import { execSync } from "child_process";

const mode = process.argv[2] || "production";

console.log(`🔧 Starting Prisma setup for ${mode} environment`);

execSync("npx prisma generate", { stdio: "inherit" });

if (mode === "production") {
  console.log("🚀 Running prisma migrate deploy...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} else {
  console.log("🚧 Running prisma migrate dev...");
  try {
    execSync("npx prisma migrate dev --name init", { stdio: "inherit" });
  } catch (err) {
    console.warn("⚠️ Prisma migrate dev failed (probably already applied). Continuing.");
  }
}
