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
  const week_start: Date = new Date(req.body.week_start);
  const activity_data: ActivityWeek = req.body.activity_week;

  const { data, error } = await supabase.from("training_data").upsert(
    {
      strava_id: strava_id,
      week_start: new Date(week_start).toLocaleDateString(),
      monday: activity_data["monday"],
      tuesday: activity_data["tuesday"],
      wednesday: activity_data["wednesday"],
      thursday: activity_data["thursday"],
      friday: activity_data["friday"],
      saturday: activity_data["saturday"],
      sunday: activity_data["sunday"],
    },
    { onConflict: "strava_id, week_start" },
  );

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: "Data stored successfully", data: data });
}
