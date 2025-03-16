import React from 'react';

const TradesTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-300 text-center mt-4">No trades data available.</p>;
  }

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16).replace('T', ' '); // yyyy-mm-dd hh:mm format
  };

  // Helper function to format prices
  const formatPrice = (price) => {
    return price !== undefined
      ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'N/A';
  };

  return (
    <div className="bg-base-100 overflow-x-auto mt-6">
      <table
        className="table w-full bg-base-100 shadow-lg rounded-lg text-gray-300 text-center"
        style={{ backgroundColor: 'transparent' }}
      >
        <thead>
          <tr>
            <th className="text-center">Start Date</th>
            <th className="text-center">End Date</th>
            <th className="text-center">Price at Entry</th>
            <th className="text-center">Exit Price</th>
            <th className="text-center">Status</th>
            <th className="text-center">Percentage Change (%)</th>
            <th className="text-center">Max Drawdown (%)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-700 text-center">
              <td>{formatDate(row.START_DATE)}</td>
              <td>{formatDate(row.END_DATE)}</td>
              <td>{formatPrice(row.PRICE_AT_ENTRY)}</td>
              <td>{formatPrice(row.EXIT_PRICE)}</td>
              <td
                className={
                  row.STATUS === 'SUCCESS'
                    ? 'text-green-500 font-bold'
                    : row.STATUS === 'FAILURE'
                    ? 'text-red-500 font-bold'
                    : 'text-gray-300'
                }
              >
                {row.STATUS || 'N/A'}
              </td>
              <td>
                {row.PERCENTAGE_CHANGE !== undefined
                  ? `${row.PERCENTAGE_CHANGE.toFixed(2)}%`
                  : 'N/A'}
              </td>
              <td>
                {row.MAX_DRAWDOWN !== undefined
                  ? `${row.MAX_DRAWDOWN.toFixed(2)}%`
                  : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradesTable;