import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Shield, AlertTriangle, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import PageContainer from "@/components/layout/PageContainer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCompanyCurrency } from "@/hooks/use-company-currency";

export default function ApprovalSettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const companyCurrency = useCompanyCurrency();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("expense");
  const [triggerAmount, setTriggerAmount] = useState("1000");
  const [steps, setSteps] = useState([{ step_order: 1, approver_role: "manager" }]);

  const { data: workflows = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/approvals/workflows"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/approvals/workflows", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/approvals/workflows"] });
      toast({
        title: t("common.success"),
        description: t("approvals.workflowCreated", "Workflow created successfully"),
      });
      setIsCreateOpen(false);
      // Reset form
      setName("");
      setEntityType("expense");
      setTriggerAmount("1000");
      setSteps([{ step_order: 1, approver_role: "manager" }]);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/approvals/workflows/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/approvals/workflows"] });
      toast({
        title: t("common.success"),
        description: t("approvals.workflowDeleted", "Workflow deleted successfully"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    }
  });

  const handleCreate = () => {
    if (!name) {
      toast({
        variant: "destructive",
        title: t("common.validationError", "Validation Error"),
        description: t("approvals.pleaseProvideName", "Please provide a workflow name"),
      });
      return;
    }
    createMutation.mutate({
      name,
      entity_type: entityType,
      trigger_amount: parseFloat(triggerAmount),
      steps: steps
    });
  };

  const addStep = () => {
    setSteps([...steps, { step_order: steps.length + 1, approver_role: "admin" }]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, step_order: i + 1 }));
    setSteps(newSteps);
  };

  const updateStepRole = (index: number, role: string) => {
    const newSteps = [...steps];
    newSteps[index].approver_role = role;
    setSteps(newSteps);
  };

  return (
    <PageContainer>
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            {t("approvals.settingsTitle", "Approval Workflows")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("approvals.settingsSubtitle", "Configure rules for automatic approval requests.")}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {t("approvals.createWorkflow", "New Workflow")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("approvals.createWorkflow", "Create Approval Workflow")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("approvals.workflowName", "Workflow Name")}</Label>
                  <Input 
                    placeholder={t("approvals.workflowNamePlaceholder", "e.g. High Value Expenses")} 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("approvals.entityType", "Transaction Type")}</Label>
                  <Select value={entityType} onValueChange={setEntityType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">{t("common.expense", "Expense")}</SelectItem>
                      <SelectItem value="purchase_order">{t("approvals.purchaseOrder", "Purchase Order")}</SelectItem>
                      <SelectItem value="invoice">{t("approvals.salesInvoice", "Sales Invoice")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t("approvals.minAmount", "Trigger Amount")}</Label>
                <Input 
                  type="number" 
                  value={triggerAmount} 
                  onChange={(e) => setTriggerAmount(e.target.value)} 
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  {t("approvals.triggerDescription", "Transactions above this amount will trigger this workflow.")}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>{t("approvals.approvalSteps", "Approval Steps")}</Label>
                  <Button variant="outline" size="sm" onClick={addStep}>
                    <Plus className="h-3 w-3 me-1" /> {t("approvals.addStep", "Add Step")}
                  </Button>
                </div>
                
                <div className="space-y-2 mt-2">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                      <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center rounded-full p-0">
                        {step.step_order}
                      </Badge>
                      <div className="flex-1">
                        <Select value={step.approver_role} onValueChange={(val) => updateStepRole(index, val)}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="accountant">Accountant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {steps.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeStep(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? t("common.saving", "Saving...") : t("common.create", "Create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          {t("common.loading", "Loading...")}
        </div>
      ) : workflows.length === 0 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold">{t("approvals.noWorkflows", "No Workflows Configured")}</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              {t("approvals.noWorkflowsDesc", "Create a workflow to start enforcing approvals for high-value transactions.")}
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setIsCreateOpen(true)}>
              {t("approvals.createFirst", "Create First Workflow")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow: any) => (
            <Card key={workflow.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="uppercase">
                    {workflow.entity_type.replace('_', ' ')}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(workflow.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg mt-2">
                  {workflow.name || "Unnamed Workflow"}
                </CardTitle>
                <CardDescription>
                  {t("approvals.above", "Above")} {new Intl.NumberFormat('en-US', { style: 'currency', currency: companyCurrency }).format(workflow.trigger_amount || workflow.min_amount || 0)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mt-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t("approvals.approvalChain", "Approval Chain")}</Label>
                  <div className="flex flex-col gap-2">
                    {workflow.steps && workflow.steps.length > 0 ? (
                      workflow.steps.map((step: any, idx: number) => (
                        <div key={step.id || idx} className="flex items-center text-sm">
                          <Badge variant="secondary" className="mr-2 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]">
                            {step.step_order}
                          </Badge>
                          <span className="capitalize">{step.approver_role}</span>
                          {idx < workflow.steps.length - 1 && (
                            <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                          )}
                        </div>
                      ))
                    ) : (
                      // Fallback for old workflows
                      <div className="flex items-center text-sm">
                        <Badge variant="secondary" className="mr-2 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]">1</Badge>
                        <span className="capitalize">{workflow.approver_role}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-4 pt-2 border-t">
                  {t("approvals.createdOn", "Created on")} {new Date(workflow.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
