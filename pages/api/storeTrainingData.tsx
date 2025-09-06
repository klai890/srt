import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase"; // Use relative path if no alias
import ActivityWeek from "../../lib/strava/models/ActivityWeek";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const strava_id: number = req.body.strava_id;
  const week_data: Array<ActivityWeek> = req.body.activity_weeks;

  var formatted_week_data = week_data.map((wk) => {
    return {
      strava_id: strava_id,
      week_start: new Date(wk.week).toLocaleDateString(),
      monday: wk["monday"],
      tuesday: wk["tuesday"],
      wednesday: wk["wednesday"],
      thursday: wk["thursday"],
      friday: wk["friday"],
      saturday: wk["saturday"],
      sunday: wk["sunday"],
      mileage: wk["mileage"],
    };
  });

  const { data, error } = await supabase
    .from("week_data")
    .upsert(formatted_week_data, { onConflict: "strava_id, week_start" });

  if (error) {
    console.error("Error storing training data: ", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: "Data stored successfully", data: data });
}
