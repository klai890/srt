import { SessionProvider } from "next-auth/react"
import '../styles/globals.css'

export const SITE_DOMAIN = 'http://localhost:3002';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    // Wrap in SessionProvider such that we can use next-auth's useSession()
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}