import SummaryActivity from "../lib/strava/models/SummaryActivity"
import { Bar } from 'react-chartjs-2'

const BIN_SIZE = 1; // 1 mile bins

const prepareHistogramData = (activities: Array<SummaryActivity>) => {
    var histogramData = activities.map(a => a.distance);

    const max = Math.max(...histogramData);
    var labels = []
    for (var i = 0; i < Math.floor(max); i++) {
        labels.push(`${i} to ${i+1}`);
    }
    var counts = new Array(Math.floor(max)+1).fill(0);
    histogramData.forEach(dist => {
        counts[Math.floor(dist)]++;
    })

    return {
        counts: counts,
        labels: labels
    }
}

export default function PlotHistogram ({ activities } : { activities: Array<SummaryActivity> }) { 
    var histogramData = prepareHistogramData(activities);
    var counts = histogramData['counts'];
    var labels = histogramData['labels'];

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Number of Runs',
                data: counts,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(255, 135, 84, 1)', // Sets a single color for all bars
                tension: 0.1,
            }
        ]
    }

    const chartOptions = {
        scales: {
            y: {
                title: { 
                    text: 'Number of Runs',
                    display: true,
                    font: {
                        size: 15
                    }
                },
                ticks: {
                    font: {
                        size: 14
                    }
                }
            },
            x: {
                title: {
                    text: 'Distances (miles)',
                    display: true,
                    font: {
                        size: 15
                    }
                },
                ticks: {
                    font: {
                        size: 14
                    }
                }
            }
        }
    }

    return (
        <>
            <h2>Histogram of Run Distances</h2>
            <Bar data={chartData} options={chartOptions} />
        </>
    )
}