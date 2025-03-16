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

function DrawdownDistributionChart({ trades, distributionType, maxBound = 100 }) {
  const getDistributionData = () => {
    switch (distributionType) {
      case 'Gain':
        return trades
          .filter((trade) => trade.STATUS === 'SUCCESS')
          .map((trade) => Math.abs(trade.PERCENTAGE_CHANGE));
      case 'Loss':
        return trades
          .filter((trade) => trade.STATUS === 'FAILURE')
          .map((trade) => Math.abs(trade.PERCENTAGE_CHANGE));
      case 'Drawdown':
        return trades.map((trade) => Math.abs(trade.MAX_DRAWDOWN));
      default:
        return [];
    }
  };

  const distributionData = getDistributionData();

  // Define the step size for each bucket
  const bucketStep = maxBound / 100; // Divide maxBound into 100 buckets
  const buckets = Array.from({ length: 100 }, (_, i) => (i + 1) * bucketStep); // 100 scaled buckets

  const bucketCounts = buckets.map((upperBound, index) => {
    const lowerBound = index === 0 ? 0 : buckets[index - 1];
    return distributionData.filter(
      (value) => value > lowerBound && value <= upperBound
    ).length;
  });

  const chartData = {
    labels: buckets.map((upperBound, index) => {
      const lowerBound = index === 0 ? 0 : buckets[index - 1];
      return `${lowerBound.toFixed(2)}% to ${upperBound.toFixed(2)}%`;
    }),
    datasets: [
      {
        data: bucketCounts,
        backgroundColor:
          distributionType === 'Gain'
            ? 'rgba(34, 197, 94, 0.4)'
            : distributionType === 'Loss'
            ? 'rgba(239, 68, 68, 0.4)'
            : 'rgba(54, 162, 235, 0.4)',
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
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#d1d5db',
          padding: 10,
        },
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#d1d5db',
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