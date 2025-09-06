/**
 * pages/api/getActivities.tsx
 *
 * API endpoint to get run activities for a specific user and day.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase"; // Use relative path if no alias
import SummaryActivity from "../../lib/strava/models/SummaryActivity";
import { prevMon } from "../../utils/utils";

/**
 *
 * @param req Contains strava_id
 * @param res
 * @returns Weekly training data from Supabase for this user.
 */
export default async function getTrainingData(
  req: NextApiRequest,
  res: NextApiResponse<Array<SummaryActivity> | { error: string }>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const strava_id: number = parseInt(req.body.strava_id, 10);

  if (!strava_id) {
    return res.status(400).json({ error: "Missing strava_id" });
  }

  const { data, error } = await supabase
    .from("activities")
    .select("distance, day")
    .eq("strava_id", strava_id);

  if (error) return res.status(500).json({ error: error.message });

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return res.status(404).json({ error: "No run activities found" });
  }

  var activities: Array<SummaryActivity> | null = [];

  data.forEach((item) => {
    activities.push({
      distance: item.distance,
      start_date: new Date(item.day),
      prev_mon: prevMon(new Date(item.day)),
    });
  });

  return res.status(200).json(activities);
}
