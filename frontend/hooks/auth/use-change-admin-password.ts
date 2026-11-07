import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { ChangePasswordPayload } from "@/services/auth.service";
import type { ApiError } from "@/api/axios";

export function useChangeAdminPassword() {
  return useMutation<{ ok: true }, ApiError, ChangePasswordPayload>({
    mutationFn: authService.changeAdminPassword,
  });
}