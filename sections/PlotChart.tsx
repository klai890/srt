import { Line } from 'react-chartjs-2'; // Line chart from react-chartjs-2
import { Chart as ChartJS, registerables } from 'chart.js';
import React from 'react';
import MileagePoint from '../lib/strava/models/MileagePoint';

// Registering the necessary chart.js components
ChartJS.register(...registerables);

interface PlotProps {
  plotData: MileagePoint[];
}

export default function PlotChart ({ plotData }){
  // Prepare data for the chart
  const chartData = {
    labels: plotData.map((dataPoint) => {
      // Format the date for the x-axis
      return dataPoint.day.toLocaleDateString('en-US');
    }),
    datasets: [
      {
        label: '7-Day Mileage Over Time',
        data: plotData.map((dataPoint) => dataPoint.value),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  return (
    <>
      <h2>Day vs 7-Day Mileage Plot</h2>
      <Line data={chartData} />
    </>
  );

};
