import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowRightLeft, Package, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StockAdjustmentsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [newAdjustment, setNewAdjustment] = useState({
    item_id: "",
    warehouse_id: "",
    quantity: "",
    unit_cost: "",
    transaction_date: new Date().toISOString().split('T')[0],
    notes: "",
    batch_number: "",
    expiry_date: "",
    serial_numbers: ""
  });
  const [editAdjustment, setEditAdjustment] = useState({
    item_id: "",
    warehouse_id: "",
    quantity: "",
    unit_cost: "",
    transaction_date: new Date().toISOString().split('T')[0],
    notes: "",
    batch_number: "",
    expiry_date: "",
    serial_numbers: ""
  });

  const { data: items = [] } = useQuery<any[]>({
    queryKey: ["/api/items"],
  });

  const { data: warehouses = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory/warehouses"],
  });

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ["stock-movements", "adjustments"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/inventory/movements?type=adjustment");
      if (!res.ok) return [];
      const data = await res.json();
      // Filter to show only manual adjustments
      return Array.isArray(data) ? data.filter((m: any) => m.transaction_type === 'adjustment' || m.reference_type === 'manual_adjustment') : [];
    },
  });

  // Get selected item's tracking type
  const selectedItem = useMemo(() => {
    return items?.find((i: any) => i.id === newAdjustment.item_id);
  }, [items, newAdjustment.item_id]);

  const trackingType = selectedItem?.tracking_type || 'none';

  const createAdjustmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload: any = {
        item_id: data.item_id,
        warehouse_id: data.warehouse_id,
        quantity: parseFloat(data.quantity),
        unit_cost: parseFloat(data.unit_cost),
        transaction_type: 'adjustment',
        date: new Date(data.transaction_date).toISOString(),
        notes: data.notes
      };
      
      // Add batch info if batch tracking
      if (data.batch_number) {
        payload.batch_number = data.batch_number;
        payload.expiry_date = data.expiry_date || null;
      }
      
      // Add serial numbers if serial tracking
      if (data.serial_numbers) {
        payload.serial_numbers = data.serial_numbers.split('\n').filter((s: string) => s.trim());
      }
      
      const res = await apiRequest("POST", "/api/inventory/adjustments", payload);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create adjustment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements", "adjustments"] });
      setIsCreateOpen(false);
      setNewAdjustment({
        item_id: "",
        warehouse_id: "",
        quantity: "",
        unit_cost: "",
        transaction_date: new Date().toISOString().split('T')[0],
        notes: "",
        batch_number: "",
        expiry_date: "",
        serial_numbers: ""
      });
      toast({
        title: t("common.success"),
        description: t("inventory.adjustments.createdDesc"),
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

  const updateAdjustmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const payload: any = {
        item_id: data.item_id,
        warehouse_id: data.warehouse_id,
        quantity: parseFloat(data.quantity),
        unit_cost: parseFloat(data.unit_cost),
        date: new Date(data.transaction_date).toISOString(),
        notes: data.notes
      };
      
      const res = await apiRequest("PUT", `/api/inventory/adjustments/${id}`, payload);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update adjustment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements", "adjustments"] });
      setIsEditOpen(false);
      setSelectedMovement(null);
      toast({
        title: t("common.success"),
        description: t("inventory.adjustments.updatedDesc"),
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

  const deleteAdjustmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/inventory/adjustments/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete adjustment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements", "adjustments"] });
      setDeleteDialogOpen(false);
      setSelectedMovement(null);
      toast({
        title: t("common.success"),
        description: t("inventory.adjustments.deletedDesc"),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAdjustmentMutation.mutate(newAdjustment);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMovement) {
      updateAdjustmentMutation.mutate({ id: selectedMovement.id, data: editAdjustment });
    }
  };

  const openEditDialog = (movement: any) => {
    setSelectedMovement(movement);
    setEditAdjustment({
      item_id: movement.item_id,
      warehouse_id: movement.warehouse_id,
      quantity: String(movement.quantity),
      unit_cost: String(movement.unit_cost || 0),
      transaction_date: new Date(movement.transaction_date).toISOString().split('T')[0],
      notes: movement.notes || "",
      batch_number: "",
      expiry_date: "",
      serial_numbers: ""
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (movement: any) => {
    setSelectedMovement(movement);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("inventory.adjustments.title")}</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t("inventory.adjustments.description")}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="me-2 h-4 w-4" />
              {t("inventory.adjustments.addAdjustment")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("inventory.adjustments.addAdjustment")}</DialogTitle>
              <DialogDescription>
                {t("inventory.adjustments.details")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouse">{t("inventory.adjustments.warehouse")}</Label>
                  <Select 
                    value={newAdjustment.warehouse_id} 
                    onValueChange={(val) => setNewAdjustment({...newAdjustment, warehouse_id: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("inventory.adjustments.selectWarehouse")} />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses?.map((w: any) => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">{t("inventory.adjustments.date")}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAdjustment.transaction_date}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, transaction_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item">{t("inventory.adjustments.item")}</Label>
                <Select 
                    value={newAdjustment.item_id} 
                    onValueChange={(val) => {
                      // Find the selected item and auto-fill unit cost
                      const item = items?.find((i: any) => i.id === val);
                      const unitCost = item?.cost_price || item?.purchase_price || '';
                      setNewAdjustment({
                        ...newAdjustment, 
                        item_id: val,
                        unit_cost: unitCost ? String(unitCost) : newAdjustment.unit_cost
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("inventory.adjustments.selectItem")} />
                    </SelectTrigger>
                    <SelectContent>
                      {items?.filter((i: any) => i.type === 'inventory').map((i: any) => (
                        <SelectItem key={i.id} value={i.id}>{i.name} ({i.sku})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">{t("inventory.adjustments.quantity")}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.0001"
                    value={newAdjustment.quantity}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, quantity: e.target.value })}
                    required
                    placeholder="-10 or 10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_cost">{t("inventory.valuation.averageCost")}</Label>
                  <Input
                    id="unit_cost"
                    type="number"
                    step="0.01"
                    value={newAdjustment.unit_cost}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, unit_cost: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("inventory.adjustments.notes")}</Label>
                <Input
                  id="notes"
                  value={newAdjustment.notes}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, notes: e.target.value })}
                  placeholder={t("inventory.adjustments.reasonPlaceholder", { defaultValue: "Reason for adjustment..." })}
                />
              </div>

              {/* Batch tracking fields */}
              {trackingType === 'batch' && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
                    <Package className="h-4 w-4" />
                    {t("inventory.batchTracking", { defaultValue: "معلومات الدفعة" })}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="batch_number">{t("inventory.batchNumber", { defaultValue: "رقم الدفعة" })}</Label>
                      <Input
                        id="batch_number"
                        value={newAdjustment.batch_number}
                        onChange={(e) => setNewAdjustment({ ...newAdjustment, batch_number: e.target.value })}
                        placeholder="LOT-2024-001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry_date">{t("inventory.expiryDate", { defaultValue: "تاريخ الانتهاء" })}</Label>
                      <Input
                        id="expiry_date"
                        type="date"
                        value={newAdjustment.expiry_date}
                        onChange={(e) => setNewAdjustment({ ...newAdjustment, expiry_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t("inventory.batchHint", { defaultValue: "أدخل رقم الدفعة من المورد. تاريخ الانتهاء يساعد في تتبع المنتجات القابلة للتلف." })}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Serial number tracking fields */}
              {trackingType === 'serial' && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <Package className="h-4 w-4" />
                    {t("inventory.serialTracking", { defaultValue: "الأرقام التسلسلية" })}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serial_numbers">
                      {t("inventory.serialNumbers", { defaultValue: "أدخل رقم تسلسلي لكل وحدة (سطر لكل رقم)" })}
                    </Label>
                    <textarea
                      id="serial_numbers"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={newAdjustment.serial_numbers}
                      onChange={(e) => setNewAdjustment({ ...newAdjustment, serial_numbers: e.target.value })}
                      placeholder={"SN-001\nSN-002\nSN-003"}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("inventory.serialHint", { 
                        defaultValue: `عدد الأرقام المدخلة: ${newAdjustment.serial_numbers.split('\n').filter(s => s.trim()).length} - يجب أن يساوي الكمية المدخلة`,
                        count: newAdjustment.serial_numbers.split('\n').filter(s => s.trim()).length
                      })}
                    </p>
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t("inventory.serialWarning", { defaultValue: "أدخل رقم تسلسلي فريد لكل وحدة. عدد الأرقام يجب أن يساوي الكمية." })}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button type="submit" disabled={createAdjustmentMutation.isPending} className="w-full sm:w-auto">
                  {createAdjustmentMutation.isPending ? t("common.saving") : t("common.save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("inventory.adjustments.title")}</CardTitle>
          <CardDescription>{t("inventory.adjustments.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("common.loading")}...
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("common.noData")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("items.item")}</TableHead>
                  <TableHead>{t("inventory.warehouse")}</TableHead>
                  <TableHead className="text-center">{t("inventory.quantity")}</TableHead>
                  <TableHead className="text-end">{t("inventory.valuation.averageCost")}</TableHead>
                  <TableHead>{t("common.notes")}</TableHead>
                  <TableHead className="text-center">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement: any) => (
                  <TableRow key={movement.id}>
                    <TableCell>{new Date(movement.transaction_date).toLocaleDateString()}</TableCell>
                    <TableCell>{movement.item?.name || movement.item_id}</TableCell>
                    <TableCell>{movement.warehouse?.name || movement.warehouse_id}</TableCell>
                    <TableCell className={`text-center font-medium ${parseFloat(movement.quantity) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(movement.quantity) >= 0 ? '+' : ''}{parseFloat(movement.quantity).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-end">{parseFloat(movement.unit_cost || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{movement.notes || '-'}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(movement)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(movement)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("inventory.adjustments.editAdjustment")}</DialogTitle>
            <DialogDescription>
              {t("inventory.adjustments.editDetails", { defaultValue: "عدل بيانات التسوية" })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_warehouse">{t("inventory.adjustments.warehouse")}</Label>
                <Select 
                  value={editAdjustment.warehouse_id} 
                  onValueChange={(val) => setEditAdjustment({...editAdjustment, warehouse_id: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("inventory.adjustments.selectWarehouse")} />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses?.map((w: any) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_date">{t("inventory.adjustments.date")}</Label>
                <Input
                  id="edit_date"
                  type="date"
                  value={editAdjustment.transaction_date}
                  onChange={(e) => setEditAdjustment({ ...editAdjustment, transaction_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_item">{t("items.item")}</Label>
              <Select 
                value={editAdjustment.item_id} 
                onValueChange={(val) => {
                  const item = items?.find((i: any) => i.id === val);
                  setEditAdjustment({
                    ...editAdjustment, 
                    item_id: val,
                    unit_cost: item?.cost_price ? String(item.cost_price) : editAdjustment.unit_cost
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("inventory.adjustments.selectItem")} />
                </SelectTrigger>
                <SelectContent>
                  {items?.filter((i: any) => i.type === 'inventory').map((i: any) => (
                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_quantity">{t("inventory.quantity")}</Label>
                <Input
                  id="edit_quantity"
                  type="number"
                  step="any"
                  value={editAdjustment.quantity}
                  onChange={(e) => setEditAdjustment({ ...editAdjustment, quantity: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t("inventory.adjustments.quantityHint")}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_unit_cost">{t("inventory.valuation.averageCost")}</Label>
                <Input
                  id="edit_unit_cost"
                  type="number"
                  step="0.01"
                  value={editAdjustment.unit_cost}
                  onChange={(e) => setEditAdjustment({ ...editAdjustment, unit_cost: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_notes">{t("common.notes")}</Label>
              <Input
                id="edit_notes"
                value={editAdjustment.notes}
                onChange={(e) => setEditAdjustment({ ...editAdjustment, notes: e.target.value })}
                placeholder={t("inventory.adjustments.notesPlaceholder")}
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="w-full sm:w-auto">
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={updateAdjustmentMutation.isPending} className="w-full sm:w-auto">
                {updateAdjustmentMutation.isPending ? t("common.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.adjustments.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedMovement && deleteAdjustmentMutation.mutate(selectedMovement.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAdjustmentMutation.isPending ? t("common.deleting", { defaultValue: "جاري الحذف..." }) : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
