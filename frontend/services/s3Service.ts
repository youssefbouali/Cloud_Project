import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { awsConfig } from '../config/aws';
import { AuthService } from './authService';

let s3Client: S3Client;

export const initializeS3 = (idToken?: string) => {
  if (!awsConfig.identityPoolId) {
    console.error('Identity Pool ID is not configured');
    return;
  }

  if (!idToken) {
    console.error('Cognito idToken is required to initialize S3 for authenticated identity');
    return;
  }

  const credentialProvider = fromCognitoIdentityPool({
    clientConfig: { region: awsConfig.region },
    identityPoolId: awsConfig.identityPoolId,
    logins: {
      [`cognito-idp.${awsConfig.region}.amazonaws.com/${awsConfig.userPoolId}`]: idToken,
    },
  });

  s3Client = new S3Client({
    region: awsConfig.region,
    credentials: credentialProvider,
  });
};

const getS3Client = async (): Promise<S3Client> => {
  if (!s3Client) {
    const idToken = await AuthService.getIdToken();
    if (!idToken) {
      throw new Error('NotAuthorizedException: Authenticated Cognito idToken required for S3');
    }
    initializeS3(idToken);
  }
  return s3Client;
};

export const S3Service = {
  async uploadFile(file: File, fileName: string): Promise<{ key: string; url: string }> {
    try {
      const client = await getS3Client();
      const fileArrayBuffer = await file.arrayBuffer();

      const command = new PutObjectCommand({
        Bucket: awsConfig.s3Bucket,
        Key: fileName,
        Body: new Uint8Array(fileArrayBuffer),
        ContentType: file.type,
      });

      await client.send(command);

      const url = await S3Service.getFileUrl(fileName);
      return {
        key: fileName,
        url,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const client = await getS3Client();
      const command = new GetObjectCommand({
        Bucket: awsConfig.s3Bucket,
        Key: key,
      });

      const url = await getSignedUrl(client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  },

  async deleteFile(key: string): Promise<void> {
    try {
      const client = await getS3Client();
      const command = new DeleteObjectCommand({
        Bucket: awsConfig.s3Bucket,
        Key: key,
      });

      await client.send(command);
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
