import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import type { ApiError } from '@/api/axios';
import type { OkResponse, SignupPayload } from '@/types/auth.types';
import { authKeys } from './auth.keys';
import { setAuthSession } from '@/lib/auth-storage';

export function useSignup() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<OkResponse, ApiError, SignupPayload>({
    mutationFn: authService.signup,
    onSuccess: async () => {
      setAuthSession();
      try {
        const user = await authService.me();
        // Immediately seed the cache so all components see the user at once
        qc.setQueryData(authKeys.me(), user);
      } catch {
        // non-fatal; cache will be populated on next mount
      }
      router.push('/');
    },
  });
}