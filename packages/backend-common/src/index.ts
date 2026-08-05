import path from "path";
import dotenv from "dotenv";

// Load root-level .env if present (used in local development).
// In production (Render, Docker, etc.), environment variables are injected directly into process.env.
const rootEnv = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: rootEnv });

const secret = process.env.JWT_SECRET;

if (!secret || secret.trim().length === 0) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is not set. The server cannot start without it.",
  );
}

export const JWT_SECRET: string = secret.trim();