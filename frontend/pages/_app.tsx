import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { DataProvider } from '../context/DataContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DataProvider>
      <Component {...pageProps} />
    </DataProvider>
  );
}
