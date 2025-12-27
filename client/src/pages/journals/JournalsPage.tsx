import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function JournalsPage() {
  const { t, i18n } = useTranslation();

  const { data: journals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/journals"],
  });

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Responsive Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("accounting.journals.title")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t("accounting.journals.pageDescription")}
          </p>
        </div>
        <Link href="/journals/new">
          <Button className="w-full sm:w-auto">
            <Plus className="me-2 h-4 w-4" />
            {t("accounting.journals.new")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("accounting.journals.entries")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("accounting.journals.date")}</TableHead>
                  <TableHead>{t("accounting.journals.number")}</TableHead>
                  <TableHead>{t("accounting.journals.description")}</TableHead>
                  <TableHead>{t("accounting.journals.reference")}</TableHead>
                  <TableHead>{t("accounting.journals.source")}</TableHead>
                  <TableHead className="text-end">{t("accounting.journals.amount")}</TableHead>
                  <TableHead className="text-end">{t("accounting.journals.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">{t("common.loading")}</TableCell>
                  </TableRow>
                ) : journals?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">{t("accounting.journals.noJournals")}</TableCell>
                  </TableRow>
                ) : (
                  journals?.map((journal: any) => (
                    <TableRow key={journal.id}>
                      <TableCell>{new Date(journal.date).toLocaleDateString(i18n.language)}</TableCell>
                      <TableCell className="font-medium">{journal.journal_number}</TableCell>
                      <TableCell>{journal.description}</TableCell>
                      <TableCell>{journal.reference || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{journal.source_type || t("accounting.journals.manual")}</Badge>
                      </TableCell>
                      <TableCell className="text-end">{Number(journal.total_amount).toLocaleString(i18n.language, { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-end">
                        <Link href={`/journals/${journal.id}`}>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
