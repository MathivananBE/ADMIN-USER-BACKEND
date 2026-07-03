//shared TS types + JWT payload shape

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export type TokenRole = "admin" | "user";

export interface JwtPayload {
  role: TokenRole;
  // present only for user tokens
  userId?: number;
  email: string;
}

// Augment Express Request to carry decoded auth info
declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}
