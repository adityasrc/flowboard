import { z } from "zod";

export const CreateUserSchema = z.object({
    username: z.string().trim().min(4).max(15),
    name: z.string().trim().min(4).max(24),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(4).max(72),
});

export const SigninSchema = z.object({
    username: z.string().trim().min(4).max(15),
    password: z.string().min(4).max(72),
});

export const CreateRoomSchema = z.object({
    name: z.string().trim().min(4).max(24),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;