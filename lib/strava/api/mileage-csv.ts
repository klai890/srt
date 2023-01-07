/**
 * Created Jan 04, 2023
 * Creates an API call to retrieve Strava data and exports it in a CSV-ready format
 * through variable csvData : Array<ActivityWeek>
 */

import ActivityWeek from '../models/ActivityWeek';
import SummaryActivity from '../models/SummaryActivity';
import {getActivities} from './strava';


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

export const formatData = async function(userId) {
    
    // <----------------------- API CALL -------------------------->
    var allRuns : Array<SummaryActivity> = await getActivities(userId)

    console.log("ALL RUNS: ")
    console.log(allRuns);

    // <----------------------- INIT DATA ------------------------>
    var csvTable : Array<ActivityWeek> = [];

    // <---------------------- ADD TO CSV DATA ---------------------->
    while (allRuns.length != 0) {
        // console.log("ALL RUNS: ");
        // allRuns.forEach(item => console.log(item))
        var lastDate : Date = new Date(allRuns[0].start_date); // may need Date.parse
        var prevSun : Date = prevSunday(lastDate);
        var prevMon : Date = monday(prevSun);

        // Grab everything after prevSun
        var week : ActivityWeek = {
            'week': prevMon.toLocaleDateString() + " Monday", // ex: 1/6/2023
            'monday': 0,
            'tuesday': 0,
            'wednesday': 0,
            'thursday': 0,
            'friday': 0,
            'saturday': 0,
            'sunday': 0,
            'mileage': 0
        }

        // d1 > d2 if d1 occurs at a later time than d2 
        // https://stackabuse.com/compare-two-dates-in-javascript/
        while ( lastDate > prevSun && allRuns.length != 0 ) {
            let run = allRuns.shift();
            let day = activityWeekKey(new Date(run.start_date));
            var miles =  0.000621371192 * run.distance; // meters to miles
            week[day] += miles;
            week['mileage'] += miles;
            lastDate = new Date(run.start_date);
        }

        // console.log(lastDate + " WAS LESS THAN " + prevSun);

        // round everything to 2 decimals
        week['monday'] = roundTwo(week['monday']);
        week['tuesday'] = roundTwo(week['tuesday']);
        week['wednesday'] = roundTwo(week['wednesday']);
        week['thursday'] = roundTwo(week['thursday']);
        week['friday'] = roundTwo(week['friday']);
        week['saturday'] = roundTwo(week['saturday']);
        week['sunday'] = roundTwo(week['sunday']);
        week['mileage'] = roundTwo(week['mileage']);

        csvTable.push(week);
    }

    // console.log("CSV TABLE: ")
    // csvTable.forEach(obj => console.log(obj));

    return csvTable;

}


// <--------------------- HELPER FUNCTIONS ----------------------->

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
    var diff = day; // # days to sunday
    mon.setDate(prevSunday.getDate() - diff);

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