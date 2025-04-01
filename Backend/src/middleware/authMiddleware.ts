import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";



export const authenticate:RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.authToken;
  if (!token) { 
    res.status(401).json({ message: "Unauthorized" })
    return
  };
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string };
    (req as unknown as AuthRequest).user = decoded;
    next();
  } catch {
    res.status(400).json({ message: "Invalid token" });
    return
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as unknown as AuthRequest).user) {
        // Ensure req.user is defined
        res.status(401).json({ message: "Unauthorized" });
        return
      }
  
      if (!roles.includes((req as unknown as AuthRequest).user.role)) {
        res.status(403).json({ message: "Access denied" });
        return
      }
    next();
  };
};
