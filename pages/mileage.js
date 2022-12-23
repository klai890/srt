import styles from '../styles/Mileage.module.css'
import Layout from '../components/Layout';
import Image from 'next/image';

export default function Mileage() {
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1 className={styles.h2}>Strava, I want a mileage log!</h1>
        <p> Track runs on Strava to automatically update a mileage log on Google Sheets! </p>
      </div>

        {/* Image Gallery */}
        <div className={styles.gallery}>

          <div className={styles.card}>
            <Image
              src="/shoe.svg"
              alt="Gallery Image"
              width={100}
              height={100}
              priority
            />
          </div>
          <div className={styles.card}>
            <Image
              src="/shoe.svg"
              alt="Gallery Image"
              width={100}
              height={100}
              priority
            />
          </div>
          <div className={styles.card}>
            <Image
              src="/shoe.svg"
              alt="Gallery Image"
              width={100}
              height={100}
              priority
            />
          </div>
          <div className={styles.card}>
            <Image
              src="/shoe.svg"
              alt="Gallery Image"
              width={100}
              height={100}
              priority
            />
          </div>
        </div>

    </Layout>
  )
}
