import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { ApiError } from '@/api/axios';
import type { OkResponse, SendOtpPayload } from '@/types/auth.types';

export function useSendOtp() {
  return useMutation<OkResponse, ApiError, SendOtpPayload>({
    mutationFn: authService.sendOtp,
  });
}