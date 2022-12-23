import Metadata from '../components/Metadata';
import { Inter } from '@next/font/google'
import styles from '../styles/components/Layout.module.css'
import Link from 'next/link';
import Banner from '../components/Banner';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] })

export default function Layout({children}){
    return (
        <div className={inter.className}>
            {/* meta content */}
            <Metadata />

            {/* Nav Bar */}
            <Banner />

            <main className={styles.main}>

                {/* load children */}
                {children}

            </main> 

            <Footer />           
        </div>
    )
}