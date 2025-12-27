import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import PortalLayout from "./PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export default function PortalDocuments() {
  const { t } = useTranslation();
  const { data: documents, isLoading } = useQuery({
    queryKey: ['portal-documents'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/portal/documents');
      if (!res.ok) throw new Error('Failed to fetch documents');
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("portal.documents", "Documents")}</h2>
            <p className="text-muted-foreground">{t("portal.documentsDescription", "View and download your invoices and bills")}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("portal.allDocuments", "All Documents")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.type", "Type")}</TableHead>
                  <TableHead>{t("common.number", "Number")}</TableHead>
                  <TableHead>{t("common.date", "Date")}</TableHead>
                  <TableHead>{t("common.dueDate", "Due Date")}</TableHead>
                  <TableHead>{t("common.amount", "Amount")}</TableHead>
                  <TableHead>{t("common.status", "Status")}</TableHead>
                  <TableHead className="text-end">{t("common.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(documents) && documents.map((doc: any) => (
                  <TableRow key={`${doc.document_type}-${doc.id}`}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {doc.document_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{doc.number}</TableCell>
                    <TableCell>{format(new Date(doc.date), 'PP')}</TableCell>
                    <TableCell>{doc.due_date ? format(new Date(doc.due_date), 'PP') : '-'}</TableCell>
                    <TableCell>{Number(doc.total).toFixed(2)} {doc.currency}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status === 'paid' ? 'default' : 'secondary'}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!documents || !Array.isArray(documents) || documents.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {t("portal.noDocumentsFound", "No documents found")}
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
