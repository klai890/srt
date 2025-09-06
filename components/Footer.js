import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import footerStyles from "../styles/components/Footer.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function Footer() {
  return (
    <>
      <main className={inter.className}>
        <div className={footerStyles.main}>
              <Image
                src="/api_logo_pwrdBy_strava_horiz_white.svg"
                alt="Powered by Strava"
                width={200}
                height={30}
              />
          <div> © Karena Lai </div>
        </div>
      </main>
    </>
  );
}
