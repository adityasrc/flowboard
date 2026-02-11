import 'dotenv/config';  //  loads .env

import express from "express";
const app = express();
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { client } from "@repo/db/client";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common";
import cors from "cors";
app.use(cors());
app.use(express.json());

//signup - for new account(register)

app.post("/signup", async function(req, res){
    // const username = req.body.username;
    // const name = req.body.name;
    // const email = req.body.email;
    // const password = req.body.password;

    //.Parse just returns either data or error 
    const parsedData = CreateUserSchema.safeParse(req.body);
    //safeParse returns three things, parsed data, true or false, error

    

    if(!parsedData.success){
        res.json({
            message: "Incorrect inputs",
            error: parsedData.error    
        })
        return;
    }
    try{
        const hashedPassword = await bcrypt.hash(parsedData.data.password, 15);
        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                name: parsedData.data.name,
                email: parsedData.data.email,
                //hashing is left 
                password: hashedPassword
            }
        })
        res.json({
            userId : user.id 
        })
    }catch(e){
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
    // db call here
});

//signin or login - for accessing account(access)


app.post("/signin", async function(req, res){
    //zod
    const parsedData = SigninSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message: "Incorrect inputs",
            error: parsedData.error    
        })
        return;
    }
    const user = await client.user.findFirst({
        where: {
            username: parsedData.data.username,
            // password: parsedData.data.password
        }
    })


    if(!user){
        res.status(403).json({
            message: "Incorrect creds"
        })
    }else{
        const passwordMatch = await bcrypt.compare(parsedData.data.password, user.password );
        if(passwordMatch){
            const token = jwt.sign({
                id: user.id
            },  JWT_SECRET  );

            res.json({
                token
            })
        }
    }

    
    // const token = jwt.sign({
        
    // }, JWT_SECRET);

    // res.json({
    //     token
    // })
})

app.post("/room", middleware, async function(req, res){
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message: "Incorrect inputs",
            error: parsedData.error    
        })
        return;
    }
    
    const userId = req.userId; //we got this user id form middleware
    try{    
        const room = await client.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: Number(userId), //converted string userid to num/int
            }
        })
        res.json({
            roomId: room.id
        })
    }catch(e){
        // console.log("The real error is here: ", e);
        res.status(411).json({
            message: "Room already exist with this name.",
            actualError: e
        })
    }
})

app.get("/chats/:roomSlug", async function(req, res){
    
    //auth ko add karna
    //rate limiting 
    
    try{
        const roomSlug = req.params.roomSlug;
        const room = await client.room.findUnique({
            where:{
                slug: roomSlug
            }
        })
        if(!room){
            res.status(404).json({
                message: "Room not found"
            })
            return;
        }
        const messages = await client.chat.findMany({
            where:{
                roomId: room.id
            }, 
            orderBy: {
                id: "desc"
            },
            take: 50
        })
        res.json({
            messages: messages.reverse()
        })
    }catch(e){
        console.log("Room not found");
        res.status(500).json({
            messages: []
        })
    }
})


app.listen(3001, function(){
    console.log("Server is running at port: 3001");
})

