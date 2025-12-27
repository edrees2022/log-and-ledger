import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { api_keys } from "@shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  
  // Basic format check
  if (!token.startsWith("sk_live_")) {
    return res.status(401).json({ message: "Invalid API key format" });
  }

  const hashed = hashKey(token);

  try {
    const key = await db.query.api_keys.findFirst({
      where: eq(api_keys.key_hash, hashed)
    });

    if (!key || !key.is_active) {
      return res.status(401).json({ message: "Invalid or inactive API key" });
    }

    if (key.expires_at && new Date() > key.expires_at) {
      return res.status(401).json({ message: "API key expired" });
    }

    // Update last used (fire and forget to not block response)
    db.update(api_keys)
      .set({ last_used_at: new Date() })
      .where(eq(api_keys.id, key.id))
      .catch(err => console.error("Failed to update api key last_used_at", err));

    // Attach context to request
    (req as any).apiKey = key;
    (req as any).companyId = key.company_id; // For compatibility with existing logic
    // Mock session for reused functions that expect it
    (req as any).session = { 
      companyId: key.company_id, 
      userId: key.created_by,
      isApiKey: true 
    }; 

    next();
  } catch (error) {
    console.error("API Key Auth Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function requireScope(scope: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = (req as any).apiKey;
    if (!key) return res.status(401).json({ message: "Unauthorized" });

    const scopes = key.scopes as string[];
    
    // "all" scope grants everything
    if (scopes.includes("all") || scopes.includes(scope)) {
      next();
    } else {
      res.status(403).json({ message: `Missing required scope: ${scope}` });
    }
  };
}
