/**
 * utils.ts – Commonly used helper functions and constants
 */

// Time constants in milliseconds
export const ONE_YEAR = 12 * 2.628e9;
export const SIX_MONTHS = 6 * 2.628e9;
export const THREE_MONTHS = 3 * 2.628e9;
export const ONE_MONTH = 2.628e9;
export const ONE_WEEK = 6.048e8;

export var headers = [
  { label: "Week Of", key: "week" },
  { label: "Monday", key: "monday" },
  { label: "Tuesday", key: "tuesday" },
  { label: "Wednesday", key: "wednesday" },
  { label: "Thursday", key: "thursday" },
  { label: "Friday", key: "friday" },
  { label: "Saturday", key: "saturday" },
  { label: "Sunday", key: "sunday" },
  { label: "Mileage", key: "mileage" },
];

/**
 * prevMon(): Retrieves the Monday before a date.
 * @param date: Date
 * @returns Date: Monday, the Monday prior to date @ 11:59pm
 */
export function prevMon(date: Date): Date {
  // day: 0 to 6, with 0 as Sunday, 6 as Saturday
  var day: number = date.getDay() == 0 ? 7 : date.getDay();
  var mon = new Date(date.getTime());

  var diff = day - 1;
  mon.setDate(date.getDate() - diff);

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
export function roundTwo(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * activityWeekKey(): Converts an integer from 0-6 to a day of week.
 * @param date
 * @returns string: the corresponding key in ActivityWeek
 */
export function activityWeekKey(date: Date): string {
  const day = date.getDay();
  switch (day) {
    case 0:
      return "sunday";
    case 1:
      return "monday";
    case 2:
      return "tuesday";
    case 3:
      return "wednesday";
    case 4:
      return "thursday";
    case 5:
      return "friday";
    case 6:
      return "saturday";
  }
}
/**
 * Returns an Array of mondays between af and bf.
 * @param bf Date to stop at
 * @param af Date to start at
 * @returns An Array of Mondays between af and bf
 */
export function getMondays(bf: Date, af: Date): Array<Date> {
  var d: Date = prevMon(af);
  const bfValue: number = bf.valueOf();
  var result: Array<Date> = [];

  while (d.valueOf() <= bfValue) {
    result.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }

  return result;
}
