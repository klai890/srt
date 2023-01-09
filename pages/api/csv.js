// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

/** ---------------------- AUTHORIZE -------------------------- */

// This is an example of how to read a JSON Web Token from an API route
import { getToken } from "next-auth/jwt"
import { formatData, headers } from '../../lib/strava/api/mileage-csv';

/**  --------------------- CREATE STRAVA API -------------------- */

var StravaApiV3 = require('strava_api_v3');
var defaultClient = StravaApiV3.ApiClient.instance;

// // Configure OAuth2 access token for authorization: strava_oauth
var strava_oauth = defaultClient.authentications['strava_oauth'];
strava_oauth.accessToken = process.env.STRAVA_ACCESS_TOKEN;

var athletesApi = new StravaApiV3.AthletesApi();
var activitiesApi = new StravaApiV3.ActivitiesApi();


/* ----------------------- MAKE STRAVA API CALL --------------------- */
export default async function handler(req, res) {
  const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});

  // console.log("TOKEN: ");
  // console.log(token);
  if (token) {
    const data = await formatData(token.id);
  
    // console.log("DATA: " + data)
    res.send(JSON.stringify(data, null, 2))
  }

  else {
    res.status(401).send("");
  }

  /* Display JSON Token to screen */
//   res.send(JSON.stringify(data, null, 2))
  // res.send(JSON.stringify(token, null, 2))
};