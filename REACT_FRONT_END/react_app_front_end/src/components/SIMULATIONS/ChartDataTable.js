import React, { useState } from 'react';

const ChartDataTable = ({ apiData, simFormMainData }) => {
  const [viewByYears, setViewByYears] = useState(false); // Toggle state
  const maxRows = 15; // Maximum rows in the table

  const investmentType = apiData?.type || 'Equities'; // Determine investment type

  // Use periodicFrequency from simFormMainData or default to 'Monthly'
  const periodicFrequency = simFormMainData?.periodicFrequency || 'Monthly';

  // Function to toggle between years and the selected period
  const toggleView = () => {
    setViewByYears((prev) => !prev);
  };

  // Aggregate equities data to the last available date for each period
  const aggregateEquitiesData = (data, period) => {
    const aggregatedData = [];
    const periodMap = {
      Monthly: 'month',
      Quarterly: 'quarter',
      Yearly: 'year',
    };

    // Determine period grouping
    const groupBy = periodMap[period] || 'month';
    const periodFormatter = (date) => {
      const d = new Date(date);
      if (groupBy === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (groupBy === 'quarter') return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
      if (groupBy === 'year') return `${d.getFullYear()}`;
    };

    const grouped = data.reduce((acc, item) => {
      const formattedDate = periodFormatter(item.DATE);
      if (!acc[formattedDate] || new Date(acc[formattedDate].DATE) < new Date(item.DATE)) {
        acc[formattedDate] = item;
      }
      return acc;
    }, {});

    Object.keys(grouped).forEach((key) => {
      aggregatedData.push(grouped[key]);
    });

    return aggregatedData.sort((a, b) => new Date(a.DATE) - new Date(b.DATE));
  };

  // Process data based on investment type
  const processedData =
    investmentType === 'Equities'
      ? aggregateEquitiesData(apiData.all, viewByYears ? 'Yearly' : periodicFrequency)
      : apiData.all;

  // Format the data for display
  const displayData = processedData.map((item) => {
    const interestAccrued =
      investmentType !== 'Equities'
        ? Math.round(item.PORTFOLIO_VALUE - item.CASH_INVESTED)
        : null;

    const formattedDate = new Date(item.DATE).toISOString().slice(0, 7); // Format to yyyy-mm

    return {
      date: formattedDate,
      cashInvested: Math.round(item.CASH_INVESTED).toLocaleString(),
      portfolioValue: Math.round(item.PORTFOLIO_VALUE).toLocaleString(),
      dividends: investmentType === 'Equities' ? Math.round(item.DIVIDENDS_EARNED || 0).toLocaleString() : null,
      interestAccrued: interestAccrued ? interestAccrued.toLocaleString() : null,
    };
  });

  // Limit rows to maxRows
  const displayedData = displayData.slice(0, maxRows);

  return (
    <div className="mt-6">
      {/* Toggle */}
      <div className="flex justify-end items-center mb-4">
        <span className="label-text mr-2 text-gray-300">
          {viewByYears ? 'Years' : periodicFrequency}
        </span>
        <input
          type="checkbox"
          className="toggle toggle-warning"
          checked={viewByYears}
          onChange={toggleView}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
  <table
    className="table text-gray-300"
    style={{
      backgroundColor: 'transparent',
      textAlign: 'center', // Center headers and cells
    }}
  >
    <thead>
      <tr>
        <th style={{ textAlign: 'center' }}>Date</th>
        <th style={{ textAlign: 'center' }}>Cash Invested</th>
        <th style={{ textAlign: 'center' }}>Portfolio Value</th>
        {investmentType === 'Equities' ? (
          <th style={{ textAlign: 'center' }}>Dividends</th>
        ) : (
          <th style={{ textAlign: 'center' }}>Interest Accrued</th>
        )}
      </tr>
    </thead>
    <tbody>
      {displayedData.map((row, index) => (
        <tr key={index} className="hover:bg-gray-700">
          <td style={{ textAlign: 'center' }}>{row.date}</td>
          <td style={{ textAlign: 'center' }}>${row.cashInvested}</td>
          <td style={{ textAlign: 'center' }}>${row.portfolioValue}</td>
          {investmentType === 'Equities' ? (
            <td style={{ textAlign: 'center' }}>${row.dividends || '0'}</td>
          ) : (
            <td style={{ textAlign: 'center' }}>${row.interestAccrued || '0'}</td>
          )}
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div>
  );
};

export default ChartDataTable;