import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { authKeys } from './auth.keys';
import { hasAuthSession } from '@/lib/auth-storage';

export function useMe(options?: { enabled?: boolean }) {
  const isEnabled = options?.enabled ?? (typeof window !== 'undefined' ? hasAuthSession() : false);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authService.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: isEnabled,
  });
}