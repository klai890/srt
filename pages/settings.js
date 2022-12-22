import Metadata from '../components/Metadata';
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import Link from 'next/link';
import Banner from '../components/Banner';
import Layout from '../components/Layout';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <Layout>
      <p>Change default run names!</p>
    </Layout>
  )
}
