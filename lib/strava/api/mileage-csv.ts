/**
 * Created Jan 04, 2023
 * Creates an API call to retrieve Strava data and exports it in a CSV-ready format
 * through variable csvData : Array<ActivityWeek>
 */

import ActivityWeek from '../models/ActivityWeek';
import SummaryActivity from '../models/SummaryActivity';
import Activity from "../models/Activity";
import { getAccessToken } from "./Authorization.Js";

const PER_PAGE = 200; // # activities per page

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

export const formatData = async function({userId, oldAccessToken, refreshToken}) {
    
    // <------------------------- RETRIEVE CREDENTIALS ---------------------------->
    // console.log(userId); console.log(oldAccessToken); console.log(refreshToken);
    const ATHLETES_ENDPOINT = `https://www.strava.com/api/v3/athletes/${userId}`;
    const accessToken = oldAccessToken; //await getAccessToken(oldAccessToken, refreshToken);

    // for parameter reference: https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
    // can prob do some parameter manipulaiton & loops to get desired outcome
    
    // epoch: https://www.epochconverter.com/
    // max per page seems to be 200
    
    // <------------------------- RETRIEVE ACTIVITY DATA ------------------------------------>

    var i = 1;
    var pageJson : Array<SummaryActivity> = [];
    var csvTable : Array<ActivityWeek> = [];
    var response : Response = await fetch(
        `${ATHLETES_ENDPOINT}/activities?access_token=${accessToken}&page=${i}&per_page=${PER_PAGE}`
    );
    var json = await response.json();
    console.log(json);
    
    // Loop to retrieve ALL data. Uncomment at your own risk!!
    while (json.length != 0) {
        pageJson = prettify(json);
        // console.log(pageJson);
        // console.log('json, json.length');
        // console.log(json);
        // console.log(json.length);

        // <--------------------- ADD DATA --------------------------------------->
        csvTable = addData(pageJson, csvTable);
        // console.log("--------- CSV TABLE MID PROCESS ----------");
        // console.log(csvTable)

        i++;

        response = await fetch(
            `${ATHLETES_ENDPOINT}/activities?access_token=${accessToken}&page=${i}&per_page=${PER_PAGE}`
        );
        json = await response.json();
    }

    console.log("<-------------------------CSV TABLE------------------------->")
    csvTable.forEach(obj => console.log(obj));
    return csvTable.reverse();
}

// <--------------------- HELPER FUNCTIONS ----------------------->

// TODO: case api calls split the week?
function addData(json : Array<SummaryActivity>, csvTable : Array<ActivityWeek>) : Array<ActivityWeek>{

    // <---------------------- ADD TO CSV DATA ---------------------->
    // pop from existing data, add to csvTable
    while (json.length != 0) {
        // console.log("RETRIEVED DATA: ");
        // json.forEach(item => console.log(item))
        var date : Date = new Date(json[0].start_date); // may need Date.parse
        var prevSun : Date = prevSunday(date);
        var prevMon : Date = monday(prevSun);

        let run = json.shift();
        let day = activityWeekKey(new Date(run.start_date));
        
        // see if week of prevMon exists. if so, add to there
        // if csvTable includes obj that represents week prevMon:
        //  add run mileage to that week
        var week : ActivityWeek = csvTable.find(item => item.week === prevMon.toLocaleDateString());
        
        // if not in csvTable, create a new week for prevMon and add to it.
        if (week === undefined){
            week = {
                'week': prevMon.toLocaleDateString(), // ex: 1/6/2023
                'monday': 0,
                'tuesday': 0,
                'wednesday': 0,
                'thursday': 0,
                'friday': 0,
                'saturday': 0,
                'sunday': 0,
                'mileage': 0
            }
            csvTable.push(week); // should update obj in orig func, if like Java.
        }

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
            name: activity.name,
            distance: roundTwo(miles),
            type: activity.type,
            start_date: activity.start_date_local
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
function prevSunday(date: Date) : Date {
    var day : number = date.getDay()
    var sunday = new Date(date.getTime());
    var diff = day; // # days to sunday
    sunday.setDate(date.getDate() - diff);

    // 11:59pm
    sunday.setHours(23);
    sunday.setMinutes(59);
    sunday.setSeconds(59);

    // console.log(day);
    // console.log("prevSunday: " + sunday);  
    return sunday;
}

/**
 * @param prevSunday : Date
 * @returns Date : the Monday after prevSunday
 */
function monday(prevSunday: Date) : Date {
    var day = prevSunday.getDay()
    var mon = new Date(prevSunday.getTime());
    var diff = 1; // # days to monday
    mon.setDate(prevSunday.getDate() + diff);

    // 11:59pm
    mon.setHours(23);
    mon.setMinutes(59);
    mon.setSeconds(59);
  
    // console.log(prevSunday);
    // console.log("prevMonday: " + monday);  
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