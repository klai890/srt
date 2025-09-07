export default interface SummaryActivity {
  distance: number; // in meters
  // "moving_time": number, // in seconds
  // "elapsed_time": number,
  // "total_elevation_gain": number,
  start_date: Date; // ex: 2018-05-02T12:15:09Z FLAG: maybe ts has a type for dates which would make extracting these a whole lot easier?
  prev_mon: Date;
}

export function compareActivities(
  a1: SummaryActivity,
  a2: SummaryActivity,
): number {
  var d1: Date = new Date(a1.start_date);
  var d2: Date = new Date(a2.start_date);
  return d1.valueOf() - d2.valueOf();
}
