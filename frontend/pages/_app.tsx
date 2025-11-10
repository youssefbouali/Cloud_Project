import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { awsConfig, validateAwsConfig } from '../config/aws';
import { AuthService } from '../services/authService';
import { Amplify } from 'aws-amplify';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    validateAwsConfig();

    Amplify.configure({
      Auth: {
        region: awsConfig.region,
        userPoolId: awsConfig.userPoolId,
        userPoolWebClientId: awsConfig.clientId,
        identityPoolId: awsConfig.identityPoolId,
      } as any, 
      Storage: {
        region: awsConfig.region,
        bucket: awsConfig.s3Bucket,
        identityPoolId: awsConfig.identityPoolId,
      } as any,
    });

    const checkAuth = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          // User is logged in
        }
      } catch (error) {}
    };

    checkAuth();
  }, []);

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
