import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import bannerStyles from '../styles/components/Banner.module.css'
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] })

export default function Banner() {
  return (
    <>
      <main className={inter.className}>
        <div className={bannerStyles.banner}>
            {/* Heading */}
            <h2 id={bannerStyles.siteTitle}> 
                <Link href={'/'}>Strava Running Tools</Link>
            </h2>
        </div>
        {/* Nav */}  
        <ul className={bannerStyles.nav}>
            <li className={bannerStyles.navItem}> <Link href={'/mileage'}> Mileage </Link></li>
            <li className={bannerStyles.navItem}> <Link href={'/settings'}> Settings </Link></li>
            <li className={bannerStyles.navItem}> <Link href={'/gear'} > Equipment </Link></li>
        </ul>
      </main>
    </>
  )
}
