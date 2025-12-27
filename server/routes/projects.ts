import { Router } from "express";
import { db } from "../db";
import { projects, project_phases, project_tasks, project_time_entries, users } from "@shared/schema";
import { eq, and, asc, desc, sum } from "drizzle-orm";
import { getProjectFinancials, getProjectTransactions } from "../utils/projects";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware";
import { logCreate, logUpdate, logDelete } from "../utils/auditLog";

const router = Router();

// Get all projects
router.get("/", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const allProjects = await db.select().from(projects).where(eq(projects.company_id, companyId));
    res.json(allProjects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get single project
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.id),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Create project
router.post("/", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const schema = z.object({
      code: z.string(),
      name: z.string(),
      description: z.string().optional(),
      budget: z.number().optional(),
      start_date: z.string().optional(), // ISO date string
      end_date: z.string().optional(), // ISO date string
      status: z.enum(["active", "completed", "on_hold", "cancelled"]).optional(),
    });

    const data = schema.parse(req.body);

    // Validate dates: start_date must be before end_date
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      if (startDate > endDate) {
        return res.status(400).json({ error: "تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء" });
      }
    }

    const [newProject] = await db.insert(projects).values({
      ...data,
      company_id: companyId,
      budget: data.budget ? data.budget.toString() : undefined,
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      end_date: data.end_date ? new Date(data.end_date) : undefined,
    }).returning();

    // Audit log
    const userId = (req as any).session.userId;
    await logCreate({
      companyId,
      entityType: 'project',
      entityId: newProject.id,
      createdData: { code: newProject.code, name: newProject.name },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json(newProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create project" });
    }
  }
});

// Update project
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const schema = z.object({
      code: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      budget: z.number().optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      status: z.enum(["active", "completed", "on_hold", "cancelled"]).optional(),
      is_active: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    // Validate dates: start_date must be before end_date
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      if (startDate > endDate) {
        return res.status(400).json({ error: "تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء" });
      }
    }

    const [updatedProject] = await db
      .update(projects)
      .set({
        ...data,
        budget: data.budget ? data.budget.toString() : undefined,
        start_date: data.start_date ? new Date(data.start_date) : undefined,
        end_date: data.end_date ? new Date(data.end_date) : undefined,
        updated_at: new Date(),
      })
      .where(and(
        eq(projects.id, req.params.id),
        eq(projects.company_id, companyId)
      ))
      .returning();

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Audit log
    const userId = (req as any).session.userId;
    await logUpdate({
      companyId,
      entityType: 'project',
      entityId: updatedProject.id,
      oldData: {},
      newData: data,
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;

    // Check if project exists
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.id),
        eq(projects.company_id, companyId)
      ),
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Delete the project
    await db.delete(projects).where(
      and(
        eq(projects.id, req.params.id),
        eq(projects.company_id, companyId)
      )
    );

    // Audit log
    const userId = (req as any).session.userId;
    await logDelete({
      companyId,
      entityType: 'project',
      entityId: req.params.id,
      deletedData: { code: project.code, name: project.name },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Get project financials
router.get("/:id/financials", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.id),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const financials = await getProjectFinancials(req.params.id);
    res.json(financials);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project financials" });
  }
});

// Get project transactions
router.get("/:id/transactions", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.id),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const transactions = await getProjectTransactions(req.params.id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project transactions" });
  }
});

// ============== PROJECT PHASES ==============

// Get all phases for a project
router.get("/:projectId/phases", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const phases = await db.select().from(project_phases)
      .where(eq(project_phases.project_id, req.params.projectId))
      .orderBy(asc(project_phases.order_index));

    res.json(phases);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch phases" });
  }
});

