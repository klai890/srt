/**
 * Retrieves access_token from a given JWT token
 */

import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const KEY = process.env.JWT_KEY;

export default function (req: NextApiRequest, res: NextApiResponse) {
  const { jwt_token } = req.body;
  const { access_token } = jwt.verify(jwt_token, KEY) as {
    [key: string]: string;
  };
  res.json({ access_token });
}
