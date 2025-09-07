/**
 * pages/api/getTrainingData.tsx
 *
 * API endpoint to get weekly training data for a specific user and week.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase"; // Use relative path if no alias
import ActivityWeek from "../../lib/strava/models/ActivityWeek";

export default async function getTrainingData(
  req: NextApiRequest,
  res: NextApiResponse<Array<ActivityWeek> | { error: string }>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // strava_id must be int
  const strava_id: number = parseInt(req.body.strava_id, 10);

  if (!strava_id) {
    return res.status(400).json({ error: "Missing strava_id" });
  }

  const { data, error } = await supabase
    .from("week_data")
    .select(
      "week_start, monday, tuesday, wednesday, thursday, friday, saturday, sunday, mileage",
    )
    .eq("strava_id", strava_id);

  if (error) return res.status(500).json({ error: error.message });

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return res.status(404).json({ error: "No training data found" });
  }

  const activityWeeks: Array<ActivityWeek> = data.map((d) => {
    return {
      week: new Date(d.week_start + "T00:00:00").toLocaleDateString(), // Rename `week_start` to `week`
      monday: d.monday,
      tuesday: d.tuesday,
      wednesday: d.wednesday,
      thursday: d.thursday,
      friday: d.friday,
      saturday: d.saturday,
      sunday: d.sunday,
      mileage: d.mileage,
    };
  });

  return res.status(200).json(activityWeeks);
}
