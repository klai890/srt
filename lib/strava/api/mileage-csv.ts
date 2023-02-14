/**
 * Created Jan 04, 2023
 * Creates an API call to retrieve Strava data and exports it in a CSV-ready format
 * through variable csvData : Array<ActivityWeek>
 */

import ActivityWeek from '../models/ActivityWeek';
import SummaryActivity from '../models/SummaryActivity';
import Activity from "../models/Activity";

// TODO:
// 1. Retrieve from a private cache
// 2. Optimize – 

const PER_PAGE = 200; // # activities per page
const MAX_CALLS = 4;

// Temporarily set it to my own account. TODO: Set up the /mileage -> /api/activities
// redirect to retrieve the USER_ID from the request.

export var headers = [
    {label: 'Week Of', key: 'week'},
    {label: 'Monday', key: 'monday'},
    {label: 'Tuesday', key: 'tuesday'},
    {label: 'Wednesday', key: 'wednesday'},
    {label: 'Thursday', key: 'thursday'},
    {label: 'Friday', key: 'friday'},
    {label: 'Saturday', key: 'saturday'},
    {label: 'Sunday', key: 'sunday'},
    {label: 'Mileage', key: 'mileage'}
]

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
    const oldest : Date = prevMon(after)
    const newest : Date = prevMon(before)
    var d : Date = oldest;
    var wk : ActivityWeek;

    // https://groups.google.com/g/strava-api/c/KiQo6sVlWG4: before & after params must be in seconds
    const bf : number = newest.valueOf() / 1000
    const af : number = oldest.valueOf() / 1000
    console.log(bf);
    console.log(af);
    
    // Add each Monday to table
    while (d <= newest) {
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
    
    // <------------------------- RETRIEVE CREDENTIALS ---------------------------->
    // console.log(userId); console.log(accessToken); console.log(refreshToken);
    const ATHLETES_ENDPOINT = `https://www.strava.com/api/v3/athletes/${userId}`;
    
    // epoch: https://www.epochconverter.com/
    // max per page seems to be 200
    
    // <------------------------- RETRIEVE ACTIVITY DATA ------------------------------------>

    var i = 1;
    var response : Array<SummaryActivity>= await fetch(
        `${ATHLETES_ENDPOINT}/activities?access_token=${accessToken}&page=${i}&per_page=${PER_PAGE}&before=${bf}&after=${af}`
    ).then(d => d.json()).then(d => {if (d) return prettify(d)})

    if (!response) return;

    var responses : Array<SummaryActivity> = [];
    
    // Loop to retrieve this year's data

    var start = Date.now();
    var n; var e;

    while ((response.length != 0 || i == 1) && i < MAX_CALLS) {

        n = Date.now();
        responses = responses.concat(response)
        e = Date.now();

        console.log(`<---------------------------------------- CONCAT EXECUTION TIME: ${e - n} ms ------------------------------------->`)


        i++;
        
        n = Date.now();
        response = await fetch(
            `${ATHLETES_ENDPOINT}/activities?access_token=${accessToken}&page=${i}&per_page=${PER_PAGE}&before=${bf}&after=${af}`
        ).then(d => d.json()).then(d => {if (d) return prettify(d)})
        e = Date.now();

        // ISSUE: THE STRAVA API IS REALLY SLOW!

        console.log(`<---------------------------------------- FETCH EXECUTION TIME: ${e - n} ms ------------------------------------->`)
    }

    if (i == MAX_CALLS) {
        // Do something to alert the user
    }

    var end = Date.now();
    console.log(`<----------------------------------------------- Retrieval Execution time: ${end - start} ms ----------------------------------------------->`);

    start = Date.now();
    csvTable = addData(responses, csvTable);
    end = Date.now();
    console.log(`<----------------------------------------------- Data Addition Execution time: ${end - start} ms ----------------------------------------------->`);
    return csvTable;
}

/**
 * 
 * @param activityId, userId, accessToken
 * @return the mileage of the activity of id activityId if the activity is of type run.
 */
export const activityMileage = async function (activityId, accessToken) {
  // <------------------------- RETRIEVE CREDENTIALS ---------------------------->
    // console.log(userId); console.log(accessToken); console.log(refreshToken);
    const ATHLETES_ENDPOINT = `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=false`;
    
    // <------------------------- RETRIEVE ACTIVITY DATA ------------------------------------
    const data : Activity = await fetch(ATHLETES_ENDPOINT, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
    }).then(t => t.json())
    .catch(err => console.error(err))
    
    console.log("<-------------------------ACTIVITY------------------------->")
    console.log(data);

    const distance = data.distance * 0.000621371192; // meters to miles
    return distance;
}

// <--------------------- HELPER FUNCTIONS ----------------------->

// TODO: case api calls split the week?
function addData(json : Array<SummaryActivity>, csvTable : Array<ActivityWeek>) : Array<ActivityWeek>{

    // pop from existing data, add to csvTable
    while (json.length != 0) {
        // console.log("RETRIEVED DATA: ");
        // json.forEach(item => console.log(item))
        var date : Date = new Date(json[0].start_date); // may need Date.parse
        var mon : Date = json[0].prev_mon;

        let run = json.shift();
        let day = activityWeekKey(new Date(run.start_date));
        
        // Get object
        var week : ActivityWeek = csvTable.find(item => item.week === mon.toLocaleDateString());

        week[day] += run.distance;
        week['mileage'] += run.distance;
        week[day] = roundTwo(week[day]);
        week['mileage'] = roundTwo(week['mileage']);
        
    }
    return csvTable;
    
}

/**
 * 
 * @param json : Data retrieved from Strava
 * @returns array of SummaryActivity : A condensed version
 */
function prettify (json: Array<Activity>) : Array<SummaryActivity> {

    // FLAG: look into JQ
    // https://stackoverflow.com/questions/29815940/javascript-implementation-of-jq

    // first, get only running activities
    json = json.filter ( activity => activity.type == 'Run');
  
    // second, grab only essential data
    var condensedJson = json.map ( activity => {
        // var date : Date = new Date(activity.start_date_local);
        var miles : number = 0.000621371192 * activity.distance; // meters to miles
        return ({
            distance: roundTwo(miles),
            start_date: activity.start_date_local,
            prev_mon: prevMon(new Date(activity.start_date))
        })
    })
    
    return condensedJson;
  }  

/**
 * Date Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
 * use this for exploration: https://playcode.io/new
 * @param date: Date 
 * @returns Date: sunday, the Sunday prior to date @ 11:59pm
 */
function prevMon(date: Date) : Date {
    var day : number = date.getDay()
    var mon = new Date(date.getTime());
    var diff = day - 1; // # days to monday
    mon.setDate(date.getDate() - diff);

    // 11:59pm
    mon.setHours(23);
    mon.setMinutes(59);
    mon.setSeconds(59);

    // console.log(day);
    // console.log("prevSunday: " + sunday);  
    return mon;
}

/**
 * @param num 
 * @returns num rounded to 2 decimal places
 */
function roundTwo (num : number) : number {
    return Math.round(num * 100) / 100
}

/**
 * @param date
 * @returns string: the corresponding key in ActivityWeek
 */

function activityWeekKey(date: Date) : string {
    const day = date.getDay(); // range: 0-6 inclusive

    switch (day) {
        case 0: return 'sunday';
        case 1: return 'monday';
        case 2: return 'tuesday';
        case 3: return 'wednesday';
        case 4: return 'thursday';
        case 5: return 'friday';
        case 6: return 'saturday'
    }
}