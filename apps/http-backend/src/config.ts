import path from "path";
import dotenv from "dotenv";

// Load root-level .env for local development.
// In production, env vars are injected by the platform.
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const secret = process.env.JWT_SECRET;

if (!secret || secret.trim().length === 0) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is not set. The server cannot start without it.",
  );
}

export const JWT_SECRET: string = secret.trim();
