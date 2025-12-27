
import { Router } from "express";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/permissions";

const router = Router();

// 1. Generate Secret & QR Code
router.post("/setup", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).session.userId;
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    
    if (!user) return res.status(404).json({ error: "User not found" });

    const secret = speakeasy.generateSecret({
      name: `LogAndLedger (${user.email})`
    });

    // Save secret temporarily (it's not enabled yet)
    await db.update(users)
      .set({ two_factor_secret: secret.base32 })
      .where(eq(users.id, userId));

    QRCode.toDataURL(secret.otpauth_url!, (err, data_url) => {
      if (err) return res.status(500).json({ error: "Could not generate QR code" });
      res.json({ secret: secret.base32, qrCode: data_url });
    });
  } catch (error) {
    console.error("2FA Setup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. Verify & Enable
router.post("/verify", requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = (req as any).session.userId;
    
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user || !user.two_factor_secret) return res.status(400).json({ error: "2FA not initialized" });

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: token
    });

    if (verified) {
      await db.update(users)
        .set({ two_factor_enabled: true })
        .where(eq(users.id, userId));
      res.json({ success: true, message: "2FA enabled successfully" });
    } else {
      res.status(400).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.error("2FA Verify Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. Disable
router.post("/disable", requireAuth, async (req, res) => {
  try {
    const { token } = req.body; // Require token to disable for security
    const userId = (req as any).session.userId;
    
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user || !user.two_factor_enabled) return res.status(400).json({ error: "2FA not enabled" });

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret!,
      encoding: 'base32',
      token: token
    });

    if (verified) {
      await db.update(users)
        .set({ two_factor_enabled: false, two_factor_secret: null })
        .where(eq(users.id, userId));
      res.json({ success: true, message: "2FA disabled" });
    } else {
      res.status(400).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.error("2FA Disable Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
