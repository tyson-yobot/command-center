import fs from "fs";
import path from "path";

const required = [
  ".env",
  "client/vite.config.ts",
  "client/src",
  "server/server.ts",
  "tsconfig.json"
];

let failed = false;

for (const file of required) {
  const exists = fs.existsSync(path.resolve(file));
  if (!exists) {
    console.error(`❌ Missing: ${file}`);
    failed = true;
  } else {
    console.log(`✅ Found: ${file}`);
  }
}

if (failed) {
  console.error("\n🚫 Preflight failed. Fix missing files before continuing.");
  process.exit(1);
} else {
  console.log("\n🚀 All required files are present.");
}
