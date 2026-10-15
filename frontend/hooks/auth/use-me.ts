import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { authKeys } from './auth.keys';

export function useMe(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? (typeof window !== 'undefined');

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authService.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}