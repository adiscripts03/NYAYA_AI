import type { Request, Response, NextFunction } from "express";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/"/g, "") || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY?.replace(/"/g, "") || "";

/**
 * Middleware to verify Supabase JWT tokens via the Supabase Auth server.
 * This correctly handles ES256 signatures and checks if the token has been revoked.
 * Attaches the user ID to req.user.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("SUPABASE_URL or SUPABASE_ANON_KEY is not set");
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    // Verify token against Supabase auth server
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (!response.ok) {
      console.error("Supabase verification failed:", await response.text());
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const user = await response.json();
    
    req.user = {
      id: user.id,
      email: user.email,
    };
    
    next();
  } catch (error: any) {
    console.error("Auth Verification Error:", error.message);
    res.status(500).json({ error: "Internal server error during authentication" });
  }
};
