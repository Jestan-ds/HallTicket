import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";
import { db } from '../db'; // Adjust the path to your Drizzle DB instance
// Import your usersAuth and usersDetails schemas
import { usersAuth, usersDetails } from '../db/schema';
import { eq } from 'drizzle-orm'; // Import eq for Drizzle queries



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

// Replace with a strong fallback or ensure env var is set

// Define the structure that your middleware will attach to req.user
// This should match the AuthenticatedUser interface in your express.d.ts file
// It includes the usersDetails.id (as number), usersAuth.id (as number),
// usersAuth.role (as string enum), usersAuth.email (as string), and usersDetails.name (as string).
interface AuthenticatedUser {
    id: number; // Corresponds to usersDetails.id (int) - This is the main user ID used elsewhere
    authId?: number; // Corresponds to usersAuth.id (int) - This is the ID from the authentication table
    role: 'admin' | 'student' | 'superadmin'; // Corresponds to usersAuth.role enum
    email?: string; // Corresponds to usersAuth.email
    name?: string; // Corresponds to usersDetails.name
}

// Extend the Express Request interface to include the 'user' property
// This declaration should ideally be in a separate .d.ts file (e.g., src/types/express.d.ts)
// but is included here for context. Ensure you have the separate file.
declare module 'express' {
  interface Request {
    user?: AuthenticatedUser; // '?' makes the user property optional (for routes that don't require auth)
  }
}


export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      // 1. Get the token from the Authorization header
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Expected format: "Bearer TOKEN"

      if (token == null) {
          // If no token is provided, send 401 Unauthorized
          // For routes that are public, you would just call next() here without setting req.user
           res.sendStatus(401); // Send status and return early
           return; // Explicitly return void
      }
      console.log("process.env.JWT_SECRET", process.env.JWT_SECRET)

      // 2. Verify the token and extract the payload
      jwt.verify(token, process.env.JWT_SECRET!, async (err, payload: any) => {
          if (err) {
              // If token verification fails (invalid signature, expired, etc.), send 403 Forbidden
              console.error("JWT verification failed:", err.message);
               res.sendStatus(403); // Send status and return early
               return; // Explicitly return void
          }

          // Assuming your JWT payload contains the usersAuth.id (authId) as per your login logic
          // The key is 'authId' and the value is the ID from the usersAuth table.
          const authId = payload.authId;

          if (authId === undefined || authId === null) {
               console.error("JWT payload missing required 'authId':", payload);
               res.sendStatus(403); // Send status and return early
               return; // Explicitly return void
          }

          // 3. Fetch user details from the database using the authId from the token
          // Join usersAuth and usersDetails to get both usersDetails.id and usersAuth.role, email, name
          const userDetails = await db
              .select({
                  id: usersDetails.id, // Fetch usersDetails ID (int) - This is the main user ID used elsewhere
                  authId: usersAuth.id, // Fetch usersAuth ID (int) - This is the ID from the authentication table
                  role: usersAuth.role, // Fetch Role from usersAuth (string enum)
                  email: usersAuth.email, // Fetch email from usersAuth
                  name: usersDetails.name, // Fetch name from usersDetails
              })
              .from(usersAuth) // Start from usersAuth as we filter by usersAuth.id
              .innerJoin(usersDetails, eq(usersDetails.authId, usersAuth.id)) // Join with usersDetails on the foreign key
              .where(eq(usersAuth.id, authId)) // Filter by the authId obtained from the token (usersAuth.id)
              .limit(1); // Limit to 1 result as authId should be unique in usersAuth

          if (userDetails.length === 0) {
              // If no user is found in the database with the given authId, send 404 Not Found
              console.error("User not found in DB for authId from token:", authId);
               res.sendStatus(404); // Send status and return early
               return; // Explicitly return void
          }

          // Get the first (and only) user detail object
          const user = userDetails[0];

          // 4. Attach user details to the request object
          // This makes user information available in subsequent route handlers (e.g., req.user.id, req.user.role)
          // Ensure the attached object matches the AuthenticatedUser interface
          req.user = {
              id: user.id, // usersDetails.id (int)
              authId: user.authId, // usersAuth.id (int)
              role: user.role, // usersAuth.role (string enum)
              email: user.email, // usersAuth.email
              name: user.name, // usersDetails.name
          };

          // 5. Proceed to the next middleware or route handler
          next();
      });

  } catch (error) {
      // Catch any unexpected errors during the process
      console.error("Unexpected error in authentication middleware:", error);
      res.sendStatus(500); // Internal Server Error
  }
};