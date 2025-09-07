/**
 * pages/api/storeActivities.tsx
 *
 * API endpoint to store run activities for a specific user
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase"; // Use relative path if no alias
import SummaryActivity from "../../lib/strava/models/SummaryActivity";

/**
 *
 * @param req Contains strava_id, and an array of objects each with distance (miles), day (Date)
 * @param res
 * @returns Stores the run activities in Supabase.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    return res.status(200).end();
  }

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const strava_id: number = req.body.strava_id;
  const activities: Array<SummaryActivity> = req.body.activities;
  var formatted_activities = activities.map((a) => {
    return {
      strava_id: strava_id,
      distance: a.distance,
      day: new Date(a.start_date).toLocaleDateString(),
    };
  });

  const { data, error } = await supabase
    .from("activities")
    .insert(formatted_activities);

  if (error) {
    console.error("Error storing training data: ", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: "Data stored successfully", data: data });
}
