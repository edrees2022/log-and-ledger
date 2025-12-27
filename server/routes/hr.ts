import { Router } from "express";
import { db } from "../db";
import { 
  employees, departments, payroll_runs, payslips,
  insertEmployeeSchema, insertDepartmentSchema, insertPayrollRunSchema, insertPayslipSchema
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/authMiddleware";
import { z } from "zod";
import { badRequest, notFound, serverError } from "../utils/sendError";
import { logCreate, logUpdate } from "../utils/auditLog";

const router = Router();

// === EMPLOYEES ===
router.get("/employees", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const results = await db.select().from(employees).where(eq(employees.company_id, companyId));
    res.json(results);
  } catch (error: any) {
    return serverError(res, "Failed to fetch employees");
  }
});

router.post("/employees", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const data = insertEmployeeSchema.parse(req.body);
    const [newEmployee] = await db.insert(employees).values({ ...data, company_id: companyId }).returning();
    res.status(201).json(newEmployee);
  } catch (error: any) {
    return serverError(res, "Failed to create employee");
  }
});

// === DEPARTMENTS ===
router.get("/departments", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const results = await db.select().from(departments).where(eq(departments.company_id, companyId));
    res.json(results);
  } catch (error: any) {
    return serverError(res, "Failed to fetch departments");
  }
});

router.post("/departments", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const data = insertDepartmentSchema.parse(req.body);
    const [newDept] = await db.insert(departments).values({ ...data, company_id: companyId }).returning();
    res.status(201).json(newDept);
  } catch (error: any) {
    return serverError(res, "Failed to create department");
  }
});

// === PAYROLL ===
router.post("/payroll/run", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const data = insertPayrollRunSchema.parse(req.body);
    
    // 1. Create Payroll Run
    const [run] = await db.insert(payroll_runs).values({ ...data, company_id: companyId }).returning();
    
    // 2. Auto-generate payslips for all active employees (simplified logic)
    const activeEmployees = await db.select().from(employees)
      .where(and(eq(employees.company_id, companyId), eq(employees.status, 'active')));
      
    const payslipPromises = activeEmployees.map(emp => {
      return db.insert(payslips).values({
        payroll_run_id: run.id,
        employee_id: emp.id,
        basic_salary: emp.salary || "0",
        net_salary: emp.salary || "0",
        allowances: "0",
        deductions: "0",
      });
    });
    
    await Promise.all(payslipPromises);
    
    res.status(201).json({ run, generated_payslips: activeEmployees.length });
  } catch (error: any) {
    console.error("Payroll error:", error);
    return serverError(res, "Failed to run payroll");
  }
});

// List Payroll Runs
router.get("/payroll-runs", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const results = await db.select()
      .from(payroll_runs)
      .where(eq(payroll_runs.company_id, companyId))
      .orderBy(desc(payroll_runs.created_at));
    res.json(results);
  } catch (error: any) {
    return serverError(res, "Failed to fetch payroll runs");
  }
});

// Get Payslips for a Run
router.get("/payroll-runs/:id/payslips", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // Join with employees to get names
    const results = await db.select({
      id: payslips.id,
      employee_name: employees.first_name,
      employee_last_name: employees.last_name,
      basic_salary: payslips.basic_salary,
      allowances: payslips.allowances,
      deductions: payslips.deductions,
      net_salary: payslips.net_salary,
    })
    .from(payslips)
    .innerJoin(employees, eq(payslips.employee_id, employees.id))
    .where(eq(payslips.payroll_run_id, id));
    
    res.json(results);
  } catch (error: any) {
    return serverError(res, "Failed to fetch payslips");
  }
});

export default router;
