import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, FolderKanban, TrendingUp, TrendingDown, DollarSign, Eye, Edit, Trash2, BarChart3, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useCompanyCurrency } from "@/hooks/use-company-currency";
import { DatePicker } from "@/components/ui/date-picker";

import { useAuth } from "@/contexts/AuthContext";

type ProjectFormData = {
  code: string;
  name: string;
  description: string;
  budget: string;
  start_date: string;
  end_date: string;
  status: string;
};

const emptyProject: ProjectFormData = {
  code: "",
  name: "",
  description: "",
  budget: "",
  start_date: "",
  end_date: "",
  status: "active"
};

export default function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const companyCurrency = useCompanyCurrency();
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedProjectFinancials, setSelectedProjectFinancials] = useState<any>(null);
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>(emptyProject);
  const [dateError, setDateError] = useState<string>("");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/projects");
      const json = await res.json();
      return Array.isArray(json) ? json : (json.data || []);
    },
  });

  // Validate dates
  const validateDates = (startDate: string, endDate: string): boolean => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        setDateError(t("projects.dateError", "تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء"));
        return false;
      }
    }
    setDateError("");
    return true;
  };

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    validateDates(newData.start_date, newData.end_date);
  };

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/projects", data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create project");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsCreateOpen(false);
      setFormData(emptyProject);
      setDateError("");
      toast({
        title: t("common.success"),
        description: t("projects.createdSuccess"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/projects/${selectedProject.id}`, data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update project");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsEditOpen(false);
      setSelectedProject(null);
      setFormData(emptyProject);
      setDateError("");
      toast({
        title: t("common.success"),
        description: t("projects.updatedSuccess", "تم تحديث المشروع بنجاح"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/projects/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete project");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsDeleteOpen(false);
      setSelectedProject(null);
      toast({
        title: t("common.success"),
        description: t("projects.deletedSuccess", "تم حذف المشروع بنجاح"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates(formData.start_date, formData.end_date)) {
      return;
    }
    createProjectMutation.mutate({
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates(formData.start_date, formData.end_date)) {
      return;
    }
    updateProjectMutation.mutate({
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
    });
  };

  const openViewDialog = async (project: any) => {
    setSelectedProject(project);
    setSelectedProjectFinancials(null);
    setLoadingFinancials(true);
    setIsViewOpen(true);
    
    // Fetch financials for this project
    try {
      const res = await apiRequest("GET", `/api/projects/${project.id}/financials`);
      if (res.ok) {
        const financials = await res.json();
        setSelectedProjectFinancials(financials);
      }
    } catch (error) {
      console.error("Failed to fetch project financials:", error);
    } finally {
      setLoadingFinancials(false);
    }
  };

  const openEditDialog = (project: any) => {
    setSelectedProject(project);
    setFormData({
      code: project.code || "",
      name: project.name || "",
      description: project.description || "",
      budget: project.budget?.toString() || "",
      start_date: project.start_date ? project.start_date.split('T')[0] : "",
      end_date: project.end_date ? project.end_date.split('T')[0] : "",
      status: project.status || "active"
    });
    setDateError("");
    setIsEditOpen(true);
  };

  const openDeleteDialog = (project: any) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  const openCreateDialog = () => {
    setFormData(emptyProject);
    setDateError("");
    setIsCreateOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'on_hold': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  // Calculate project statistics
  const projectStats = {
    total: projects?.length || 0,
    active: projects?.filter((p: any) => p.status === 'active').length || 0,
    completed: projects?.filter((p: any) => p.status === 'completed').length || 0,
    totalBudget: projects?.reduce((sum: number, p: any) => sum + (parseFloat(p.budget) || 0), 0) || 0,
  };

  // Render form fields - NOT a component, just JSX to avoid re-mounting
  const renderFormFields = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">{t("projects.code")}</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">{t("projects.status")}</Label>
          <select
            id="status"
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="active">{t("projects.active")}</option>
            <option value="completed">{t("projects.completed")}</option>
            <option value="on_hold">{t("projects.on_hold")}</option>
            <option value="cancelled">{t("projects.cancelled")}</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">{t("projects.name")}</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{t("common.description")}</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="budget">{t("projects.budget")}</Label>
        <div className="relative">
          <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {companyCurrency}
          </span>
          <Input
            id="budget"
            inputMode="decimal"
            value={formData.budget}
            onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
            className="ps-12"
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("projects.startDate")}</Label>
          <DatePicker
            value={formData.start_date}
            onChange={(date) => handleDateChange('start_date', date ? date.toISOString().split('T')[0] : '')}
            maxDate={formData.end_date ? new Date(formData.end_date) : undefined}
            placeholder={t("projects.startDate")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("projects.endDate")}</Label>
          <DatePicker
            value={formData.end_date}
            onChange={(date) => handleDateChange('end_date', date ? date.toISOString().split('T')[0] : '')}
            minDate={formData.start_date ? new Date(formData.start_date) : undefined}
            placeholder={t("projects.endDate")}
          />
        </div>
      </div>
      {dateError && (
        <p className="text-sm text-destructive">{dateError}</p>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("projects.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("projects.description")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation("/projects/profitability")}>
            <BarChart3 className="me-2 h-4 w-4" />
            {t("projects.profitabilityReport", "تقرير الربحية")}
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="me-2 h-4 w-4" />
            {t("projects.addProject")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              {t("projects.totalProjects", { defaultValue: "إجمالي المشاريع" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {t("projects.activeProjects", { defaultValue: "مشاريع نشطة" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{projectStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              {t("projects.completedProjects", { defaultValue: "مشاريع مكتملة" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{projectStats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              {t("projects.totalBudget", { defaultValue: "إجمالي الميزانيات" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {projectStats.totalBudget.toLocaleString(i18n.language, { style: 'currency', currency: companyCurrency })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("projects.createTitle")}</DialogTitle>
            <DialogDescription>
              {t("projects.createDesc")}
            </DialogDescription>
          </DialogHeader>
          <form id="create-form" onSubmit={handleCreate} className="space-y-4">
            {renderFormFields()}
          </form>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="w-full sm:w-auto">
              {t("common.cancel")}
            </Button>
            <Button type="submit" form="create-form" disabled={createProjectMutation.isPending || !!dateError} className="w-full sm:w-auto">
              {createProjectMutation.isPending ? t("common.creating") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("projects.viewTitle", "تفاصيل المشروع")}</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t("projects.code")}</Label>
                  <p className="font-medium">{selectedProject.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("projects.status")}</Label>
                  <Badge variant={getStatusColor(selectedProject.status)}>
                    {t(`projects.${selectedProject.status}`)}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("projects.name")}</Label>
                <p className="font-medium">{selectedProject.name}</p>
              </div>
              {selectedProject.description && (
                <div>
                  <Label className="text-muted-foreground">{t("common.description")}</Label>
                  <p>{selectedProject.description}</p>
                </div>
              )}
              
              {/* Financial Summary */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t("projects.financialSummary", "الملخص المالي")}
                </h4>
                {loadingFinancials ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : selectedProjectFinancials ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                        <p className="text-xs text-muted-foreground mb-1">{t("projects.revenue")}</p>
                        <p className="text-lg font-bold text-green-600">
                          {Number(selectedProjectFinancials.revenue || 0).toLocaleString(i18n.language, { style: 'currency', currency: companyCurrency })}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                        <p className="text-xs text-muted-foreground mb-1">{t("projects.expenses")}</p>
                        <p className="text-lg font-bold text-red-600">
                          {Number(selectedProjectFinancials.expenses || 0).toLocaleString(i18n.language, { style: 'currency', currency: companyCurrency })}
                        </p>
                      </div>
                      <div className={`text-center p-3 rounded-lg border ${
                        selectedProjectFinancials.profit >= 0 
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' 
                          : 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
                      }`}>
                        <p className="text-xs text-muted-foreground mb-1">{t("projects.profit")}</p>
                        <p className={`text-lg font-bold ${selectedProjectFinancials.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {Number(selectedProjectFinancials.profit || 0).toLocaleString(i18n.language, { style: 'currency', currency: companyCurrency })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Budget Progress */}
                    {selectedProject.budget && parseFloat(selectedProject.budget) > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("projects.budgetUsage", "استخدام الميزانية")}</span>
                          <span className={`font-medium ${
                            ((selectedProjectFinancials.expenses / parseFloat(selectedProject.budget)) * 100) > 100 
                              ? 'text-red-600' 
                              : 'text-foreground'
                          }`}>
                            {((selectedProjectFinancials.expenses / parseFloat(selectedProject.budget)) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((selectedProjectFinancials.expenses / parseFloat(selectedProject.budget)) * 100, 100)} 
                          className={`h-2 ${
                            ((selectedProjectFinancials.expenses / parseFloat(selectedProject.budget)) * 100) > 100 
                              ? '[&>div]:bg-red-500' 
                              : ((selectedProjectFinancials.expenses / parseFloat(selectedProject.budget)) * 100) > 85
                                ? '[&>div]:bg-orange-500'
                                : ''
                          }`}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{t("projects.spent", "المنفق")}: {Number(selectedProjectFinancials.expenses || 0).toLocaleString(i18n.language, { style: 'currency', currency: companyCurrency })}</span>
                          <span>{t("projects.budget")}: {Number(selectedProject.budget).toLocaleString(i18n.language, { style: 'currency', currency: companyCurrency })}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("projects.noFinancialData", "لا توجد بيانات مالية")}
                  </p>
                )}
              </div>

              {/* Dates and Budget */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t("projects.budget")}</Label>
                  <p className="font-medium">
                    {selectedProject.budget 
                      ? Number(selectedProject.budget).toLocaleString(i18n.language, { style: 'currency', currency: companyCurrency }) 
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("projects.startDate")}</Label>
                  <p className="font-medium">
                    {selectedProject.start_date 
                      ? new Date(selectedProject.start_date).toLocaleDateString(i18n.language) 
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("projects.endDate")}</Label>
                  <p className="font-medium">
                    {selectedProject.end_date 
                      ? new Date(selectedProject.end_date).toLocaleDateString(i18n.language) 
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              {t("common.close", "إغلاق")}
            </Button>
            <Button onClick={() => { setIsViewOpen(false); openEditDialog(selectedProject); }}>
              <Edit className="me-2 h-4 w-4" />
              {t("common.edit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("projects.editTitle", "تعديل المشروع")}</DialogTitle>
          </DialogHeader>
          <form id="edit-form" onSubmit={handleUpdate} className="space-y-4">
            {renderFormFields()}
          </form>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="w-full sm:w-auto">
              {t("common.cancel")}
            </Button>
            <Button type="submit" form="edit-form" disabled={updateProjectMutation.isPending || !!dateError} className="w-full sm:w-auto">
              {updateProjectMutation.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDelete", "تأكيد الحذف")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("projects.deleteConfirm", "هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProjectMutation.mutate(selectedProject?.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>{t("projects.title")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[550px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("projects.code")}</TableHead>
                  <TableHead>{t("projects.name")}</TableHead>
                  <TableHead>{t("projects.status")}</TableHead>
                  <TableHead>{t("projects.budget")}</TableHead>
                  <TableHead>{t("projects.startDate")}</TableHead>
                  <TableHead className="text-end">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">{t("common.loading")}</TableCell>
                  </TableRow>
                ) : projects?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {t("common.noData")}
                    </TableCell>
                  </TableRow>
                ) : (
                  projects?.map((project: any) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.code}</TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(project.status)}>
                          {t(`projects.${project.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>{project.budget ? Number(project.budget).toLocaleString(i18n.language, { style: 'currency', currency: companyCurrency }) : '-'}</TableCell>
                      <TableCell>{project.start_date ? new Date(project.start_date).toLocaleDateString(i18n.language) : '-'}</TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openViewDialog(project)} title={t("common.view")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(project)} title={t("common.edit")}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(project)} title={t("common.delete")} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
