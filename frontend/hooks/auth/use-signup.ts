import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import type { ApiError } from '@/api/axios';
import type { OkResponse, SignupPayload } from '@/types/auth.types';
import { authKeys } from './auth.keys';

export function useSignup() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<OkResponse, ApiError, SignupPayload>({
    mutationFn: authService.signup,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: authKeys.me() });
      router.push('/');
    },
  });
}