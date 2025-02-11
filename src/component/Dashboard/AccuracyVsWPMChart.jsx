// src/components/AccuracyVsWPMChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';

const AccuracyVsWPMChart = ({ data }) => {
  
  const chartData = {
    labels: data.map(item => item.wpm),
    datasets: [
      {
        label: 'Accuracy vs WPM',
        data: data.map(item => item.accuracy),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Words Per Minute (WPM)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Accuracy (%)',
        },
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default AccuracyVsWPMChart;
