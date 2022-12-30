import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import footerStyles from '../styles/components/Footer.module.css'
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] })

export default function Footer() {
  return (
    <>
      <main className={inter.className}>
        <div className={footerStyles.main}>

          {/* Powered by Strava Credit */}
          {/* <div>
            <p>Powered By</p>
            <a href="https://strava.com">
              <Image 
                src="/strava.svg"
                alt="Strava Logo"
                className={footerStyles.logo}
                width={120}
                height={60}
                priority
              />
            </a>
          </div> */}

          {/* MY personal stamp! */}
          <div> Made with ♥ by Karena Lai </div>
          </div>
      </main>
    </>
  )
}
