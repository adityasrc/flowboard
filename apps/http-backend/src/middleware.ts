import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt, { JwtPayload }  from "jsonwebtoken";
//Request, Response and NextFunction are types for the middleware parameters
export function middleware(req : Request, res : Response, next : NextFunction){
    //jwt token are stored at headers.authorization
    const token = req.headers["authorization"] ?? "";//we need to give emtpy stiring too or it takes undefined type

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload; //jwt.verify only takes string as first input
    //Jwtpayload is type that defines structure of token
    if(decoded){
        
        //used declaration merging here
        req.userId = decoded.userId;
        next();

    }else{
        res.status(403).json({
            message: "You are unauthorized"
        })
    }


}