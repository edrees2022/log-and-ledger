import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Eye, Calendar, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogFooter,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PageContainer from "@/components/layout/PageContainer";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { PayrollRun } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyCurrency } from "@/hooks/use-company-currency";

export default function PayrollPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const companyCurrency = useCompanyCurrency();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    payment_date: new Date().toISOString().split('T')[0],
  });

  const { data: runs = [], isLoading } = useQuery<PayrollRun[]>({
    queryKey: ["/api/hr/payroll-runs"],
  });

  const { data: payslips = [], isLoading: isLoadingPayslips } = useQuery<any[]>({
    queryKey: ["/api/hr/payroll-runs", selectedRunId, "payslips"],
    enabled: !!selectedRunId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/hr/payroll/run", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/payroll-runs"] });
      setIsDialogOpen(false);
      toast({
        title: t("common.success"),
        description: t("hr.payrollRunSuccess"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <PageContainer>
      {/* Responsive Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("hr.payroll")}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="me-2 h-4 w-4" />
              {t("hr.newPayrollRun")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("hr.newPayrollRun")}</DialogTitle>
            </DialogHeader>
            <form id="payroll-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("hr.periodStart")}</Label>
                  <Input
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("hr.periodEnd")}</Label>
                  <Input
                    type="date"
                    value={formData.period_end}
                    onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("hr.paymentDate")}</Label>
                <Input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  required
                />
              </div>
            </form>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                {t("common.cancel")}
              </Button>
              <Button type="submit" form="payroll-form" disabled={createMutation.isPending} className="w-full sm:w-auto">
                {createMutation.isPending ? t("common.processing") : t("hr.generate")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("hr.history")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border-t overflow-x-auto">
                <Table className="min-w-[400px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.date")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          {t("common.loading")}
                        </TableCell>
                      </TableRow>
                    ) : runs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          {t("hr.noRuns")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      runs.map((run) => (
                        <TableRow 
                          key={run.id} 
                          className={`cursor-pointer ${selectedRunId === run.id ? "bg-muted" : ""}`}
                          onClick={() => setSelectedRunId(run.id)}
                        >
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{new Date(run.period_end).toLocaleDateString(i18n.language)}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(run.period_start).toLocaleDateString(i18n.language)} - {new Date(run.period_end).toLocaleDateString(i18n.language)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={run.status === "paid" ? "default" : "secondary"}>
                              {t(`status.${run.status}`)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
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

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedRunId ? t("hr.payslips") : t("hr.selectRun")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRunId ? (
                isLoadingPayslips ? (
                  <div className="text-center py-8">{t("common.loading")}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-[450px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("hr.employee")}</TableHead>
                          <TableHead className="text-end">{t("hr.basic")}</TableHead>
                          <TableHead className="text-end">{t("hr.allowances")}</TableHead>
                          <TableHead className="text-end">{t("hr.deductions")}</TableHead>
                          <TableHead className="text-end">{t("hr.net")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payslips.map((slip: any) => (
                          <TableRow key={slip.id}>
                            <TableCell className="font-medium">
                              {slip.employee_name} {slip.employee_last_name}
                            </TableCell>
                            <TableCell className="text-end">
                              {new Intl.NumberFormat(i18n.language, { style: 'currency', currency: companyCurrency }).format(Number(slip.basic_salary))}
                            </TableCell>
                            <TableCell className="text-end text-green-600">
                              +{new Intl.NumberFormat(i18n.language, { style: 'currency', currency: companyCurrency }).format(Number(slip.allowances))}
                            </TableCell>
                            <TableCell className="text-end text-red-600">
                              -{new Intl.NumberFormat(i18n.language, { style: 'currency', currency: companyCurrency }).format(Number(slip.deductions))}
                            </TableCell>
                            <TableCell className="text-end font-bold">
                              {new Intl.NumberFormat(i18n.language, { style: 'currency', currency: companyCurrency }).format(Number(slip.net_salary))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-20" />
                  <p>{t("hr.selectRunPrompt")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}