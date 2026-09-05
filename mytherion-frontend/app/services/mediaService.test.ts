import axios from 'axios';
import { mediaService, MEDIA_CONSTRAINTS } from './mediaService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('mediaService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateImageFile', () => {
    it('validates allowed image types', () => {
      const validPng = new File([''], 'test.png', { type: 'image/png' });
      const validJpg = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const validWebp = new File([''], 'test.webp', { type: 'image/webp' });
      const validGif = new File([''], 'test.gif', { type: 'image/gif' });

      expect(mediaService.validateImageFile(validPng).valid).toBe(true);
      expect(mediaService.validateImageFile(validJpg).valid).toBe(true);
      expect(mediaService.validateImageFile(validWebp).valid).toBe(true);
      expect(mediaService.validateImageFile(validGif).valid).toBe(true);
    });

    it('rejects disallowed file types', () => {
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      const result = mediaService.validateImageFile(pdfFile);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid file type. Allowed: JPEG, PNG, GIF, WebP');
    });

    it('rejects files exceeding the 5MB size limit', () => {
      const largeFile = new File([''], 'large.png', { type: 'image/png' });
      Object.defineProperty(largeFile, 'size', { value: MEDIA_CONSTRAINTS.MAX_SIZE_BYTES + 1 });

      const result = mediaService.validateImageFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File size exceeds 5MB limit');
    });
  });

  describe('getThumbnailUrl', () => {
    it('returns null for null/undefined input', () => {
      expect(mediaService.getThumbnailUrl(null)).toBeNull();
      expect(mediaService.getThumbnailUrl(undefined)).toBeNull();
    });

    it('returns absolute URLs as-is', () => {
      const url = 'https://s3.amazonaws.com/my-bucket/image.jpg';
      expect(mediaService.getThumbnailUrl(url)).toBe(url);
    });

    it('prefixes relative thumbnail paths with MinIO endpoint', () => {
      const result = mediaService.getThumbnailUrl('entries/1/image.jpg');
      expect(result).toBe('http://localhost:9000/entries/1/image.jpg');
    });
  });

  describe('uploadEntryThumbnail', () => {
    it('sends multipart POST request to entry thumbnail endpoint', async () => {
      const mockResponse = {
        data: {
          url: 'http://localhost:9000/mytherion-uploads/entries/1/img.png',
          objectKey: 'entries/1/img.png',
          bucketName: 'mytherion-uploads',
          contentType: 'image/png',
          size: 1024,
        },
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const file = new File(['img-content'], 'img.png', { type: 'image/png' });
      const result = await mediaService.uploadEntryThumbnail('proj-1', 'entry-1', file);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects/proj-1/entries/entry-1/thumbnail'),
        expect.any(FormData),
        expect.objectContaining({
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteEntryThumbnail', () => {
    it('sends DELETE request to entry thumbnail endpoint', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ status: 204 });

      await mediaService.deleteEntryThumbnail('proj-1', 'entry-1');

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects/proj-1/entries/entry-1/thumbnail'),
        { withCredentials: true }
      );
    });
  });
});
