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