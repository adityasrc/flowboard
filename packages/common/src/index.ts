import { z } from "zod";

export const CreateUserSchema = z.object({
    name: z.string().trim().min(4).max(24),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(4).max(72),
});

export const SigninSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(4).max(72),
});

export const CreateRoomSchema = z.object({
    name: z.string().trim().min(4).max(24),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;

// Converts a room name into a URL-safe slug.
// e.g. "My Room #1" -> "my-room-1"
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-") // replace non-alphanumeric chars with hyphens
    .replace(/-+/g, "-")         // collapse multiple hyphens into one
    .replace(/^-+|-+$/g, "");    // strip leading and trailing hyphens
}