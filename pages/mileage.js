import styles from '../styles/Mileage.module.css'
import Layout from '../components/Layout';
import Image from 'next/image';
import { useSession, signIn, signOut } from "next-auth/react"
import { CSVLink } from 'react-csv';
import { getToken } from "next-auth/jwt"
import { getStravaData, headers } from '../lib/strava/api/mileage-csv';
import { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen.js'

// TODO: 
// 1. Manage the before and after date hooks
// 2. Manage the conversion between Date and seconds.
// 3. Implement cache reading.

export async function getServersideProps(context){

  // If cache has no data (init request)
  // 1. If not authenticated: Return null
  // 2. If authenticated: FETCH the last 6 months.

  // If Cache has data
  // 1. If no query parameters: Return data from the cache
  // 2. If query parameters and the date range is NOT in the cache, FETCH the date range specified by the query params.
}

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function Mileage({ csvData }) {

  const { data: session } = useSession();
  
  // The Date of the before and after times.
  const [bfDate, setBfDate] = useState<Date>(null);
  const [afDate, setAfDate] = useState<Date>(null);


  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1 className={styles.h2}>Download your Mileage Log!</h1>
        <p> A readable CSV file containing all your miles! </p>
      </div>

        {/* Image Gallery – Beautiful Advertising Screenshots */}
        <div className={styles.gallery}>
            <Image
              className={styles.csvWidescreen}
              src="/csv.png"
              alt="Image of CSV File"
              width={753}
              height={406}
              priority
            />
            <Image
              className={styles.csvMobile}
              src="/csv-mobile.png"
              alt="Image of CSV File"
              width={336}
              height={400}
              priority
            />
        </div>

        <div className={styles.btnContainer}>
          <div className={styles.btnContent}>

        {/* Logged in : Options */}
        {session && (
          <>
                <p className={styles.description}>Signed in through Strava as {session.user.toString()}</p>

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

                    {/* Preview Data */}
                    <div>
                    {csvData && csvData.map(week => 
                        <div><span>Week of: {week.week} : {week.mileage}</span></div>
                    )}
                    </div>

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

// import { authOptions } from './api/auth/[...nextauth].js'
// import { unstable_getServerSession } from "next-auth/next"

// // TODO:
// // Issue: Takes too long to retrieve data from Strava
// // 1. Implement On-Demand Revalidation
// //    a. OAuth -> Load page without Data (make mileage export button invisible)
// //    b. Revalidate page when data comes in
// //    c. Make mileage export button clickable.

// // https://stackoverflow.com/questions/65752932/internal-api-fetch-with-getserversideprops-next-js
// export async function getServerSideProps(context){
//   const session = await unstable_getServerSession(context.req, context.res, authOptions)
//   const token = await getToken({req: context.req, secret: process.env.NEXTAUTH_SECRET});

//   // Rough 'n Dirty Prototype – Will let user select; LAST 6 months, max. Can generate more data if wishes.
//   const before = new Date("2023-01-30") // 01/01/23
//   const after = new Date("2022-06-30")  // 12/31/22

//   console.log("<------------ BEFORE ---------------->")
//   console.log(before);
//   console.log("<------------ AFTER ---------------->")
//   console.log(after);

//   // CHECK IF CACHE
//   const inCache = false;

//   if (session && token && (inCache == false)){
//     const start = Date.now();
//     const data = await getStravaData(token.id, session.accessToken, before, after);
//     const end = Date.now();
    
//     console.log(`<----------------------------------------------- TOTAL Execution time: ${end - start} ms ----------------------------------------------->`);
    
//     return {
//       props: {
//         csvData : data
//       }
//     }
//   }

//   // Retrieve from cache (TODO)
//   else if (session && token && inCache) {
//     var data = null;
//     return {
//       props: {
//         csvData: data
//       }
//     }
//   }

//   else 
//   return { 
//     props: {
//       csvData: null
//     }
//   }
// }