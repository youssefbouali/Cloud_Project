import '../styles/globals.css'
import { DataProvider } from '../context/DataContext'

export default function App({ Component, pageProps }) {
  return (
    <DataProvider>
      <Component {...pageProps} />
    </DataProvider>
  )
}
