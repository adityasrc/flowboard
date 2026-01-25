import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

async function createDummyUsers(){
    let user = await client.user.create({
        
    })
}

createDummyUsers();