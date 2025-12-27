import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Search, FileCheck, ArrowUpRight, ArrowDownLeft, Eye, ScanLine, Loader2 } from "lucide-react";
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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "@shared/schema";
import { useCompanyCurrency } from '@/hooks/use-company-currency';

type CheckWithDetails = Check & {
  bank_name?: string;
  currency?: string;
};

export default function ChecksPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const companyCurrency = useCompanyCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState("receivable"); // receivable (in), payable (out)
  const [formData, setFormData] = useState({
    type: "receivable",
    check_number: "",
    bank_name: "",
    amount: "",
    currency: companyCurrency,
    issue_date: new Date().toISOString().split('T')[0],
    date: new Date().toISOString().split('T')[0],
    contact_id: "",
    description: "",
    status: "on_hand",
  });

  // Comprehensive currency list
  const currencies = [
    // Major World Currencies
    { code: 'USD', name: t('currencies.USD') },
    { code: 'EUR', name: t('currencies.EUR') },
    { code: 'GBP', name: t('currencies.GBP') },
    { code: 'JPY', name: t('currencies.JPY') },
    { code: 'CHF', name: t('currencies.CHF') },
    { code: 'CAD', name: t('currencies.CAD') },
    { code: 'AUD', name: t('currencies.AUD') },
    { code: 'NZD', name: t('currencies.NZD') },
    // Arabic & Middle Eastern Currencies
    { code: 'AED', name: t('currencies.AED') },
    { code: 'SAR', name: t('currencies.SAR') },
    { code: 'EGP', name: t('currencies.EGP') },
    { code: 'SYP', name: t('currencies.SYP') },
    { code: 'LBP', name: t('currencies.LBP') },
    { code: 'IQD', name: t('currencies.IQD') },
    { code: 'JOD', name: t('currencies.JOD') },
    { code: 'KWD', name: t('currencies.KWD') },
    { code: 'QAR', name: t('currencies.QAR') },
    { code: 'BHD', name: t('currencies.BHD') },
    { code: 'OMR', name: t('currencies.OMR') },
    { code: 'YER', name: t('currencies.YER') },
    { code: 'MAD', name: t('currencies.MAD') },
    { code: 'DZD', name: t('currencies.DZD') },
    { code: 'TND', name: t('currencies.TND') },
    { code: 'LYD', name: t('currencies.LYD') },
    { code: 'SDG', name: t('currencies.SDG') },
    { code: 'TRY', name: t('currencies.TRY') },
    // Asian Currencies
    { code: 'PHP', name: t('currencies.PHP') },
    { code: 'CNY', name: t('currencies.CNY') },
    { code: 'KRW', name: t('currencies.KRW') },
    { code: 'INR', name: t('currencies.INR') },
    { code: 'PKR', name: t('currencies.PKR') },
    { code: 'IDR', name: t('currencies.IDR') },
    { code: 'THB', name: t('currencies.THB') },
    { code: 'MYR', name: t('currencies.MYR') },
    { code: 'SGD', name: t('currencies.SGD') },
  ];

  const { data: checks = [], isLoading } = useQuery<CheckWithDetails[]>({
    queryKey: ["/api/checks", { type: activeTab }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/checks?type=${activeTab}`);
      return res.json();
    }
  });

  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/checks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checks"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: t("common.success"),
        description: t("checks.createSuccess", "Check recorded successfully"),
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

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/checks/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checks"] });
      toast({
        title: t("common.success"),
        description: t("checks.statusUpdateSuccess", "Check status updated"),
      });
    },
  });

  const resetForm = () => {
    setFormData({
      type: activeTab,
      check_number: "",
      bank_name: "",
      amount: "",
      currency: companyCurrency,
      issue_date: new Date().toISOString().split('T')[0],
      date: new Date().toISOString().split('T')[0],
      contact_id: "",
      description: "",
      status: "on_hand",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        // Call the new AI endpoint
        const res = await apiRequest("POST", "/api/ai/extract/check", { image: base64 });
        const responseData = await res.json();
        
        if (responseData.ok && responseData.data) {
          const extracted = responseData.data;
          
          // Try to find a matching contact if payee is present
          let matchedContactId = "";
          if (extracted.payee && contacts.length > 0) {
            const match = contacts.find((c: any) => 
              c.name.toLowerCase().includes(extracted.payee.toLowerCase()) ||
              extracted.payee.toLowerCase().includes(c.name.toLowerCase())
            );
            if (match) matchedContactId = match.id;
          }

          setFormData(prev => ({
            ...prev,
            type: activeTab, // Keep current tab context
            check_number: extracted.check_number || prev.check_number,
            bank_name: extracted.bank_name || prev.bank_name,
            amount: extracted.amount ? String(extracted.amount) : prev.amount,
            currency: extracted.currency || prev.currency,
            issue_date: extracted.date || prev.issue_date,
            date: extracted.date || prev.date, // Default due date to issue date
            description: extracted.memo || `Check from ${extracted.payee || 'Unknown'}`,
            contact_id: matchedContactId,
          }));
          
          setIsDialogOpen(true);
          toast({
            title: t("common.success"),
            description: t("checks.extractSuccess", "Check data extracted successfully. Please verify."),
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("checks.extractFailed", "Failed to extract check data"),
      });
    } finally {
      setIsScanning(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      on_hand: "bg-blue-100 text-blue-800",
      deposited: "bg-yellow-100 text-yellow-800",
      cleared: "bg-green-100 text-green-800",
      bounced: "bg-red-100 text-red-800",
      returned: "bg-gray-100 text-gray-800",
      cancelled: "bg-gray-200 text-gray-600",
    };
    return <Badge className={styles[status] || ""}>{t(`checks.status.${status}`, status)}</Badge>;
  };

  const filteredChecks = checks.filter((check) =>
    check.check_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (check.bank_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("checks.title", "Checks Management")}</h1>
          <p className="text-muted-foreground">
            {t("checks.subtitle", "Manage incoming and outgoing checks")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <input
              type="file"
              accept="image/*,.pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              disabled={isScanning}
            />
            <Button variant="outline" disabled={isScanning} className="w-full sm:w-auto">
              {isScanning ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : (
                <ScanLine className="me-2 h-4 w-4" />
              )}
              {isScanning ? t("checks.scanning", "Scanning...") : t("checks.scanCheck", "Scan Check (AI)")}
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto">
                <Plus className="me-2 h-4 w-4" />
                {t("checks.add", "Add Check")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {activeTab === 'receivable' ? t("checks.addReceivable", "Record Received Check") : t("checks.addPayable", "Record Issued Check")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("checks.number", "Check Number")}</Label>
                  <Input
                    value={formData.check_number}
                    onChange={(e) => setFormData({ ...formData, check_number: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("checks.bankName", "Bank Name")}</Label>
                  <Input
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.amount", "Amount")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.currency", "Currency")}</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(val) => setFormData({ ...formData, currency: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.code} - {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("checks.issueDate", "Issue Date")}</Label>
                  <Input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("checks.dueDate", "Due Date")}</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{activeTab === 'receivable' ? t("common.customer", "Customer") : t("common.supplier", "Supplier")}</Label>
                  <Select
                    value={formData.contact_id}
                    onValueChange={(val) => setFormData({ ...formData, contact_id: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.select", "Select Contact...")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(contacts as any[])
                        .filter((c: any) => activeTab === 'receivable' ? c.type !== 'supplier' : c.type !== 'customer')
                        .map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{t("common.description", "Description")}</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <DialogFooter className="sm:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                    {t("common.save", "Save")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

        <div className="relative w-72 mb-4">
          <Search className="absolute start-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("common.search", "Search checks...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-8"
          />
        </div>

        <Tabs defaultValue="receivable" onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap w-full h-auto min-h-10 gap-1 sm:gap-2 mb-4">
            <TabsTrigger value="receivable">{t("checks.receivable", "Receivable")}</TabsTrigger>
            <TabsTrigger value="payable">{t("checks.payable", "Payable")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("checks.number", "Check #")}</TableHead>
                  <TableHead>{t("checks.bank", "Bank")}</TableHead>
                  <TableHead>{t("common.contact", "Contact")}</TableHead>
                                    <TableHead>{t("checks.dueDate", "Due Date")}</TableHead>
                  <TableHead>{t("common.amount", "Amount")}</TableHead>
                  <TableHead>{t("common.status", "Status")}</TableHead>
                  <TableHead className="text-end">{t("common.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {t("common.loading", "Loading...")}
                    </TableCell>
                  </TableRow>
                ) : filteredChecks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("checks.noChecks", "No checks found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredChecks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell className="font-medium">{check.check_number}</TableCell>
                      <TableCell>{check.bank_name || "-"}</TableCell>
                      <TableCell>{check.payee}</TableCell>
                      <TableCell>{new Date(check.date).toLocaleDateString(i18n.language)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {new Intl.NumberFormat(i18n.language, {
                            style: "currency",
                            currency: check.currency || "USD",
                          }).format(Number(check.amount))}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(check.status)}</TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setFormData({
                                type: "payable", // Default or derive from check
                                check_number: check.check_number,
                                bank_name: check.bank_name || "",
                                amount: check.amount.toString(),
                                currency: check.currency || "USD",
                                issue_date: new Date(check.issue_date).toISOString().split('T')[0],
                                date: new Date(check.date).toISOString().split('T')[0],
                                contact_id: "", // No contact_id in check
                                description: check.memo || "",
                                status: check.status,
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {/* Status actions */}
                          {check.status === 'on_hand' && (
                            <Button variant="ghost" size="icon" title={t("checks.markDeposited", "Mark Deposited")} onClick={() => statusMutation.mutate({ id: check.id, status: 'deposited' })}>
                              <ArrowUpRight className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                          {check.status === 'deposited' && (
                            <Button variant="ghost" size="icon" title={t("checks.markCleared", "Mark Cleared")} onClick={() => statusMutation.mutate({ id: check.id, status: 'cleared' })}>
                              <FileCheck className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </PageContainer>
  );
}
