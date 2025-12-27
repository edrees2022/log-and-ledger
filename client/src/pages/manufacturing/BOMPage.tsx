import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Search, Factory, Layers, Package } from "lucide-react";
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
import { ManufacturingBom, Item } from "@shared/schema";

export default function BOMPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    item_id: "",
    version: "1.0",
    labor_cost: "0",
    overhead_cost: "0",
    is_active: true,
  });

  const { data: boms = [], isLoading } = useQuery<ManufacturingBom[]>({
    queryKey: ["/api/manufacturing/boms"],
  });

  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/manufacturing/boms", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/boms"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: t("common.success"),
        description: t("manufacturing.bomCreateSuccess", "BOM created successfully"),
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
      return apiRequest("PATCH", `/api/manufacturing/boms/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/boms"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: t("common.success"),
        description: t("manufacturing.bomUpdateSuccess", "BOM updated successfully"),
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

  const resetForm = () => {
    setFormData({
      name: "",
      item_id: "",
      version: "1.0",
      labor_cost: "0",
      overhead_cost: "0",
      is_active: true,
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

  const handleEdit = (bom: ManufacturingBom) => {
    setFormData({
      name: bom.name,
      item_id: bom.item_id,
      version: bom.version,
      labor_cost: bom.labor_cost?.toString() || "0",
      overhead_cost: bom.overhead_cost?.toString() || "0",
      is_active: bom.is_active,
    });
    setEditingId(bom.id);
    setIsDialogOpen(true);
  };

  const filteredBoms = boms.filter((bom) =>
    bom.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getItemName = (id: string) => {
    return items.find(i => i.id === id)?.name || "-";
  };

  return (
    <PageContainer>
      {/* Responsive Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("manufacturing.boms", "Bill of Materials")}</h1>
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
              {t("manufacturing.addBom", "Add BOM")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? t("manufacturing.editBom", "Edit BOM") : t("manufacturing.addBom", "Add BOM")}
              </DialogTitle>
            </DialogHeader>
            <form id="bom-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("manufacturing.bomName", "BOM Name")}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("manufacturing.version", "Version")}</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("manufacturing.finishedGood", "Finished Good")}</Label>
                <Select
                  value={formData.item_id}
                  onValueChange={(val) => setFormData({ ...formData, item_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.select", "Select Item...")} />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("manufacturing.laborCost", "Labor Cost")}</Label>
                  <Input
                    type="number"
                    value={formData.labor_cost}
                    onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("manufacturing.overheadCost", "Overhead Cost")}</Label>
                  <Input
                    type="number"
                    value={formData.overhead_cost}
                    onChange={(e) => setFormData({ ...formData, overhead_cost: e.target.value })}
                  />
                </div>
              </div>
            </form>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" form="bom-form" disabled={createMutation.isPending || updateMutation.isPending} className="w-full sm:w-auto">
                {editingId ? t("common.save", "Save Changes") : t("common.create", "Create BOM")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>{t("manufacturing.name", "Name")}</TableHead>
              <TableHead>{t("manufacturing.item", "Item")}</TableHead>
              <TableHead>{t("manufacturing.version", "Version")}</TableHead>
              <TableHead>{t("common.status", "Status")}</TableHead>
              <TableHead className="text-end">{t("common.actions", "Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {t("common.loading", "Loading...")}
                </TableCell>
              </TableRow>
            ) : filteredBoms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {t("manufacturing.noBoms", "No BOMs found")}
                </TableCell>
              </TableRow>
            ) : (
              filteredBoms.map((bom) => (
                <TableRow key={bom.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      {bom.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {getItemName(bom.item_id)}
                    </div>
                  </TableCell>
                  <TableCell>{bom.version}</TableCell>
                  <TableCell>
                    <Badge variant={bom.is_active ? "default" : "secondary"}>
                      {bom.is_active ? t("status.active", "Active") : t("status.inactive", "Inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(bom)}
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