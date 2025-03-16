import React from 'react';

const TradeTable = ({ data }) => {
  return (
    <div className="bg-base-100 overflow-x-auto mt-6">
      <table
        className="table w-full bg-base-100 shadow-lg rounded-lg text-gray-300"
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Table Head */}
        <thead>
          <tr>
            <th>Trade Number</th>
            <th>Algorithm</th>
            <th>Direction</th>
            <th>Symbol</th>
            <th>Exit Date</th>
            <th>Status</th>
            <th>Equity</th>
            <th>Realized P&L</th>
            <th>Drawdown</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-700">
              <td>{row.TRADE_NBR || 'N/A'}</td>
              <td>{row.ALGO || 'N/A'}</td>
              <td>{row.DIRECTION || 'N/A'}</td>
              <td>{row.SYMBOL || 'N/A'}</td>
              <td>
                {row.EXIT_DATE
                  ? new Date(row.EXIT_DATE).toLocaleDateString('en-GB')
                  : 'N/A'}
              </td>
              <td>{row.STATUS || 'N/A'}</td>
              <td>
                {row.EQUITY !== undefined
                  ? `$${row.EQUITY.toFixed(2)}`
                  : 'N/A'}
              </td>
              <td>
                {row.REALIZED_PNL !== undefined
                  ? `$${row.REALIZED_PNL.toFixed(2)}`
                  : 'N/A'}
              </td>
              <td>
                {row.DRAWDOWN !== undefined
                  ? `${row.DRAWDOWN.toFixed(2)}%`
                  : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeTable;