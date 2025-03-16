import React, { useState } from 'react';

function AllocationFundsForm({ strategies, allocationTableData, onExecute }) {
  const [fromStrategy, setFromStrategy] = useState('');
  const [toStrategy, setToStrategy] = useState('');
  const [amount, setAmount] = useState('');

  // Get the portfolio_balance for the selected "from" strategy
  const getPortfolioBalance = (strategy) => {
    const strategyData = allocationTableData.find((item) => item.ALGO === strategy);
    return strategyData ? strategyData.PORTFOLIO_BALANCE : 0;
  };

  const handleFromStrategyChange = (event) => {
    setFromStrategy(event.target.value);
    setAmount(''); // Reset amount when changing the strategy
  };

  const handleToStrategyChange = (event) => {
    setToStrategy(event.target.value);
  };

  const handleAmountChange = (event) => {
    const inputAmount = parseFloat(event.target.value);
    const maxBalance = getPortfolioBalance(fromStrategy);

    if (!isNaN(inputAmount) && inputAmount <= maxBalance) {
      setAmount(event.target.value);
    } else if (inputAmount > maxBalance) {
      setAmount(maxBalance.toString()); // Cap the amount to the max balance
    } else {
      setAmount(''); // Reset if invalid input
    }
  };

  const handleExecute = () => {
    if (fromStrategy && toStrategy && amount) {
      // Replace spaces with underscores for both strategies
      const formattedFromStrategy = fromStrategy.replace(/ /g, '_');
      const formattedToStrategy = toStrategy.replace(/ /g, '_');

      const url = `http://127.0.0.1:8000/API/TRANSFER_FUNDS/${formattedFromStrategy}/${formattedToStrategy}/${amount}/`;
      onExecute(url);
    }
  };

  return (
    <div className="flex items-end space-x-4 w-full">
      {/* From Strategy Dropdown */}
      <div className="flex-1">
        <label className="form-control">
          <div className="label">
            <span className="label-text">Sending Account</span>
          </div>
          <select
            value={fromStrategy}
            onChange={handleFromStrategyChange}
            className="select select-bordered text-gray-300 bg-transparent w-full"
          >
            <option disabled value="">
              Select From Strategy
            </option>
            {strategies
              .filter((strategy) => strategy !== toStrategy)
              .map((strategy, index) => (
                <option key={index} value={strategy}>
                  {strategy}
                </option>
              ))}
          </select>
        </label>
      </div>

      {/* Amount Input */}
      <div className="flex-1">
        <label className="form-control">
          <div className="label">
            <span className="label-text">Value to Send</span>
          </div>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={handleAmountChange}
            className="input input-bordered text-gray-300 bg-transparent w-full"
          />
        </label>
      </div>

      {/* To Strategy Dropdown */}
      <div className="flex-1">
        <label className="form-control">
          <div className="label">
            <span className="label-text">Receiving Account</span>
          </div>
          <select
            value={toStrategy}
            onChange={handleToStrategyChange}
            className="select select-bordered text-gray-300 bg-transparent w-full"
          >
            <option disabled value="">
              Select To Strategy
            </option>
            {strategies
              .filter((strategy) => strategy !== fromStrategy)
              .map((strategy, index) => (
                <option key={index} value={strategy}>
                  {strategy}
                </option>
              ))}
          </select>
        </label>
      </div>

      {/* Execute Button */}
      <div className="flex-1 flex items-end">
        <button
          onClick={handleExecute}
          className="btn btn-outline btn-warning w-full"
          disabled={!fromStrategy || !toStrategy || !amount}
        >
          Execute
        </button>
      </div>
    </div>
  );
}

export default AllocationFundsForm;