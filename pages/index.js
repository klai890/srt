import Metadata from '../components/Metadata';
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import Link from 'next/link';
import Banner from '../components/Banner';
import Footer from '../components/Footer';
import Image from 'next/image'
import Layout from '../components/Layout';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <Layout>
        <main className={styles.main}>
        <div className={styles.homeGrid}>

          <Link href={`/mileage`} className={styles.card} > 
            <Image
                src="/milestone.svg"
                alt="cute milestone image"
                className={styles.vercelLogo}
                width={70}
                height={70}
                priority
              />
              <div>
                <h2 className={inter.className}>
                  Mileage
                </h2>
                <p className={inter.className}>
                  Track runs on Strava to automatically update a mileage log on Google Sheets!
                </p>
              </div>
          </Link>          

          <Link href={`/sheets`} className={styles.card}> 
            <Image
                src="/settings.svg"
                alt="Vercel Logo"
                className={styles.vercelLogo}
                width={70}
                height={70}
                priority
              />
              <div>
                <h2 className={inter.className}>
                  Google Sheets
                </h2>
                <p className={inter.className}>
                  Export data to Google Sheets, or even configure auto-update to add your miles to 
                  Google Sheets automatically!
                </p>
              </div>
          </Link>          
        </div>
        </main>
    </Layout>
  )
}
