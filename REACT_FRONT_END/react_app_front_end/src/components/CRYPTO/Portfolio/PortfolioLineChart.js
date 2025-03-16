import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler);

function PortfolioLineChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-gray-300">No data available</div>; // Handle empty data case
  }

  // Prepare data for Chart.js
  const labels = data.map((entry) => entry.DATE); // Dates for x-axis
  const balanceData = data.map((entry) => entry.PORTFOLIO_BALANCE);
  const commitmentData = data.map((entry) => entry.COMMITMENT_BALANCE);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Balance',
        data: balanceData,
        borderColor: 'rgba(34, 197, 94, 1)', // Green for balance
        backgroundColor: 'rgba(34, 197, 94, 0.3)', // Shading color under the line
        borderWidth: 2,
        fill: 'origin', // Enable shading under the line
        tension: 0.4, // Smooth the line
        pointRadius: 2, // Smaller points
        hoverRadius: 6, // Hover size
      },
      {
        label: 'Commitment',
        data: commitmentData,
        borderColor: 'rgba(255, 205, 86, 1)', // Yellow for commitment
        backgroundColor: 'rgba(255, 205, 86, 0.3)', // Shading color under the line
        borderWidth: 2,
        fill: 'origin', // Enable shading under the line
        tension: 0.4, // Smooth the line
        pointRadius: 2, // Smaller points
        hoverRadius: 6, // Hover size
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      tooltip: {
        enabled: true, // Enable tooltips
        mode: 'index', // Show values for all datasets at the hovered index
        intersect: false, // Allow hovering anywhere along the X-axis
        callbacks: {
          title: (tooltipItems) => `Date: ${tooltipItems[0].label}`, // Customize tooltip title
          label: (tooltipItem) =>
            `${tooltipItem.dataset.label}: $${tooltipItem.raw.toLocaleString()}`, // Customize label format
        },
      },
    },
    interaction: {
      mode: 'nearest', // Ensure the closest point is highlighted
      intersect: false, // Highlight even when not directly over a point
    },
    scales: {
      x: {
        grid: { display: false }, // Remove vertical gridlines
        ticks: { display: true }, // Show x-axis labels
      },
      y: {
        grid: { display: true }, // Keep horizontal gridlines
        ticks: {
          display: true, // Show y-axis labels
          callback: (value) => `$${value.toLocaleString()}`, // Format y-axis values as currency
        },
        beginAtZero: true, // Start y-axis from zero
      },
    },
  };

  return (

      <Line data={chartData} options={chartOptions} />

  );
}

export default PortfolioLineChart;