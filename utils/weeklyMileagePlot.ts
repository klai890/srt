import ActivityWeek from "../lib/strava/models/ActivityWeek";
import MileagePoint from "../lib/strava/models/MileagePoint";
import { activityWeekKey, ONE_WEEK, prevMon, roundTwo } from "./utils";

/**
 * 
 * Returns an array of MileagePoint's with points between af and bf, each day's value as the
 * sum of the mileage from the time_interval (in seconds) prior to the day in question.
 * 
 * @param bf Date to stop at
 * @param af Date to start at
 * @param data An array of ActivityWeeks
 * @param time_interval Time interval (in seconds) to calculate mileage over. Default is 7 days.
 * @returns An array of MileagePoints between af and bf
 */
export function getMileagePlotData(af: Date, bf: Date, data : Array<ActivityWeek>, time_interval : number = ONE_WEEK) : Array<MileagePoint> {
    var mileagePoints : Array<MileagePoint> = []
    
    var queue : Array<number> = []
    var runningSum : number = 0
    var monday : Date = new Date(af);

    // First, loop through the 7 days before af
    for (var d : Date = new Date(af.valueOf() - time_interval); d < new Date(af); d.setDate(d.getDate() + 1)){

      monday = prevMon(new Date(d));

      // Retrieve day's mileage from data
      var key : string = activityWeekKey(d);
      var dayMileage;

      try {
        dayMileage = data.find(item => item.week == monday.toLocaleDateString())[key];
      } catch {
        dayMileage = 0;
      }

      queue.push(dayMileage);
      runningSum += dayMileage;
    }

    // Then, loop through all the dates from af to bf.
    for (var d : Date = new Date(af); d < bf; d.setDate(d.getDate() + 1)) {

        var element : number = queue.shift();
        runningSum -= element;

        // If we've moved onto a new week, update monday
        if (d.getTime() - monday.getTime() >= ONE_WEEK) {
          monday = new Date(monday.valueOf() + ONE_WEEK);
        }

        var key : string = activityWeekKey(d);
        try {
            element = data.find(item => item.week == monday.toLocaleDateString())[key];
        } catch {
            element = 0;
        }

        queue.push(element);
        runningSum += element;

        var pt : MileagePoint = {
          'day': new Date(d),
          'value': runningSum < 0 ? 0 : roundTwo(runningSum)
        }

        mileagePoints.push(pt);
    }

    return mileagePoints;
}