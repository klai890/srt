import styles from '../styles/Mileage.module.css'
import Layout from '../components/Layout';
import Image from 'next/image';

import { useSession, signIn, signOut } from "next-auth/react"
import {CSVLink, CSVDownload} from 'react-csv';
import { getToken } from "next-auth/jwt"
import { formatData, headers } from '../lib/strava/api/mileage-csv';
import { authOptions } from './api/auth/[...nextauth].js'
import { unstable_getServerSession } from "next-auth/next"
// import { authenticate } from '../lib/strava/api/Authorization.js'


// https://stackoverflow.com/questions/65752932/internal-api-fetch-with-getserversideprops-next-js
export async function getServerSideProps(context){
  const session = await unstable_getServerSession(context.req, context.res, authOptions)

  // console.log("SESSION: ")
  // console.log(session);
  const token = await getToken({req: context.req, secret: process.env.NEXTAUTH_SECRET});

  // console.log('TOKEN:')
  // console.log(token);

  if (token){

    // console.log("PASSED REFRESH TOKEN:")
    // console.log(session.refreshToken);
    const data = await formatData({
      userId: token.id, 
      accessToken: session.accessToken, 
      refreshToken: session.refreshToken
    });
    
    // console.log("SERVERSIDE PROPS DATA: ")
    // console.log(data);
    
    return {
      props: {
        csvData : data
      }
    }
  }

  else 
  return { 
    props: {
      csvData: null
    }
  }
}


/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function Mileage({ csvData }) {

  const { data: session } = useSession();
  const gsheets_loggedin = false;

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

        <div className={styles.btnContainer}>
          <div className={styles.btnContent}>

        {/* Logged in : Options */}
        {session && (
          <>
                <p className={styles.description}>Signed in through Strava as {session.user}</p>

                <div className={styles.btnGrid}>

                    {csvData && (
                        <CSVLink 
                          data={csvData} 
                          headers={headers}
                          filename={"mileage.csv"}
                          className={styles.btn}
                        >
                          Export Mileage as CSV
                        </CSVLink>
                    )}
                
                
                {/* GSheets logged in */}
                { gsheets_loggedin && (
                  <>
                    <button className={styles.btn} id={styles.btn2}> Export Mileage to Google Sheets </button>
                    <div>
                      <p className={styles.description}>
                        Or if you want autoupdates, click the button below.
                        This also creates a new sheet, but automatically updates it
                        with new information from Strava.
                      </p>                    
                      <button className={styles.btn} id={styles.btn2}> Automatic Update Google Sheets </button>
                    </div>
                  </>
                )}

                {/* Gsheets not logged in */}
                { !gsheets_loggedin && (
                <>
                  <button className={styles.btn} id={styles.btn2}>
                    Connect to Google Sheets
                  </button>
                  
                </>)}

                <button className={styles.btn} id={styles.btn2} onClick={() => signOut()}>
                  Sign Out of Strava
                </button>
              </div>
          </>
        )}



        {/* Not logged in : Prompt */}
        { !session && (
            <>        
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
            </>
        )}

        </div>
      </div>

    </Layout>
  )
}
