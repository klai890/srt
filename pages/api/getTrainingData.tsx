/**
 * pages/api/getTrainingData.tsx
 * 
 * API endpoint to get weekly training data for a specific user and week.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from '../../lib/supabase'; // Use relative path if no alias
import ActivityWeek from "../../lib/strava/models/ActivityWeek";

export default async function getTrainingData(req : NextApiRequest, res: NextApiResponse <ActivityWeek | { error: string }>) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    // strava_id, week_start must be int and Date respectively.
    const strava_id : number = parseInt(req.body.strava_id, 10);
    const week_start : Date = new Date(req.body.week_start);

    if (!strava_id || !week_start) {
        return res.status(400).json({ error: "Missing strava_id or week_start" });
    }

    const { data , error } = await supabase
        .from("week_data")
        .select("week_start, monday, tuesday, wednesday, thursday, friday, saturday, sunday, mileage")
        .eq('strava_id', strava_id)
        .eq('week_start', week_start.toISOString().split("T")[0])
        .single()

    if (error) return res.status(500).json({error: error.message});

    if (!data || (Array.isArray(data) && data.length === 0)) {
        return res.status(404).json({ error: "No training data found" });
    }    

    const activityWeek: ActivityWeek = {
        week: (new Date(data.week_start + 'T00:00:00')).toLocaleDateString(), // Rename `week_start` to `week`
        monday: data.monday,
        tuesday: data.tuesday,
        wednesday: data.wednesday,
        thursday: data.thursday,
        friday: data.friday,
        saturday: data.saturday,
        sunday: data.sunday,
        mileage: data.mileage,
    };

    return res.status(200).json(activityWeek);
}
