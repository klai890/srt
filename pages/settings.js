import Metadata from '../components/Metadata';
import { Inter } from '@next/font/google'
import styles from '../styles/Settings.module.css'
import Link from 'next/link';
import Banner from '../components/Banner';
import Layout from '../components/Layout';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1 className={styles.h2}>Change default settings!</h1>
        <p> Under construction! </p>
      </div>    
    </Layout>
  )
}
