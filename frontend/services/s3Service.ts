// services/s3Service.ts
import { getUrl, uploadData, remove } from 'aws-amplify/storage';

export const S3Service = {
  async uploadFile(file: File, fileName: string): Promise<{ key: string; url: string }> {
    try {
      // Upload the file
      await uploadData({
        key: fileName,
        data: file,
        options: {
          contentType: file.type,
          accessLevel: 'guest', // equivalent to 'public' in Gen 1
        },
      }).result;

      // Get the public URL
      const { url } = await getUrl({
        key: fileName,
        options: { accessLevel: 'guest' },
      });

      return {
        key: fileName,
        url: url.toString(),
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async getFileUrl(key: string): Promise<string> {
    try {
      const { url } = await getUrl({
        key,
        options: { accessLevel: 'guest' },
      });
      return url.toString();
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  },

  async deleteFile(key: string): Promise<void> {
    try {
      await remove({ key, options: { accessLevel: 'guest' } });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  generateFileName(userId: string, fileExtension: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    return `activities/${userId}/${timestamp}-${randomString}.${fileExtension}`;
  },
};