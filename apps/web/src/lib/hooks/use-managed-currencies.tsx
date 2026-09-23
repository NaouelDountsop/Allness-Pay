import { useQuery } from '@tanstack/react-query';
import { adminService, type AdminCurrency } from '@/lib/api/admin.service';

export function useManagedCurrencies() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['managed-currencies'],
    queryFn: () => adminService.listCurrencies(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const currencies = (data ?? []) as AdminCurrency[];
  const codes = currencies.filter((currency) => currency.isActive).map((currency) => currency.code);
  const set = new Set<string>(codes);

  return { codes, set, isLoading, error };
}

export default useManagedCurrencies;
