import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { authKeys } from './auth.keys';

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authService.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}