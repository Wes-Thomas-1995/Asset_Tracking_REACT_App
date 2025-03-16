import React from 'react';

const AllocationMetricsTable = ({ data }) => {
  return (
    <div className="bg-base-100 overflow-x-auto mt-6">
      <table
        className="table w-full bg-base-100 shadow-lg rounded-lg text-gray-300 text-center"
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Table Head */}
        <thead>
          <tr>
            <th className="text-center">Algorithm</th>
            <th className="text-center">Balance ($)</th>
            <th className="text-center">Gain Rate (%)</th>
            <th className="text-center">Number of Trades</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-700 text-center">
              <td>{row.ALGO || 'N/A'}</td>
              <td>
                {row.PORTFOLIO_BALANCE !== undefined
                  ? `$${row.PORTFOLIO_BALANCE.toFixed(2)}`
                  : 'N/A'}
              </td>
              <td>
                {row.GAIN_RATE !== undefined
                  ? `${(row.GAIN_RATE).toFixed(2)}%`
                  : 'N/A'}
              </td>
              <td>{row.NBR_OF_TRADES || '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllocationMetricsTable;