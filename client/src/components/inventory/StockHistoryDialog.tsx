import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface StockHistoryDialogProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockHistoryDialog({
  itemId,
  open,
  onOpenChange,
}: StockHistoryDialogProps) {
  const { t, i18n } = useTranslation();

  const { data: history = [], isLoading, error } = useQuery({
    queryKey: ["stock-history", itemId],
    queryFn: async () => {
      if (!itemId) return [];
      const res = await fetch(`/api/inventory/items/${itemId}/history`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      console.log("Stock history response:", data);
      // Handle both array and object responses
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      if (data?.movements?.data && Array.isArray(data.movements.data)) return data.movements.data;
      return [];
    },
    enabled: !!itemId && open,
  });

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "purchase":
        return <Badge className="bg-green-500">{t("inventory.purchase")}</Badge>;
      case "sale":
        return <Badge className="bg-blue-500">{t("inventory.sale")}</Badge>;
      case "adjustment":
        return <Badge className="bg-yellow-500">{t("inventory.adjustment")}</Badge>;
      case "transfer_in":
        return <Badge className="bg-purple-500">{t("inventory.transferIn")}</Badge>;
      case "transfer_out":
        return <Badge className="bg-orange-500">{t("inventory.transferOut")}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-2 shrink-0">
          <DialogTitle>{t("inventory.stockHistory")}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex justify-center p-8 text-muted-foreground">
            {t("common.errorLoading", { defaultValue: "حدث خطأ في تحميل البيانات" })}
          </div>
        ) : (
          <div className="flex-1 overflow-auto px-4 pb-4">
            <div className="min-w-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-background">{t("common.date")}</TableHead>
                    <TableHead className="sticky top-0 bg-background">{t("common.type")}</TableHead>
                    <TableHead className="sticky top-0 bg-background text-end">{t("common.quantity")}</TableHead>
                    <TableHead className="sticky top-0 bg-background text-end">{t("common.unitCost")}</TableHead>
                    <TableHead className="sticky top-0 bg-background text-end">{t("common.totalCost")}</TableHead>
                    <TableHead className="sticky top-0 bg-background">{t("common.reference")}</TableHead>
                    <TableHead className="sticky top-0 bg-background">{t("common.notes")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {history?.map((movement: any) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {new Date(movement.transaction_date).toLocaleDateString(i18n.language)}
                    </TableCell>
                    <TableCell>
                      {getTransactionTypeBadge(movement.transaction_type)}
                    </TableCell>
                    <TableCell className={
                      ["sale", "transfer_out"].includes(movement.transaction_type) 
                        ? "text-red-600 text-end" 
                        : "text-green-600 text-end"
                    }>
                      {["sale", "transfer_out"].includes(movement.transaction_type) ? "-" : "+"}
                      {movement.quantity}
                    </TableCell>
                    <TableCell className="text-end">{movement.unit_cost}</TableCell>
                    <TableCell className="text-end">{movement.total_cost}</TableCell>
                    <TableCell>
                      {movement.reference_type} #{movement.reference_id}
                    </TableCell>
                    <TableCell>{movement.notes}</TableCell>
                  </TableRow>
                ))}
                {history?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("common.noData")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
