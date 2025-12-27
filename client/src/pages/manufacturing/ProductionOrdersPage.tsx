import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Search, Factory, Calendar, CheckCircle } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PageContainer from "@/components/layout/PageContainer";
import { apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductionOrder, ManufacturingBom, Item } from "@shared/schema";

export default function ProductionOrdersPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Batch Completion State
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState({
    batch_number: "",
    expiry_date: ""
  });

  const [formData, setFormData] = useState({
    order_number: "",
    bom_id: "",
    item_id: "",
    quantity: "",
    start_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    status: "planned",
  });

  const { data: orders = [], isLoading } = useQuery<ProductionOrder[]>({
    queryKey: ["/api/manufacturing/orders"],
  });

  const { data: boms = [] } = useQuery<ManufacturingBom[]>({
    queryKey: ["/api/manufacturing/boms"],
  });

  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/manufacturing/orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/orders"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: t("common.success"),
        description: t("manufacturing.orderCreateSuccess", "Production order created successfully"),
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/manufacturing/orders/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/orders"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: t("common.success"),
        description: t("manufacturing.orderUpdateSuccess", "Production order updated successfully"),
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

  const completeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("POST", `/api/manufacturing/orders/${id}/complete`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/orders"] });
      setCompletionDialogOpen(false);
      setCompletionData({ batch_number: "", expiry_date: "" });
      toast({
        title: t("common.success"),
        description: t("manufacturing.orderCompleteSuccess", "Production order completed successfully"),
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

  const handleCompleteClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCompletionData({ batch_number: "", expiry_date: "" });
    setCompletionDialogOpen(true);
  };

  const handleConfirmComplete = () => {
    if (selectedOrderId) {
      completeMutation.mutate({ 
        id: selectedOrderId, 
        data: completionData 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      order_number: "",
      bom_id: "",
      item_id: "",
      quantity: "",
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      status: "planned",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (order: ProductionOrder) => {
    setFormData({
      order_number: order.order_number,
      bom_id: order.bom_id || "",
      item_id: order.item_id,
      quantity: order.quantity.toString(),
      start_date: new Date(order.start_date).toISOString().split('T')[0],
      due_date: order.due_date ? new Date(order.due_date).toISOString().split('T')[0] : "",
      status: order.status,
    });
    setEditingId(order.id);
    setIsDialogOpen(true);
  };

  const filteredOrders = orders.filter((order) =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getItemName = (id: string) => {
    return items.find(i => i.id === id)?.name || "-";
  };

  return (
    <PageContainer>
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("manufacturing.orders", "Production Orders")}</h1>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("common.search", "Search...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-8"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="me-2 h-4 w-4" />
              {t("manufacturing.addOrder", "Add Order")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? t("manufacturing.editOrder", "Edit Order") : t("manufacturing.addOrder", "Add Order")}
              </DialogTitle>
            </DialogHeader>
            <form id="production-order-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("manufacturing.orderNumber", "Order #")}</Label>
                  <Input
                    value={formData.order_number}
                    onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("manufacturing.bom", "BOM")}</Label>
                  <Select
                    value={formData.bom_id}
                    onValueChange={(val) => {
                      const bom = boms.find(b => b.id === val);
                      setFormData({ 
                        ...formData, 
                        bom_id: val,
                        item_id: bom?.item_id || formData.item_id 
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.select", "Select BOM...")} />
                    </SelectTrigger>
                    <SelectContent>
                      {boms.map((bom) => (
                        <SelectItem key={bom.id} value={bom.id}>
                          {bom.name} ({bom.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("manufacturing.item", "Item to Produce")}</Label>
                  <Select
                    value={formData.item_id}
                    onValueChange={(val) => setFormData({ ...formData, item_id: val })}
                    disabled={!!formData.bom_id} // Lock if BOM selected
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.select", "Select Item...")} />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("manufacturing.quantity", "Quantity")}</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("manufacturing.startDate", "Start Date")}</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("manufacturing.dueDate", "Due Date")}</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("common.status", "Status")}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">{t("status.planned", "Planned")}</SelectItem>
                    <SelectItem value="in_progress">{t("status.inProgress", "In Progress")}</SelectItem>
                    <SelectItem value="completed">{t("status.completed", "Completed")}</SelectItem>
                    <SelectItem value="cancelled">{t("status.cancelled", "Cancelled")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" form="production-order-form" disabled={createMutation.isPending || updateMutation.isPending} className="w-full sm:w-auto">
                {editingId ? t("common.save", "Save Changes") : t("common.create", "Create Order")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Completion Dialog */}
        <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("manufacturing.completeOrder", "Complete Production Order")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("inventory.batchNumber", "Batch Number (Optional)")}</Label>
                <Input
                  value={completionData.batch_number}
                  onChange={(e) => setCompletionData({ ...completionData, batch_number: e.target.value })}
                  placeholder="e.g. BATCH-001"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("inventory.expiryDate", "Expiry Date (Optional)")}</Label>
                <Input
                  type="date"
                  value={completionData.expiry_date}
                  onChange={(e) => setCompletionData({ ...completionData, expiry_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button variant="outline" onClick={() => setCompletionDialogOpen(false)} className="w-full sm:w-auto">
                {t("common.cancel", "Cancel")}
              </Button>
              <Button onClick={handleConfirmComplete} disabled={completeMutation.isPending} className="w-full sm:w-auto">
                {t("common.confirm", "Confirm Completion")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>{t("manufacturing.orderNumber", "Order #")}</TableHead>
              <TableHead>{t("manufacturing.item", "Item")}</TableHead>
              <TableHead>{t("manufacturing.quantity", "Qty")}</TableHead>
              <TableHead>{t("manufacturing.dates", "Dates")}</TableHead>
              <TableHead>{t("common.status", "Status")}</TableHead>
              <TableHead className="text-end">{t("common.actions", "Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t("common.loading", "Loading...")}
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t("manufacturing.noOrders", "No orders found")}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-muted-foreground" />
                      {order.order_number}
                    </div>
                  </TableCell>
                  <TableCell>{getItemName(order.item_id)}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="text-muted-foreground">Start: {new Date(order.start_date).toLocaleDateString(i18n.language)}</span>
                      {order.due_date && <span>Due: {new Date(order.due_date).toLocaleDateString(i18n.language)}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                      {t(`status.${order.status}`, order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    {order.status !== "completed" && order.status !== "cancelled" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCompleteClick(order.id)}
                        title={t("manufacturing.complete", "Complete Order")}
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(order)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}