import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { clearAuthSession } from '@/lib/auth-storage';
import { authKeys } from './auth.keys';

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuthSession();
      // Instantly clear the user from cache so AuthButton re-renders to Login immediately
      qc.setQueryData(authKeys.me(), null);
      qc.removeQueries({ queryKey: authKeys.me() });
      router.push('/');
    },
  });
}