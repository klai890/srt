import styles from '../styles/Mileage.module.css'
import Layout from '../components/Layout';
import Image from 'next/image';
import { useState } from 'react';
import React from 'react'
import { getStravaData, MAX_CALLS } from '../lib/strava/api/utils';
import { getMondays, SIX_MONTHS, THREE_MONTHS } from '../utils/utils';
import { useSession, signIn, signOut } from "next-auth/react"
import type ActivityWeek from '../lib/strava/models/ActivityWeek'
import { compareWeeks } from '../lib/strava/models/ActivityWeek';
import MileagePoint from '../lib/strava/models/MileagePoint';
import PlotChart from '../sections/PlotChart';
import { ONE_MONTH } from '../utils/utils';
import { getMileagePlotData } from '../utils/weeklyMileagePlot';
import CalHeatmap from '../components/CalHeatmap';

export default function Sheets(){

  const { data: session } = useSession();
  const [csvData, setData] = useState<Array<ActivityWeek> | null>(null);
  const [apiCalls, setApiCalls] = useState<number>(0);
  
  const [bfDate, setBfDate] = useState<Date | null>(new Date()); // today
  const [afDate, setAfDate] = useState<Date | null>(new Date(bfDate.valueOf() - SIX_MONTHS)); // 6 months ago
  
  const [viz, setViz] = useState<number>(0);
  const [weekMileagePlotData, setWeekMileagePlotData] = useState<Array<MileagePoint> |null>(null);
  const [monthMileagePlotData, setMonthMileagePlotData] = useState<Array<MileagePoint> |null>(null);
  const [heatmapData, setHeatmapData] = useState<Array<ActivityWeek>>([]);
  // const [dists, setDists] = useState<Array<MonthMileagePoint> |null>(null);

  // Fetch activity from database and/or Strava
  const fetchData = async () => {
    const mondays : Array<Date> = getMondays(bfDate, afDate);
    
    var excludedWeeks : Array<Date> = [];
    var data : Array<ActivityWeek> = csvData ? csvData : [];

    for (const monday of mondays) {
        // Check if we already have data for monday's week.
        const inArray : boolean = data.find(item => item.week === monday.toLocaleDateString()) ? true : false;

        // Try retrieving from database, before fetching from Strava
        if (!inArray) {
          try {
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
            console.error("Error", error)
            excludedWeeks.push(monday);
          }          
        }
    }

    // All dates cached.
    if (excludedWeeks.length == 0) {
      data.sort(compareWeeks)
      setData(data);
    }

    // Fetch missing data from Strava
    else {
      var bf = new Date(excludedWeeks[excludedWeeks.length - 1])
      bf.setDate(bf.getDate() + 7)
      if (bf.valueOf() > Date.now()) bf = new Date(); // make sure it gets the entirety of the week.
      var af = excludedWeeks[0];
      
      if (apiCalls < MAX_CALLS * 2) {

        const fetched_data : Array<ActivityWeek> | null = await getStravaData(
          session.userid, 
          session.accessToken, 
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

    // The first and last date that we provide "acute load" data for
    var firstDate : Date = new Date(bfDate.valueOf() - THREE_MONTHS);
    var lastDate : Date = new Date(bfDate.valueOf());

    var weekMileagePoints : Array<MileagePoint> = getMileagePlotData(firstDate, lastDate, data);
    setWeekMileagePlotData(weekMileagePoints);

    var monthMileagePoints : Array<MileagePoint> = getMileagePlotData(firstDate, lastDate, data, ONE_MONTH);
    setMonthMileagePlotData(monthMileagePoints);
    setHeatmapData(data);
  }

  const updateData = async () => {
    setBfDate(afDate)
    setAfDate(new Date(bfDate.valueOf() - SIX_MONTHS))
    fetchData()
  }

  return (
    <Layout>
      {/* Not logged in : Prompt */}
      { session == undefined ? (
        <div className={styles.btnContainer}>
          <div className={styles.btnContent}>
            <p className={styles.description}>Authorize Strava to use the aforementioned services!</p>

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
      {session && (
        <div>
          <div className={styles.mainContainer}>
            {/* Left-side menu to select visualizations */}
            <div className={styles.menuContainer}>
              <h2 className={styles.menuHeader}> Visualizations </h2>
              <p className={styles.menuItem} onClick={()=>setViz(0)}>Weekly Mileage Plot</p>
              <p className={styles.menuItem} onClick={()=>setViz(1)}>Monthly Mileage Plot</p>
              <p className={styles.menuItem} onClick={()=>setViz(2)}>Histogram of Run Distances</p>
              <p className={styles.menuItem} onClick={()=>setViz(3)}>Calendar Heatmap</p>
              <p className={styles.menuItem} onClick={()=>setViz(4)}>Fun Facts</p>
            </div>

            {/* Right-side content area to view visualizations */}
            <div className={styles.plotContainer} id="plotContainer">
              {viz == 0 && weekMileagePlotData && (
                <PlotChart plotData={weekMileagePlotData} time_interval_label={"7-Day"} />
              )}
              {viz == 1 && monthMileagePlotData && (
                <PlotChart plotData={monthMileagePlotData} time_interval_label={"30-Day"} />
              )}
              {viz == 3 && (
                <CalHeatmap data={heatmapData} latest={bfDate} earliest={afDate} />
              )}
            </div>
          </div>
          

          {/* Sign out */}
          <div className={styles.btnContainer}>
              <div className={styles.btnGrid}>
                <p>Signed in through Strava as {session.user.toString()}</p>
                <button className={styles.btn} onClick={e => updateData()}> Download Data</button>
                <button className={styles.btn} onClick={() => signOut()}>Sign Out of Strava</button>
            </div>
          </div>
        
        </div>

        )}

    </Layout>
  )
}