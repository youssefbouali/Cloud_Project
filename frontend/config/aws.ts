import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { AuthService } from '../services/authService';

export const awsConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
  identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || '',
  s3Bucket: process.env.NEXT_PUBLIC_S3_BUCKET || '',
  cloudFrontDomain: process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || '',
  apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5000',
};

console.log("AWS Config:", awsConfig);

export const validateAwsConfig = () => {
  const requiredVars = [
    'region',
    'userPoolId',
    'clientId',
    'identityPoolId',
    's3Bucket',
  ];

  const missing = requiredVars.filter((key) => !awsConfig[key as keyof typeof awsConfig]);

  if (missing.length > 0) {
    console.warn(
      `Missing AWS configuration: ${missing.join(', ')}. Some features may not work.`,
    );
  }

  return missing.length === 0;
};

export const loadAwsConfigFromSecrets = async (secretId: string): Promise<void> => {
  try {
    const idToken = await AuthService.getIdToken();
    if (!idToken) return;

    if (!awsConfig.identityPoolId || !awsConfig.userPoolId || !awsConfig.region) return;

    const credentials = fromCognitoIdentityPool({
      clientConfig: { region: awsConfig.region },
      identityPoolId: awsConfig.identityPoolId,
      logins: {
        [`cognito-idp.${awsConfig.region}.amazonaws.com/${awsConfig.userPoolId}`]: idToken,
      },
    });

    const sm = new SecretsManagerClient({ region: awsConfig.region, credentials });
    const res = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));
    const raw = res.SecretString || '';
    if (!raw) return;
    const data = JSON.parse(raw);

    awsConfig.region = data.region || awsConfig.region;
    awsConfig.s3Bucket = data.s3Bucket || awsConfig.s3Bucket;
    awsConfig.cloudFrontDomain = data.cloudFrontDomain || awsConfig.cloudFrontDomain;
    awsConfig.apiEndpoint = data.apiEndpoint || awsConfig.apiEndpoint;
    awsConfig.identityPoolId = data.identityPoolId || awsConfig.identityPoolId;
    awsConfig.userPoolId = data.userPoolId || awsConfig.userPoolId;
    awsConfig.clientId = data.clientId || awsConfig.clientId;
  } catch (e) {
    console.error('Failed to load config from Secrets Manager:', e);
  }
};
