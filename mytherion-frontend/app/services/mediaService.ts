import axios from 'axios';
import { API_URL, STORAGE_URL } from './apiConfig';
import logger from '../utils/logger';

const mediaLogger = logger.child({ service: 'mediaService' });

export const MEDIA_CONSTRAINTS = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

export interface UploadResponse {
  url: string;
  objectKey: string;
  bucketName: string;
  contentType: string;
  size: number;
}

export const mediaService = {
  /**
   * Validate image file type and size constraints
   */
  validateImageFile: (file: File): { valid: boolean; error?: string } => {
    if (!MEDIA_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' };
    }
    if (file.size > MEDIA_CONSTRAINTS.MAX_SIZE_BYTES) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }
    return { valid: true };
  },

  /**
   * Upload an image for a specific entity
   */
  uploadEntityImage: async (projectId: string, entityId: string, file: File): Promise<UploadResponse> => {
    mediaLogger.debug('Uploading entity image', { projectId, entityId, fileName: file.name, fileSize: file.size });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/projects/${projectId}/entities/${entityId}/image`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      mediaLogger.debug('Entity image uploaded successfully', { projectId, entityId, url: response.data.url });
      return response.data;
    } catch (error) {
      mediaLogger.error('Failed to upload entity image', error, { projectId, entityId });
      throw error;
    }
  },

  /**
   * Delete an image from a specific entity
   */
  deleteEntityImage: async (projectId: string, entityId: string): Promise<void> => {
    mediaLogger.debug('Deleting entity image', { projectId, entityId });

    try {
      await axios.delete(`${API_URL}/api/projects/${projectId}/entities/${entityId}/image`, {
        withCredentials: true,
      });
      mediaLogger.debug('Entity image deleted successfully', { projectId, entityId });
    } catch (error) {
      mediaLogger.error('Failed to delete entity image', error, { projectId, entityId });
      throw error;
    }
  },

  /**
   * Helper to resolve MinIO or relative storage URL to full absolute URL
   */
  getImageUrl: (thumbnailPath: string | null | undefined): string | null => {
    if (!thumbnailPath) return null;
    if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
      return thumbnailPath;
    }
    return `${STORAGE_URL}/${thumbnailPath.replace(/^\/+/, '')}`;
  },
};
