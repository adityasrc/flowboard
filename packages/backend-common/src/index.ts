const secret = process.env.JWT_SECRET;

if (!secret || secret.trim().length === 0) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is not set. The server cannot start without it.",
  );
}

export const JWT_SECRET: string = secret.trim();