import api from "@/api/axios";

export interface UploadResponse {
  imageUrl: string;
  publicId: string;
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB – matches backend limit

export const uploadApi = {

  uploadImage: async (
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<UploadResponse> => {
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
      );
    }

    if (file.size > MAX_SIZE) {
      throw new Error("File size must be less than 10 MB.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<UploadResponse>(
      "/uploads/product-image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      },
    );

    return response.data;
  },


  uploadImages: async (files: File[]): Promise<UploadResponse[]> => {
    return Promise.all(files.map((file) => uploadApi.uploadImage(file)));
  },
};