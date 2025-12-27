import { db } from '../db';
import { audit_logs } from '@shared/schema';

export interface AuditLogParams {
  companyId: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'sync_conflict';
  changes?: any;
  actorId?: string;
  actorName?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * تسجيل حدث في Audit Logs
 * 
 * @example
 * await logAudit({
 *   companyId: user.company_id,
 *   entityType: 'sales_invoice',
 *   entityId: invoice.id,
 *   action: 'delete',
 *   changes: { invoiceNumber: invoice.invoice_number },
 *   actorId: user.id,
 *   actorName: user.full_name,
 *   ipAddress: req.ip,
 *   userAgent: req.headers['user-agent']
 * });
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await db.insert(audit_logs).values({
      company_id: params.companyId,
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: params.action,
      changes: params.changes ? JSON.stringify(params.changes) : null,
      actor_id: params.actorId || null,
      actor_name: params.actorName || 'System',
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      timestamp: new Date(),
    });
    
    console.log(`[AUDIT] ${params.action} ${params.entityType} ${params.entityId} by ${params.actorName || 'System'}`);
  } catch (error) {
    // لا نريد أن يفشل الطلب بسبب فشل audit log
    // نسجل الخطأ فقط
    console.error('[AUDIT ERROR] Failed to log audit:', error);
  }
}

/**
 * Helper لتسجيل تسجيل الدخول
 */
export async function logLogin(params: {
  companyId: string;
  userId: string;
  userName: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await logAudit({
    companyId: params.companyId,
    entityType: 'user',
    entityId: params.userId,
    action: 'login',
    actorId: params.userId,
    actorName: params.userName,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Helper لتسجيل تسجيل الخروج
 */
export async function logLogout(params: {
  companyId: string;
  userId: string;
  userName: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await logAudit({
    companyId: params.companyId,
    entityType: 'user',
    entityId: params.userId,
    action: 'logout',
    actorId: params.userId,
    actorName: params.userName,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Helper لتسجيل الحذف
 */
export async function logDelete(params: {
  companyId: string;
  entityType: string;
  entityId: string;
  deletedData: any;
  actorId: string;
  actorName: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await logAudit({
    companyId: params.companyId,
    entityType: params.entityType,
    entityId: params.entityId,
    action: 'delete',
    changes: params.deletedData,
    actorId: params.actorId,
    actorName: params.actorName,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Helper لتسجيل التعديل
 */
export async function logUpdate(params: {
  companyId: string;
  entityType: string;
  entityId: string;
  oldData: any;
  newData: any;
  actorId: string;
  actorName: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  // احسب الفرق بين البيانات القديمة والجديدة
  const changes: any = {};
  for (const key in params.newData) {
    if (params.oldData[key] !== params.newData[key]) {
      changes[key] = {
        old: params.oldData[key],
        new: params.newData[key],
      };
    }
  }

  await logAudit({
    companyId: params.companyId,
    entityType: params.entityType,
    entityId: params.entityId,
    action: 'update',
    changes,
    actorId: params.actorId,
    actorName: params.actorName,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Helper لتسجيل الإنشاء
 */
export async function logCreate(params: {
  companyId: string;
  entityType: string;
  entityId: string;
  createdData: any;
  actorId: string;
  actorName: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await logAudit({
    companyId: params.companyId,
    entityType: params.entityType,
    entityId: params.entityId,
    action: 'create',
    changes: params.createdData,
    actorId: params.actorId,
    actorName: params.actorName,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}
