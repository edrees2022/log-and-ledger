import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Plus, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

export default function LandedCostPage() {
  const { t } = useTranslation();
  const { data: vouchers, isLoading, error } = useQuery({
    queryKey: ['landed-cost-vouchers'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/landed-cost');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch vouchers');
      }
      return res.json();
    }
  });

  // Safe access to array
  const voucherList = Array.isArray(vouchers) ? vouchers : [];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          {t("common.errorLoading", "Error loading vouchers")}: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("inventory.landedCostVouchers", "Landed Cost Vouchers")}</h1>
          <p className="text-muted-foreground">
            {t("inventory.landedCostDescription", "Allocate freight and customs costs to your inventory.")}
          </p>
        </div>
        <Link href="/inventory/landed-cost/new">
          <Button className="w-full sm:w-auto">
            <Plus className="me-2 h-4 w-4" />
            {t("inventory.newVoucher", "New Voucher")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("inventory.vouchers", "Vouchers")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : voucherList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("inventory.noLandedCostVouchers", "No landed cost vouchers found. Create one to get started.")}
            </div>
          ) : (
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("inventory.voucherNumber", "Voucher #")}</TableHead>
                  <TableHead>{t("common.date", "Date")}</TableHead>
                  <TableHead>{t("common.description", "Description")}</TableHead>
                  <TableHead>{t("inventory.method", "Method")}</TableHead>
                  <TableHead>{t("common.status", "Status")}</TableHead>
                  <TableHead className="text-end">{t("common.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voucherList.map((voucher: any) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">
                      <Link href={`/inventory/landed-cost/${voucher.id}`}>
                        <span className="cursor-pointer hover:underline text-primary flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {voucher.voucher_number}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>{format(new Date(voucher.date), 'PP')}</TableCell>
                    <TableCell>{voucher.description || '-'}</TableCell>
                    <TableCell className="capitalize">{String(t(`inventory.${voucher.allocation_method}`, voucher.allocation_method))}</TableCell>
                    <TableCell>
                      <Badge variant={voucher.status === 'posted' ? 'default' : 'secondary'}>
                        {String(t(`status.${voucher.status}`, voucher.status))}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Link href={`/inventory/landed-cost/${voucher.id}`}>
                        <Button variant="ghost" size="sm">{t("common.view", "View")}</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
