import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import type { ApiError } from '@/api/axios';
import type { LoginPayload, OkResponse } from '@/types/auth.types';
import { authKeys } from './auth.keys';

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<OkResponse, ApiError, LoginPayload>({
    mutationFn: authService.login,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: authKeys.me() });
      router.push('/');
    },
  });
}