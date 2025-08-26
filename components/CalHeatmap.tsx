import CalHeatmap from 'cal-heatmap';
import CalendarLabel from 'cal-heatmap/plugins/CalendarLabel';
import Tooltip from 'cal-heatmap/plugins/Tooltip';
import ActivityWeek from '../lib/strava/models/ActivityWeek';
import { useRef, useEffect } from 'react';
import styles from '../styles/Mileage.module.css'

export default function Cal({data, latest, earliest} : {data: Array<ActivityWeek>, latest : Date, earliest : Date}) {
    const calRef = useRef(null);
    var heatmapData : Array<{date: Date, value: number}> = []
    data.forEach(week => {
        var weekStart : Date = new Date(week.week);
        for (var i = 0; i < 7; i++) {
            var day : Date = new Date(weekStart);
            day.setDate(day.getDate() + i);
            heatmapData.push({date: new Date(day), value: week[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][i]]});
        }
    })

    useEffect(()=>{
        if (!calRef.current && heatmapData.length > 0) {
            const cal = new CalHeatmap();
            var date = earliest;

            cal.paint({
                itemSelector: "#calHeatmap",
                theme: 'light',
                domain: {
                    type: 'year', 
                    sort: 'asc', 
                },
                subDomain: {
                    type: 'day',
                    width: 21,
                    height: 25,
                },
                date: {
                    start: earliest,
                    min: earliest,
                    max: latest,
                },
                range: 1,
                data: {
                    source: heatmapData,
                    x: 'date',
                    y: 'value',
                },
                scale: {
                    color: {
                        type: 'quantize',
                        scheme: 'Oranges',
                        domain: [0, 1, 2, 3, 4, 5, 6, 7],
                    },
                },
            }, [
                [Tooltip], 
                [CalendarLabel,
                    {
                        width: 30,
                        textAlign: 'start',
                        text: () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                    }
                ]
            ]);
            calRef.current = cal;
        }
    }, [])
    
    return (
    <div>
        <h2>Run Heatmap</h2>
        <div>
            <div id="calHeatmap" className={styles.calHeatmap}></div>
            <div className={styles.calendarBtnContainer}>
                <a href="#" className={styles.btnSubtle} onClick={e => {
                    e.preventDefault();
                    calRef.current.previous();
                }}>← Previous</a>
                <a href="#" className={styles.btnSubtle} onClick={e => {
                    e.preventDefault();
                    calRef.current.next();
                }}>Next →</a>
            </div>
        </div>
  </div>)
}
