import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Loader2, 
  FileText, 
  ShoppingCart, 
  Users, 
  Package, 
  BookOpen,
  ArrowRight,
  Wallet,
  ExternalLink,
  Filter
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

interface SearchResult {
  type: 'invoice' | 'bill' | 'contact' | 'item' | 'journal' | 'account';
  id: string;
  title: string;
  subtitle?: string;
  amount?: number;
  date?: string;
  status?: string;
  link: string;
}

export default function GlobalSearchPage() {
  const { t, i18n } = useTranslation();
  const currency = useCompanyCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Search invoices
  const { data: invoices, isLoading: loadingInvoices } = useQuery({
    queryKey: ['/api/sales/invoices', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const res = await apiRequest('GET', `/api/sales/invoices?search=${encodeURIComponent(searchQuery)}`);
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  // Search bills
  const { data: bills, isLoading: loadingBills } = useQuery({
    queryKey: ['/api/purchases/bills', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const res = await apiRequest('GET', `/api/purchases/bills?search=${encodeURIComponent(searchQuery)}`);
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  // Search contacts
  const { data: contacts, isLoading: loadingContacts } = useQuery({
    queryKey: ['/api/contacts', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const res = await apiRequest('GET', `/api/contacts?search=${encodeURIComponent(searchQuery)}`);
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  // Search items
  const { data: items, isLoading: loadingItems } = useQuery({
    queryKey: ['/api/items', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const res = await apiRequest('GET', `/api/items?search=${encodeURIComponent(searchQuery)}`);
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  // Search accounts
  const { data: accounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ['/api/accounts', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const res = await apiRequest('GET', `/api/accounts?search=${encodeURIComponent(searchQuery)}`);
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  const isLoading = loadingInvoices || loadingBills || loadingContacts || loadingItems || loadingAccounts;

  // Transform results into unified format
  const allResults = useMemo((): SearchResult[] => {
    const results: SearchResult[] = [];
    
    // Add invoices
    if (Array.isArray(invoices)) {
      invoices.forEach((inv: any) => {
        results.push({
          type: 'invoice',
          id: inv.id,
          title: inv.invoice_number || `INV-${inv.id.substring(0, 8)}`,
          subtitle: inv.contact?.name || inv.customer_name,
          amount: parseFloat(inv.total) || 0,
          date: inv.date,
          status: inv.status,
          link: `/sales/invoices/${inv.id}`,
        });
      });
    }

    // Add bills
    if (Array.isArray(bills)) {
      bills.forEach((bill: any) => {
        results.push({
          type: 'bill',
          id: bill.id,
          title: bill.bill_number || `BILL-${bill.id.substring(0, 8)}`,
          subtitle: bill.contact?.name || bill.vendor_name,
          amount: parseFloat(bill.total) || 0,
          date: bill.date,
          status: bill.status,
          link: `/purchases/bills/${bill.id}`,
        });
      });
    }

    // Add contacts
    if (Array.isArray(contacts)) {
      contacts.forEach((contact: any) => {
        results.push({
          type: 'contact',
          id: contact.id,
          title: contact.name,
          subtitle: contact.type === 'customer' 
            ? t('globalSearch.customer') 
            : contact.type === 'supplier' 
              ? t('globalSearch.supplier') 
              : t('globalSearch.both'),
          link: `/contacts/${contact.id}`,
        });
      });
    }

    // Add items
    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        results.push({
          type: 'item',
          id: item.id,
          title: item.name,
          subtitle: item.sku || item.code,
          amount: parseFloat(item.selling_price) || 0,
          link: `/items/${item.id}`,
        });
      });
    }

    // Add accounts
    if (Array.isArray(accounts)) {
      accounts.forEach((account: any) => {
        results.push({
          type: 'account',
          id: account.id,
          title: `${account.code} - ${account.name}`,
          subtitle: account.account_type,
          link: `/reports/account-ledger?account=${account.id}`,
        });
      });
    }

    return results;
  }, [invoices, bills, contacts, items, accounts, t]);

  // Filter results by active tab
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return allResults;
    return allResults.filter(r => r.type === activeTab);
  }, [allResults, activeTab]);

  // Count by type
  const counts = useMemo(() => ({
    all: allResults.length,
    invoice: allResults.filter(r => r.type === 'invoice').length,
    bill: allResults.filter(r => r.type === 'bill').length,
    contact: allResults.filter(r => r.type === 'contact').length,
    item: allResults.filter(r => r.type === 'item').length,
    account: allResults.filter(r => r.type === 'account').length,
  }), [allResults]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(
      i18n.language === 'ar' ? 'ar-SA' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <FileText className="h-4 w-4 text-green-500" />;
      case 'bill': return <ShoppingCart className="h-4 w-4 text-red-500" />;
      case 'contact': return <Users className="h-4 w-4 text-blue-500" />;
      case 'item': return <Package className="h-4 w-4 text-purple-500" />;
      case 'account': return <Wallet className="h-4 w-4 text-amber-500" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'invoice': return t('globalSearch.invoice');
      case 'bill': return t('globalSearch.bill');
      case 'contact': return t('globalSearch.contact');
      case 'item': return t('globalSearch.item');
      case 'account': return t('globalSearch.account');
      default: return type;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      paid: 'default',
      unpaid: 'destructive',
      partial: 'secondary',
      draft: 'outline',
      sent: 'secondary',
      overdue: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {t(`status.${status}`, status)}
      </Badge>
    );
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">{t('globalSearch.title')}</h1>
          <p className="text-muted-foreground">{t('globalSearch.description')}</p>
        </div>
        
        {/* Search Input */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('globalSearch.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
                autoFocus
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <p className="text-sm text-muted-foreground mt-2">
                {t('globalSearch.minChars')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {searchQuery.length >= 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {t('globalSearch.results')}
                {!isLoading && (
                  <Badge variant="secondary">{allResults.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-6 mb-4">
                  <TabsTrigger value="all" className="gap-1">
                    {t('globalSearch.all')} ({counts.all})
                  </TabsTrigger>
                  <TabsTrigger value="invoice" className="gap-1">
                    <FileText className="h-4 w-4" />
                    ({counts.invoice})
                  </TabsTrigger>
                  <TabsTrigger value="bill" className="gap-1">
                    <ShoppingCart className="h-4 w-4" />
                    ({counts.bill})
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="gap-1">
                    <Users className="h-4 w-4" />
                    ({counts.contact})
                  </TabsTrigger>
                  <TabsTrigger value="item" className="gap-1">
                    <Package className="h-4 w-4" />
                    ({counts.item})
                  </TabsTrigger>
                  <TabsTrigger value="account" className="gap-1">
                    <Wallet className="h-4 w-4" />
                    ({counts.account})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>{t('globalSearch.noResults')}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('globalSearch.type')}</TableHead>
                          <TableHead>{t('globalSearch.name')}</TableHead>
                          <TableHead>{t('globalSearch.details')}</TableHead>
                          <TableHead className="text-right">{t('globalSearch.amount')}</TableHead>
                          <TableHead>{t('globalSearch.date')}</TableHead>
                          <TableHead>{t('globalSearch.status')}</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResults.map((result) => (
                          <TableRow key={`${result.type}-${result.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeIcon(result.type)}
                                <span className="text-sm text-muted-foreground">
                                  {getTypeLabel(result.type)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {result.title}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {result.subtitle}
                            </TableCell>
                            <TableCell className="text-right">
                              {result.amount ? formatCurrency(result.amount) : '-'}
                            </TableCell>
                            <TableCell>
                              {formatDate(result.date)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(result.status)}
                            </TableCell>
                            <TableCell>
                              <Link href={result.link}>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Empty state when no search */}
        {searchQuery.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  {t('globalSearch.startSearching')}
                </h3>
                <p className="text-sm max-w-md mx-auto">
                  {t('globalSearch.startSearchingDesc')}
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  <Badge variant="outline" className="gap-1">
                    <FileText className="h-3 w-3" />
                    {t('globalSearch.invoice')}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    {t('globalSearch.bill')}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    {t('globalSearch.contact')}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Package className="h-3 w-3" />
                    {t('globalSearch.item')}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Wallet className="h-3 w-3" />
                    {t('globalSearch.account')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