// Create phase
router.post("/:projectId/phases", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const schema = z.object({
      name: z.string(),
      description: z.string().optional(),
      order_index: z.number().optional(),
      budget: z.number().optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
    });

    const data = schema.parse(req.body);

    const [newPhase] = await db.insert(project_phases).values({
      project_id: req.params.projectId,
      ...data,
      budget: data.budget?.toString(),
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      end_date: data.end_date ? new Date(data.end_date) : undefined,
    }).returning();

    res.json(newPhase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create phase" });
    }
  }
});

// Update phase
router.put("/:projectId/phases/:phaseId", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const schema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      order_index: z.number().optional(),
      budget: z.number().optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
      progress_percent: z.number().min(0).max(100).optional(),
    });

    const data = schema.parse(req.body);

    const [updatedPhase] = await db.update(project_phases)
      .set({
        ...data,
        budget: data.budget?.toString(),
        start_date: data.start_date ? new Date(data.start_date) : undefined,
        end_date: data.end_date ? new Date(data.end_date) : undefined,
        updated_at: new Date(),
      })
      .where(eq(project_phases.id, req.params.phaseId))
      .returning();

    if (!updatedPhase) {
      return res.status(404).json({ error: "Phase not found" });
    }

    res.json(updatedPhase);
  } catch (error) {
    res.status(500).json({ error: "Failed to update phase" });
  }
});

// Delete phase
router.delete("/:projectId/phases/:phaseId", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await db.delete(project_phases).where(eq(project_phases.id, req.params.phaseId));
    res.json({ message: "Phase deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete phase" });
  }
});

// ============== PROJECT TASKS ==============

// Get all tasks for a project
router.get("/:projectId/tasks", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const tasks = await db.query.project_tasks.findMany({
      where: eq(project_tasks.project_id, req.params.projectId),
      with: {
        phase: true,
        assignee: {
          columns: { id: true, full_name: true, email: true }
        }
      },
      orderBy: [asc(project_tasks.order_index)]
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Create task
router.post("/:projectId/tasks", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const schema = z.object({
      title: z.string(),
      description: z.string().optional(),
      phase_id: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      status: z.enum(["todo", "in_progress", "review", "completed", "cancelled"]).optional(),
      assigned_to: z.string().optional(),
      due_date: z.string().optional(),
      estimated_hours: z.number().optional(),
      order_index: z.number().optional(),
    });

    const data = schema.parse(req.body);

    const [newTask] = await db.insert(project_tasks).values({
      project_id: req.params.projectId,
      ...data,
      estimated_hours: data.estimated_hours?.toString(),
      due_date: data.due_date ? new Date(data.due_date) : undefined,
      created_by: userId,
    }).returning();

    res.json(newTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create task" });
    }
  }
});

// Update task
router.put("/:projectId/tasks/:taskId", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const schema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      phase_id: z.string().nullable().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      status: z.enum(["todo", "in_progress", "review", "completed", "cancelled"]).optional(),
      assigned_to: z.string().nullable().optional(),
      due_date: z.string().nullable().optional(),
      estimated_hours: z.number().optional(),
      actual_hours: z.number().optional(),
      order_index: z.number().optional(),
    });

    const data = schema.parse(req.body);

    // If status changes to completed, set completed_at
    const updateData: any = {
      ...data,
      estimated_hours: data.estimated_hours?.toString(),
      actual_hours: data.actual_hours?.toString(),
      due_date: data.due_date ? new Date(data.due_date) : null,
      updated_at: new Date(),
    };

    if (data.status === "completed") {
      updateData.completed_at = new Date();
    }

    const [updatedTask] = await db.update(project_tasks)
      .set(updateData)
      .where(eq(project_tasks.id, req.params.taskId))
      .returning();

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete task
router.delete("/:projectId/tasks/:taskId", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await db.delete(project_tasks).where(eq(project_tasks.id, req.params.taskId));
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// ============== TIME ENTRIES ==============

// Get time entries for a project
router.get("/:projectId/time-entries", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const entries = await db.query.project_time_entries.findMany({
      where: eq(project_time_entries.project_id, req.params.projectId),
      with: {
        task: true,
        user: {
          columns: { id: true, full_name: true, email: true }
        }
      },
      orderBy: [desc(project_time_entries.date)]
    });

    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch time entries" });
  }
});

