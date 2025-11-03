import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { awsConfig, validateAwsConfig } from '../config/aws';
import { initializeAuth, AuthService } from '../services/authService';
import { Amplify } from 'aws-amplify';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Validate and initialize AWS config
    validateAwsConfig();

    // Configure Amplify with Cognito
    Amplify.configure({
      Auth: {
        region: awsConfig.region,
        userPoolId: awsConfig.userPoolId,
        userPoolWebClientId: awsConfig.clientId,
        identityPoolId: awsConfig.identityPoolId,
      },
      Storage: {
        region: awsConfig.region,
        bucket: awsConfig.s3Bucket,
        identityPoolId: awsConfig.identityPoolId,
      },
    });

    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          // User is logged in, could dispatch to Redux here
        }
      } catch (error) {
        // No user logged in
      }
    };

    checkAuth();
  }, []);

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
