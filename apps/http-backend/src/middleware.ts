import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt, { JwtPayload } from "jsonwebtoken";
//Request, Response and NextFunction are types for the middleware parameters
export function middleware(req: Request, res: Response, next: NextFunction) {
  //jwt token are stored at headers.authorization
  const authHeader = req.headers["authorization"] ?? ""; //we need to give emtpy stiring too or it takes undefined type

  const token = authHeader.split(" ")[1] ?? "";
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload; //jwt.verify only takes string as first input
    //Jwtpayload is type that defines structure of token
    if (decoded && decoded.id) {
      //used declaration merging here
      req.userId = decoded.id;
      next();
    } else {
      res.status(401).json({
        message: "You are unauthorized",
      });
    }
  } catch (e) {
    console.log("JWT Verification Error:", e);
    return res.status(403).json({
      message: "Unauthorized or Invalid token",
    });
  }
}
