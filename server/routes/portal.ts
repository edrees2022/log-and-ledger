import { Router } from 'express';
import { db } from '../db';
import { contact_portal_users, contacts, companies, sales_invoices, bills } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const router = Router();

// Middleware to check portal auth
const requirePortalAuth = (req: any, res: any, next: any) => {
  if (!req.session.portalUserId && !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await db.query.contact_portal_users.findFirst({
      where: eq(contact_portal_users.email, email),
      with: {
        contact: true
      }
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session
    (req.session as any).portalUserId = user.id;
    (req.session as any).portalContactId = user.contact_id;
    (req.session as any).portalCompanyId = user.contact.company_id;
    
    // Update last login
    await db.update(contact_portal_users)
      .set({ last_login_at: new Date() })
      .where(eq(contact_portal_users.id, user.id));

    res.json({
      id: user.id,
      email: user.email,
      contact_name: user.contact.name,
      type: user.contact.type
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  (req.session as any).portalUserId = undefined;
  (req.session as any).portalContactId = undefined;
  (req.session as any).portalCompanyId = undefined;
  res.json({ success: true });
});

// Get Current User
router.get('/me', requirePortalAuth, async (req, res) => {
  try {
    // Admin Access
    if ((req.session as any).userId && !(req.session as any).portalUserId) {
       return res.json({
        id: (req.session as any).userId,
        email: (req.session as any).userEmail || 'admin@logledger.com',
        contact_name: (req.session as any).userName || 'System Admin',
        type: 'admin',
        company_name: 'System Admin View'
      });
    }

    const user = await db.query.contact_portal_users.findFirst({
      where: eq(contact_portal_users.id, (req.session as any).portalUserId),
      with: {
        contact: true
      }
    });
    
    if (!user) return res.status(401).json({ error: 'User not found' });

    res.json({
      id: user.id,
      email: user.email,
      contact_name: user.contact.name,
      type: user.contact.type
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Dashboard Stats
router.get('/dashboard', requirePortalAuth, async (req, res) => {
  // Admin Access
  if ((req.session as any).userId && !(req.session as any).portalUserId) {
     return res.json({
       outstanding_invoices: 0,
       outstanding_amount: 0,
       recent_transactions: []
     });
  }

  const contactId = (req.session as any).portalContactId;
  const companyId = (req.session as any).portalCompanyId;

  // Get Contact Type
  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.id, contactId)
  });

  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  let stats = {
    outstanding_invoices: 0,
    outstanding_amount: 0,
    recent_transactions: [] as any[]
  };

  if (contact.type === 'customer' || contact.type === 'both') {
    const invoices = await db.query.sales_invoices.findMany({
      where: eq(sales_invoices.customer_id, contactId),
      orderBy: [desc(sales_invoices.date)],
      limit: 5
    });

    stats.outstanding_invoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled' && i.status !== 'draft').length;
    stats.outstanding_amount = invoices
      .filter(i => i.status !== 'paid' && i.status !== 'cancelled' && i.status !== 'draft')
      .reduce((sum, i) => sum + Number(i.total), 0);
    stats.recent_transactions = invoices;
  } else if (contact.type === 'supplier' || contact.type === 'both') {
    const supplierBills = await db.query.bills.findMany({
      where: eq(bills.supplier_id, contactId),
      orderBy: [desc(bills.date)],
      limit: 5
    });

    stats.outstanding_invoices = supplierBills.filter(b => b.status !== 'paid' && b.status !== 'draft').length;
    stats.outstanding_amount = supplierBills
      .filter(b => b.status !== 'paid' && b.status !== 'draft')
      .reduce((sum, b) => sum + Number(b.total), 0);
    stats.recent_transactions = supplierBills;
  }

  res.json(stats);
});

// Get Documents
router.get('/documents', requirePortalAuth, async (req, res) => {
  // Admin Access
  if ((req.session as any).userId && !(req.session as any).portalUserId) {
    return res.json([]);
  }

  const contactId = (req.session as any).portalContactId;
  
  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.id, contactId)
  });

  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  let documents: any[] = [];

  if (contact.type === 'customer' || contact.type === 'both') {
    const invoices = await db.query.sales_invoices.findMany({
      where: eq(sales_invoices.customer_id, contactId),
      orderBy: [desc(sales_invoices.date)]
    });
    documents = invoices.map(i => ({ ...i, document_type: 'invoice', number: i.invoice_number }));
  } 
  
  if (contact.type === 'supplier' || contact.type === 'both') {
    const supplierBills = await db.query.bills.findMany({
      where: eq(bills.supplier_id, contactId),
      orderBy: [desc(bills.date)]
    });
    const billDocs = supplierBills.map(b => ({ ...b, document_type: 'bill', number: b.bill_number }));
    documents = [...documents, ...billDocs];
  }

  // Sort combined documents by date
  documents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json(documents);
});

export default router;
