import axios from 'axios';
import { API_URL, STORAGE_URL } from './apiConfig';
import apiRoutes from '../config/apiRoutes';
import logger from '../utils/logger';

const mediaLogger = logger.child({ service: 'mediaService' });

const MAX_SIZE_MB = 5;

/** Client-side pre-check only; MAX_SIZE_MB mirrors the backend default (CI-checked). */
export const MEDIA_CONSTRAINTS = {
  MAX_SIZE_BYTES: MAX_SIZE_MB * 1024 * 1024,
  MAX_SIZE_LABEL: `${MAX_SIZE_MB}MB`,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

export interface UploadResponse {
  url: string;
  objectKey: string;
  contentType: string;
  size: number;
}

/** What the author did to an entry's image in the form: picked a new file, removed it, or neither. */
export interface ThumbnailChange {
  file: File | null;
  removed: boolean;
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
      return { valid: false, error: `File size exceeds ${MEDIA_CONSTRAINTS.MAX_SIZE_LABEL} limit` };
    }
    return { valid: true };
  },

  /**
   * Upload an image for a specific entry
   */
  uploadEntryThumbnail: async (projectId: string, entryId: string, file: File): Promise<UploadResponse> => {
    mediaLogger.debug('Uploading entry image', { projectId, entryId, fileName: file.name, fileSize: file.size });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}${apiRoutes.entries.thumbnail(projectId, entryId)}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      mediaLogger.debug('Entry image uploaded successfully', { projectId, entryId, url: response.data.url });
      return response.data;
    } catch (error) {
      mediaLogger.error('Failed to upload entry image', error, { projectId, entryId });
      throw error;
    }
  },

  /**
   * Delete an image from a specific entry
   */
  deleteEntryThumbnail: async (projectId: string, entryId: string): Promise<void> => {
    mediaLogger.debug('Deleting entry image', { projectId, entryId });

    try {
      await axios.delete(`${API_URL}${apiRoutes.entries.thumbnail(projectId, entryId)}`, {
        withCredentials: true,
      });
      mediaLogger.debug('Entry image deleted successfully', { projectId, entryId });
    } catch (error) {
      mediaLogger.error('Failed to delete entry image', error, { projectId, entryId });
      throw error;
    }
  },

  /**
   * Apply the form's image change once the entry is saved. Returns true when the stored image
   * changed, so the caller knows to refetch. A failure is logged, not thrown: the entry itself
   * is already saved, and losing it over the image would be worse.
   */
  applyEntryThumbnailChange: async (projectId: string, entryId: string, change: ThumbnailChange): Promise<boolean> => {
    try {
      if (change.file) {
        await mediaService.uploadEntryThumbnail(projectId, entryId, change.file);
        return true;
      }
      if (change.removed) {
        await mediaService.deleteEntryThumbnail(projectId, entryId);
        return true;
      }
    } catch {
      // Already logged by the upload or delete call.
    }
    return false;
  },

  /**
   * Helper to resolve MinIO or relative storage URL to full absolute URL
   */
  getThumbnailUrl: (thumbnailPath: string | null | undefined): string | null => {
    if (!thumbnailPath) return null;
    if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
      return thumbnailPath;
    }
    return `${STORAGE_URL}/${thumbnailPath.replace(/^\/+/, '')}`;
  },
};
