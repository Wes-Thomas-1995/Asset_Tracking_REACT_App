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

function ProfitabilityBarChart({ trades }) {
  // Aggregate data by day
  const aggregatedData = trades.reduce((acc, trade) => {
    // Remove time from EXIT_DATE
    const tradeDate = trade.EXIT_DATE.split('T')[0]; // Retain only the date portion
    const existing = acc.find((item) => item.date === tradeDate);

    if (existing) {
      existing.netChange += trade.REALIZED_PNL;
    } else {
      acc.push({ date: tradeDate, netChange: trade.REALIZED_PNL });
    }

    return acc;
  }, []);

  // Sort aggregated data by date (oldest to newest)
  aggregatedData.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Find the maximum and minimum values for Y-axis
  const maxValue = Math.max(...aggregatedData.map((entry) => entry.netChange), 0);
  const minValue = Math.min(...aggregatedData.map((entry) => entry.netChange), 0);

  // Calculate Y-axis max and min dynamically with padding
  const rangePadding = (maxValue - minValue) * 0.1 || 1; // Add 10% padding or default to 1
  const yAxisMax = Math.ceil(maxValue + rangePadding);
  const yAxisMin = Math.floor(minValue - rangePadding);

  // Prepare chart data
  const chartData = {
    labels: aggregatedData.map((entry) => entry.date), // X-axis: Dates (day only)
    datasets: [
      {
        label: 'Net Trading Results',
        data: aggregatedData.map((entry) => entry.netChange),
        backgroundColor: aggregatedData.map((entry) =>
          entry.netChange > 0 ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)' // Softer colors
        ),
        borderColor: aggregatedData.map((entry) =>
          entry.netChange > 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide vertical gridlines
        },
        ticks: {
          display: true, // Show x-axis ticks
        },
      },
      y: {
        grid: {
          display: true, // Show horizontal gridlines
        },
        ticks: {
          callback: (value) => `$${value}`, // Format tick labels as currency
        },
        suggestedMin: yAxisMin, // Dynamically set Y-axis minimum
        suggestedMax: yAxisMax, // Dynamically set Y-axis maximum
      },
    },
  };

  return (

      <Bar data={chartData} options={options} />

  );
}

export default ProfitabilityBarChart;