import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatCard from '../../components/CRYPTO/Portfolio/StatCard';
import AccountChoiceDropdown from '../../components/CRYPTO/Portfolio/AccountChoiceDropdown';
import BarChart from '../../components/CRYPTO/Analytics/BarChart';
import ProfitabilityBarChart from '../../components/CRYPTO/Analytics/ProfitabilityBarChart';
import TradeTable from '../../components/CRYPTO/Analytics/TradeTable';
import DistributionDropDown from '../../components/CRYPTO/Analytics/DistributionTypeDropdown';
import DrawdownDistributionChart from '../../components/CRYPTO/Analytics/DrawdownDistributionChart';
import PortfolioLineChart from '../../components/CRYPTO/Portfolio/PortfolioLineChart';

function Analytics() {
  const [kpiData, setKpiData] = useState({});
  const [algoList, setAlgoList] = useState([]);
  const [selectedAlgo, setSelectedAlgo] = useState('All Strategies');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [filteredTimeSeriesData, setFilteredTimeSeriesData] = useState([]);
  const [allocationData, setAllocationData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [distributionType, setDistributionType] = useState('Gain');

  const handleDistributionTypeSelect = (type) => {
    setDistributionType(type);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from all API endpoints
        const [timeSeriesResponse, allocationResponse, barChartResponse, kpiResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/API/TIMESERIES/'),
          axios.get('http://127.0.0.1:8000/API/TABLES/'),
          axios.get('http://127.0.0.1:8000/API/ALLOCATION_TABLE/'),
          axios.get('http://127.0.0.1:8000/API/KPI/')
        ]);

        // Process KPI Data (ignore "Drawdown")
        const kpiDataProcessed = kpiResponse.data
          .filter((_, index) => index < 4) // Limit to the first four attributes
          .reduce((acc, item) => {
            acc[item.Title] = {
              value: `${item.Overall.toFixed(2)} ${item.Metric}`,
              description: `${item.Responsible} - ${item.Best.toFixed(2)} ${item.Metric}`
            };
            return acc;
          }, {});
        setKpiData(kpiDataProcessed);

        // Set data for other components
        setTimeSeriesData(timeSeriesResponse.data);
        setAllocationData(allocationResponse.data);
        setBarChartData(barChartResponse.data);

        const uniqueAlgos = ['All Strategies', ...new Set(timeSeriesResponse.data.map((item) => item.ALGO))];
        setAlgoList(uniqueAlgos);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data from API.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAlgo === 'All Strategies') {
      const aggregatedData = timeSeriesData.reduce((acc, entry) => {
        const existing = acc.find((item) => item.DATE === entry.DATE);
        if (existing) {
          existing.PORTFOLIO_BALANCE += entry.PORTFOLIO_BALANCE;
        } else {
          acc.push({
            DATE: entry.DATE,
            PORTFOLIO_BALANCE: entry.PORTFOLIO_BALANCE,
          });
        }
        return acc;
      }, []);
      setFilteredTimeSeriesData(aggregatedData);
    } else {
      setFilteredTimeSeriesData(
        timeSeriesData.filter((item) => item.ALGO === selectedAlgo)
      );
    }
  }, [selectedAlgo, timeSeriesData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const filteredAllocationData =
    selectedAlgo === 'All Strategies'
      ? allocationData
      : allocationData.filter((item) => item.ALGO === selectedAlgo);

  const sortedTradesByDate = [...filteredAllocationData].sort(
    (a, b) => new Date(b.EXIT_DATE) - new Date(a.EXIT_DATE)
  );

  const limitedTrades = sortedTradesByDate.slice(0, 10);

  // Process chart metrics dynamically from barChartData
  const chartMetrics = [
    { title: 'Balance ($)', dataKey: 'PORTFOLIO_BALANCE' },
    { title: 'Win Rates (%)', dataKey: 'winRate' },
    { title: 'Avg Gain Rate (%)', dataKey: 'AVG_GAIN' },
    { title: 'Drawdown (%)', dataKey: 'AVG_DRAWDOWN' }
  ];

  const yAxisLabels = barChartData.map((item) => item.ALGO || 'N/A');
  const barChartMetrics = chartMetrics.map(({ title, dataKey }) => ({
    title,
    dataPoints: barChartData.map((item) => item[dataKey] || 0),
  }));

  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6 text-neutral-content">Analytics</h1>
      <div className="divider"></div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {Object.entries(kpiData).map(([key, { value, description }]) => (
          <StatCard key={key} title={key} value={value} description={description} />
        ))}
      </div>

      {/* Dynamic Chart Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {barChartMetrics.map(({ title, dataPoints }, index) => (
          <div key={index} className="bg-base-100 p-6 rounded-lg shadow-lg">
            <BarChart yAxisLabels={yAxisLabels} dataPoints={dataPoints} title={title} />
          </div>
        ))}
      </div>

      {/* Dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <AccountChoiceDropdown accounts={algoList} onSelectAccount={setSelectedAlgo} />
      </div>

      {/* Line Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-base-100 p-6 rounded-lg shadow-lg" style={{ height: '40vh' }}>
          <PortfolioLineChart data={filteredTimeSeriesData} />
        </div>
        <div className="bg-base-100 p-6 rounded-lg shadow-lg" style={{ height: '40vh' }}>
          <ProfitabilityBarChart trades={filteredAllocationData} />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-base-100 p-6 rounded-lg shadow-lg mb-10">
        <TradeTable data={limitedTrades} />
      </div>

      {/* Distribution Dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <DistributionDropDown
          onSelectPortfolio={handleDistributionTypeSelect}
          portfolios={['Gain', 'Loss', 'Drawdown']}
        />
      </div>

      {/* Drawdown Distribution */}
      <div className="mb-10 flex">
        <DrawdownDistributionChart trades={allocationData} distributionType={distributionType} />
      </div>
    </div>
  );
}

export default Analytics;