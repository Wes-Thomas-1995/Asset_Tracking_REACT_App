import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import AllocationMetricsTable from '../../components/CRYPTO/Portfolio/AllocationMetricsTable';
import StatCard from '../../components/CRYPTO/Portfolio/StatCard';
import RecentTradesTable from '../../components/CRYPTO/Portfolio/RecentTradesTable';
import AccountChoiceDropdown from '../../components/CRYPTO/Portfolio/AccountChoiceDropdown';
import PortfolioLineChart from '../../components/CRYPTO/Portfolio/PortfolioLineChart';
import AllocationFundsForm from '../../components/CRYPTO/Portfolio/AllocationFundsForm';
import AllocationCarousel from '../../components/CRYPTO/Portfolio/AllocationCarousel';

function Portfolio() {
  const [kpiData, setKpiData] = useState({});
  const [isExpanded_1, setIsExpanded_1] = useState(false);
  const [isExpanded_2, setIsExpanded_2] = useState(false);
  const [tradesTableData, setTradesTableData] = useState([]);
  const [allocationTableData, setAllocationTableData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState({});
  const [filteredTimeSeriesData, setFilteredTimeSeriesData] = useState([]);
  const [algoList, setAlgoList] = useState([]);
  const [selectedAlgo, setSelectedAlgo] = useState('All Strategies');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const leftCardRef = useRef(null);
  const [leftCardHeight, setLeftCardHeight] = useState(0);

  const toggleCollapse_1 = () => {
    setIsExpanded_1((prev) => !prev);
  };

  const toggleCollapse_2 = () => {
    setIsExpanded_2((prev) => !prev);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allocationResponse, timeSeriesResponse, tradesResponse, kpiResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/API/ALLOCATION_TABLE/'),
          axios.get('http://127.0.0.1:8000/API/TIMESERIES/'),
          axios.get('http://127.0.0.1:8000/API/TABLES/'),
          axios.get('http://127.0.0.1:8000/API/KPI/'),
        ]);

        const kpiDataProcessed = kpiResponse.data.reduce((acc, item) => {
          acc[item.Title] = {
            value: `${item.Overall.toFixed(2)} ${item.Metric}`,
            description: `${item.Responsible} - ${item.Best.toFixed(2)} ${item.Metric}`,
          };
          return acc;
        }, {});
        setKpiData(kpiDataProcessed);

        setAllocationTableData(allocationResponse.data);
        setTradesTableData(tradesResponse.data);

        const groupedTimeSeries = timeSeriesResponse.data.reduce((acc, entry) => {
          const algo = entry.ALGO;
          if (!acc[algo]) acc[algo] = [];
          acc[algo].push({
            DATE: new Date(entry.DATE).toISOString().split('T')[0],
            PORTFOLIO_BALANCE: entry.PORTFOLIO_BALANCE,
            COMMITMENT_BALANCE: entry.COMMITMENT_BALANCE,
            COMMITMENT_DELTA: entry.COMMITMENT_DELTA,
          });
          return acc;
        }, {});

        const allStrategies = Object.values(groupedTimeSeries).flat();
        const aggregatedAllStrategies = allStrategies.reduce((acc, entry) => {
          const date = entry.DATE;
          if (!acc[date]) acc[date] = { DATE: date, PORTFOLIO_BALANCE: 0, COMMITMENT_BALANCE: 0 };
          acc[date].PORTFOLIO_BALANCE += entry.PORTFOLIO_BALANCE;
          acc[date].COMMITMENT_BALANCE += entry.COMMITMENT_BALANCE;
          return acc;
        }, {});

        groupedTimeSeries['All Strategies'] = Object.values(aggregatedAllStrategies);

        setTimeSeriesData(groupedTimeSeries);
        setFilteredTimeSeriesData(groupedTimeSeries['All Strategies']);

        const uniqueAlgos = Array.from(new Set(['All Strategies', ...Object.keys(groupedTimeSeries)]));
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
      setFilteredTimeSeriesData(timeSeriesData['All Strategies']);
    } else {
      setFilteredTimeSeriesData(timeSeriesData[selectedAlgo]);
    }
  }, [selectedAlgo, timeSeriesData]);

  useEffect(() => {
    if (leftCardRef.current) {
      setLeftCardHeight(leftCardRef.current.offsetHeight);
    }
  }, [filteredTimeSeriesData]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const sortedTradesByDate = [...tradesTableData].sort(
    (a, b) => new Date(b.EXIT_DATE) - new Date(a.EXIT_DATE)
  );

  const handleFundsTransfer = async (url) => {
    try {
      await axios.post(url);
      alert('Funds transferred successfully!');
    } catch (error) {
      alert('Error transferring funds. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-neutral-content">Portfolio</h1>
      <div className="divider"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {Object.entries(kpiData).map(([key, { value, description }]) => (
          <StatCard key={key} title={key} value={value} description={description} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <AccountChoiceDropdown accounts={algoList} onSelectAccount={setSelectedAlgo} />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div
          className="lg:basis-2/3 flex-grow bg-base-100 p-4 rounded-lg shadow-lg mb-10"
          ref={leftCardRef}
          style={{ height: '50vh' }}
        >
          <PortfolioLineChart data={filteredTimeSeriesData} />
        </div>

        <div
          className="lg:basis-1/3 flex-grow bg-base-100 p-4 rounded-lg shadow-lg mb-10"
          style={{ height: `${leftCardHeight}px` }}
        >
          <AllocationMetricsTable data={allocationTableData} />
        </div>
      </div>

      <div className="collapse bg-base-100 mb-10">
        <input type="checkbox" checked={isExpanded_1} onChange={toggleCollapse_1} />
        <div className="collapse-title text-xl font-medium flex justify-between items-center text-neutral-content">
          <span>Recent Trades</span>
          <span>{isExpanded_1 ? '-' : '+'}</span>
        </div>
        <div className="collapse-content text-neutral-content">
          <RecentTradesTable data={sortedTradesByDate.slice(0, 15)} />
        </div>
      </div>

      <div className="collapse bg-base-100 mb-10">
  <input type="checkbox" checked={isExpanded_2} onChange={toggleCollapse_2} />
  <div className="collapse-title text-xl font-medium flex justify-between items-center text-neutral-content">
    <span>Allocation of Funds</span>
    <span>{isExpanded_2 ? '-' : '+'}</span>
  </div>
  <div className="collapse-content text-neutral-content">
    {/* Grid Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 items-center">
      {/* Allocation Form */}

        <AllocationFundsForm
          strategies={algoList}
          allocationTableData={allocationTableData}
          onExecute={handleFundsTransfer}
        />


      {/* Allocation Carousel */}

        <AllocationCarousel allocationTableData={allocationTableData} />

    </div>
  </div>
</div>
    </div>
  );
}

export default Portfolio;