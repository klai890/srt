// Logs into Strava

import { NextApiRequest, NextApiResponse } from "next"
import jwt from 'jsonwebtoken'

const KEY = process.env.JWT_KEY;

function Login(req: NextApiRequest, res: NextApiResponse) {

    console.log("<------------------REQ.BODY----------------->");
    console.log(req.body);

    // ERROR
    if (!req.body) {
        res.statusCode = 404;
        res.end('Error')
        return;
    }

    const {access_token, token_type, expires_in, scope} = req.body;

    // Create JWT Token
    const jwtToken = jwt.sign({
        access_token,
        token_type,
        expires_in,
        scope
    }, KEY)

    // Response
    res.json({
        token: jwtToken
    })
}

export default Login