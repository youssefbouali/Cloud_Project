export const awsConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
  identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || '',
  s3Bucket: process.env.NEXT_PUBLIC_S3_BUCKET || '',
  cloudFrontDomain: process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || '',
  apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5000',
};

export const validateAwsConfig = () => {
  const requiredVars = [
    'region',
    'userPoolId',
    'clientId',
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
