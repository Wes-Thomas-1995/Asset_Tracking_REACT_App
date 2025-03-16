import React, { useState } from 'react';
import CombinedSimulationForm from '../../components/SIMULATIONS/SimulationForm';
import PortfolioChart from '../../components/SIMULATIONS/PortfolioChart';
import ChartDataTable from '../../components/SIMULATIONS/ChartDataTable'; // Import the updated component

const Simulations = () => {
  const [apiData, setApiData] = useState({
    type: 'Equities',
    all: [], // Default empty data for the chart
  });
  const [selectedView, setSelectedView] = useState('All'); // Selected equity or "All"

  const [interestRate, setInterestRate] = useState(''); // Store interest rate if applicable
  const [, setApiUrl] = useState(''); // Store generated API URL for validation

  const generateApiUrl = (formData) => {
    const {
      type,
      initialInvestment,
      periodicInvestment,
      periodicFrequency,
      reviewHorizon,
      reviewHorizonUnit,
      interestRate,
      compoundFrequency,
      equities,
      reoccurringAmount,
      reoccurringFrequency,
      independentInvestments,
    } = formData;

    // Format equities as `name_percentage` or use `NA` if blank
    const formattedEquities =
      equities && equities.length > 0
        ? equities.map((eq) => `${eq.name}_${eq.percentage}`).join(',')
        : 'NA';

    // Format independent investments or use `NA` if empty
    const formattedIndependents =
      independentInvestments.length > 0
        ? independentInvestments
            .map((inv) => `Value_${inv.value},Date_${inv.date}`)
            .join(';')
        : 'NA';

    return `http://127.0.0.1:8000/API/_SIMULATION_/${type}/${initialInvestment}/${periodicInvestment}/${periodicFrequency}/${reviewHorizon}/${reviewHorizonUnit}/${interestRate || '0'}/${compoundFrequency}/${formattedEquities}/${reoccurringAmount}/${reoccurringFrequency || 'Monthly'}/${formattedIndependents}/`;
  };

  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();

      // Ensure data is sorted by date
      Object.keys(data.data).forEach((key) => {
        if (Array.isArray(data.data[key])) {
          data.data[key] = data.data[key].sort((a, b) => new Date(a.DATE) - new Date(b.DATE));
        }
      });

      setApiData(data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleRefresh = () => {
    const simFormMainData = JSON.parse(localStorage.getItem('SimFormMainData') || '{}');

    setInterestRate(simFormMainData.interestRate || '');

    const apiUrl = generateApiUrl(simFormMainData);
    setApiUrl(apiUrl);
    console.log('Generated API URL:', apiUrl);

    fetchData(apiUrl);
  };

  const filteredData = selectedView === 'All' ? apiData?.all : apiData?.[selectedView];

  const dropdownOptions =
    apiData?.type === 'Equities'
      ? ['All', ...Object.keys(apiData).filter((key) => key !== 'type' && key !== 'all')]
      : [];

  const kpis = filteredData?.length ? filteredData[filteredData.length - 1] : null;
  const totalGain = kpis
    ? ((kpis.PORTFOLIO_VALUE - kpis.CASH_INVESTED) / kpis.CASH_INVESTED) * 100
    : 0;

  return (
    <div className="min-h-screen bg-base-200 p-6">

      <h1 className="text-3xl font-bold mb-6 text-neutral-content">Investment Simulations</h1>
      <div className="divider"></div>

      <div className="flex gap-6">
        <div className="w-1/3 bg-base-100 shadow-lg rounded-lg p-6">
        <div className="container p-4">
          <div className="form-control mb-4">
            <button
              className="btn btn-outline btn-warning"
              onClick={handleRefresh}
            >
              Refresh
            </button>
          </div>
        </div>
          <CombinedSimulationForm />
        </div>

        <div className="w-2/3 bg-base-100 shadow-lg rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-neutral-content">
              {apiData?.type || 'Results'} :{' '}
              {apiData?.type === 'Equities'
                ? selectedView
                : `${interestRate}%`}
            </h2>
            {apiData?.type === 'Equities' && (
              <div className="form-control w-48">
                <label className="label text-gray-300">
                </label>
                <select
                  className="select select-bordered text-gray-300"
                  value={selectedView}
                  onChange={(e) => setSelectedView(e.target.value)}
                >
                  {dropdownOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

{/* KPIs */}

{kpis && (
  <div className="flex justify-between mb-6">
    <div className="stats shadow w-1/4">
      <div className="stat">
        <div className="stat-title">Cash Invested</div>
        <div className="stat-value">
          ${Math.round(kpis.CASH_INVESTED)?.toLocaleString() || '0'}
        </div>
      </div>
    </div>
    <div className="stats shadow w-1/4">
      <div className="stat">
        <div className="stat-title">Portfolio Value</div>
        <div className="stat-value">
          ${Math.round(kpis.PORTFOLIO_VALUE)?.toLocaleString() || '0'}
        </div>
      </div>
    </div>
    {apiData?.type === 'Equities' && (
      <div className="stats shadow w-1/4">
        <div className="stat">
          <div className="stat-title">Dividends</div>
          <div className="stat-value">
            ${Math.round(kpis.DIVIDENDS_EARNED)?.toLocaleString() || '0'}
          </div>
        </div>
      </div>
    )}
    <div className="stats shadow w-1/4">
      <div className="stat">
        <div className="stat-title">Total Gain</div>
        <div className="stat-value">
          {(totalGain >= 1000
            ? totalGain.toLocaleString(undefined, { maximumFractionDigits: 1 })
            : totalGain.toFixed(1)) + '%'}
        </div>
      </div>
    </div>
  </div>
)}

          {/* Chart */}
          <PortfolioChart apiData={{ all: filteredData || [] }} />
          <ChartDataTable
            apiData={apiData}
            simFormMainData={JSON.parse(localStorage.getItem('SimFormMainData') || '{}')}
          />
        </div>
      </div>
    </div>
  );
};

export default Simulations;