export interface AuthRequest {
  user: {
    userId: number;
    role: string;
  };
  cache: any;
  credentials: any;
  destination: any;
  integrity: any;
}
interface AuthenticatedUser {
  id: number; // Based on usersDetails.id being int
  role: 'admin' | 'student' | 'superadmin'; // Based on usersAuth.role enum
  // Add other properties your middleware might attach, e.g., email, name
  email?: string;
  name?: string;
  authId?: number; // Optional if you need to reference the auth ID
}


// Extend the Express Request interface
declare module 'express' {
interface Request {
  // Add the 'user' property with your custom AuthenticatedUser type
  user?: AuthenticatedUser; // Use '?' if the user might not be authenticated on some routes
}
}
