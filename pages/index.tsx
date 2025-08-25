import styles from '../styles/Mileage.module.css'
import Layout from '../components/Layout';
import Image from 'next/image';
import { useState } from 'react';
import React from 'react'
import { SIX_MONTHS, THREE_MONTHS, getPlotData,
        getStravaData, headers, MAX_CALLS, getMondays } from '../lib/strava/api/utils';
import { useSession, signIn, signOut } from "next-auth/react"
import {CSVLink} from 'react-csv';
import type ActivityWeek from '../lib/strava/models/ActivityWeek'
import { compareWeeks } from '../lib/strava/models/ActivityWeek';
import MileagePoint from '../lib/strava/models/MileagePoint';
import PlotChart from '../sections/PlotChart';

export default function Sheets(){

  const { data: session } = useSession();
  const [csvData, setData] = useState<Array<ActivityWeek> | null>(null);
  const [apiCalls, setApiCalls] = useState<number>(0);
  const [plotData, setPlotData] = useState<Array<MileagePoint> |null>(null);

  const [bfDate, setBfDate] = useState<Date | null>(new Date()); // today
  const [afDate, setAfDate] = useState<Date | null>(new Date(bfDate.valueOf() - SIX_MONTHS)); // 6 months ago

  /**
   * Fetches activity data.
   */
  const fetchData = async () => {

    const mondays : Array<Date> = getMondays(bfDate, afDate);
    
    var excludedWeeks : Array<Date> = [];
    var data : Array<ActivityWeek> = csvData ? csvData : [];
    console.log("Data: ", data)

    for (const monday of mondays) {

        console.log("data: ", data)

        // Check if we already have data for monday's week.
        const inArray : boolean = data.find(item => item.week === monday.toLocaleDateString()) ? true : false;

        // Check if we have data stored. If not, we have to fetch it.

        if (!inArray) {
          console.log("Not in array")

          try {

            // Try retrieving from databse
            const response = await fetch('/api/getTrainingData', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                strava_id: session.userid,
                week_start: monday
              })
            })

            const res = await response.json();

            if (res['error']) throw Error(res.error);

            const res_data : ActivityWeek = res;
            data.push(res_data);

          }
          catch (error) {
            // Not in database, must fetch from Strava & store in database.
            console.log("Error", error)
            excludedWeeks.push(monday);
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
      
      if (apiCalls < MAX_CALLS * 2) {

        const fetched_data : Array<ActivityWeek> | null = await getStravaData(
          session.userid, 
          session.accessToken, 
          // not getting the last week because using the mondays.
          bf, 
          af
        );
  
        setApiCalls(apiCalls + 5);
        
        // Add to database
        if (fetched_data != null){

          fetched_data.forEach(async wk => {

            try {
                const response = await fetch('/api/storeTrainingData', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    strava_id: session.userid,
                    week_start: wk.week,
                    activity_week: wk
                  }),
                  
              });

              const res = await response.json();
              console.log("Success:", res.data);
            }

            catch( error ){
              console.error("Error saving training data");
            }
            
          })

          data = data.concat(fetched_data);
          data.sort(compareWeeks)
          setData(data);
        }
      }

      else {
        alert("API calls has surpassed the maximum. Sorry!")
      }
    }

    // Massage csvData into plotData

    // The first and last date that we provide "acute load" data for
    var firstDate : Date = new Date(bfDate.valueOf() - THREE_MONTHS);
    var lastDate : Date = new Date(bfDate.valueOf());

    console.log("Final csvData:", csvData)
    var mileagePoints : Array<MileagePoint> = getPlotData(firstDate, lastDate, data);
    setPlotData(mileagePoints);

  }

  const updateData = async () => {
    setBfDate(afDate)

    // Set afDate to six months after bfDate
    setAfDate(new Date(bfDate.valueOf() - SIX_MONTHS))
    fetchData()
  }

  return (
    <Layout>
      
      <div className={styles.pageHeader}>
        <h1 className={styles.h2}>Download your Mileage Log!</h1>
        <p>Download the previous 6 month's worth of mileage as a CSV file! </p>
      </div>

      {/* Image Gallery – Beautiful Advertising Screenshots */}
      <div className={styles.gallery}>
        <Image
          className={styles.sheetsWidescreen}
          src="/sheets.png"
          alt="Image of CSV File"
          width={909}
          height={253}
          priority
        />
        <Image
          className={styles.sheetsMobile}
          src="/sheets-mobile.png"
          alt="Image of CSV File"
          width={336}
          height={166}
          priority
        />
      </div>

        {/* Not logged in : Prompt */}
        { session == undefined ? (
              <div className={styles.btnContainer}>
                <div className={styles.btnContent}>
                  <p className={styles.description}>
                    Authorize Strava to use the aforementioned services!
                  </p>

                  {!session && (
                    <button onClick={() => signIn()} className={`${styles.stravaBtn} ${styles.authBtn}`}>
                      <Image
                        src="/btn_strava_connectwith_orange.svg"
                        alt="Connect with Strava"
                        width={225}
                        height={55}
                      />
                    </button>
                  )}
            </div>
          </div>
        ) : (<></>)}

        {/* Logged in : Options */}
        { session && (
          <div className={styles.btnContainer}>
              <div className={styles.btnContent}>
                <div className={styles.btnGrid}>
                  <p>
                  <button className={styles.btn2} onClick={e => updateData()}> Generate Previous 6 Months </button>
                  </p>

                  <p>
                    Please be patient, this may take up to 10 seconds because data fetching
                    from Strava takes some time!
                  </p>

              </div>
            </div>
          </div>

        )}

        {/* Logged in : Options */}
        {session && (
          <div>
            <div className={styles.plot}>

              {plotData && (
                <>
                <div className={styles.plotContainer}>
                  <PlotChart plotData={plotData} />
                </div>
                  </>
              )}

            </div>
            <div className={styles.btnContainer}>
              <div className={styles.btnContent}>      
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

                <button className={styles.btn} id={styles.btn2} onClick={() => signOut()}>
                  Sign Out of Strava
                </button>
              </div>

            </div>
        </div>
        </div>

        )}


    </Layout>
  )
}