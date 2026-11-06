import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import type { ApiError } from '@/api/axios';
import type { OkResponse, SignupPayload } from '@/types/auth.types';
import { authKeys } from './auth.keys';
import { setAuthSession } from '@/lib/auth-storage';
import { useCartStore } from '@/stores/cart-store';
import { synchronizeAuthenticatedCart } from '@/services/cart-sync.service';

export function useSignup() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<OkResponse, ApiError, SignupPayload>({
    mutationFn: authService.signup,
    onSuccess: async () => {
      useCartStore.getState().prepareGuestCartSync();
      setAuthSession();
      let user;
      try {
        user = await authService.me();
        useCartStore.getState().beginAuthenticatedCartSession();
        await synchronizeAuthenticatedCart(user.id, qc);
      } catch (error) {
        console.error('Failed to finish signup cart synchronization:', error);
        try {
          user ??= await authService.me();
          useCartStore.getState().beginAuthenticatedCartSession();
        } catch {
          router.push('/');
          return;
        }
      }
      qc.setQueryData(authKeys.me(), user);
      router.push('/');
    },
  });
}
