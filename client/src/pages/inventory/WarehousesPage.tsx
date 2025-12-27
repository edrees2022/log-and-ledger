import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

export default function WarehousesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  const [newWarehouse, setNewWarehouse] = useState({
    code: "",
    name: "",
    location: "",
    is_active: true
  });

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/inventory/warehouses");
      const json = await res.json();
      return Array.isArray(json) ? json : (json.data || []);
    },
  });

  const createWarehouseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/inventory/warehouses", data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create warehouse");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      setIsCreateOpen(false);
      setNewWarehouse({
        code: "",
        name: "",
        location: "",
        is_active: true
      });
      toast({
        title: t("common.success"),
        description: t("inventory.warehouses.createdDesc"),
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

  const updateWarehouseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/inventory/warehouses/${data.id}`, data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update warehouse");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      setIsEditOpen(false);
      setEditingWarehouse(null);
      toast({
        title: t("common.success"),
        description: t("inventory.warehouses.updatedDesc", { defaultValue: "Warehouse updated successfully" }),
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
    createWarehouseMutation.mutate(newWarehouse);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWarehouseMutation.mutate(editingWarehouse);
  };

  const openEditDialog = (warehouse: any) => {
    setEditingWarehouse({ ...warehouse });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("inventory.warehouses.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("inventory.warehouses.description")}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="me-2 h-4 w-4" />
              {t("inventory.warehouses.addWarehouse")}
            </Button>
          </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("inventory.warehouses.addWarehouse")}</DialogTitle>
                <DialogDescription>
                  {t("inventory.warehouses.details")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">{t("inventory.warehouses.code")}</Label>
                  <Input
                    id="code"
                    value={newWarehouse.code}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, code: e.target.value })}
                    required
                    placeholder="WH-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t("inventory.warehouses.name")}</Label>
                  <Input
                    id="name"
                    value={newWarehouse.name}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                    required
                    placeholder="Main Warehouse"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{t("inventory.warehouses.location")}</Label>
                  <Input
                    id="location"
                    value={newWarehouse.location}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
                    placeholder="123 Storage Lane"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createWarehouseMutation.isPending}>
                    {createWarehouseMutation.isPending ? t("common.creating") : t("common.create")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("inventory.warehouses.title")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[450px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("inventory.warehouses.code")}</TableHead>
                  <TableHead>{t("inventory.warehouses.name")}</TableHead>
                  <TableHead>{t("inventory.warehouses.location")}</TableHead>
                  <TableHead>{t("inventory.warehouses.status")}</TableHead>
                  <TableHead className="text-end">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">{t("common.loading")}</TableCell>
                  </TableRow>
                ) : warehouses?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {t("common.noData")}
                    </TableCell>
                  </TableRow>
                ) : (
                  warehouses?.map((warehouse: any) => (
                    <TableRow key={warehouse.id}>
                      <TableCell className="font-medium">{warehouse.code}</TableCell>
                      <TableCell>{warehouse.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {warehouse.location || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={warehouse.is_active ? 'default' : 'secondary'}>
                          {warehouse.is_active ? t("inventory.warehouses.active") : t("inventory.warehouses.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(warehouse)}
                        >
                          <Edit className="h-4 w-4 me-1" />
                          {t("common.edit")}
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("inventory.warehouses.editWarehouse", { defaultValue: "Edit Warehouse" })}</DialogTitle>
            <DialogDescription>
              {t("inventory.warehouses.editDetails", { defaultValue: "Update warehouse details" })}
            </DialogDescription>
          </DialogHeader>
          {editingWarehouse && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">{t("inventory.warehouses.code")}</Label>
                <Input
                  id="edit-code"
                  value={editingWarehouse.code}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t("inventory.warehouses.name")}</Label>
                <Input
                  id="edit-name"
                  value={editingWarehouse.name}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">{t("inventory.warehouses.location")}</Label>
                <Input
                  id="edit-location"
                  value={editingWarehouse.location || ''}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, location: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>{t("inventory.warehouses.status")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {editingWarehouse.is_active ? t("inventory.warehouses.active") : t("inventory.warehouses.inactive")}
                  </p>
                </div>
                <Switch
                  checked={editingWarehouse.is_active}
                  onCheckedChange={(checked) => setEditingWarehouse({ ...editingWarehouse, is_active: checked })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={updateWarehouseMutation.isPending}>
                  {updateWarehouseMutation.isPending ? t("common.saving") : t("common.save")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
