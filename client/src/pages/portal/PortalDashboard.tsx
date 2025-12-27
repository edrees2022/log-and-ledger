import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import PortalLayout from "./PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

export default function PortalDashboard() {
  const { t } = useTranslation();
  const { data: user } = useQuery({
    queryKey: ['portal-me'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/portal/me');
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    }
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ['portal-dashboard'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/portal/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{t("portal.welcome", "Welcome")}, {user?.contact_name}</h2>
          <p className="text-muted-foreground">{user?.company_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("portal.outstandingBalance", "Outstanding Balance")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.outstanding_amount ? `$${Number(stats.outstanding_amount).toFixed(2)}` : '$0.00'}</div>
              <p className="text-xs text-muted-foreground">
                {t("portal.totalAmountDue", "Total amount due")}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("portal.recentDocuments", "Recent Documents")}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.recent_transactions?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t("portal.inLast30Days", "In the last 30 days")}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("portal.recentActivity", "Recent Activity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.number", "Number")}</TableHead>
                  <TableHead>{t("common.date", "Date")}</TableHead>
                  <TableHead>{t("common.amount", "Amount")}</TableHead>
                  <TableHead>{t("common.status", "Status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(stats?.recent_transactions) && stats.recent_transactions.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.invoice_number || doc.bill_number}</TableCell>
                    <TableCell>{format(new Date(doc.date), 'PP')}</TableCell>
                    <TableCell>{Number(doc.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status === 'paid' ? 'default' : 'secondary'}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!stats?.recent_transactions || stats.recent_transactions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      {t("portal.noRecentDocuments", "No recent documents found")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
