import Head from "next/head";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import bannerStyles from "../styles/components/Banner.module.css";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export default function Banner() {
  return (
    <>
      <main className={inter.className}>
        <div className={bannerStyles.banner}>
          <div>
            {/* Heading */}
            <h1 id={bannerStyles.siteTitle}>
              <Link href={"/"}>Running Stats</Link>
            </h1>

            <p>Interesting statistics from your runs on Strava!</p>
          </div>
        </div>
      </main>
    </>
  );
}
