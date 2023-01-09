export default interface Activity {
    "resource_state"?: number,
    "athlete" : {
        "id" : number,
        "resource_state": number
    },
    "name": string,
    "distance": number // in meters
    "moving_time": number, // in seconds
    "elapsed_time": number,
    "total_elevation_gain": number,
    "type": string,
    "sport_type": string,
    "workout_type"?: string,
    "id": number
    "external_id"?: string,
    "upload_id": number,
    "start_date"?: Date, // ex: 2018-05-02T12:15:09Z FLAG: maybe ts has a type for dates which would make extracting these a whole lot easier?
    "start_date_local"?: Date,
    "timezone": string,
    "utc_offset"?: number,
    "start_latlng"? : string, // may cause an error.
    "end_latlng"? : string,
    "location_city"? : string,
    "location_state"? : string,
    "location_country"? : string,
    "achievement_count"? : number,
    "kudos_count"? : number,
    "comment_count"? : number,
    "athlete_count"? : number,
    "photo_count"? : number,
    "map" : {
        "id"? : string,
        "summary_polyline"? : string,
        "resource_state"? : number
    },
    "trainer"? : boolean,
    "commute"? : boolean,
    "manual"? : boolean,
    "private"? : boolean,
    "flagged"? : boolean,
    "gear_id"? : string,
    "from_accepted_tag"? : boolean,
    "average_speed"? : number,
    "max_speed"? : number,
    "average_cadence"? : number,
    "average_watts" : number,
    "weighted_average_watts"? : number,
    "kilojoules"? : number,
    "device_watts"? : boolean,
    "has_heartrate"? : boolean,
    "average_heartrate"? : number,
    "max_heartrate"? : number,
    "max_watts"? : number,
    "pr_count"? : number,
    "total_photo_count"? : number,
    "has_kudoed"? : boolean,
    "suffer_score"? : number
}