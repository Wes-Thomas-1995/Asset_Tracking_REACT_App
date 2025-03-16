import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler);

function BalanceLineChart({ Balance_Data = [] }) {
  if (!Array.isArray(Balance_Data) || Balance_Data.length === 0) {
    return <div className="text-gray-300">No data available</div>;
  }

  // Prepare data for Chart.js
  const labels = Balance_Data.map((_, index) => index + 1); // X-axis labels: 1, 2, 3, ...
  const endAmountData = Balance_Data.map((entry) => entry.END_AMOUNT.toFixed(2));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Portfolio Balance',
        data: endAmountData,
        borderColor: 'rgba(34, 197, 94, 1)', // Green for the line
        backgroundColor: 'rgba(34, 197, 94, 0.3)', // Shading under the line
        borderWidth: 2,
        fill: 'origin', // Enable shading under the line
        tension: 0.4, // Smooth the line
        pointRadius: 3, // Point size
        hoverRadius: 6, // Point size on hover
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Show legend
        labels: {
          color: '#ffffff', // White legend text
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          title: (tooltipItems) => `Trade Number: ${tooltipItems[0].label}`, // Tooltip title
          label: (tooltipItem) =>
            `Portfolio Balance: $${tooltipItem.raw.toLocaleString()}`, // Tooltip label
        },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          display: true,
          color: '#ffffff', // White x-axis labels
        },
        title: {
          display: true,
          text: 'Trade Number',
          color: '#ffffff', // White axis title
        },
      },
      y: {
        grid: { display: true },
        ticks: {
          display: true,
          color: '#ffffff', // White y-axis labels
          callback: (value) => `$${value.toLocaleString()}`, // Format y-axis values
        },
        title: {
          display: true,
          text: 'Portfolio Balance ($)',
          color: '#ffffff', // White axis title
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-full h-[400px]">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default BalanceLineChart;