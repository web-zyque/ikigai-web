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
      setAuthSession();

      let user;
      try {
        user = await authService.me();
      } catch {
        router.push('/');
        return;
      }

      qc.setQueryData(authKeys.me(), user);

      // Admins and staff have no cart — skip cart sync entirely
      if (user.role === 'ADMIN' || user.role === 'STAFF') {
        router.push('/admin');
        return;
      }

      // Customer flow: sync guest cart then navigate
      useCartStore.getState().prepareGuestCartSync();
      useCartStore.getState().beginAuthenticatedCartSession();

      try {
        await synchronizeAuthenticatedCart(user.id, qc);
      } catch (error) {
        console.error('Failed to finish login cart synchronization:', error);
      }

      router.push('/');
    },
    onError: (error) => {
      console.error('Login failed:', error.message);
    },
  });
}