// Get time summary for a project
router.get("/:projectId/time-summary", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const entries = await db.select({
      totalHours: sum(project_time_entries.hours),
      billableHours: sum(project_time_entries.hours),
    }).from(project_time_entries)
      .where(eq(project_time_entries.project_id, req.params.projectId));

    const billableEntries = await db.select({
      billableHours: sum(project_time_entries.hours),
    }).from(project_time_entries)
      .where(and(
        eq(project_time_entries.project_id, req.params.projectId),
        eq(project_time_entries.billable, true)
      ));

    res.json({
      totalHours: parseFloat(entries[0]?.totalHours || "0"),
      billableHours: parseFloat(billableEntries[0]?.billableHours || "0"),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch time summary" });
  }
});

// Create time entry
router.post("/:projectId/time-entries", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const schema = z.object({
      task_id: z.string().optional(),
      date: z.string(),
      hours: z.number().positive(),
      description: z.string().optional(),
      billable: z.boolean().optional(),
      hourly_rate: z.number().optional(),
    });

    const data = schema.parse(req.body);

    const [newEntry] = await db.insert(project_time_entries).values({
      project_id: req.params.projectId,
      user_id: userId,
      ...data,
      hours: data.hours.toString(),
      hourly_rate: data.hourly_rate?.toString(),
      date: new Date(data.date),
    }).returning();

    res.json(newEntry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create time entry" });
    }
  }
});

// Update time entry
router.put("/:projectId/time-entries/:entryId", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const schema = z.object({
      task_id: z.string().nullable().optional(),
      date: z.string().optional(),
      hours: z.number().positive().optional(),
      description: z.string().optional(),
      billable: z.boolean().optional(),
      hourly_rate: z.number().optional(),
    });

    const data = schema.parse(req.body);

    const [updatedEntry] = await db.update(project_time_entries)
      .set({
        ...data,
        hours: data.hours?.toString(),
        hourly_rate: data.hourly_rate?.toString(),
        date: data.date ? new Date(data.date) : undefined,
        updated_at: new Date(),
      })
      .where(eq(project_time_entries.id, req.params.entryId))
      .returning();

    if (!updatedEntry) {
      return res.status(404).json({ error: "Time entry not found" });
    }

    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: "Failed to update time entry" });
  }
});

// Delete time entry
router.delete("/:projectId/time-entries/:entryId", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await db.delete(project_time_entries).where(eq(project_time_entries.id, req.params.entryId));
    res.json({ message: "Time entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete time entry" });
  }
});

// Get project progress summary
router.get("/:projectId/progress", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, req.params.projectId),
        eq(projects.company_id, companyId)
      ),
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Get tasks statistics
    const tasks = await db.select().from(project_tasks)
      .where(eq(project_tasks.project_id, req.params.projectId));

    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === "completed").length,
      inProgress: tasks.filter(t => t.status === "in_progress").length,
      todo: tasks.filter(t => t.status === "todo").length,
      overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed").length,
    };

    // Get phases statistics
    const phases = await db.select().from(project_phases)
      .where(eq(project_phases.project_id, req.params.projectId));

    const phaseStats = {
      total: phases.length,
      completed: phases.filter(p => p.status === "completed").length,
      inProgress: phases.filter(p => p.status === "in_progress").length,
      avgProgress: phases.length > 0 
        ? phases.reduce((sum, p) => sum + p.progress_percent, 0) / phases.length 
        : 0,
    };

    // Calculate overall progress
    const overallProgress = taskStats.total > 0 
      ? Math.round((taskStats.completed / taskStats.total) * 100) 
      : 0;

    res.json({
      tasks: taskStats,
      phases: phaseStats,
      overallProgress,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project progress" });
  }
});

export default router;
