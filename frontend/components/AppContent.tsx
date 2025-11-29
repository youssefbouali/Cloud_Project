import { useEffect, useState } from 'react';
import { awsConfig, validateAwsConfig, loadAwsConfigFromSecrets } from '../config/aws';
import { AuthService, initializeCognito } from '../services/authService';

export default function AppContent({ Component, pageProps }: any) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!validateAwsConfig()) {
      console.error('AWS config is incomplete. Services not initialized.');
      return;
    }

    initializeCognito();

    loadAwsConfigFromSecrets('fittrack-dev-frontend-config')
      .finally(() => setReady(true));

    AuthService.getCurrentUser()
      .then(user => user && console.log('User logged in:', user))
      .catch(console.error);
  }, []);

  if (!ready) return null;
  return <Component {...pageProps} />;
}
