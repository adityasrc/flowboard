import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt, { JwtPayload } from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"] ?? "";

  // Accepts both "Bearer <token>" and a raw token string
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.userId = String(decoded.id);
    next();
  } catch (e) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}