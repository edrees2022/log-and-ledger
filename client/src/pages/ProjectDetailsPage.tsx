import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useCompanyCurrency } from "@/hooks/use-company-currency";
import { apiRequest } from "@/lib/queryClient";
import { 
  Loader2, ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar,
  Plus, Edit, Trash2, Clock, Target, ListTodo, Layers, Timer, User
} from "lucide-react";

export default function ProjectDetailsPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id;
  const companyCurrency = useCompanyCurrency();
  const [activeTab, setActiveTab] = useState("overview");

  // Dialog states
  const [isPhaseDialogOpen, setIsPhaseDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: string; id: string } | null>(null);

  // Form states
  const [phaseForm, setPhaseForm] = useState({ name: "", description: "", budget: "", start_date: "", end_date: "", status: "pending" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", phase_id: "", priority: "medium", status: "todo", due_date: "", estimated_hours: "" });
  const [timeForm, setTimeForm] = useState({ task_id: "", date: new Date().toISOString().split('T')[0], hours: "", description: "", billable: true });

  // Queries
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: !!projectId,
  });

  const { data: financials } = useQuery({
    queryKey: ["project-financials", projectId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/projects/${projectId}/financials`);
      if (!res.ok) throw new Error("Failed to fetch financials");
      return res.json();
    },
    enabled: !!projectId,
  });

  const { data: phases = [] } = useQuery({
    queryKey: ["project-phases", projectId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/projects/${projectId}/phases`);
      if (!res.ok) throw new Error("Failed to fetch phases");
      return res.json();
    },
    enabled: !!projectId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/projects/${projectId}/tasks`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    enabled: !!projectId,
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["project-time", projectId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/projects/${projectId}/time-entries`);
      if (!res.ok) throw new Error("Failed to fetch time entries");
      return res.json();
    },
    enabled: !!projectId,
  });

  const { data: progress } = useQuery({
    queryKey: ["project-progress", projectId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/projects/${projectId}/progress`);
      if (!res.ok) throw new Error("Failed to fetch progress");
      return res.json();
    },
    enabled: !!projectId,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["project-transactions", projectId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/projects/${projectId}/transactions`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
    enabled: !!projectId,
  });

  // Mutations
  const createPhaseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/phases`, data);
      if (!res.ok) throw new Error("Failed to create phase");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-phases", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-progress", projectId] });
      setIsPhaseDialogOpen(false);
      resetPhaseForm();
      toast({ title: t("common.success"), description: t("projects.phaseCreated", "تم إنشاء المرحلة بنجاح") });
    },
  });

  const updatePhaseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/projects/${projectId}/phases/${editingPhase.id}`, data);
      if (!res.ok) throw new Error("Failed to update phase");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-phases", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-progress", projectId] });
      setIsPhaseDialogOpen(false);
      setEditingPhase(null);
      resetPhaseForm();
      toast({ title: t("common.success"), description: t("projects.phaseUpdated", "تم تحديث المرحلة بنجاح") });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/tasks`, data);
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-progress", projectId] });
      setIsTaskDialogOpen(false);
      resetTaskForm();
      toast({ title: t("common.success"), description: t("projects.taskCreated", "تم إنشاء المهمة بنجاح") });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/projects/${projectId}/tasks/${editingTask.id}`, data);
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-progress", projectId] });
      setIsTaskDialogOpen(false);
      setEditingTask(null);
      resetTaskForm();
      toast({ title: t("common.success"), description: t("projects.taskUpdated", "تم تحديث المهمة بنجاح") });
    },
  });

  const createTimeEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/time-entries`, data);
      if (!res.ok) throw new Error("Failed to create time entry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-time", projectId] });
      setIsTimeDialogOpen(false);
      resetTimeForm();
      toast({ title: t("common.success"), description: t("projects.timeEntryCreated", "تم تسجيل الوقت بنجاح") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: string }) => {
      const endpoint = type === "phase" ? "phases" : type === "task" ? "tasks" : "time-entries";
      const res = await apiRequest("DELETE", `/api/projects/${projectId}/${endpoint}/${id}`);
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-phases", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-time", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-progress", projectId] });
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
      toast({ title: t("common.success"), description: t("common.deletedSuccessfully", "تم الحذف بنجاح") });
    },
  });

  // Helpers
  const resetPhaseForm = () => setPhaseForm({ name: "", description: "", budget: "", start_date: "", end_date: "", status: "pending" });
  const resetTaskForm = () => setTaskForm({ title: "", description: "", phase_id: "", priority: "medium", status: "todo", due_date: "", estimated_hours: "" });
  const resetTimeForm = () => setTimeForm({ task_id: "", date: new Date().toISOString().split('T')[0], hours: "", description: "", billable: true });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: companyCurrency }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      todo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-600",
      medium: "bg-blue-100 text-blue-600",
      high: "bg-orange-100 text-orange-600",
      urgent: "bg-red-100 text-red-600",
    };
    return colors[priority] || colors.medium;
  };

  const openEditPhase = (phase: any) => {
    setEditingPhase(phase);
    setPhaseForm({
      name: phase.name,
      description: phase.description || "",
      budget: phase.budget?.toString() || "",
      start_date: phase.start_date ? phase.start_date.split('T')[0] : "",
      end_date: phase.end_date ? phase.end_date.split('T')[0] : "",
      status: phase.status,
    });
    setIsPhaseDialogOpen(true);
  };

  const openEditTask = (task: any) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      phase_id: task.phase_id || "",
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ? task.due_date.split('T')[0] : "",
      estimated_hours: task.estimated_hours?.toString() || "",
    });
    setIsTaskDialogOpen(true);
  };

  const handlePhaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: phaseForm.name,
      description: phaseForm.description || undefined,
      budget: phaseForm.budget ? parseFloat(phaseForm.budget) : undefined,
      start_date: phaseForm.start_date || undefined,
      end_date: phaseForm.end_date || undefined,
      status: phaseForm.status,
    };
    if (editingPhase) {
      updatePhaseMutation.mutate(data);
    } else {
      createPhaseMutation.mutate(data);
    }
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: taskForm.title,
      description: taskForm.description || undefined,
      phase_id: taskForm.phase_id || undefined,
      priority: taskForm.priority,
      status: taskForm.status,
      due_date: taskForm.due_date || undefined,
      estimated_hours: taskForm.estimated_hours ? parseFloat(taskForm.estimated_hours) : undefined,
    };
    if (editingTask) {
      updateTaskMutation.mutate(data);
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const handleTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTimeEntryMutation.mutate({
      task_id: timeForm.task_id || undefined,
      date: timeForm.date,
      hours: parseFloat(timeForm.hours),
      description: timeForm.description || undefined,
      billable: timeForm.billable,
    });
  };

  const totalTimeHours = timeEntries.reduce((sum: number, e: any) => sum + parseFloat(e.hours || 0), 0);

  if (isProjectLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return <div>{t("projects.notFound")}</div>;
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center gap-4">
        <Link href="/projects">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
              {t(`projects.${project.status}`)}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <span className="font-mono bg-muted px-1 rounded">{project.code}</span>
            {project.start_date && (
              <span className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3" />
                {new Date(project.start_date).toLocaleDateString(i18n.language)}
                {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString(i18n.language)}`}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      {progress && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t("projects.overallProgress", "التقدم الكلي")}</span>
                  <span className="font-medium">{progress.overallProgress}%</span>
                </div>
                <Progress value={progress.overallProgress} className="h-3" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{progress.tasks.completed}</div>
                  <div className="text-xs text-muted-foreground">{t("projects.completedTasks", "مكتملة")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{progress.tasks.inProgress}</div>
                  <div className="text-xs text-muted-foreground">{t("projects.inProgressTasks", "قيد التنفيذ")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{progress.tasks.todo}</div>
                  <div className="text-xs text-muted-foreground">{t("projects.todoTasks", "في الانتظار")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{progress.tasks.overdue}</div>
                  <div className="text-xs text-muted-foreground">{t("projects.overdueTasks", "متأخرة")}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">{t("common.overview", "نظرة عامة")}</span>
          </TabsTrigger>
          <TabsTrigger value="phases" className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">{t("projects.phases", "المراحل")}</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-1">
            <ListTodo className="h-4 w-4" />
            <span className="hidden sm:inline">{t("projects.tasks", "المهام")}</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-1">
            <Timer className="h-4 w-4" />
            <span className="hidden sm:inline">{t("projects.timeTracking", "الوقت")}</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("projects.revenue")}</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(financials?.revenue || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("projects.expenses")}</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(financials?.expenses || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("projects.profit")}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(financials?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financials?.profit || 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("projects.totalHours", "إجمالي الساعات")}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTimeHours.toFixed(1)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("projects.transactions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.date")}</TableHead>
                      <TableHead>{t("common.description")}</TableHead>
                      <TableHead>{t("common.account")}</TableHead>
                      <TableHead className="text-end">{t("reports.financial.debit")}</TableHead>
                      <TableHead className="text-end">{t("reports.financial.credit")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {t("projects.noTransactions")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx: any) => (
                        <TableRow key={tx.id}>
                          <TableCell>{tx.journal?.date ? new Date(tx.journal.date).toLocaleDateString(i18n.language) : '-'}</TableCell>
                          <TableCell>{tx.description || tx.journal?.description}</TableCell>
                          <TableCell>{tx.account?.name}</TableCell>
                          <TableCell className="text-end">{Number(tx.base_debit) > 0 ? formatCurrency(Number(tx.base_debit)) : '-'}</TableCell>
                          <TableCell className="text-end">{Number(tx.base_credit) > 0 ? formatCurrency(Number(tx.base_credit)) : '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phases Tab */}
        <TabsContent value="phases" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t("projects.phases", "مراحل المشروع")}</h3>
            <Button onClick={() => { resetPhaseForm(); setEditingPhase(null); setIsPhaseDialogOpen(true); }}>
              <Plus className="me-2 h-4 w-4" />
              {t("projects.addPhase", "إضافة مرحلة")}
            </Button>
          </div>

          {phases.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("projects.noPhases", "لا توجد مراحل بعد")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {phases.map((phase: any, index: number) => (
                <Card key={phase.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{phase.name}</h4>
                            <Badge className={getStatusColor(phase.status)}>
                              {String(t(`projects.phaseStatus.${phase.status}`, phase.status))}
                            </Badge>
                          </div>
                          {phase.description && <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>}
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                            {phase.budget && <span>{t("projects.budget")}: {formatCurrency(parseFloat(phase.budget))}</span>}
                            {phase.start_date && <span>{t("projects.startDate")}: {new Date(phase.start_date).toLocaleDateString(i18n.language)}</span>}
                          </div>
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{t("projects.progress", "التقدم")}</span>
                              <span>{phase.progress_percent}%</span>
                            </div>
                            <Progress value={phase.progress_percent} className="h-2" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditPhase(phase)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setDeletingItem({ type: "phase", id: phase.id }); setIsDeleteDialogOpen(true); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t("projects.tasks", "المهام")}</h3>
            <Button onClick={() => { resetTaskForm(); setEditingTask(null); setIsTaskDialogOpen(true); }}>
              <Plus className="me-2 h-4 w-4" />
              {t("projects.addTask", "إضافة مهمة")}
            </Button>
          </div>

          {tasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("projects.noTasks", "لا توجد مهام بعد")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {tasks.map((task: any) => (
                <Card key={task.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {String(t(`projects.priority.${task.priority}`, task.priority))}
                            </Badge>
                            <Badge className={getStatusColor(task.status)}>
                              {String(t(`projects.taskStatus.${task.status}`, task.status))}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                            {task.phase && <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {task.phase.name}</span>}
                            {task.assignee && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {task.assignee.full_name}</span>}
                            {task.due_date && (
                              <span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-500' : ''}`}>
                                <Calendar className="h-3 w-3" />
                                {new Date(task.due_date).toLocaleDateString(i18n.language)}
                              </span>
                            )}
                            {task.estimated_hours && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.estimated_hours}h</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditTask(task)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setDeletingItem({ type: "task", id: task.id }); setIsDeleteDialogOpen(true); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Time Tracking Tab */}
        <TabsContent value="time" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{t("projects.timeTracking", "تتبع الوقت")}</h3>
              <p className="text-sm text-muted-foreground">{t("projects.totalHoursLogged", "إجمالي الساعات")}: {totalTimeHours.toFixed(1)} {t("common.hours", "ساعة")}</p>
            </div>
            <Button onClick={() => { resetTimeForm(); setIsTimeDialogOpen(true); }}>
              <Plus className="me-2 h-4 w-4" />
              {t("projects.logTime", "تسجيل وقت")}
            </Button>
          </div>

          {timeEntries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("projects.noTimeEntries", "لا توجد سجلات وقت بعد")}</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.date")}</TableHead>
                      <TableHead>{t("projects.task", "المهمة")}</TableHead>
                      <TableHead>{t("common.description")}</TableHead>
                      <TableHead className="text-end">{t("common.hours", "ساعات")}</TableHead>
                      <TableHead>{t("projects.billable", "قابل للفوترة")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.date).toLocaleDateString(i18n.language)}</TableCell>
                        <TableCell>{entry.task?.title || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{entry.description || '-'}</TableCell>
                        <TableCell className="text-end font-medium">{parseFloat(entry.hours).toFixed(1)}</TableCell>
                        <TableCell>
                          {entry.billable ? (
                            <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-950">{t("common.yes", "نعم")}</Badge>
                          ) : (
                            <Badge variant="outline">{t("common.no", "لا")}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setDeletingItem({ type: "time", id: entry.id }); setIsDeleteDialogOpen(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Phase Dialog */}
      <Dialog open={isPhaseDialogOpen} onOpenChange={setIsPhaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPhase ? t("projects.editPhase", "تعديل المرحلة") : t("projects.addPhase", "إضافة مرحلة")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePhaseSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("common.name")}</Label>
              <Input value={phaseForm.name} onChange={e => setPhaseForm({...phaseForm, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>{t("common.description")}</Label>
              <Textarea value={phaseForm.description} onChange={e => setPhaseForm({...phaseForm, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("projects.budget")}</Label>
                <Input type="number" step="0.01" value={phaseForm.budget} onChange={e => setPhaseForm({...phaseForm, budget: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t("projects.status")}</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={phaseForm.status} onChange={e => setPhaseForm({...phaseForm, status: e.target.value})}>
                  <option value="pending">{t("projects.phaseStatus.pending", "في الانتظار")}</option>
                  <option value="in_progress">{t("projects.phaseStatus.in_progress", "قيد التنفيذ")}</option>
                  <option value="completed">{t("projects.phaseStatus.completed", "مكتملة")}</option>
                  <option value="cancelled">{t("projects.phaseStatus.cancelled", "ملغية")}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("projects.startDate")}</Label>
                <Input type="date" value={phaseForm.start_date} onChange={e => setPhaseForm({...phaseForm, start_date: e.target.value})} className="[color-scheme:dark] dark:[color-scheme:dark]" />
              </div>
              <div className="space-y-2">
                <Label>{t("projects.endDate")}</Label>
                <Input type="date" value={phaseForm.end_date} onChange={e => setPhaseForm({...phaseForm, end_date: e.target.value})} className="[color-scheme:dark] dark:[color-scheme:dark]" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPhaseDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={createPhaseMutation.isPending || updatePhaseMutation.isPending}>
                {(createPhaseMutation.isPending || updatePhaseMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
                {editingPhase ? t("common.save") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? t("projects.editTask", "تعديل المهمة") : t("projects.addTask", "إضافة مهمة")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("projects.taskTitle", "عنوان المهمة")}</Label>
              <Input value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>{t("common.description")}</Label>
              <Textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("projects.phase", "المرحلة")}</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={taskForm.phase_id} onChange={e => setTaskForm({...taskForm, phase_id: e.target.value})}>
                  <option value="">{t("common.none", "بدون")}</option>
                  {phases.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t("projects.priority.label", "الأولوية")}</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                  <option value="low">{t("projects.priority.low", "منخفضة")}</option>
                  <option value="medium">{t("projects.priority.medium", "متوسطة")}</option>
                  <option value="high">{t("projects.priority.high", "عالية")}</option>
                  <option value="urgent">{t("projects.priority.urgent", "عاجلة")}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("projects.status")}</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                  <option value="todo">{t("projects.taskStatus.todo", "للتنفيذ")}</option>
                  <option value="in_progress">{t("projects.taskStatus.in_progress", "قيد التنفيذ")}</option>
                  <option value="review">{t("projects.taskStatus.review", "قيد المراجعة")}</option>
                  <option value="completed">{t("projects.taskStatus.completed", "مكتملة")}</option>
                  <option value="cancelled">{t("projects.taskStatus.cancelled", "ملغية")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t("projects.dueDate", "تاريخ الاستحقاق")}</Label>
                <Input type="date" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} className="[color-scheme:dark] dark:[color-scheme:dark]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("projects.estimatedHours", "الساعات المقدرة")}</Label>
              <Input type="number" step="0.5" value={taskForm.estimated_hours} onChange={e => setTaskForm({...taskForm, estimated_hours: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={createTaskMutation.isPending || updateTaskMutation.isPending}>
                {(createTaskMutation.isPending || updateTaskMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
                {editingTask ? t("common.save") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Time Entry Dialog */}
      <Dialog open={isTimeDialogOpen} onOpenChange={setIsTimeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("projects.logTime", "تسجيل وقت")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTimeSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.date")}</Label>
                <Input type="date" value={timeForm.date} onChange={e => setTimeForm({...timeForm, date: e.target.value})} required className="[color-scheme:dark] dark:[color-scheme:dark]" />
              </div>
              <div className="space-y-2">
                <Label>{t("common.hours", "ساعات")}</Label>
                <Input type="number" step="0.25" min="0.25" value={timeForm.hours} onChange={e => setTimeForm({...timeForm, hours: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("projects.task", "المهمة")}</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={timeForm.task_id} onChange={e => setTimeForm({...timeForm, task_id: e.target.value})}>
                <option value="">{t("common.none", "بدون")}</option>
                {tasks.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t("common.description")}</Label>
              <Textarea value={timeForm.description} onChange={e => setTimeForm({...timeForm, description: e.target.value})} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="billable" checked={timeForm.billable} onChange={e => setTimeForm({...timeForm, billable: e.target.checked})} className="h-4 w-4" />
              <Label htmlFor="billable">{t("projects.billable", "قابل للفوترة")}</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTimeDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={createTimeEntryMutation.isPending}>
                {createTimeEntryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDelete", "تأكيد الحذف")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.deleteWarning", "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingItem && deleteMutation.mutate(deletingItem)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
