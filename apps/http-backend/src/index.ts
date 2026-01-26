import express from "express";
const app = express();
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
// const JWT-SECRET: string = "dirtySecret";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";

app.use(express.json());
//signup - for new account(register)

app.post("/signup",function(req, res){

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
    //db call here
    res.json({
       userId : "123" 
    })
});

//signin or login - for accessing account(access)


app.post("/signin", function(req, res){
    //zod
    const parsedData = SigninSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message: "Incorrect inputs",
            error: parsedData.error    
        })
        return;
    }
    const userId = 1;
    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        token
    })
})

app.post("/room", middleware, function(req, res){
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message: "Incorrect inputs",
            error: parsedData.error    
        })
        return;
    }
    //db call

    res.json({
        roomId: "123"
    })
})
app.listen(3001, function(){
    console.log("Server is running at port: 3001");
})

