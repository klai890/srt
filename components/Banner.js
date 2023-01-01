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
                  <Link href={'/'}>Strava Running Tools</Link>
              </h1>

              <p>A set of tools which makes using Strava easier for runners. Made by a random kid, NOT affiliated with Strava</p>


          </div>


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
