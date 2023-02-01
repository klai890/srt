import Cors from 'cors'
import { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'

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
    // Run the middleware
    // await runMiddleware(req, res, cors)

    if (req.method === 'POST') {
        console.log("<--------------------------- webhook event received! ------------------------------->")
        console.log("<------------------------ WEBHOOK DATA -------------------------------------->")
        const body = (await buffer(req)).toString()
        const data = JSON.parse(body)
        console.log(data)
        
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