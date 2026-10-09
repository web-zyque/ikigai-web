import api from "@/api/axios";

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export const uploadApi = {
  // Upload a single image file
  uploadImage: async (file: File): Promise<UploadResponse> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // For now, create a mock URL using placeholders
    // In a real implementation, you would:
    // 1. Upload to cloud storage (AWS S3, Cloudinary, etc.)
    // 2. Return the permanent URL
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate a realistic mock URL
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop() || 'jpg';
    
    // Using picsum.photos as a placeholder service for demo
    const mockUrl = `https://picsum.photos/800/600?random=${randomId}`;
    
    return {
      url: mockUrl,
      filename: `product-${timestamp}-${randomId}.${extension}`,
      size: file.size,
      type: file.type,
    };
  },

  // Upload multiple image files
  uploadImages: async (files: File[]): Promise<UploadResponse[]> => {
    const uploadPromises = files.map(file => uploadApi.uploadImage(file));
    return Promise.all(uploadPromises);
  },
};

// TODO: Replace with actual cloud storage implementation
// Example implementations:

// For AWS S3:
/*
uploadImage: async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
},
*/

// For Cloudinary:
/*
uploadImage: async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_upload_preset');
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );
  
  const data = await response.json();
  
  return {
    url: data.secure_url,
    filename: data.public_id,
    size: data.bytes,
    type: file.type,
  };
},
*/