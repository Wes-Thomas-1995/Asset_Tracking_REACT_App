import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

const CandlestickChart = ({
    apiData,
    overlayIndicators,
    separateIndicators,
    selectedStrategies,
    buySignals,
    sellSignals,
    selectedTimeframe,
    setSelectedTimeframe,
    selectedWindow,
    setSelectedWindow,
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const separateChartsContainerRef = useRef(null);
  const separateChartsRefs = useRef({});
  const groupedSeparateIndicators = {
    STOCHASTIC_OSCILLATOR: ["%K", "%D"],
    MACD: ["MACD", "MACD_SIGNAL", "MACD_DIFF"],
  };
  const overlaySeriesRefs = useRef({});

  const initializeChart = () => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      rightPriceScale: {
        minimumWidth: 90,
        borderVisible: true,
        borderColor: '#485c7b',
        scaleMargins: {
          top: 0.2,
          bottom: 0.2, // Ensures consistent spacing for the main chart
        },
      },
      timeScale: {
        borderColor: '#485c7b',
      },
      grid: {
        vertLines: { color: '#334158' },
        horzLines: { color: '#334158' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    });

    candleSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#4bffb5',
      downColor: '#ff4976',
      borderUpColor: '#4bffb5',
      borderDownColor: '#ff4976',
      wickUpColor: '#838ca1',
      wickDownColor: '#838ca1',
    });
  };

  const cleanupChart = () => {
    // Cleanup overlay indicators
    Object.keys(overlaySeriesRefs.current).forEach((key) => {
      chartRef.current?.removeSeries(overlaySeriesRefs.current[key]);
    });
    overlaySeriesRefs.current = {};

    // Cleanup separate charts
    Object.values(separateChartsRefs.current).forEach(({ chart }) => {
      chart.remove();
    });
    separateChartsRefs.current = {};

    // Remove the main chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    }

    // Clear separate charts container
    if (separateChartsContainerRef.current) {
      separateChartsContainerRef.current.innerHTML = '';
    }
  };

  const setVisibleWindow = (window) => {
    if (!chartRef.current || !candleSeriesRef.current) return;

    const now = Math.floor(Date.now() / 1000);
    let from;

    switch (window) {
      case '1W':
        from = now - 7 * 24 * 60 * 60;
        break;
      case '1M':
        from = now - 30 * 24 * 60 * 60;
        break;
      case '3M':
        from = now - 90 * 24 * 60 * 60;
        break;
      case 'YTD':
        const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime() / 1000;
        from = startOfYear;
        break;
      case '1Y':
        from = now - 365 * 24 * 60 * 60;
        break;
      default:
        return;
    }

    chartRef.current.timeScale().setVisibleRange({ from, to: now });
  };

  const syncTimeScale = (sourceChart, targetChart) => {
    const sourceTimeScale = sourceChart.timeScale();
    const targetTimeScale = targetChart.timeScale();

    sourceTimeScale.subscribeVisibleLogicalRangeChange((newRange) => {
      if (newRange) {
        targetTimeScale.setVisibleLogicalRange(newRange);
      }
    });
  };

  useEffect(() => {
    initializeChart();

    return () => cleanupChart();
  }, []);

  useEffect(() => {
    if (!candleSeriesRef.current || !apiData.length) return;

    const formattedData = apiData.map((item) => ({
      time: Math.floor(new Date(item.DATE).getTime() / 1000),
      open: parseFloat(item.OPEN),
      high: parseFloat(item.HIGH),
      low: parseFloat(item.LOW),
      close: parseFloat(item.CLOSE),
    }));

    candleSeriesRef.current.setData(formattedData);

    // Set the visible window once data is loaded
    if (selectedWindow) {
      setVisibleWindow(selectedWindow);
    }
  }, [apiData, selectedWindow]);

  useEffect(() => {
    if (!chartRef.current || !apiData.length) return;

    // Cleanup and reapply indicators
    cleanupChart();
    initializeChart();

    // Apply OHLC data
    if (candleSeriesRef.current && apiData.length) {
      const formattedData = apiData.map((item) => ({
        time: Math.floor(new Date(item.DATE).getTime() / 1000),
        open: parseFloat(item.OPEN),
        high: parseFloat(item.HIGH),
        low: parseFloat(item.LOW),
        close: parseFloat(item.CLOSE),
      }));
      candleSeriesRef.current.setData(formattedData);
    }

    // Apply overlay indicators
    overlayIndicators.forEach((indicator) => {
      if (!overlaySeriesRefs.current[indicator]) {
        overlaySeriesRefs.current[indicator] = chartRef.current.addLineSeries({
          color: '#ffcc00',
          lineWidth: 2,
        });
      }
      const data = apiData.map((item) => ({
        time: Math.floor(new Date(item.DATE).getTime() / 1000),
        value: parseFloat(item[indicator]),
      }));
      overlaySeriesRefs.current[indicator].setData(data);
    });

    let remainingIndicators = [...separateIndicators];

    // Process grouped indicators
    Object.entries(groupedSeparateIndicators).forEach(([group, indicators]) => {
        const isGroupPresent = remainingIndicators.some((indicator) => indicators.includes(indicator) || indicator === group);
        if (isGroupPresent) {
          const container = document.createElement('div');
          container.style.height = '200px';
          container.style.marginTop = '10px';
          separateChartsContainerRef.current.appendChild(container);
      
          const separateChart = createChart(container, {
            width: chartContainerRef.current.clientWidth,
            height: 200,
            layout: { background: { color: 'transparent' }, textColor: '#ffffff' },
            rightPriceScale: {
              minimumWidth: 90,
              borderColor: '#485c7b',
              scaleMargins: {
                top: 0.2,
                bottom: 0.2,
              },
            },
            timeScale: {
              borderColor: '#485c7b',
            },
            grid: {
              vertLines: { color: '#334158' },
              horzLines: { color: '#334158' },
            },
          });
      
          const seriesMap = {};
          indicators.forEach((indicator, index) => {
            seriesMap[indicator] = separateChart.addLineSeries({
              color: index === 0 ? '#00ccff' : '#ffcc00', // Different color for each series
              lineWidth: 2,
            });
      
            const data = apiData.map((item) => ({
              time: Math.floor(new Date(item.DATE).getTime() / 1000),
              value: parseFloat(item[indicator]),
            }));
      
            seriesMap[indicator].setData(data);
          });
      
          separateChartsRefs.current[group] = { chart: separateChart, seriesMap };
      
          syncTimeScale(chartRef.current, separateChart);
          syncTimeScale(separateChart, chartRef.current);
      
          // Remove all related indicators from remainingIndicators
          remainingIndicators = [...remainingIndicators.filter(
            (indicator) => !indicators.includes(indicator) && indicator !== group
          )];
        }
      });
    
    // Process remaining indicators
    remainingIndicators.forEach((indicator) => {
      if (!separateChartsRefs.current[indicator]) {
        const container = document.createElement('div');
        container.style.height = '200px';
        container.style.marginTop = '10px';
        separateChartsContainerRef.current.appendChild(container);
    
        const separateChart = createChart(container, {
          width: chartContainerRef.current.clientWidth,
          height: 200,
          layout: { background: { color: 'transparent' }, textColor: '#ffffff' },
          rightPriceScale: {
            minimumWidth: 90,
            borderColor: '#485c7b',
            scaleMargins: {
              top: 0.2,
              bottom: 0.2,
            },
          },
          timeScale: {
            borderColor: '#485c7b',
          },
          grid: {
            vertLines: { color: '#334158' },
            horzLines: { color: '#334158' },
          },
        });
    
        const lineSeries = separateChart.addLineSeries({
          color: '#00ccff',
          lineWidth: 2,
        });
    
        separateChartsRefs.current[indicator] = { chart: separateChart, series: lineSeries };
    
        const data = apiData.map((item) => ({
          time: Math.floor(new Date(item.DATE).getTime() / 1000),
          value: parseFloat(item[indicator]),
        }));
    
        lineSeries.setData(data);
    
        syncTimeScale(chartRef.current, separateChart);
        syncTimeScale(separateChart, chartRef.current);
      }
    });
  }, [overlayIndicators, separateIndicators, apiData, selectedTimeframe]);

  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const plotMarkers = () => {
        const buyMarkers = buySignals.map((signal) => ({
            time: Math.floor(new Date(signal.time).getTime() / 1000),
            position: 'belowBar',
            color: '#4CAF50',
            shape: 'arrowUp',
            text: `Buy: ${signal.signal}`,
        }));

        const sellMarkers = sellSignals.map((signal) => ({
            time: Math.floor(new Date(signal.time).getTime() / 1000),
            position: 'aboveBar',
            color: '#FF5722',
            shape: 'arrowDown',
            text: 'Sell Signal',
        }));

        const sortedMarkers = [...buyMarkers, ...sellMarkers].sort((a, b) => a.time - b.time);

        candleSeriesRef.current.setMarkers(sortedMarkers);
    };

    plotMarkers();
}, [buySignals, sellSignals, overlayIndicators, separateIndicators]);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex gap-x-2">
          {['2H', '4H', '12H', '1D'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 rounded text-sm ${
                selectedTimeframe === timeframe
                  ? 'bg-warning text-black'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
        <div className="flex gap-x-2">
          {['1W', '1M', '3M', 'YTD', '1Y'].map((window) => (
            <button
              key={window}
              onClick={() => setSelectedWindow(window)}
              className={`px-3 py-1 rounded text-sm ${
                selectedWindow === window
                  ? 'bg-warning text-black'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {window}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} style={{ height: '400px' }} />
      <div ref={separateChartsContainerRef} />
    </div>
  );
};

export default CandlestickChart;