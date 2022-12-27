// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

/** ---------------------- AUTHORIZE -------------------------- */

// This is an example of how to read a JSON Web Token from an API route
import { getToken } from "next-auth/jwt"

import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // If you don't have the NEXTAUTH_SECRET environment variable set,
  // you will have to pass your secret as `secret` to `getToken`
  const token = await getToken({ req })
  res.send(JSON.stringify(token, null, 2))
}

/**  --------------------- CALL STRAVA API -------------------- */

// var StravaApiV3 = require('strava_api_v3');
// var defaultClient = StravaApiV3.ApiClient.instance;

// Configure OAuth2 access token for authorization: strava_oauth
// var strava_oauth = defaultClient.authentications['strava_oauth'];
// strava_oauth.accessToken = "3ae0997262becbed5cd70ac8ac2f26c00eae7a78"

// var api = new StravaApiV3.AthletesApi()


/* ----------------------- MAKE STRAVA API CALL --------------------- */
// export default function handler(req, res) {
//   var callback = function(error, data, response) {
//     if (error) {
//       console.error(error);
//     } else {
//       console.log('API called successfully. Returned data: ' + data);
//     }
    // console.log("<---------------------RESPONSE------------------->");
    // console.log(JSON.parse(response.text)); // oh god, please remember to do JSON.parse....

//     res.status(200).json({ data: response.text })
//   };

//   api.getLoggedInAthlete(callback);
// };