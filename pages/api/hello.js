// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

/** ---------------------- AUTHORIZE -------------------------- */

// This is an example of how to read a JSON Web Token from an API route
import { getToken } from "next-auth/jwt"
import { getActivities } from '../../lib/strava';


// import type { NextApiRequest, NextApiResponse } from "next"

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   // If you don't have the NEXTAUTH_SECRET environment variable set,
//   // you will have to pass your secret as `secret` to `getToken`
//   const token = await getToken({ req })
//   res.send(JSON.stringify(token, null, 2))


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
  const activities = await getActivities(token.id);
  console.log(activities);
  /* Display JSON Token to screen */
  res.send(JSON.stringify(activities, null, 2))
  // res.send(JSON.stringify(token, null, 2))
};