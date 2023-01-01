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

              {/* Mandatory  */}
              <Image
                src="/api_logo_pwrdBy_strava_horiz_white.svg"
                alt="Powered by Strava"
                width={200}
                height={30}
              />

          {/* MY personal stamp! */}
          <div> © Karena Lai </div>
          </div>
      </main>
    </>
  )
}
