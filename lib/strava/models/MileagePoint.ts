/**
 * Represents "acute" load on a specific day.
 * 
 * day: Date of interest (12am)
 * value: Sum of mileage from the 7 days before Date day
 */

export default interface MileagePoint {
    'day' : Date,
    'value': number
}

export function comparePoints(pt1: MileagePoint, pt2: MileagePoint) : number {
    var d1 : Date = new Date(pt1.day);
    var d2 : Date = new Date(pt2.day);

    // neg = d1 comes before d2
    // pos = d1 comes after d2
    return d1.valueOf() - d2.valueOf();
}