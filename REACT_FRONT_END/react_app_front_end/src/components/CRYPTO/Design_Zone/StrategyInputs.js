import React from 'react';

const StrategyInputs = ({
  leverage,
  setLeverage,
  portfolioUsage,
  setPortfolioUsage,
  startingBalance,
  setStartingBalance,
  onRefresh,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 items-end">
      {/* Leverage Input */}
      <div>
        <label className="form-control">
          <span className="label-text text-gray-300 mb-2 block">Leverage :</span>
          <div className="relative">
            <input
              type="number"
              placeholder="Enter leverage"
              value={leverage}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setLeverage(isNaN(value) ? '' : value);
              }}
              className="input input-bordered bg-transparent text-gray-300 w-full pr-10"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              x
            </span>
          </div>
        </label>
      </div>

      {/* Portfolio Usage Input */}
      <div>
        <label className="form-control">
          <span className="label-text text-gray-300 mb-2 block">Portfolio Usage (%) :</span>
          <div className="relative">
            <input
              type="number"
              placeholder="Enter usage"
              value={portfolioUsage}
              onChange={(e) => {
                const value1 = parseFloat(e.target.value);
                setPortfolioUsage(isNaN(value1) ? '' : value1);
              }}
              className="input input-bordered bg-transparent text-gray-300 w-full pr-10"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              %
            </span>
          </div>
        </label>
      </div>

      {/* Starting Balance Input */}
      <div>
        <label className="form-control">
          <span className="label-text text-gray-300 mb-2 block">Starting Balance ($) :</span>
          <div className="relative">
            <input
              type="number"
              placeholder="Enter balance"
              value={startingBalance}
              onChange={(e) => {
                const value2 = parseFloat(e.target.value);
                setStartingBalance(isNaN(value2) ? '' : value2);
              }}
              className="input input-bordered bg-transparent text-gray-300 w-full pr-10"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              $
            </span>
          </div>
        </label>
      </div>

    </div>
  );
};

export default StrategyInputs;