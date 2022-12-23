import Metadata from '../components/Metadata';
import { Inter } from '@next/font/google'
import styles from '../styles/Gear.module.css'
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';

const inter = Inter({ subsets: ['latin'] })

/**
 * Do a loop thing, retrieve from data base and display it.
 */

export default function Home() {
  return (
    <Layout>

      <div className={styles.pageHeader}>
        <h1 className={styles.h2}>#worshipyourshoes</h1>
      </div>

      <main className={styles.main}>
          <div className={styles.homeGrid}>

          <div className={styles.card} > 
            <Image
                src="/shoe.svg"
                alt="shoe imaeg"
                className={styles.vercelLogo}
                width={70}
                height={70}
                priority
              />
              <div className={inter.className}>
                <h2> Shoe Name </h2>
                <p className={styles.description}>
                  Dec 22, 2022 | 3 months 
                </p>
              </div>
          </div>          

          <div className={styles.card}> 
            <Image
                src="/shoe.svg"
                alt="shoe image"
                className={styles.vercelLogo}
                width={70}
                height={70}
                priority
              />
              <div className={inter.className}>
                <h2>
                  Shoe Name
                </h2>
                <p className={styles.description}>
                  Dec 22, 2022 | 3 months 
                </p>
              </div>
          </div>          
          
          <div>
            <div className={styles.card}> 
              <Image
                  src="/shoe.svg"
                  alt="shoe image"
                  className={styles.vercelLogo}
                  width={70}
                  height={70}
                  priority
                />
                <div>
                  <h2 className={inter.className}>
                    Shoe Name
                  </h2>
                  <p className={styles.description}>
                    Dec 22, 2022 | 3 months 
                  </p>
                </div>
            </div>

          </div>
          </div>
      </main>
    </Layout>
  )
}
