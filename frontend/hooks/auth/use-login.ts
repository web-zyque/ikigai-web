import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import type { ApiError } from '@/api/axios';
import type { LoginPayload, OkResponse } from '@/types/auth.types';
import { authKeys } from './auth.keys';
import { setAuthSession } from '@/lib/auth-storage';

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<OkResponse, ApiError, LoginPayload>({
    mutationFn: authService.login,
    onSuccess: async () => {
      setAuthSession();
      await qc.invalidateQueries({ queryKey: authKeys.me() });
      router.push('/');
    },
  });
}