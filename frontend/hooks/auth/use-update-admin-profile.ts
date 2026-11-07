import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { UpdateAdminProfilePayload } from "@/services/auth.service";
import type { ApiError } from "@/api/axios";
import type { User } from "@/types/auth.types";
import { authKeys } from "./auth.keys";

export function useUpdateAdminProfile() {
  const qc = useQueryClient();

  return useMutation<User, ApiError, UpdateAdminProfilePayload>({
    mutationFn: authService.updateAdminProfile,
    onSuccess: (updatedUser) => {
      // Immediately update the cached user so the sidebar/header reflects the change
      qc.setQueryData<User>(authKeys.me(), (prev) =>
        prev ? { ...prev, ...updatedUser } : updatedUser
      );
    },
  });
}