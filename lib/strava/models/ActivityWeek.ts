// Represents a week of activity

/**
 * key: day of week
 * value: mileage (in miles) on that day
 */

export default interface ActivityWeek {
  week: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  mileage: number;
}

export function compareWeeks(wk1: ActivityWeek, wk2: ActivityWeek): number {
  var d1: Date = new Date(wk1.week);
  var d2: Date = new Date(wk2.week);

  // neg = d1 comes before d2
  // pos = d1 comes after d2
  return d1.valueOf() - d2.valueOf();
}
