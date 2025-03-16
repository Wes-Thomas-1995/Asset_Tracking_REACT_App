import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

function DrawdownDistributionChart({ trades, distributionType }) {
  // Process data based on the selected distribution type
  const getDistributionData = () => {
    switch (distributionType) {
      case 'Gain':
        return trades
          .filter((trade) => trade.REALIZED_PNL > 0)
          .map((trade) => (trade.REALIZED_PNL / trade.EQUITY) * 100); // Calculate % gain
      case 'Loss':
        return trades
          .filter((trade) => trade.REALIZED_PNL < 0)
          .map((trade) => (trade.REALIZED_PNL / trade.EQUITY) * 100); // Calculate % loss
      case 'Drawdown':
        return trades
          .filter((trade) => trade.DRAWDOWN < 0)
          .map((trade) => trade.DRAWDOWN); // Use drawdown directly
      default:
        return [];
    }
  };

  const distributionData = getDistributionData();

  // Create buckets for the distribution
  const bucketStep = 5; // 5% increments
  let buckets;

  if (distributionType === 'Gain') {
    buckets = Array.from({ length: 20 }, (_, i) => (i + 1) * bucketStep); // 0% to 95%
  } else {
    buckets = Array.from({ length: 20 }, (_, i) => i * bucketStep * -1); // 0% to -100%
  }

  const bucketCounts = buckets.map((bucket) => {
    const lowerBound = bucket - bucketStep;
    const upperBound = bucket;

    return distributionData.filter(
      (value) => value > lowerBound && value <= upperBound
    ).length;
  });

  // Prepare chart data
  const chartData = {
    labels: buckets.map((bucket) => {
      const lowerBound = bucket - bucketStep;
      return distributionType === 'Gain'
        ? `${lowerBound}% to ${bucket}%`
        : `${bucket}% to ${lowerBound}%`;
    }),
    datasets: [
      {
        data: bucketCounts,
        backgroundColor:
          distributionType === 'Gain'
            ? 'rgba(34, 197, 94, 0.4)' // Softer green for gains
            : distributionType === 'Loss'
            ? 'rgba(239, 68, 68, 0.4)' // Softer red for losses
            : 'rgba(54, 162, 235, 0.4)', // Softer blue for drawdowns
        borderColor:
          distributionType === 'Gain'
            ? 'rgba(34, 197, 94, 1)'
            : distributionType === 'Loss'
            ? 'rgba(239, 68, 68, 1)'
            : 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        bottom: 20,
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      },
      legend: {
        display: false, // Remove legend
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide vertical gridlines
        },
        ticks: {
          color: '#d1d5db', // Light grey x-axis labels
          padding: 10,
        },
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)', // Subtle gridlines
        },
        ticks: {
          color: '#d1d5db', // Light grey y-axis labels
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-full" style={{ height: '40vh' }}>
      <h2 className="text-xl font-bold mb-4 text-gray-300 text-center">
        {distributionType} Distribution
      </h2>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default DrawdownDistributionChart;