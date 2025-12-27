import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { fixed_assets, insertFixedAssetSchema, asset_depreciation_entries } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { requirePermission } from "../middleware/permissions";
import { requireAuth } from "../middleware/authMiddleware";
import { badRequest, notFound, serverError } from '../utils/sendError';
import { normalize } from "../utils/sanitize";
import { postDepreciation, calculateDepreciation, disposeAsset } from "../utils/fixedAssets";
import { fromZodError } from "zod-validation-error";
import QRCode from "qrcode";
import { logCreate, logUpdate, logDelete } from "../utils/auditLog";

const router = Router();

// List Assets
router.get("/", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const assets = await db.select().from(fixed_assets)
      .where(eq(fixed_assets.company_id, companyId))
      .orderBy(desc(fixed_assets.created_at));
    res.json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    serverError(res, "Failed to fetch assets");
  }
});

// Create Asset
router.post("/", requireAuth, requirePermission('accounting', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const body = normalize(req.body);
    
    const validatedData = insertFixedAssetSchema.parse({
      ...body,
      company_id: companyId
    });

    const [asset] = await db.insert(fixed_assets).values(validatedData).returning();
    
    // Audit log
    const userId = (req as any).session.userId;
    await logCreate({
      companyId,
      entityType: 'fixed_asset',
      entityId: asset.id,
      createdData: { name: asset.name, asset_code: asset.asset_code, cost: asset.cost },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json(asset);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return badRequest(res, fromZodError(error).message);
    }
    console.error("Error creating asset:", error);
    serverError(res, "Failed to create asset");
  }
});

// Get Asset
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const [asset] = await db.select().from(fixed_assets).where(eq(fixed_assets.id, req.params.id));
    if (!asset) return notFound(res, "Asset not found");
    res.json(asset);
  } catch (error) {
    serverError(res, "Failed to fetch asset");
  }
});

// Get Depreciation History
router.get("/:id/history", requireAuth, async (req, res) => {
  try {
    const history = await db.select().from(asset_depreciation_entries)
      .where(eq(asset_depreciation_entries.asset_id, req.params.id))
      .orderBy(desc(asset_depreciation_entries.date));
    res.json(history);
  } catch (error) {
    serverError(res, "Failed to fetch history");
  }
});

// Preview Depreciation
router.post("/:id/preview-depreciation", requireAuth, async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return badRequest(res, "Date is required");
    
    const calculation = await calculateDepreciation(req.params.id, new Date(date));
    res.json(calculation);
  } catch (error: any) {
    badRequest(res, error.message);
  }
});

// Post Depreciation
router.post("/:id/depreciate", requireAuth, requirePermission('accounting', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const { date } = req.body;
    
    if (!date) return badRequest(res, "Date is required");

    const journal = await postDepreciation(companyId, req.params.id, new Date(date), userId);
    
    if (!journal) {
      return res.json({ message: "No depreciation to post (amount is 0)" });
    }

    // Audit log
    await logCreate({
      companyId,
      entityType: 'asset_depreciation',
      entityId: req.params.id,
      createdData: { asset_id: req.params.id, date, journal_id: journal.id },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: "Depreciation posted successfully", journal });
  } catch (error: any) {
    console.error("Depreciation error:", error);
    badRequest(res, error.message);
  }
});

// Dispose Asset
router.post("/:id/dispose", requireAuth, requirePermission('accounting', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const { date, proceeds, depositAccountId, gainLossAccountId } = req.body;

    if (!date || proceeds === undefined || !depositAccountId || !gainLossAccountId) {
      return badRequest(res, "Missing required fields: date, proceeds, depositAccountId, gainLossAccountId");
    }

    const journal = await disposeAsset(
      companyId,
      req.params.id,
      new Date(date),
      parseFloat(proceeds),
      depositAccountId,
      gainLossAccountId,
      userId
    );

    // Audit log
    await logUpdate({
      companyId,
      entityType: 'fixed_asset',
      entityId: req.params.id,
      oldData: { status: 'active' },
      newData: { status: 'disposed', disposal_date: date, disposal_proceeds: proceeds },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: "Asset disposed successfully", journal });
  } catch (error: any) {
    console.error("Disposal error:", error);
    badRequest(res, error.message);
  }
});

// Generate QR Code
router.get("/:id/qrcode", requireAuth, async (req, res) => {
  try {
    const [asset] = await db.select().from(fixed_assets).where(eq(fixed_assets.id, req.params.id));
    if (!asset) return notFound(res, "Asset not found");

    // Format: JSON string with key info
    const data = JSON.stringify({
      id: asset.id,
      code: asset.asset_code,
      name: asset.name,
      company: asset.company_id
    });

    const qrCodeUrl = await QRCode.toDataURL(data);
    res.json({ url: qrCodeUrl, assetCode: asset.asset_code });
  } catch (error) {
    console.error("QR Code error:", error);
    serverError(res, "Failed to generate QR code");
  }
});

export default router;
