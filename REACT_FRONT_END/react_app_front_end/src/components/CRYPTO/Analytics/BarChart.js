import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const BarChart = ({ yAxisLabels, dataPoints, title }) => {
  // Chart data configuration
  const data = {
    labels: yAxisLabels, // Use yAxisLabels for horizontal bars
    datasets: [
      {
        label: 'Dataset',
        data: dataPoints, // Data points for the bars
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // Bar fill color
        borderColor: 'rgba(34, 197, 94, 1)', // Bar border color
        borderWidth: 1, // Bar border width
      },
    ],
  };

  // Chart options configuration
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Horizontal bars
    scales: {
      x: {
        beginAtZero: true, // Start x-axis from zero
        grid: {
          display: false, // Remove x-axis gridlines
        },
        ticks: {
          color: '#d1d5db', // Light grey x-axis labels
        },
        title: {
          display: true, // Show X-axis title
          text: title, // Label text
          color: '#d1d5db', // Light grey color for the label
          font: {
            size: 14, // Font size
            weight: 'bold', // Font weight
          },
          padding: 10, // Padding for the label
        },
      },
      y: {
        grid: {
          display: false, // Remove y-axis gridlines
        },
        ticks: {
          color: '#d1d5db', // Light grey y-axis labels
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hide legend (optional)
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw.toLocaleString()}`, // Format tooltip values
        },
      },
    },
  };

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg" style={{ height: '400px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;