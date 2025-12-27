import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface Company {
  id: string;
  name: string;
  base_currency: string;
  // Add other fields as needed
}

/**
 * Hook to get the current company's base currency
 * Falls back to USD if no company is selected or if the company has no currency set
 */
export function useCompanyCurrency(): string {
  const { user } = useAuth();
  
  // Fetch companies to get the current company's currency
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
    enabled: !!user,
  });
  
  // Find current company by company_id
  const currentCompany = companies.find(c => c.id === user?.company_id);
  
  // Return the company's base currency or fallback to USD
  return currentCompany?.base_currency || user?.activeCompany?.base_currency || 'USD';
}

/**
 * Hook to get the current company object
 */
export function useCurrentCompany(): Company | null {
  const { user } = useAuth();
  
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
    enabled: !!user,
  });
  
  return companies.find(c => c.id === user?.company_id) || null;
}

/**
 * Format a number as currency using the company's base currency
 */
export function useFormatCurrency() {
  const currency = useCompanyCurrency();
  
  return (amount: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      ...options,
    }).format(amount);
  };
}
