import { Router } from 'express';
import { db } from '../db';
import { landed_cost_vouchers, landed_cost_bills, landed_cost_items, stock_movements, bills } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';
import { allocateLandedCost, postLandedCostVoucher } from '../utils/landedCost';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// List Vouchers
router.get('/', requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    console.log(`Fetching landed cost vouchers for company: ${companyId}`);
    
    const vouchers = await db.query.landed_cost_vouchers.findMany({
      where: eq(landed_cost_vouchers.company_id, companyId),
      orderBy: [desc(landed_cost_vouchers.date)],
      with: {
        bills: {
          with: {
            bill: true
          }
        },
        items: {
          with: {
            stock_movement: {
              with: {
                item: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Found ${vouchers.length} vouchers`);
    res.json(vouchers);
  } catch (error: any) {
    console.error('Error fetching landed cost vouchers:', error);
    res.status(500).json({ error: 'Failed to fetch vouchers', details: error.message });
  }
});

// Create Voucher
router.post('/', async (req, res) => {
  try {
    const { date, description, allocation_method } = req.body;
    
    // Generate voucher number (simple logic for now)
    const count = await db.$count(landed_cost_vouchers, eq(landed_cost_vouchers.company_id, (req as any).session.companyId));
    const voucher_number = `LCV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const [voucher] = await db.insert(landed_cost_vouchers).values({
      company_id: (req as any).session.companyId,
      voucher_number,
      date: new Date(date),
      description,
      allocation_method: allocation_method || 'value',
      created_by: (req as any).session.userId,
      status: 'draft'
    }).returning();

    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create voucher' });
  }
});

// Get Voucher
router.get('/:id', async (req, res) => {
  try {
    const voucher = await db.query.landed_cost_vouchers.findFirst({
      where: eq(landed_cost_vouchers.id, req.params.id),
      with: {
        bills: {
          with: {
            bill: true
          }
        },
        items: {
          with: {
            stock_movement: {
              with: {
                item: true
              }
            }
          }
        }
      }
    });

    if (!voucher) return res.status(404).json({ error: 'Voucher not found' });
    if (voucher.company_id !== (req as any).session.companyId) return res.status(403).json({ error: 'Unauthorized' });

    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch voucher' });
  }
});

// Add Bill to Voucher
router.post('/:id/bills', async (req, res) => {
  try {
    const { bill_id, amount } = req.body;
    const companyId = (req as any).session.companyId;
    
    // Verify bill belongs to company
    const bill = await db.query.bills.findFirst({
      where: eq(bills.id, bill_id)
    });
    
    if (!bill || bill.company_id !== companyId) {
      return res.status(400).json({ error: 'Invalid bill' });
    }

    const [entry] = await db.insert(landed_cost_bills).values({
      voucher_id: req.params.id,
      bill_id,
      amount
    }).returning();

    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add bill' });
  }
});

// Add Items (Stock Movements) to Voucher
router.post('/:id/items', async (req, res) => {
  try {
    const { stock_movement_ids } = req.body; // Array of IDs
    const companyId = (req as any).session.companyId;

    const movements = await db.query.stock_movements.findMany({
      where: (table, { inArray, and, eq }) => and(
        inArray(table.id, stock_movement_ids),
        eq(table.company_id, companyId)
      )
    });

    if (movements.length !== stock_movement_ids.length) {
      return res.status(400).json({ error: 'Some stock movements are invalid' });
    }

    const items = await Promise.all(movements.map(m => 
      db.insert(landed_cost_items).values({
        voucher_id: req.params.id,
        stock_movement_id: m.id,
        original_cost: m.total_cost,
        allocated_cost: '0',
        new_unit_cost: m.unit_cost
      }).returning()
    ));

    res.json(items.flat());
  } catch (error) {
    res.status(500).json({ error: 'Failed to add items' });
  }
});

// Allocate Costs (Preview)
router.post('/:id/allocate', async (req, res) => {
  try {
    await allocateLandedCost(req.params.id);
    
    // Return updated voucher
    const voucher = await db.query.landed_cost_vouchers.findFirst({
      where: eq(landed_cost_vouchers.id, req.params.id),
      with: {
        items: true
      }
    });
    
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to allocate costs' });
  }
});

// Post Voucher
router.post('/:id/post', async (req, res) => {
  try {
    const userId = (req as any).session.userId;
    await postLandedCostVoucher(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to post voucher' });
  }
});

export default router;
