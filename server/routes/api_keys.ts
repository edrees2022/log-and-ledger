import { Router } from "express";
import { db } from "../db";
import { api_keys } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { serverError, badRequest } from "../utils/sendError";
import { logAudit } from "../utils/auditLog";
import crypto from "crypto";

const router = Router();

// Helper to hash key
function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// List API Keys
router.get("/", requireAuth, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;

    const keys = await db.query.api_keys.findMany({
      where: eq(api_keys.company_id, companyId),
      orderBy: [desc(api_keys.created_at)]
    });

    // Don't return the hash obviously, but we don't have the plain key anyway
    const safeKeys = keys.map(k => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      scopes: k.scopes,
      last_used_at: k.last_used_at,
      expires_at: k.expires_at,
      is_active: k.is_active,
      created_at: k.created_at
    }));

    res.json(safeKeys);
  } catch (error) {
    console.error("Error listing API keys:", error);
    serverError(res, "Failed to list API keys");
  }
});

// Create API Key
router.post("/", requireAuth, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const { name, scopes, expires_at } = req.body;

    if (!name) return badRequest(res, "Name is required");

    // Generate a random key
    // Format: sk_live_<random_32_chars>
    const randomPart = crypto.randomBytes(24).toString('hex');
    const plainKey = `sk_live_${randomPart}`;
    const prefix = plainKey.substring(0, 12); // sk_live_1234
    const hashed = hashKey(plainKey);

    const [newKey] = await db.insert(api_keys).values({
      company_id: companyId,
      name,
      key_hash: hashed,
      prefix,
      scopes: scopes || [],
      expires_at: expires_at ? new Date(expires_at) : null,
      created_by: userId
    }).returning();

    await logAudit({
      companyId,
      entityType: 'api_key',
      entityId: newKey.id,
      action: 'create',
      changes: { name, scopes },
      actorId: userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      apiKey: plainKey, // Return full key ONLY ONCE
      meta: {
        id: newKey.id,
        name: newKey.name,
        prefix: newKey.prefix,
        scopes: newKey.scopes,
        expires_at: newKey.expires_at
      }
    });

  } catch (error) {
    console.error("Error creating API key:", error);
    serverError(res, "Failed to create API key");
  }
});

// Revoke API Key
router.delete("/:id", requireAuth, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const { id } = req.params;

    const [deleted] = await db.delete(api_keys)
      .where(and(
        eq(api_keys.id, id),
        eq(api_keys.company_id, companyId)
      ))
      .returning();

    if (!deleted) return badRequest(res, "API key not found");

    await logAudit({
      companyId,
      entityType: 'api_key',
      entityId: id,
      action: 'delete',
      actorId: (req as any).session.userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, message: "API key revoked" });

  } catch (error) {
    console.error("Error revoking API key:", error);
    serverError(res, "Failed to revoke API key");
  }
});

export default router;
