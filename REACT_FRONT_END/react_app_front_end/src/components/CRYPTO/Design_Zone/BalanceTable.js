import React from 'react';

const BalanceTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-300 text-center mt-4">No balance data available.</p>;
  }

  // Create a formatter for 1,000.00 format
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-base-100 overflow-x-auto mt-6">
      <table
        className="table w-full bg-base-100 shadow-lg rounded-lg text-gray-300 text-center"
        style={{ backgroundColor: 'transparent' }}
      >
        <thead>
          <tr>
            <th className="text-center">Start Amount</th>
            <th className="text-center">Gross Profit</th>
            <th className="text-center">Fees</th>
            <th className="text-center">Net Profit</th>
            <th className="text-center">End Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-700 text-center">
              <td>{row.START_AMOUNT ? formatter.format(row.START_AMOUNT) : 'N/A'}</td>
              <td>{row.GROSS_PROFIT ? formatter.format(row.GROSS_PROFIT) : 'N/A'}</td>
              <td>{row.FEES ? formatter.format(row.FEES) : 'N/A'}</td>
              <td
                style={{
                  color: row.NET_PROFIT > 0 ? 'green' : row.NET_PROFIT < 0 ? 'red' : 'inherit',
                }}
              >
                {row.NET_PROFIT ? formatter.format(row.NET_PROFIT) : 'N/A'}
              </td>
              <td>{row.END_AMOUNT ? formatter.format(row.END_AMOUNT) : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BalanceTable;