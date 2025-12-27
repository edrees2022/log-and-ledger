import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Save, Calculator, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export default function LandedCostDetail() {
  const [, params] = useRoute("/inventory/landed-cost/:id");
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = params?.id;
  const isNew = id === 'new';

  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isAddItemsOpen, setIsAddItemsOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string>("");
  const [billAmount, setBillAmount] = useState<string>("");
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    allocation_method: 'value'
  });

  // Fetch Voucher
  const { data: voucher, isLoading } = useQuery({
    queryKey: ['landed-cost-voucher', id],
    queryFn: async () => {
      if (isNew) return null;
      const res = await apiRequest("GET", `/api/landed-cost/${id}`);
      if (!res.ok) throw new Error('Failed to fetch voucher');
      return res.json();
    },
    enabled: !isNew
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/landed-cost', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: t("common.success"), description: t("inventory.voucherCreated", "Voucher created") });
      setLocation(`/inventory/landed-cost/${data.id}`);
    }
  });

  // Allocate Mutation
  const allocateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/landed-cost/${id}/allocate`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landed-cost-voucher', id] });
      toast({ title: t("inventory.allocated", "Allocated"), description: t("inventory.costsDistributed", "Costs have been distributed") });
    }
  });

  // Post Mutation
  const postMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/landed-cost/${id}/post`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landed-cost-voucher', id] });
      toast({ title: t("inventory.posted", "Posted"), description: t("inventory.landedCostsApplied", "Landed costs applied to inventory") });
    }
  });

  // Fetch Bills for Selection
  const { data: availableBills = [] } = useQuery<any[]>({
    queryKey: ['/api/purchases/bills'],
    enabled: isAddBillOpen
  });

  // Fetch Stock Movements for Selection
  const { data: recentMovements = [] } = useQuery<any[]>({
    queryKey: ['/api/inventory/movements', { type: 'in' }],
    queryFn: async () => {
      // We need a custom endpoint or filter for this. 
      // For now, let's assume we can fetch recent IN movements.
      // I'll implement a quick fetch here or use existing if available.
      const res = await apiRequest('GET', '/api/inventory/movements?type=in&limit=50');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAddItemsOpen
  });

  // Add Bill Mutation
  const addBillMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/landed-cost/${id}/bills`, {
        bill_id: selectedBillId,
        amount: billAmount
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landed-cost-voucher', id] });
      setIsAddBillOpen(false);
      setSelectedBillId("");
      setBillAmount("");
      toast({ title: t("inventory.billAdded", "Bill Added"), description: t("inventory.freightBillAdded", "Freight bill added to voucher") });
    }
  });

  // Add Items Mutation
  const addItemsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/landed-cost/${id}/items`, {
        stock_movement_ids: selectedMovements
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landed-cost-voucher', id] });
      setIsAddItemsOpen(false);
      setSelectedMovements([]);
      toast({ title: t("inventory.itemsAdded", "Items Added"), description: t("inventory.stockMovementsAdded", "Stock movements added for allocation") });
    }
  });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  const isPosted = voucher?.status === 'posted';

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/inventory/landed-cost')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? t('inventory.newLandedCostVoucher', { defaultValue: 'New Landed Cost Voucher' }) : `${t('inventory.voucherNumber', { defaultValue: 'Voucher' })} ${voucher?.voucher_number}`}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? t('inventory.createAllocationRecord', { defaultValue: 'Create a new allocation record' }) : `${t('common.createdOn', { defaultValue: 'Created on' })} ${format(new Date(voucher?.date || new Date()), 'PP')}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew && !isPosted && (
            <>
              <Button variant="outline" onClick={() => allocateMutation.mutate()} disabled={allocateMutation.isPending}>
                <Calculator className="mr-2 h-4 w-4" />
                {t('inventory.allocateCosts', { defaultValue: 'Allocate Costs' })}
              </Button>
              <Button onClick={() => postMutation.mutate()} disabled={postMutation.isPending}>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('inventory.post', { defaultValue: 'Post' })}
              </Button>
            </>
          )}
          {isNew && (
            <Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {t('inventory.createDraft', { defaultValue: 'Create Draft' })}
            </Button>
          )}
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("common.details", "Details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.date", "Date")}</Label>
                <Input 
                  type="date" 
                  value={isNew ? formData.date : format(new Date(voucher.date), 'yyyy-MM-dd')}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  disabled={!isNew}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("inventory.allocationMethod", "Allocation Method")}</Label>
                <Select 
                  value={isNew ? formData.allocation_method : voucher.allocation_method}
                  onValueChange={v => setFormData({...formData, allocation_method: v})}
                  disabled={!isNew}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value">{t("inventory.byValue", "By Value")}</SelectItem>
                    <SelectItem value="quantity">{t("inventory.byQuantity", "By Quantity")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("common.description", "Description")}</Label>
              <Input 
                value={isNew ? formData.description : voucher.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                disabled={!isNew}
                placeholder={t("inventory.importShipmentPlaceholder", "e.g. Import Shipment #123")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("common.summary", "Summary")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("common.status", "Status")}</span>
              <Badge variant={isPosted ? 'default' : 'secondary'}>
                {isNew ? t("common.new", "New") : voucher.status}
              </Badge>
            </div>
            {!isNew && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("inventory.totalFreight", "Total Freight")}</span>
                  <span className="font-medium">
                    {voucher.bills?.reduce((sum: number, b: any) => sum + Number(b.amount), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("inventory.itemsValue", "Items Value")}</span>
                  <span className="font-medium">
                    {voucher.items?.reduce((sum: number, i: any) => sum + Number(i.original_cost), 0).toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {!isNew && (
        <>
          {/* Bills Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("inventory.freightCustomsBills", "Freight & Customs Bills")}</CardTitle>
                <CardDescription>{t("inventory.addBillsDescription", "Add bills that represent the extra costs.")}</CardDescription>
              </div>
              {!isPosted && (
                <Dialog open={isAddBillOpen} onOpenChange={setIsAddBillOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">{t("inventory.addBill", "Add Bill")}</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("inventory.addFreightBill", "Add Freight/Customs Bill")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{t("inventory.selectBill", "Select Bill")}</Label>
                        <Select value={selectedBillId} onValueChange={(val) => {
                          setSelectedBillId(val);
                          const bill = availableBills.find(b => b.id === val);
                          if (bill) setBillAmount(bill.total);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("inventory.selectBillPlaceholder", "Select a bill...")} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBills.map((bill) => (
                              <SelectItem key={bill.id} value={bill.id}>
                                {bill.bill_number} - {bill.supplier?.name} ({bill.total})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("inventory.amountToAllocate", "Amount to Allocate")}</Label>
                        <Input 
                          type="number" 
                          value={billAmount} 
                          onChange={(e) => setBillAmount(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => addBillMutation.mutate()} disabled={!selectedBillId || addBillMutation.isPending}>
                        {t("inventory.addBill", "Add Bill")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <Table className="min-w-[400px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("inventory.billNumber", "Bill #")}</TableHead>
                    <TableHead>{t("contacts.supplier", "Supplier")}</TableHead>
                    <TableHead className="text-end">{t("common.amount", "Amount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voucher.bills?.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.bill.bill_number}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-end">{Number(entry.amount).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {(!voucher.bills || voucher.bills.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">{t("inventory.noBillsAdded", "No bills added")}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("inventory.itemsToAllocate", "Items to Allocate")}</CardTitle>
                <CardDescription>{t("inventory.selectGRNDescription", "Select the stock receipts (GRNs) to apply costs to.")}</CardDescription>
              </div>
              {!isPosted && (
                <Dialog open={isAddItemsOpen} onOpenChange={setIsAddItemsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">{t("inventory.addItems", "Add Items")}</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t("inventory.selectStockReceipts", "Select Stock Receipts")}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 max-h-[60vh] overflow-y-auto">
                      <Table className="min-w-[450px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>{t("common.date", "Date")}</TableHead>
                            <TableHead>{t("common.item", "Item")}</TableHead>
                            <TableHead>{t("common.type", "Type")}</TableHead>
                            <TableHead className="text-end">{t("common.qty", "Qty")}</TableHead>
                            <TableHead className="text-end">{t("common.cost", "Cost")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentMovements.map((move) => (
                            <TableRow key={move.id}>
                              <TableCell>
                                <Checkbox 
                                  checked={selectedMovements.includes(move.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) setSelectedMovements([...selectedMovements, move.id]);
                                    else setSelectedMovements(selectedMovements.filter(id => id !== move.id));
                                  }}
                                />
                              </TableCell>
                              <TableCell>{format(new Date(move.transaction_date), 'PP')}</TableCell>
                              <TableCell>{move.item?.name}</TableCell>
                              <TableCell className="capitalize">{move.transaction_type}</TableCell>
                              <TableCell className="text-right">{move.quantity}</TableCell>
                              <TableCell className="text-right">{move.total_cost}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => addItemsMutation.mutate()} disabled={selectedMovements.length === 0 || addItemsMutation.isPending}>
                        {t("inventory.addSelectedItems", "Add Selected Items")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <Table className="min-w-[450px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("items.item", "Item")}</TableHead>
                    <TableHead className="text-right">{t("common.qty", "Qty")}</TableHead>
                    <TableHead className="text-right">{t("inventory.originalCost", "Original Cost")}</TableHead>
                    <TableHead className="text-right">{t("inventory.allocated", "Allocated")}</TableHead>
                    <TableHead className="text-right">{t("inventory.newUnitCost", "New Unit Cost")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voucher.items?.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.stock_movement.item.name}</TableCell>
                      <TableCell className="text-right">{entry.stock_movement.quantity}</TableCell>
                      <TableCell className="text-right">{Number(entry.original_cost).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium text-blue-600">
                        +{Number(entry.allocated_cost).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {Number(entry.new_unit_cost).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!voucher.items || voucher.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">{t("inventory.noItemsAdded", "No items added")}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
