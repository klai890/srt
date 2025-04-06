/**
 * /lib/strava/api/utils.ts
 * Contains functions to help with fetching & parsing date from Strava.
 */

import ActivityWeek from '../models/ActivityWeek';
import SummaryActivity from '../models/SummaryActivity';
import Activity from "../models/Activity";
import MileagePoint from '../models/MileagePoint';

// Six months in miliseconds
export const SIX_MONTHS = 6*2.628e+9;

// Three months in miliseconds
export const THREE_MONTHS = 3*2.628e+9;

// One week in miliseconds
export const ONE_WEEK = 6.048e+8;


const PER_PAGE = 200; // # activities per page
export const MAX_CALLS = 10;

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
    setupCsvTable(csvTable, prevMon(after), prevMon(before))

    // https://groups.google.com/g/strava-api/c/KiQo6sVlWG4: before & after params must be in seconds
    const bf : number = Math.trunc(before.valueOf() / 1000)
    const af : number = Math.trunc(after.valueOf() / 1000)
    const ATHLETES_ENDPOINT = `https://www.strava.com/api/v3/athletes/${userId}`;
    
    // epoch: https://www.epochconverter.com
    // max per page seems to be 200
    
    // <------------------------- RETRIEVE ACTIVITY DATA ------------------------------------>
    var responses : Array<SummaryActivity> = []; // all responses
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
function setupCsvTable (csvTable : Array<ActivityWeek>, oldest: Date, newest: Date) : void { 
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
    
    // first, get only running activities
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

/**
 * prevMon(): Retrieves the Monday before a date.
 * @param date: Date 
 * @returns Date: Monday, the Monday prior to date @ 11:59pm
 */
export function prevMon(date: Date) : Date {    

    // day: 0 to 6, with 0 as Sunday, 6 as Saturday
    var day : number = date.getDay() == 0 ? 7 : date.getDay()
    var mon = new Date(date.getTime());

    // TODO: small bug – if it's monday but before 11:59pm, prevMon is actually AFTER date.
    var diff = day - 1; // Days to the previous monday
    mon.setDate(date.getDate() - diff);

    // 11:59pm
    mon.setHours(0);
    mon.setMinutes(0);
    mon.setSeconds(0);

    return mon;
}

/**
 * Rounds num to 2 decimal places.
 * @param num 
 * @returns num rounded to 2 decimal places
 */
function roundTwo (num : number) : number {
    return Math.round(num * 100) / 100
}

/**
 * activityWeekKey(): Converts an integer from 0-6 to a day of week. 
 * @param date
 * @returns string: the corresponding key in ActivityWeek
 */
export function activityWeekKey(date: Date) : string {
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
/**
 * Returns an Array of mondays between af and bf.
 * @param bf Date to stop at
 * @param af Date to start at
 * @returns An Array of Mondays between af and bf
 */
export function getMondays (bf: Date, af: Date) : Array<Date> {
    var d : Date = prevMon(af);
    const bfValue : number = bf.valueOf();
    var result : Array<Date>= [];

    while (d.valueOf() <= bfValue) {
        result.push(new Date(d)); // create a new object. you don't want an array of references to the same object.
        d.setDate(d.getDate() + 7)
    }

    return result;
}

/**
 * 
 * Returns an array of MileagePoint's with points between af and bf, each day's value as the
 * sum of the mileage from the seven days prior to the day in question.
 * 
 * @param bf Date to stop at
 * @param af Date to start at
 * @param data An array of ActivityWeeks
 * @returns An array of MileagePoints between af and bf
 */
export function getPlotData(af: Date, bf: Date, data : Array<ActivityWeek>) : Array<MileagePoint> {
    /**
    Loop thru all dates from the last 3 months, calculate each day's "acute load", defined as 
    the mileage of the last 7 days.
    */

    var mileagePoints : Array<MileagePoint> = []
    
    // First, get the acute load data for af. Queue with oldest date at front, newest date at the end. 
    // Running sum variable to calculate sum of mileage from each day. Monday to track index of data needed to
    // access the current day's mileage.

    var queue : Array<number> = []
    var runningSum : number = 0
    var monday : Date = new Date(af);

    for (var d : Date = new Date(af.valueOf() - ONE_WEEK); d < new Date(af); d.setDate(d.getDate() + 1)){

      monday = prevMon(d)

      // Retrieve day's mileage from data
      var key : string = activityWeekKey(d);
      console.log(data)
      console.log("Trying to find ", monday.toLocaleDateString())
      var dayMileage = data.find(item => item.week == monday.toLocaleDateString())[key];
      queue.push(dayMileage);
      runningSum += dayMileage;
    }

    // Then, loop through all the dates from af to bf. For each Date d,
    for (var d : Date = new Date(af); d < bf; d.setDate(d.getDate() + 1)) {

        // 1. Pop from queue & subtract element's value from running sum variable.
        var element : number = queue.shift();
        runningSum -= element;

        // 2. Retrieve data for d.
        // Check if we need to update monday – if difference between d and monday is 7 days or more
        if (d.getTime() - monday.getTime() >= ONE_WEEK) {
          monday = new Date(monday.valueOf() + ONE_WEEK);
        }

        // Retrieve day's mileage from data
        var key : string = activityWeekKey(d);
        element = data.find(item => item.week == monday.toLocaleDateString())[key];

        // 3. Push element to queue & add element's value to running sum variable.
        queue.push(element);
        runningSum += element;

        // 4. Create MileagePoint data, push to array
        var pt : MileagePoint = {
          'day': new Date(d),
          'value': runningSum < 0 ? 0 : roundTwo(runningSum)
        }

        mileagePoints.push(pt);

    }
    return mileagePoints;
}