import path from "path";
import dotenv from "dotenv";

// __dirname after tsc compile is apps/http-backend/dist — three levels up is the monorepo root
const rootEnv = path.resolve(__dirname, "../../../.env");
const result = dotenv.config({ path: rootEnv });

if (result.error) {
  console.error(`[env] Could not load .env from ${rootEnv}:`, result.error.message);
  process.exit(1);
}
