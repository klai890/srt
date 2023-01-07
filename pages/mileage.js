import styles from '../styles/Mileage.module.css'
import Layout from '../components/Layout';
import Image from 'next/image';

import { useSession, signIn, signOut } from "next-auth/react"
import {CSVLink, CSVDownload} from 'react-csv';
import { getToken } from "next-auth/jwt"
import { formatData, headers } from '../lib/strava/api/mileage-csv';


export async function getServerSideProps(context){
  const token = await getToken({req: context.req, secret: process.env.NEXTAUTH_SECRET});
  // console.log('SERVERSIDE PROPS TOKEN: ')
  // console.log(token);
  const data = await formatData(token.id);
  
  // console.log("SERVERSIDE PROPS DATA: ")
  // console.log(data);

  return {
    props: {
      csvData : data
    }
  }
}


/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function Mileage({ csvData }) {

  console.log("CSV DATA: ")
  console.log(csvData);

  const { data: session } = useSession();

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1 className={styles.h2}>Strava, I want a mileage log!</h1>
        <p> Track runs on Strava to automatically update a mileage log on Google Sheets! </p>
      </div>

        {/* Image Gallery – Beautiful Advertising Screenshots */}
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

        {/* Logged in : Options */}
        {session && (
          <>
            <div className={styles.btnContainer}>
              <div className={styles.btnContent}>
                <p className={styles.description}>Signed in through Strava as {session.user.name}</p>

                <div className={styles.btnGrid}>

                <button className={styles.btn} id={styles.btn1}>
                  {csvData && (
                      <CSVLink data={csvData} headers={headers}>
                      Export CSV
                      </CSVLink>
                  )}
                </button>

                <button className={styles.btn} id={styles.btn2}>  {/*onClick={() => signIn()} className={styles.stravaBtn}> */}
                  Connect to Google Sheets
                </button>
                
                <button className={styles.btn} id={styles.btn2} onClick={() => signOut()}>
                  Sign Out
                </button>
                </div>
              </div>

            </div>
          </>
        )}


        {/* Not logged in : Prompt */}
        { !session && (
            <>
              <div className={styles.btnContainer}>
        
                <div className={styles.btnContent}>
        
                  <p className={styles.description}>
                    Please authorize Strava to use the aforementioned services!
                  </p>
        
                  <button onClick={() => signIn()} className={styles.stravaBtn}>
                    <Image
                      src="/btn_strava_connectwith_orange.svg"
                      alt="Connect with Strava"
                      width={225}
                      height={55}
                    />
                  </button>
                </div>
        
              </div>
            </>
        )}

    </Layout>
  )
}
