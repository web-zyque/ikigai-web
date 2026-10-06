import { useMutation } from '@tanstack/react-query';
import { verifyOtp } from '@/services/auth.service';
import type { ApiError } from '@/api/axios';
import type { OkResponse, VerifyOtpPayload } from '@/types/auth.types';

export function useVerifyOtp() {
  return useMutation<OkResponse, ApiError, VerifyOtpPayload>({
    mutationFn: verifyOtp,
  });
}