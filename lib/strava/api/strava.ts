/**
 * Makes API calls to Strava
 * 
 * TABLE OF CONTENTS:
 * 1. getActivities() -> Array<Activity> – Retrieves all of the user's activities
 */
// INSPO: https://samuelkraft.com/blog/strava-api-with-nextjs

import Activity from "../models/Activity";
import SummaryActivity from "../models/SummaryActivity";
import { getAccessToken } from "./Authorization.Js";

/**
 * 
 * @param json : Data retrieved from Strava
 * @returns array of SummaryActivity : A condensed version
 */
const prettify = function (json: Array<Activity>) : Array<SummaryActivity> {

  // first, get only running activities
  json = json.filter ( activity => activity.type == 'Run');

  // second, grab only essential data
  var condensedJson = json.map ( activity => {
      // var date : Date = new Date(activity.start_date_local);
      return ({
          name: activity.name,
          distance: activity.distance,
          type: activity.type,
          start_date: activity.start_date_local
      })
  })

  return condensedJson;
}


// <------------------------- RETRIEVE DATA: MAKE API CALL ---------------------->

export const getActivities = async (userId) => {

  // <------------------------- RETRIEVE CREDENTIALS ---------------------------->
  const ATHLETES_ENDPOINT = `https://www.strava.com/api/v3/athletes/${userId}`;
  const { access_token: accessToken } = await getAccessToken();

  
  // for parameter reference: https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
  // can prob do some parameter manipulaiton & loops to get desired outcome

  // epoch: https://www.epochconverter.com/
  // max per page seems to be 200

  // <------------------------- RETRIEVE ALL RUNS ------------------------------------>
  
  const PER_PAGE = 200;

  // var response = await fetch(
  //     `${ATHLETES_ENDPOINT}/activities?access_token=${accessToken}&page=1&per_page=${PER_PAGE}`
  // );
  
    var allRuns : Array<SummaryActivity> = []  
    var i = 1;
    var pageJson : Array<SummaryActivity> = [];
  
  // Loop to retrieve ALL data. Uncomment at your own risk!!
  while (i < 3) {
    var response = await fetch(
        `${ATHLETES_ENDPOINT}/activities?access_token=${accessToken}&page=${i}&per_page=${PER_PAGE}`
    );
    pageJson = prettify(await response.json());
    allRuns = allRuns.concat(pageJson);
    
    console.log("pageJSON");
    console.log(pageJson);
    i++;
  }

  console.log("RUNS")
  console.log(allRuns);

  return allRuns;

};
