import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calculator, History, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

export default function AssetsPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [depreciateDate, setDepreciateDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isDepreciateOpen, setIsDepreciateOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [newAsset, setNewAsset] = useState({
    asset_code: "",
    name: "",
    description: "",
    cost: "",
    acquisition_date: new Date().toISOString().split('T')[0],
    useful_life_years: "",
    salvage_value: "0",
    depreciation_method: "straight_line",
    asset_account_id: "",
    depreciation_account_id: "",
    expense_account_id: ""
  });

    const { data: assets = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/fixed-assets"],
  });

  const { data: accounts = [] } = useQuery<any[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: history = [], isLoading: isHistoryLoading } = useQuery<any[]>({
    queryKey: ["/api/fixed-assets", selectedAssetId, "history"],
    queryFn: async () => {
      if (!selectedAssetId) return [];
      const res = await apiRequest("GET", `/api/fixed-assets/${selectedAssetId}/history`);
      return res.json();
    },
    enabled: !!selectedAssetId && isHistoryOpen,
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/fixed-assets", {
          ...data,
          cost: parseFloat(data.cost),
          useful_life_years: parseInt(data.useful_life_years),
          salvage_value: parseFloat(data.salvage_value),
          acquisition_date: new Date(data.acquisition_date).toISOString()
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-assets"] });
      setIsCreateOpen(false);
      setNewAsset({
        asset_code: "",
        name: "",
        description: "",
        cost: "",
        acquisition_date: new Date().toISOString().split('T')[0],
        useful_life_years: "",
        salvage_value: "0",
        depreciation_method: "straight_line",
        asset_account_id: "",
        depreciation_account_id: "",
        expense_account_id: ""
      });
      toast({
        title: t("Success"),
        description: t("Asset created successfully"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const depreciateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAssetId) return;
      const res = await apiRequest("POST", `/api/fixed-assets/${selectedAssetId}/depreciate`, { 
        date: new Date(depreciateDate).toISOString() 
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-assets"] });
      setIsDepreciateOpen(false);
      setSelectedAssetId(null);
      toast({
        title: t("Success"),
        description: data.message || t("Depreciation posted successfully"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAssetMutation.mutate(newAsset);
  };

  const handleDepreciateClick = (assetId: string) => {
    setSelectedAssetId(assetId);
    setIsDepreciateOpen(true);
  };

  const handleHistoryClick = (assetId: string) => {
    setSelectedAssetId(assetId);
    setIsHistoryOpen(true);
  };

  const handleConfirmDepreciate = () => {
    depreciateMutation.mutate();
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Responsive Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("fixedAssets.title", { defaultValue: "Fixed Assets" })}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t("fixedAssets.description", { defaultValue: "Manage your company's fixed assets and depreciation" })}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="me-2 h-4 w-4" />
              {t("fixedAssets.newAsset", { defaultValue: "New Asset" })}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("fixedAssets.registerAsset", { defaultValue: "Register New Asset" })}</DialogTitle>
              <DialogDescription>
                {t("fixedAssets.enterDetails", { defaultValue: "Enter asset details for tracking and depreciation." })}
              </DialogDescription>
            </DialogHeader>
            <form id="asset-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">{t("fixedAssets.assetCode", { defaultValue: "Asset Code" })}</Label>
                  <Input
                    id="code"
                    value={newAsset.asset_code}
                    onChange={(e) => setNewAsset({ ...newAsset, asset_code: e.target.value })}
                    required
                    placeholder="FA-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t("fixedAssets.assetName", { defaultValue: "Asset Name" })}</Label>
                  <Input
                    id="name"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    required
                    placeholder={t("fixedAssets.assetNamePlaceholder", { defaultValue: "Office Laptop" })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">{t("fixedAssets.acquisitionCost", { defaultValue: "Acquisition Cost" })}</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={newAsset.cost}
                    onChange={(e) => setNewAsset({ ...newAsset, cost: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">{t("fixedAssets.acquisitionDate", { defaultValue: "Acquisition Date" })}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAsset.acquisition_date}
                    onChange={(e) => setNewAsset({ ...newAsset, acquisition_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="life">{t("fixedAssets.usefulLifeYears", { defaultValue: "Useful Life (Years)" })}</Label>
                  <Input
                    id="life"
                    type="number"
                    value={newAsset.useful_life_years}
                    onChange={(e) => setNewAsset({ ...newAsset, useful_life_years: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salvage">{t("fixedAssets.salvageValue", { defaultValue: "Salvage Value" })}</Label>
                  <Input
                    id="salvage"
                    type="number"
                    step="0.01"
                    value={newAsset.salvage_value}
                    onChange={(e) => setNewAsset({ ...newAsset, salvage_value: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">{t("fixedAssets.depreciationMethod", { defaultValue: "Depreciation Method" })}</Label>
                <Select 
                  value={newAsset.depreciation_method} 
                  onValueChange={(val) => setNewAsset({...newAsset, depreciation_method: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight_line">{t("fixedAssets.straightLine", { defaultValue: "Straight Line" })}</SelectItem>
                    <SelectItem value="declining_balance">{t("fixedAssets.decliningBalance", { defaultValue: "Declining Balance" })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset_account">{t("fixedAssets.assetAccount", { defaultValue: "Asset Account" })}</Label>
                <Select 
                  value={newAsset.asset_account_id} 
                  onValueChange={(val) => setNewAsset({...newAsset, asset_account_id: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("fixedAssets.selectAssetAccount", { defaultValue: "Select Asset Account" })} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.filter((a: any) => a.account_type === 'asset').map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depreciation_account">{t("fixedAssets.accumulatedDepreciationAccount", { defaultValue: "Accumulated Depreciation Account" })}</Label>
                <Select 
                  value={newAsset.depreciation_account_id} 
                  onValueChange={(val) => setNewAsset({...newAsset, depreciation_account_id: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("fixedAssets.selectContraAccount", { defaultValue: "Select Contra Asset Account" })} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.filter((a: any) => a.account_type === 'asset').map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_account">{t("fixedAssets.depreciationExpenseAccount", { defaultValue: "Depreciation Expense Account" })}</Label>
                <Select 
                  value={newAsset.expense_account_id} 
                  onValueChange={(val) => setNewAsset({...newAsset, expense_account_id: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("fixedAssets.selectExpenseAccount", { defaultValue: "Select Expense Account" })} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.filter((a: any) => a.account_type === 'expense').map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                    ))}

                  </SelectContent>
                </Select>
              </div>
            </form>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="w-full sm:w-auto">
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" form="asset-form" disabled={createAssetMutation.isPending} className="w-full sm:w-auto">
                {createAssetMutation.isPending ? t("common.creating", "Creating...") : t("fixedAssets.createAsset", "Create Asset")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDepreciateOpen} onOpenChange={setIsDepreciateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("fixedAssets.postDepreciation", { defaultValue: "Post Depreciation" })}</DialogTitle>
              <DialogDescription>
                {t("fixedAssets.calculateDescription", { defaultValue: "Calculate and post depreciation up to the selected date." })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="depreciate_date">{t("fixedAssets.depreciationDate", { defaultValue: "Depreciation Date" })}</Label>
                <Input
                  id="depreciate_date"
                  type="date"
                  value={depreciateDate}
                  onChange={(e) => setDepreciateDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDepreciateOpen(false)}>{t("common.cancel", { defaultValue: "Cancel" })}</Button>
              <Button onClick={handleConfirmDepreciate} disabled={depreciateMutation.isPending}>
                {depreciateMutation.isPending ? t("fixedAssets.posting", { defaultValue: "Posting..." }) : t("fixedAssets.postDepreciation", { defaultValue: "Post Depreciation" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("Depreciation History")}</DialogTitle>
            </DialogHeader>
            <div className="py-4 overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Date")}</TableHead>
                    <TableHead className="text-end">{t("Amount")}</TableHead>
                    <TableHead>{t("Journal Entry")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isHistoryLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">{t("common.loading", "Loading...")}</TableCell>
                    </TableRow>
                  ) : history?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">{t("common.noHistoryFound", "No history found")}</TableCell>
                    </TableRow>
                  ) : (
                    history?.map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.date).toLocaleDateString(i18n.language)}</TableCell>
                        <TableCell className="text-end">{Number(entry.amount).toLocaleString(i18n.language, { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>#{entry.journal_entry_id}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("fixedAssets.assetRegistry", { defaultValue: "Asset Registry" })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow>
                <TableHead>{t("fixedAssets.assetCode", { defaultValue: "Code" })}</TableHead>
                <TableHead>{t("fixedAssets.assetName", { defaultValue: "Name" })}</TableHead>
                <TableHead>{t("fixedAssets.acquired", { defaultValue: "Acquired" })}</TableHead>
                <TableHead className="text-end">{t("common.cost", { defaultValue: "Cost" })}</TableHead>
                <TableHead className="text-end">{t("fixedAssets.bookValue", { defaultValue: "Book Value" })}</TableHead>
                <TableHead>{t("common.status", { defaultValue: "Status" })}</TableHead>
                <TableHead className="text-end">{t("common.actions", { defaultValue: "Actions" })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">{t("common.loading", "Loading...")}</TableCell>
                </TableRow>
              ) : (
                assets?.map((asset: any) => {
                  const bookValue = Number(asset.cost) - Number(asset.accumulated_depreciation);
                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.asset_code}</TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{new Date(asset.acquisition_date).toLocaleDateString(i18n.language)}</TableCell>
                      <TableCell className="text-end">{Number(asset.cost).toLocaleString(i18n.language, { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-end">{bookValue.toLocaleString(i18n.language, { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Badge variant={asset.is_active ? 'default' : 'secondary'}>
                          {asset.is_active ? t("common.active", { defaultValue: "Active" }) : t("fixedAssets.disposed", { defaultValue: "Disposed" })}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDepreciateClick(asset.id)}
                          title={t("fixedAssets.postDepreciation", { defaultValue: "Post Depreciation" })}
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleHistoryClick(asset.id)}
                          title={t("View History")}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
