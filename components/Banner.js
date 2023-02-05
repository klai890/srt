import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import bannerStyles from '../styles/components/Banner.module.css'
import Link from 'next/link';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] })

export default function Banner() {
  return (
    <>
      <main className={inter.className}>
        <div className={bannerStyles.banner}>

          <div>
            {/* Logo */}

              <Image
                src="/logo.svg"
                alt="Powered by Strava"
                width={100}
                height={100}
              />
              {/* Heading */}
              <h1 id={bannerStyles.siteTitle}> 
                  <Link href={'/'}>Mileage Log for Strava</Link>
              </h1>

              <p>A Strava add-on which enables you to export your mileage log in a readable format from Strava</p>
          </div>


        </div>
        {/* Nav */}  
        <ul className={bannerStyles.nav}>
            <li className={bannerStyles.navItem}> <Link href={'/mileage'}> CSV Mileage Export </Link></li>
            <li className={bannerStyles.navItem}> <Link href={'/sheets'}> Google Sheets Mileage Export </Link></li>
            <li className={bannerStyles.navItem}> <Link href={'/autoupdate'}> Auto-Update Google Sheets </Link></li>
        </ul>
      </main>
    </>
  )
}
