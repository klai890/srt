/**
 * /lib/strava/api/utils.ts
 * Contains functions to help with fetching & parsing data from Strava.
 */

import ActivityWeek from '../models/ActivityWeek';
import SummaryActivity from '../models/SummaryActivity';
import Activity from "../models/Activity";
import { roundTwo, prevMon, activityWeekKey } from '../../../utils/utils'

// API parameters
const PER_PAGE = 200;
export const MAX_CALLS = 10;

/**
 * @params userId: The Strava user's id
 * @params accessToken: The Strava user's access token
 * @params before: Filter activities that have taken place before a certain time 
 * @params after: Filter activities that have taken place after a certain time 
 * 
 * PRECONDITION: before and after are within 1 year of one another.
 * The API takes too long to respond if it is more than one year
 * 
 * Retrieves data between Date after and Date before.
 */
export const getStravaData = async function(userId, accessToken, before: Date, after: Date) {

    // Setup Table
    var csvTable : Array<ActivityWeek> = [];
    setupCsvTable(csvTable, prevMon(after), prevMon(before))

    // https://groups.google.com/g/strava-api/c/KiQo6sVlWG4: before & after params must be in seconds
    const bf : number = Math.trunc(before.valueOf() / 1000)
    const af : number = Math.trunc(after.valueOf() / 1000)
    const ATHLETES_ENDPOINT = `https://www.strava.com/api/v3/athletes/${userId}`;
    
    // epoch: https://www.epochconverter.com
    // max per page seems to be 200
    
    var responses : Array<SummaryActivity> = [];
    var i = 1;
    var response : Array<SummaryActivity>= await fetch(
        `${ATHLETES_ENDPOINT}/activities?page=${i}&per_page=${PER_PAGE}&before=${bf}&after=${af}`,
        {
            method: 'GET', 
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
    ).then(d => d.json()).then(d => {if (d) return prettify(d)})
    if (!response) return;

    while ((response.length != 0 || i == 1) && i < MAX_CALLS) {        
        responses = responses.concat(response)
        i++;

        response = await fetch(
            `${ATHLETES_ENDPOINT}/activities?page=${i}&per_page=${PER_PAGE}&before=${bf}&after=${af}`,
            {
                method: 'GET', 
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        ).then(d => d.json()).then(d => {if (d) return prettify(d)})
    }

    if (i == MAX_CALLS) {
        alert("Max calls reached. Data may not be accurate. Sorry!");
    }

    csvTable = addData(responses, csvTable);
    return csvTable;
}

/**
 * 
 * @param activityId, userId, accessToken
 * @return the mileage of the activity of id activityId if the activity is of type run.
 */
export const activityMileage = async function (activityId, accessToken) {
  // <------------------------- RETRIEVE CREDENTIALS ---------------------------->
    const ATHLETES_ENDPOINT = `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=false`;
    
    // <------------------------- RETRIEVE ACTIVITY DATA ------------------------------------
    const data : Activity = await fetch(ATHLETES_ENDPOINT, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
    }).then(t => t.json())
    .catch(err => console.error(err))

    const distance = data.distance * 0.000621371192; // meters to miles
    return distance;
}

// <--------------------- HELPER FUNCTIONS ----------------------->

/**
 * 
 * @param csvTable CSV Table to modify
 * @param oldest Oldest date in the table.
 * @param newest Newest date in the table.
 */
export const setupCsvTable  = async function(csvTable : Array<ActivityWeek>, oldest: Date, newest: Date) { 
    var d : Date = new Date(oldest);
    var wk : ActivityWeek;
    
    // Add each Monday to table
    while (d <= newest) {
        if (d.getDay() != 1) d = prevMon(d);
        wk = {
            'week': d.toLocaleDateString(), // ex: 1/6/2023
            'monday': 0,
            'tuesday': 0,
            'wednesday': 0,
            'thursday': 0,
            'friday': 0,
            'saturday': 0,
            'sunday': 0,
            'mileage': 0
        }

        csvTable.push(wk); // should update obj in orig func, if like Java.
        d.setDate(d.getDate() + 7)
    }
}

/**
 * addData: Parses data and adds it to an array of parsed data.
 * @param json Array<SummaryActivity> to add
 * @param csvTable The table to add json to.
 * @returns Array<ActivityWeek> The updated CSV Table
 */
function addData(json : Array<SummaryActivity>, csvTable : Array<ActivityWeek>) : Array<ActivityWeek>{

    // pop from existing data, add to csvTable
    while (json.length != 0) {
        var mon : Date = json[0].prev_mon;
        let run = json.shift();
        let day = activityWeekKey(new Date(run.start_date));
        
        var week : ActivityWeek = csvTable.find(item => item.week === mon.toLocaleDateString());

        if (week) {
            week[day] += run.distance;
            week['mileage'] += run.distance;
            week[day] = roundTwo(week[day]);
            week['mileage'] = roundTwo(week['mileage']);
        }

        else {
            alert("ERROR: Week was not in CSV table.")
        }
    }

    return csvTable;
}

/**
 * pretitfy(): Extracts relevant data from the long-ass fetch response.
 * @param json : Data retrieved from Strava
 * @returns array of SummaryActivity : A condensed version
 */
function prettify (json: Array<Activity>) : Array<SummaryActivity> {
    if (!json) return [];
    
    json = json.filter ( activity => activity.type == 'Run');
  
    // second, grab only essential data
    var condensedJson = json.map ( activity => {
        // var date : Date = new Date(activity.start_date_local);
        var miles : number = 0.000621371192 * activity.distance; // meters to miles
        return ({
            distance: roundTwo(miles),
            start_date: activity.start_date,
            prev_mon: prevMon(new Date(activity.start_date))
        })
    })
    
    return condensedJson;
  }  