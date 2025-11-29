// pages/_app.tsx
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import dynamic from 'next/dynamic';
import '../styles/globals.css';
import '../styles/auth.css';
import '../styles/coach-dashboard.css';

const AppContent = dynamic(() => import('../components/AppContent'), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AppContent Component={Component} pageProps={pageProps} />
    </Provider>
  );
}
