import { useMutation } from "@tanstack/react-query";
import { uploadApi, type UploadResponse } from "@/services/upload.service";

export const useUploadImage = () => {
  return useMutation({
    mutationFn: (file: File) => uploadApi.uploadImage(file),
    onError: (error: unknown) => {
      console.error("Failed to upload image:", error);
    },
  });
};

export const useUploadImages = () => {
  return useMutation({
    mutationFn: (files: File[]) => uploadApi.uploadImages(files),
    onError: (error: unknown) => {
      console.error("Failed to upload images:", error);
    },
  });
};

export type { UploadResponse };