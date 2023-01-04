// FROM: https://samuelkraft.com/blog/strava-api-with-nextjs
// SO SO SO HELPFUL

const clientId = process.env.STRAVA_ID;
const clientSecret = process.env.STRAVA_SECRET;
const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

const TOKEN_ENDPOINT = "https://www.strava.com/oauth/token";

const getAccessToken = async () => {

  const body = JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  // need to generate authorization code for the user

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body,
  });

  return response.json();
};

interface Activity {
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
"start_date"?: string, // ex: 2018-05-02T12:15:09Z FLAG: maybe ts has a type for dates which would make extracting these a whole lot easier?
"start_date_local"?: string,
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

interface SummaryActivity {
    "name": string,
    "distance": number // in meters
    // "moving_time": number, // in seconds
    // "elapsed_time": number,
    // "total_elevation_gain": number,
    "type": string,
    "start_date"?: string, // ex: 2018-05-02T12:15:09Z FLAG: maybe ts has a type for dates which would make extracting these a whole lot easier?
}



const prettify = function (json: Array<Activity>) : Array<SummaryActivity> {

    // first, get only running activities
    json.filter ( activity => activity.type == 'Run')

    // second, grab only essential data
    json.map ( activity => {
        return ({
            name: activity.name,
            distance: activity.distance,
            type: activity.type,
            start_date: activity.start_date_local
        })
    })

    return json;

}

export const getActivities = async (userId) => {
  // const userId = 95300802; // 👈 Your strava user id, can be found by visiting your strava profile and checking the url
  const ATHLETES_ENDPOINT = `https://www.strava.com/api/v3/athletes/${userId}`;
  const { access_token: accessToken } = await getAccessToken();

  console.log(userId);
  
  // for parameter reference: https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
  // can prob do some parameter manipulaiton & loops to get desired outcome

  // epoch: https://www.epochconverter.com/
  // max per page seems to be 200

  // <------------------------- RETRIEVE DATA ------------------------------------>
  
  var response = await fetch(
      `${ATHLETES_ENDPOINT}/activities?access_token=${accessToken}&page=1&per_page=200`
  );
  var i = 2;
  var json : Array<SummaryActivity>;
  var pageJson : Array<SummaryActivity>;

  var runs = prettify(await response.json());
  
  while (response) {
    pageJson = prettify(await response.json());
    if (json) json.concat(pageJson);
    else json = pageJson;
    console.log(json);
    response = await fetch(
        `${ATHLETES_ENDPOINT}/activities?access_token=${accessToken}&page=${i}&per_page=200`
    );
    i++;
  }

    // const activities = json.map(
    //     // (activity) => activity
    //     (activity) => {
    //         return ({
    //             name: activity.name,
    //             type: activity.sport_type,
    //             start_date: activity.start_date_local,
    //             distance: activity.distance   // distance in meters
    //         })
    //     }
    // )
    
    // const runs = activities.filter(
    //     activity => activity.type === 'Run'
    // )

  return runs;


};
