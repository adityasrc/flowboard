import dotenv from "dotenv";
dotenv.config(); 

import { PrismaClient } from "@prisma/client";

export const client = new PrismaClient();

console.log("DATABASE_URL in database package:", process.env.DATABASE_URL);
