import path from "path";
import dotenv from "dotenv";

// Load the root-level .env regardless of what process.cwd() is.
// __dirname here is  <repo>/apps/ws-backend/dist  (after tsc compile),
// so three levels up lands us at the monorepo root.
const rootEnv = path.resolve(__dirname, "../../../.env");
const result = dotenv.config({ path: rootEnv });

if (result.error) {
  console.warn(`[env] Could not load .env from ${rootEnv}:`, result.error.message);
}
