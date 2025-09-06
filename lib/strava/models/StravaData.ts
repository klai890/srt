import ActivityWeek from "./ActivityWeek"
import SummaryActivity from "./SummaryActivity"

export type StravaData = {
    week_data: Array<ActivityWeek>,
    raw_data: Array<SummaryActivity>
}