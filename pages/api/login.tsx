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

    const {username, password} = req.body;

    // Create JWT Token
    const jwtToken = jwt.sign({
        username,
        admin: username=='admin' && password=='admin',
    }, KEY)

    // Response
    res.json({
        token: jwtToken
    })
}

export default Login