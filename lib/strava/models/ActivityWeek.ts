// Represents a week of activity

/**
 * key: day of week
 * value: mileage (in miles) on that day
 */

export default interface ActivityWeek {
    'week': string,
    'monday': number,
    'tuesday': number,
    'wednesday': number,
    'thursday': number,
    'friday': number,
    'saturday': number,
    'sunday': number,
    'mileage': number
}