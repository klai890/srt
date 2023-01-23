/**
 * Unpack a token
 */

import { NextApiRequest, NextApiResponse } from "next";
import jwt from 'jsonwebtoken'

const KEY = process.env.JWT_KEY;

export default function (req: NextApiRequest, res: NextApiResponse){
    const {token} = req.body;

    console.log("<------------------------------------TOKEN --------------------------->");
    console.log(token);

    const {admin} = jwt.verify(token, KEY) as {[key: string]: boolean}
    const verifiedToken = jwt.verify(token, KEY);
    console.log("<---------------------------- VERIFIED TOKEN --------------------->")
    console.log(verifiedToken);
    

    if (admin){
        res.json({secretAdminCode: 12345})
    }
    else {
        res.json({admin: false})
    }
}