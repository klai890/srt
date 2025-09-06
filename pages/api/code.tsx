/**
 * Retrieves code from a given JWT token
 */

import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const KEY = process.env.JWT_KEY;

export default function (req: NextApiRequest, res: NextApiResponse) {
  console.log(
    "<---------------------------------------------/API/CODE REQ -------------------------------->",
  );
  console.log(req.body);

  const { code_jwt } = req.body;
  const { code } = jwt.verify(code_jwt, KEY) as { [key: string]: string };
  res.json({ code });
}
