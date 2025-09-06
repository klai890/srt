export default interface Activity {
  distance: number; // in meters
  // "moving_time": number, // in seconds
  // "elapsed_time": number,
  // "total_elevation_gain": number,
  type: string;
  start_date?: Date; // ex: 2018-05-02T12:15:09Z FLAG: maybe ts has a type for dates which would make extracting these a whole lot easier?
}
