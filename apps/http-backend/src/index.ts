import express from "express";
const app = express();
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/common/config";
// const JWT-SECRET: string = "dirtySecret";

app.use(express.json());
//signup - for new account(register)

app.post("/signup",function(req, res){
    //db call here
    res.json({
       userId : "123" 
    })
});

//signin or login - for accessing account(access)


app.post("/signin", function(req, res){
    //zod is left for now
    const userId = 1;
    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        token
    })
})

app.post("/room", middleware, function(req, res){
    //db call
    res.json({
        roomId: "123"
    })
})
app.listen(3001, function(){
    console.log("Server is running at port: 3001");
})

