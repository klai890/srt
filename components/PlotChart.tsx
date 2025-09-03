import { Line } from 'react-chartjs-2'; // Line chart from react-chartjs-2
import { Chart as ChartJS, registerables } from 'chart.js';
import React from 'react';
import MileagePoint from '../lib/strava/models/MileagePoint';

// Registering the necessary chart.js components
ChartJS.register(...registerables);

export default function PlotChart ({ plotData, time_interval_label }){

  const chartData = {
    labels: plotData.map((dataPoint) => {
      // Date MM/DD for x-axis
      const month = (dataPoint.day.getMonth() + 1).toString().padStart(2, '0');
      const day = dataPoint.day.getDate().toString().padStart(2, '0');
      return `${month}/${day}`;
    }),
    
    datasets: [
      {
        label: `${time_interval_label} Mileage Over Time`,
        data: plotData.map((dataPoint) => dataPoint.value),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y:{
        title: {
          text: `Previous ${time_interval_label} Mileage`,
          display: true,
        }
      },
      x: {
        title: {
          text: 'Date (MM/DD)',
          display: true
        }
      }
    }
  };

  return (
    <>
      <h2>Day vs {time_interval_label} Mileage</h2>
      <Line data={chartData} options={chartOptions} />
    </>
  );
};
