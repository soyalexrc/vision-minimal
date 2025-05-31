import axiosInstance from '../../lib/axios';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface MultipleUploadResult {
  success: boolean;
  uploaded: number;
  failed: number;
  results: UploadResult[];
  urls: string[];
}

export class UploadService {
  /**
   * Upload a single file
   */
  static async uploadSingle(file: File): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post<UploadResult>(`r2/upload/single`, formData);

      if (!response.status || response.status >= 400) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadMultiple(files: File[]): Promise<MultipleUploadResult> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axiosInstance.post(`r2/upload/multiple`, formData);

      if (!response.status || response.status >= 400) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('response file upload', response)

      return response.data?.data;
    } catch (error) {
      console.error('Multiple upload error:', JSON.stringify(error));
      return {
        success: false,
        uploaded: 0,
        failed: files.length,
        results: [],
        urls: [],
      };
    }
  }

  /**
   * Delete a file by key
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const encodedKey = encodeURIComponent(key);
      const response = await fetch(`/upload/${encodedKey}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  /**
   * Extract key from URL for deletion
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove leading slash
    } catch {
      return null;
    }
  }
}
