import styles from '../styles/Mileage.module.css'
import Layout from '../components/Layout';
import Image from 'next/image';
import { useSession, signIn, signOut } from "next-auth/react"
import { CSVLink } from 'react-csv';
import { getToken } from "next-auth/jwt"
import { formatData, headers } from '../lib/strava/api/mileage-csv';
import { authOptions } from './api/auth/[...nextauth].js'
import { unstable_getServerSession } from "next-auth/next"


// https://stackoverflow.com/questions/65752932/internal-api-fetch-with-getserversideprops-next-js
export async function getServerSideProps(context){
  const session = await unstable_getServerSession(context.req, context.res, authOptions)
  const token = await getToken({req: context.req, secret: process.env.NEXTAUTH_SECRET});

  if (token){
    const data = await formatData({
      userId: token.id, 
      accessToken: session.accessToken, 
      refreshToken: session.refreshToken
    });
    
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
