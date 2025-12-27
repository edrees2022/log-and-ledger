import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, DollarSign, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useCompanyCurrency } from "@/hooks/use-company-currency";

export default function InventoryValuationPage() {
  const { t, i18n } = useTranslation();
  const companyCurrency = useCompanyCurrency();

  const { data: valuation, isLoading } = useQuery({
    queryKey: ["inventory-valuation"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/inventory/valuation");
      const json = await res.json();
      return Array.isArray(json) ? json : (json.data || []);
    },
  });

  const totalValue = valuation?.reduce((sum: number, item: any) => sum + item.totalValue, 0) || 0;
  const totalItems = valuation?.length || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("inventory.valuation.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("inventory.valuation.description")}</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("inventory.valuation.totalValue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat(i18n.language, { style: 'currency', currency: companyCurrency }).format(totalValue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("inventory.valuation.totalItems")}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("inventory.valuation.title")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("inventory.valuation.itemCode")}</TableHead>
                  <TableHead>{t("inventory.valuation.itemName")}</TableHead>
                  <TableHead className="text-end">{t("inventory.valuation.quantity")}</TableHead>
                  <TableHead className="text-end">{t("inventory.valuation.averageCost")}</TableHead>
                  <TableHead className="text-end">{t("inventory.valuation.value")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {valuation?.map((item: any) => (
                  <TableRow key={item.itemId}>
                    <TableCell className="font-mono">{item.itemCode}</TableCell>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell className="text-end">{item.quantity}</TableCell>
                    <TableCell className="text-end">
                      {new Intl.NumberFormat(i18n.language, { style: 'currency', currency: companyCurrency }).format(item.averageCost)}
                    </TableCell>
                    <TableCell className="text-end font-bold">
                      {new Intl.NumberFormat(i18n.language, { style: 'currency', currency: companyCurrency }).format(item.totalValue)}
                    </TableCell>
                  </TableRow>
                ))}
                {valuation?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t("common.noData")}
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
