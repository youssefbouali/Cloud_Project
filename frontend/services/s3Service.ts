import { Storage } from 'aws-amplify';

export const S3Service = {
  async uploadFile(
    file: File,
    fileName: string,
  ): Promise<{ key: string; url: string }> {
    try {
      const result = await Storage.put(fileName, file, {
        contentType: file.type,
        level: 'public',
      });

      return {
        key: result.key,
        url: await this.getFileUrl(result.key),
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'File upload failed',
      );
    }
  },

  async getFileUrl(key: string): Promise<string> {
    try {
      const url = await Storage.get(key, {
        level: 'public',
        expires: 3600, // 1 hour expiration
      });
      return url as string;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get file URL',
      );
    }
  },

  async deleteFile(key: string): Promise<void> {
    try {
      await Storage.remove(key, {
        level: 'public',
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'File deletion failed',
      );
    }
  },

  generateFileName(userId: string, fileExtension: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    return `activities/${userId}/${timestamp}-${randomString}.${fileExtension}`;
  },
};
