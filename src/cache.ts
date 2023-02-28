import {redis} from "./redis";
import { getStravaData } from "../lib/strava/api/mileage-csv";
import ActivityWeek from '../lib/strava/models/ActivityWeek'
import {prevMon} from '../lib/strava/api/mileage-csv'

const EX = 60 * 10; // expires in 10 minutes
const WEEK = 6.048e+8;


/**
 * Called by functions to retrieve userId's Strava activity data between dates bf and af.
 * PRECONDITION: time between bf and af is 6 months.
 * 
 * @param key The key of data in redis
 * @param userId The user's Strava id
 * @param token the user's access token
 * @param bf collect activities before bš
 * @param af collect activities after af
 * @returns Promise which returns Array of Activity Weeks
 */
async function cacheFetch (userId: string, token: string, bf: Date, af: Date) : Promise<Array<ActivityWeek>> {

    console.log("<----------------- CALLED CACHEFETCH ---------------------->");
    
    // Check if in cache
    var existing : Array<ActivityWeek> | null; // = await get(`activities:${userId}`, bf, af)

    const mondays = getMondays(bf, af);

    
    var excludedWeeks : Array<Date> = [];
    for (const monday of mondays) {
        const answer : number = await redis.hlen(monday.toLocaleDateString());
        if (answer != 8) excludedWeeks.push(monday);
    }
    
    console.log("<------------ EXCLUDED WEEKS -------------->")
    console.log(excludedWeeks);

    // All dates in cache.
    if (excludedWeeks.length == 0) {
        console.log("All dates in cache.");
        return existing;
    }

    // Not all dates in cache.
    // PRECONDITION: mondays is in chronological order.
    bf = excludedWeeks[excludedWeeks.length -1]
    af = excludedWeeks [0]

    console.log("<-------- BF NEW --------------->");
    console.log(bf);
    
    console.log("<-------- AF NEW --------------->");
    console.log(af);
    

    // Not in cache – add to cache.
    return await set(`activities:${userId}`, userId, token, bf, af);
}

/**
 * Checks if the dates in range bf to af are in the cache. If they are in the cache, returns
 * all the dates. If not, returns a range of dates between bf and af for which there is no data
 * in the cache. 
 * 
 * @param key specify which user, format `activities:${userId}`
 * @param bf collect activites before this date
 * @param af collect activities after this date
 * @returns activity data stored in the cache for dates between bf and af. if there is no data between bf 
 * and af in the cache, returns a range between bf and af for which there is no data.
 * 
 */
// async function get (key: string, bf: Date, af: Date) : Promise<Array<ActivityWeek>> {
//     // TODO: Find keys within redis
//     var value : Array<ActivityWeek> | null; // = await redis.get(key);

    
//     if (value === null) return null; // no value
//     return value;
// }

/**
 * 
 * @param key Key to add to Redis
 * @param fetcher Function to fetch value
 * @param expires Time to expire
 * @returns Value to set key to
 */
async function set (key: string, userId: string, token: string, bf: Date, af: Date) : Promise<Array<ActivityWeek>> {
    // TODO: Retrieve values
    const value : Array<ActivityWeek> | null = await getStravaData(userId, token, bf, af);

    console.log("<------------ VALUE ----------------------->");
    console.log(value);
    
    // Put value into Redis (have to store string value)
    // await redis.setex(key, value, expires)
    // Do I have to stringify? Read into the API docs, I think it might do it automatically.
    // https://stackoverflow.com/questions/6278316/how-to-store-array-of-hashes-in-redis

    // Set `activities:${userId}` contains hashes of key wk.week which contain info on each week
    // value.forEach(async wk => {
    //     // TODO: SPLIT WEEK ERROR CATCH
    //     const isInSet: number = await redis.sismember(`activities${userId}`, wk.week);
    //     if (isInSet == 0) {
    //         await redis.hset(wk.week, {
    //             'week': wk.week,
    //             'monday': wk.monday,
    //             'tuesday': wk.tuesday,
    //             'wednesday': wk.wednesday,
    //             'thursday': wk.thursday,
    //             'friday': wk.friday,
    //             'saturday': wk.saturday,
    //             'sunday': wk.sunday,
    //             'mileage': wk.mileage
    //         })
    //         await redis.sadd(`activities:${userId}`, wk.week).catch(err => console.error(err));
    //     }
    // })

    // await redis.setex(key, EX, JSON.stringify(value))
    return value;
}

/**
 * 
 * @param key Deletes key from the Redis cache.
 */
const del = async (key: string) => {
    await redis.del(key);
}

/**
 * Returns an array of Mondays : Date in range bf : Date to af : Date.
 * If af is not Monday at 11:59pm, returns the previous Monday at 11:59pm.
 * 
 */

function getMondays (bf: Date, af: Date) : Array<Date> {
    var d : Date = prevMon(af);
    const bfValue : number = bf.valueOf();
    var result : Array<Date>= [];

    while (d.valueOf() <= bfValue) {
        result.push(new Date(d)); // create a new object. you don't want an array of references to the same object.
        d.setDate(d.getDate() + 7)
    }

    return result;
}

export { cacheFetch, set, del, getMondays }