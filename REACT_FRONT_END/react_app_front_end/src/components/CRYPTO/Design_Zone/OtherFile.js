import React, { useState } from 'react';
import BalanceTable from './BalanceTable';
import TradesTable from './TradesTable';
import BalanceLineChart from './LineChart';
import StrategyInputs from './StrategyInputs';

const StrategyResults = ({
  Balance_Data,
  Trade_Data,
  leverage,
  setLeverage,
  portfolioUsage,
  setPortfolioUsage,
  startingBalance,
  setStartingBalance,
  fetchStrategyData,
  coin,
  timeframe,
  strategy_type,
  code,
}) => {
  const [viewPortfolio, setViewPortfolio] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleNextPage = () => {
    const totalPages = Math.ceil((viewPortfolio ? Balance_Data : Trade_Data).length / rowsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const paginatedData = (viewPortfolio ? Balance_Data : Trade_Data).slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleRefresh = () => {
    console.log(`Refreshing with Leverage: ${leverage}, Portfolio Usage: ${portfolioUsage}%, Starting Balance: $${startingBalance}`);
    fetchStrategyData(coin, timeframe, strategy_type, leverage, portfolioUsage, startingBalance, code);
  };

  return (
    <div className="collapse bg-base-100 mb-10 mt-10">
      <input type="checkbox" checked={isExpanded} onChange={() => setIsExpanded(!isExpanded)} />
      <div className="collapse-title text-xl font-medium flex justify-between items-center text-neutral-content">
        <span>Strategy Results</span>
        <span>{isExpanded ? '-' : '+'}</span>
      </div>

      {isExpanded && (
        <div className="collapse-content text-neutral-content">
          <div className="grid grid-cols-2 items-end gap-6 mb-6">
            <StrategyInputs
              leverage={leverage}
              setLeverage={setLeverage}
              portfolioUsage={portfolioUsage}
              setPortfolioUsage={setPortfolioUsage}
              startingBalance={startingBalance}
              setStartingBalance={setStartingBalance}
              onRefresh={handleRefresh}
            />
            <div className="flex justify-end items-center">
              <span className="label-text mr-2 text-gray-300">
                {viewPortfolio ? 'Portfolio Data' : 'Trade Data'}
              </span>
              <input
                type="checkbox"
                className="toggle toggle-warning"
                checked={viewPortfolio}
                onChange={() => {
                  setViewPortfolio((prev) => !prev);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 mb-4 items-center">
            <div>
              <BalanceLineChart Balance_Data={Balance_Data} />
            </div>
            <div>
              {viewPortfolio ? (
                <BalanceTable data={paginatedData} />
              ) : (
                <TradesTable data={paginatedData} />
              )}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="btn btn-sm btn-warning"
                >
                  Previous
                </button>
                <span className="text-gray-300">
                  Page {currentPage} of{' '}
                  {Math.ceil((viewPortfolio ? Balance_Data : Trade_Data).length / rowsPerPage)}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={
                    currentPage >=
                    Math.ceil((viewPortfolio ? Balance_Data : Trade_Data).length / rowsPerPage)
                  }
                  className="btn btn-sm btn-warning"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyResults;