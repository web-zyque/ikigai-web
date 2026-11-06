import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import type { ApiError } from '@/api/axios';
import type { LoginPayload, OkResponse } from '@/types/auth.types';
import { authKeys } from './auth.keys';
import { setAuthSession } from '@/lib/auth-storage';
import { useCartStore } from '@/stores/cart-store';
import { synchronizeAuthenticatedCart } from '@/services/cart-sync.service';

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<OkResponse, ApiError, LoginPayload>({
    mutationFn: authService.login,
    onSuccess: async () => {
      // Persist an immutable guest snapshot before the authenticated cart can load.
      useCartStore.getState().prepareGuestCartSync();
      setAuthSession();
      let user;
      try {
        user = await authService.me();
        useCartStore.getState().beginAuthenticatedCartSession();
        await synchronizeAuthenticatedCart(user.id, qc);
      } catch (error) {
        console.error('Failed to finish login cart synchronization:', error);
        try {
          user ??= await authService.me();
          useCartStore.getState().beginAuthenticatedCartSession();
        } catch {
          router.push('/');
          return;
        }
      }

      // Populate the user cache after the merge so CartInitializer cannot replace
      // the guest snapshot with the pre-merge server cart.
      qc.setQueryData(authKeys.me(), user);
      if (user.role === 'ADMIN' || user.role === 'STAFF') router.push('/admin');
      else router.push('/');
    },
    onError: (error) => {

      console.error('Login failed:', error.message);
    },
  });
}
