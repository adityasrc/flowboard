import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "./config";
import jwt, { JwtPayload } from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token missing" });
  }

  const token = authHeader.split(" ")[1]?.trim();

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded?.id || isNaN(Number(decoded.id))) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.userId = Number(decoded.id);
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}