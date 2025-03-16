import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

const PortfolioChart = ({ apiData }) => {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const portfolioSeriesRef = useRef(null);
  const cashSeriesRef = useRef(null);

  useEffect(() => {
    if (!apiData || !apiData.all) return;

    if (chartInstanceRef.current) {
      // Clean up existing chart instance
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    // Initialize the chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#334158' },
        horzLines: { color: '#334158' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#485c7b',
      },
      timeScale: {
        borderColor: '#485c7b',
      },
    });

    // Portfolio Value (Green Line)
    const portfolioSeries = chart.addLineSeries({
      color: '#00FF00', // Green
      lineWidth: 2,
      title: 'Portfolio Value',
    });

    // Cash Invested (Yellow Line)
    const cashSeries = chart.addLineSeries({
      color: '#FFFF00', // Yellow
      lineWidth: 2,
      title: 'Cash Invested',
    });

    // Format the data for the chart
    const chartData = apiData.all.map((item) => ({
      time: new Date(item.DATE).getTime() / 1000, // Convert date to UNIX timestamp
      portfolioValue: item.PORTFOLIO_VALUE,
      cashInvested: item.CASH_INVESTED,
    }));

    // Set data to respective series
    portfolioSeries.setData(
      chartData.map((data) => ({
        time: data.time,
        value: Math.round(data.portfolioValue), // Round to 0 decimal places
      }))
    );

    cashSeries.setData(
      chartData.map((data) => ({
        time: data.time,
        value: Math.round(data.cashInvested), // Round to 0 decimal places
      }))
    );

    // Dynamically set the Y-axis range to always include 0


    const priceScale = chart.priceScale('right');
    priceScale.applyOptions({
      scaleMargins: {
        top: 0.2,
        bottom: 0,
      },
    });

    chart.priceScale('right').applyOptions({
      autoScale: true,
    });

    chart.timeScale().fitContent();

    // Format Y-axis values
    priceScale.applyOptions({
      priceFormat: {
        type: 'custom',
        formatter: (value) =>
          value.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      },
    });

    // Save references to series
    portfolioSeriesRef.current = portfolioSeries;
    cashSeriesRef.current = cashSeries;

    // Save reference to chart
    chartInstanceRef.current = chart;

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [apiData]);

  return <div ref={chartContainerRef} style={{ height: '400px' }} />;
};

export default PortfolioChart;