import { z } from "zod";

export const CreateUserSchema = z.object({
    username: z.string().min(4).max(15),
    name: z.string().email(), 
    email: z.string().min(4).max(24),
    password: z.string().min(4).max(24)
})

export const SigninSchema = z.object({
    username: z.string().min(4).max(15),
    password: z.string().min(4).max(24)
})

export const CreateRoomSchema = z.object({
    name: z.string().min(4).max(24)
})