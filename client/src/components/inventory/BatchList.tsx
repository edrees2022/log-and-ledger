import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface BatchListProps {
  itemId: string;
}

export function BatchList({ itemId }: BatchListProps) {
  const { t } = useTranslation();
  const { data: batches, isLoading } = useQuery<any[]>({
    queryKey: [`/api/inventory/items/${itemId}/batches`],
  });

  if (isLoading) return <div>{t("common.loading", "Loading batches...")}</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("inventory.batchLotNumbers", "Batch / Lot Numbers")}</h3>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("inventory.batchNumber", "Batch #")}</TableHead>
              <TableHead>{t("inventory.expiryDate", "Expiry Date")}</TableHead>
              <TableHead>{t("common.quantity", "Quantity")}</TableHead>
              <TableHead>{t("inventory.warehouse", "Warehouse")}</TableHead>
              <TableHead>{t("common.status", "Status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches?.map((batch: any) => (
              <TableRow key={batch.id}>
                <TableCell className="font-medium">{batch.batch_number}</TableCell>
                <TableCell>
                  {batch.expiry_date ? format(new Date(batch.expiry_date), "PP") : "-"}
                </TableCell>
                <TableCell>{batch.quantity}</TableCell>
                <TableCell>{batch.warehouse?.name || "-"}</TableCell>
                <TableCell>
                  <Badge variant={batch.is_active ? "default" : "secondary"}>
                    {batch.is_active ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {batches?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  {t("inventory.noBatches", "No batches found")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
