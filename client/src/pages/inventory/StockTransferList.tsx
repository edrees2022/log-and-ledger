import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, CheckCircle, Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function StockTransferList() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: transfers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/inventory/transfers"],
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/inventory/transfers/${id}/complete`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/transfers"] });
      toast({
        title: t("common.success"),
        description: t("inventory.transferCompleted", "Stock has been moved successfully."),
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/inventory/transfers/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/transfers"] });
      toast({
        title: t("common.success"),
        description: t("inventory.transferDeleted", "Transfer deleted successfully."),
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

  if (isLoading) {
    return <div className="p-8">{t("common.loading", "Loading...")}</div>;
  }

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{t("inventory.stockTransfers", "Stock Transfers")}</h1>
          <p className="text-sm text-muted-foreground truncate">
            {t("inventory.stockTransfersDescription", "Manage internal stock movements between warehouses")}
          </p>
        </div>
        <Link href="/inventory/transfers/new">
          <Button className="shrink-0">
            <Plus className="me-2 h-4 w-4" />
            {t("inventory.newTransfer", "New Transfer")}
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle>{t("inventory.transferHistory", "Transfer History")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">{t("common.date", "Date")}</TableHead>
                  <TableHead className="whitespace-nowrap">{t("inventory.transferNumber", "Transfer #")}</TableHead>
                  <TableHead className="whitespace-nowrap">{t("inventory.fromWarehouse", "From")}</TableHead>
                  <TableHead className="whitespace-nowrap">{t("inventory.toWarehouse", "To")}</TableHead>
                  <TableHead className="whitespace-nowrap">{t("common.status", "Status")}</TableHead>
                  <TableHead className="text-end whitespace-nowrap">{t("common.items", "Items")}</TableHead>
                  <TableHead className="text-end whitespace-nowrap">{t("common.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers?.map((transfer: any) => (
                <TableRow key={transfer.id}>
                  <TableCell>{format(new Date(transfer.date), "PP")}</TableCell>
                  <TableCell className="font-medium">{transfer.transfer_number}</TableCell>
                  <TableCell>{transfer.from_warehouse.name}</TableCell>
                  <TableCell>{transfer.to_warehouse.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={transfer.status === 'completed' ? 'default' : 'secondary'}
                      className={
                        transfer.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                          : transfer.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                      }
                    >
                      {String(t(`status.${transfer.status}`, transfer.status))}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{transfer.items.length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{t("inventory.transferDetails", "Transfer Details")}: {transfer.transfer_number}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-semibold">{t("inventory.fromWarehouse", "From")}:</span> {transfer.from_warehouse.name}
                              </div>
                              <div>
                                <span className="font-semibold">{t("inventory.toWarehouse", "To")}:</span> {transfer.to_warehouse.name}
                              </div>
                              <div>
                                <span className="font-semibold">{t("common.date", "Date")}:</span> {format(new Date(transfer.date), "PP")}
                              </div>
                              <div>
                                <span className="font-semibold">{t("common.status", "Status")}:</span> {String(t(`status.${transfer.status}`, transfer.status))}
                              </div>
                            </div>
                            
                            <Table className="min-w-[400px]">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("common.item", "Item")}</TableHead>
                                  <TableHead>{t("common.sku", "SKU")}</TableHead>
                                  <TableHead className="text-end">{t("common.quantity", "Quantity")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {transfer.items.map((item: any) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{item.item.name}</TableCell>
                                    <TableCell>{item.item.sku}</TableCell>
                                    <TableCell className="text-end">{item.quantity}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            
                            {transfer.notes && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">{t("common.notes", "Notes")}:</span> {transfer.notes}
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {transfer.status === 'draft' && (
                        <Link href={`/inventory/transfers/edit/${transfer.id}`}>
                          <Button size="sm" variant="ghost" title={t("common.edit", "Edit")}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}

                      {transfer.status === 'draft' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" title={t("common.delete", "Delete")}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("inventory.deleteTransferTitle", "Delete Transfer?")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("inventory.deleteTransferDescription", "This will permanently delete this transfer. This action cannot be undone.")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteMutation.mutate(transfer.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t("common.delete", "Delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {transfer.status === 'draft' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                              <CheckCircle className="me-2 h-4 w-4" />
                              {t("approvals.approve", "Approve")}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("inventory.approveTransferTitle", "Approve Transfer?")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("inventory.approveTransferDescription", "This will immediately move stock from {{from}} to {{to}}. This action cannot be undone.", { from: transfer.from_warehouse.name, to: transfer.to_warehouse.name })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => completeMutation.mutate(transfer.id)}>
                                {t("inventory.approveAndTransfer", "Approve & Transfer")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {transfers?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t("inventory.noTransfersFound", "No transfers found")}
                  </TableCell>
                </TableRow>
              )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
