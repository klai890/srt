import styles from "../styles/Mileage.module.css";
import Layout from "../components/Layout";
import Image from "next/image";
import { useState } from "react";
import React from "react";
import { getStravaData } from "../lib/strava/api/utils";
import { StravaData } from "../lib/strava/models/StravaData";
import { THREE_MONTHS, ONE_MONTH } from "../utils/utils";
import { useSession, signIn, signOut } from "next-auth/react";
import type ActivityWeek from "../lib/strava/models/ActivityWeek";
import { compareWeeks } from "../lib/strava/models/ActivityWeek";
import MileagePoint from "../lib/strava/models/MileagePoint";
import PlotChart from "../components/PlotChart";
import { getMileagePlotData } from "../utils/weeklyMileagePlot";
import CalHeatmap from "../components/CalHeatmap";
import SummaryActivity, {
  compareActivities,
} from "../lib/strava/models/SummaryActivity";
import PlotHistogram from "../components/PlotHistogram";

export default function Sheets() {
  const { data: session } = useSession();
  const [weekData, setWeekData] = useState<Array<ActivityWeek>>([]);

  const [viz, setViz] = useState<number>(0);
  const [weekMileagePlotData, setWeekMileagePlotData] =
    useState<Array<MileagePoint> | null>(null);
  const [monthMileagePlotData, setMonthMileagePlotData] =
    useState<Array<MileagePoint> | null>(null);
  const [heatmapData, setHeatmapData] = useState<Array<ActivityWeek>>([]);
  const [activities, setActivities] = useState<Array<SummaryActivity>>([]);
  const [earliest, setEarliest] = useState<Date | null>(null);

  // Fetch activity from database and/or Strava
  const fetchData = async () => {
    var all_weeks: Array<ActivityWeek> = [];
    var all_activities: Array<SummaryActivity> = [];

    // Retrieve all week data from Supabase, for this user
    try {
      var response = await fetch("/api/getTrainingData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          strava_id: session.userid,
        }),
      });
      var res = await response.json();
      if (res["error"]) throw Error(res.error);
      const res_data: Array<ActivityWeek> = res;
      res_data.sort(compareWeeks);
      all_weeks = res_data;
    } catch (error) {
      console.error(`Error fetching activities from Supabase`, error);
    }

    // Retrieve all activities from Supabase
    try {
      const response = await fetch("/api/getActivities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          strava_id: session.userid,
        }),
      });

      const res = await response.json();

      if (res["error"]) throw Error(res.error);

      const res_data: Array<SummaryActivity> = res;
      res_data.sort(compareActivities);
      all_activities = res_data;
    } catch (error) {
      // Not in database, must fetch from Strava & store in database.
      console.error(`Error fetching week data from database`, error);
    }

    // Retrieve data from Strava API
    var bf = new Date();
    var af = null;

    if (all_activities.length != 0) {
      // all_activities sorted in chronologically ascending order.
      af = new Date(all_activities[all_activities.length - 1].start_date);
    }

    const fetched_data: StravaData = await getStravaData(
      session.userid,
      session.accessToken,
      bf,
      af,
    );

    // Data freshly retrieved from API
    const week_data: Array<ActivityWeek> | null = fetched_data.week_data;
    const raw_data: Array<SummaryActivity> | null = fetched_data.raw_data;
    all_weeks.concat(week_data);
    all_activities.concat(raw_data);

    // Add weekly training stats to database
    if (week_data != null) {
      try {
        const response = await fetch("/api/storeTrainingData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            strava_id: session.userid,
            activity_weeks: week_data,
          }),
        });

        const res: Array<ActivityWeek> = await response.json();
      } catch (error) {
        console.error(`Error saving training data (week) ${error}`);
      }
    }

    // Add individual activities to database
    if (raw_data != null) {
      try {
        const response = await fetch("/api/storeActivities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            strava_id: session.userid,
            activities: raw_data,
          }),
        });

        const res = await response.json();
      } catch (error) {
        console.error(`Error saving activities ${error}`);
      }
    }

    // The first and last date that we provide "acute load" data for
    var firstDate: Date = new Date(new Date().valueOf() - THREE_MONTHS);
    var lastDate: Date = new Date(new Date().valueOf());

    var weekMileagePoints: Array<MileagePoint> = getMileagePlotData(
      firstDate,
      lastDate,
      all_weeks,
    );
    setWeekMileagePlotData(weekMileagePoints);

    var monthMileagePoints: Array<MileagePoint> = getMileagePlotData(
      firstDate,
      lastDate,
      all_weeks,
      ONE_MONTH,
    );
    setMonthMileagePlotData(monthMileagePoints);
    setHeatmapData(all_weeks);

    // Update states
    all_weeks.sort(compareWeeks);
    setEarliest(new Date(all_weeks[0].week));
    setWeekData(all_weeks);

    all_activities.sort(compareActivities);
    setActivities(all_activities);
  };

  const updateData = async () => {
    fetchData();
  };

  return (
    <Layout>
      {/* Not logged in : Prompt */}
      {session == undefined ? (
        <div className={styles.btnContainer}>
          <div className={styles.btnContent}>
            <p className={styles.description}>
              Authorize Strava to use the aforementioned services!
            </p>

            {!session && (
              <button
                onClick={() => signIn()}
                className={`${styles.stravaBtn} ${styles.authBtn}`}
              >
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
      ) : (
        <></>
      )}
      {/* Logged in : Options */}
      {session && (
        <div>
          <div className={styles.mainContainer}>
            {/* Left-side menu to select visualizations */}
            <div className={styles.menuContainer}>
              <h2 className={styles.menuHeader}> Visualizations </h2>
              <p className={styles.menuItem} onClick={() => setViz(0)}>
                Weekly Mileage Plot
              </p>
              <p className={styles.menuItem} onClick={() => setViz(1)}>
                Monthly Mileage Plot
              </p>
              <p className={styles.menuItem} onClick={() => setViz(2)}>
                Histogram of Run Distances
              </p>
              <p className={styles.menuItem} onClick={() => setViz(3)}>
                Calendar Heatmap
              </p>
              <p className={styles.menuItem} onClick={() => setViz(4)}>
                Fun Facts
              </p>
            </div>

            {/* Right-side content area to view visualizations */}
            <div className={styles.plotContainer} id="plotContainer">
              {viz == 0 && weekMileagePlotData && (
                <PlotChart
                  plotData={weekMileagePlotData}
                  time_interval_label={"7-Day"}
                />
              )}
              {viz == 1 && monthMileagePlotData && (
                <PlotChart
                  plotData={monthMileagePlotData}
                  time_interval_label={"30-Day"}
                />
              )}
              {viz == 2 && activities && (
                <PlotHistogram activities={activities} />
              )}
              {viz == 3 && (
                <CalHeatmap
                  data={heatmapData}
                  latest={new Date()}
                  earliest={earliest}
                />
              )}
            </div>
          </div>

          {/* Sign out */}
          <div className={styles.btnContainer}>
            <div className={styles.btnGrid}>
              <p>Signed in through Strava as {session.user.toString()}</p>
              <button className={styles.btn} onClick={(e) => updateData()}>
                {" "}
                Download Data
              </button>
              <button className={styles.btn} onClick={() => signOut()}>
                Sign Out of Strava
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
