import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';

export default function OtherTaxesPage() {
  const { t, i18n } = useTranslation();
  const { data: taxes } = useQuery<any[]>({
    queryKey: ['/api/taxes'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/taxes');
      return res.json();
    }
  });

  const rows = (taxes || []).map((tx) => ({
    id: tx.id,
    code: tx.code,
    name: tx.name,
    type: tx.tax_type,
    rate: parseFloat(tx.rate || '0'),
  }));

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('navigation.otherTaxes')}</h1>
          <p className="text-muted-foreground mt-1">{t('reports.tax.summary')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('navigation.otherTaxes')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[450px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tax.code')}</TableHead>
                  <TableHead>{t('tax.name')}</TableHead>
                  <TableHead>{t('tax.type')}</TableHead>
                  <TableHead className="text-end">{t('tax.rate')}</TableHead>
                  <TableHead className="w-28"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.code}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell className="text-end">{r.rate}%</TableCell>
                    <TableCell className="text-end">
                      <Link href={`/reports/tax/custom/${r.id}`}>
                        <Button size="sm" variant="outline">{t('common.view')}</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
