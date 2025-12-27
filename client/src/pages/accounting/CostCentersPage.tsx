import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Search, FolderTree } from "lucide-react";
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
import { CostCenter } from "@shared/schema";

export default function CostCentersPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    parent_id: "none",
  });

  const { data: costCenters = [], isLoading } = useQuery<CostCenter[]>({
    queryKey: ["/api/cost-centers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data };
      if (payload.parent_id === "none") delete payload.parent_id;
      return apiRequest("POST", "/api/cost-centers", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cost-centers"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: t("common.success"),
        description: t("accounting.costCenters.createSuccess"),
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
    mutationFn: async (data: any) => {
      const payload = { ...data };
      if (payload.parent_id === "none") payload.parent_id = null;
      return apiRequest("PUT", `/api/cost-centers/${editingId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cost-centers"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: t("common.success"),
        description: t("accounting.costCenters.updateSuccess"),
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/cost-centers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cost-centers"] });
      toast({
        title: t("common.success"),
        description: t("accounting.costCenters.deleteSuccess"),
      });
    },
  });

  const resetForm = () => {
    setFormData({ code: "", name: "", parent_id: "none" });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (center: any) => {
    setFormData({
      code: center.code,
      name: center.name,
      parent_id: center.parent_id || "none",
    });
    setEditingId(center.id);
    setIsDialogOpen(true);
  };

  const filteredCenters = costCenters.filter((center: any) =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Build hierarchy for display (simple level indentation)
  const getParentName = (parentId: string) => {
    const parent = costCenters.find((c: any) => c.id === parentId);
    return parent ? parent.name : "-";
  };

  return (
    <PageContainer>
      {/* Responsive Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("accounting.costCenters.title")}</h1>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("common.search")}
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
              {t("accounting.costCenters.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? t("accounting.costCenters.edit") : t("accounting.costCenters.add")}
              </DialogTitle>
            </DialogHeader>
            <form id="cost-center-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("accounting.costCenters.code")}</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("accounting.costCenters.name")}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("accounting.costCenters.parent")}</Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(val) => setFormData({ ...formData, parent_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.select")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("common.none")}</SelectItem>
                    {costCenters
                      .filter((c: any) => c.id !== editingId) // Prevent self-parenting
                      .map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </form>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                {t("common.cancel")}
              </Button>
              <Button type="submit" form="cost-center-form" disabled={createMutation.isPending || updateMutation.isPending} className="w-full sm:w-auto">
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            {t("accounting.costCenters.list")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("accounting.costCenters.code")}</TableHead>
                  <TableHead>{t("accounting.costCenters.name")}</TableHead>
                  <TableHead>{t("accounting.costCenters.parent")}</TableHead>
                  <TableHead className="text-end">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredCenters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {t("common.noData")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCenters.map((center: any) => (
                    <TableRow key={center.id}>
                      <TableCell className="font-medium">{center.code}</TableCell>
                      <TableCell>{center.name}</TableCell>
                      <TableCell>{getParentName(center.parent_id)}</TableCell>
                      <TableCell className="text-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(center)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(t("common.confirmDelete"))) {
                              deleteMutation.mutate(center.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
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
    </PageContainer>
  );
}
