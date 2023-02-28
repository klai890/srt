import styles from '../styles/Mileage.module.css'
import Layout from '../components/Layout';
import Image from 'next/image';
import { useSession, signIn, signOut } from "next-auth/react"
import { CSVLink } from 'react-csv';
import { getStravaData, headers } from '../lib/strava/api/mileage-csv';
import { useEffect, useState } from 'react';
import {getMondays} from '../src/cache'
import ActivityWeek, { compareWeeks } from '../lib/strava/models/ActivityWeek';

export default function Mileage(){

  const { data: session } = useSession();
  const [bfDate, setBfDate] = useState<Date | null>(new Date());
  const [afDate, setAfDate] = useState<Date | null>(new Date(bfDate.valueOf() - 6*2.628e+9));
  const [apiCalls, setApiCalls] = useState<number>(0);

  // Data shown to user.
  const [csvData, setData] = useState<Array<ActivityWeek> | null>(null);

  /**
   * Fetches activity data.
   */
  const fetchData = async () => {

    const mondays : Array<Date> = getMondays(bfDate, afDate);
    
    var excludedWeeks : Array<Date> = [];
    var data : Array<ActivityWeek> = csvData ? csvData : [];
    for (const monday of mondays) {
        const inArray : boolean = data.find(item => item.week === monday.toLocaleDateString()) ? true : false;

        if (!inArray) {
          const cached_response : string | null = localStorage.getItem(monday.toLocaleDateString())
          
          if (cached_response == null){
            excludedWeeks.push(monday);
          }

          else {
            data.push(JSON.parse(cached_response) as ActivityWeek)
          }
        }
    }

    // All dates in cache.
    if (excludedWeeks.length == 0) {
      data.sort(compareWeeks)
      setData(data);
    }

    // Fetch missing weeks.
    else {

      var bf = new Date(excludedWeeks[excludedWeeks.length - 1])
      bf.setDate(bf.getDate() + 7)
      if (bf.valueOf() > Date.now()) bf = new Date(); // make sure it gets the entirety of the week.
      var af = excludedWeeks[0];
      
      if (apiCalls < 10) {
        const fetched_data : Array<ActivityWeek> | null = await getStravaData(
          session.userid, 
          session.accessToken, 
          // not getting the last week because using the mondays.
          bf, 
          af
        );
  
        setApiCalls(apiCalls + 5);
        
        // Add to local storage.
        if (fetched_data != null){
          fetched_data.forEach(wk => localStorage.setItem(wk.week, JSON.stringify(wk)));
          data = data.concat(fetched_data);
          data.sort(compareWeeks)
          setData(data);
        }
      }

      else {
        alert("API calls has surpassed 10. Sorry!")
      }
    }
    
  }

  const updateData = async () => {
    setBfDate(afDate)
    setAfDate(new Date(bfDate.valueOf() - 6*2.628e+9))
    fetchData()
  }
  
  /**
   * Retrieves data
   */
  useEffect(() => {
    if (session != null && csvData == null) {
      fetchData();
    }
  }, [bfDate, afDate]
  )

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
                    <h3>Export the your 6 months of mileage:</h3>
                    {csvData != null && (
                        <CSVLink 
                          data={csvData} 
                          headers={headers}
                          filename={"mileage.csv"}
                          className={styles.btn}
                        >
                          Export Mileage as CSV
                        </CSVLink>
                    )}

                    <h3>Select additional date ranges to export</h3>

                    <label><strong>Date time picker</strong></label>
                    
                    <p>
                    <button onClick={e => updateData()}> Generate Previous 6 Months </button>

                    </p>


                    {/* Preview Data */}
                    <div>
                    {csvData != null && csvData.map((week, id) => 
                        <div key={id}>Week of: {week.week} : {week.mileage}</div>
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