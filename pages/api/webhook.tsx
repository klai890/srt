import Cors from 'cors'
import { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import {activityMileage} from '../../lib/strava/api/mileage-csv'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'

export const config = {
    api: {
      bodyParser: false,
    },
}

const cors = Cors({
    allowMethods: ['GET', 'POST', 'HEAD'],
})

function runMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    fn: Function
  ) {
    return new Promise((resolve, reject) => {
      fn(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result)
        }
  
        return resolve(result)
      })
    })
  }  
  
export default async function (req: NextApiRequest, res: NextApiResponse) {
    console.log("<-----========================= req =========---------------------------")
    console.log(req);
    
    await runMiddleware(req, res, cors)
    const session = await getServerSession(req, res, authOptions);

    console.log("<------------------------------ SESSION -------------------________>")
    console.log(session);
    

    // Run the middleware
    // await runMiddleware(req, res, cors)
    console.log("<--------------------------- webhook event received! ------------------------------->")

    if (req.method === 'POST') {
        console.log(req.body)
        console.log("<------------------------ WEBHOOK DATA -------------------------------------->")
        const body = (await buffer(req)).toString()
        const data = JSON.parse(body)
        console.log(data)

        // CHANGES OCCUR: Title, Type, Privacy, requires an access token with activity:read_all scope
        // TODO: Filter by aspect_type

        // ------------------------------------------- aspect_type: 'create' ---------------------------------
        if (data.object_type === 'activity') {
            // Retrieve Activity
            const activityId = data.object_id;

            // Retrieve access token
            const response = await fetch('/api/strava', {
                method: 'GET'
            }).then(t => t.json())
            .catch(err => console.error(err));
            var accessToken;
            if (response) accessToken = response.accessToken();

            console.log("<-------------------------------- res --------------------------->")
            console.log(response);
            

            // Get Mileage
            const distance = await activityMileage(activityId, accessToken);

            console.log("<------------------ DISTANCE ------------------------------------------------>")
            console.log(distance);

            // PUT google sheets.
        }

        // -------------------------------------------- aspect_type: 'delete' ----------------------------------

        // TODO: Error checking
        // TODO: Webhook Security

        res.status(200).send('EVENT_RECEIVED');      
    }

    else if (req.method === 'GET') {
          // Your verify token. Should be a random string.
        const VERIFY_TOKEN = "STRAVA";
        // Parses the query params
        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];
        // Checks if a token and mode is in the query string of the request
        if (mode && token) {
            // Verifies that the mode and token sent are valid
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {     
                // Responds with the challenge token from the request
                console.log('WEBHOOK_VERIFIED');
                res.json({"hub.challenge":challenge});  
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                res.status(403);      
            }
        }
    }
}