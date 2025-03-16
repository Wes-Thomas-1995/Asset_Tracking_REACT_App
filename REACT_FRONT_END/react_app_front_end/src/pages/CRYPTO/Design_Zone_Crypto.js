import React, { useEffect, useState, useRef } from 'react';
import CandlestickChart from '../../components/CRYPTO/Design_Zone/CandleCombined';
import CoinDropdown from '../../components/CRYPTO/Design_Zone/CoinDropdown';
import IndicatorSelector from '../../components/CRYPTO/Design_Zone/IndicatorSelector';
import PythonCodeEditor from '../../components/CRYPTO/Design_Zone/PythonCodeEditor'; 
import StrategyResults from '../../components/CRYPTO/Design_Zone/OtherFile';
import DevelopmentStrategyDropdown from '../../components/CRYPTO/Design_Zone/DevelopmentStrategyDropdown';
import DrawdownDistributionChart from '../../components/CRYPTO/Design_Zone/DrawdownDistributionChart';
import DistributionDropDown from '../../components/CRYPTO/Design_Zone/DistributionDropDown';

function DesignZone({ isSidebarExpanded }) {
  const [apiData, setApiData] = useState([]);
  const [strategyData, setStrategyData] = useState([]);
  const [Balance_Data, setBalance_Data] = useState([]);
  const [Trade_Data, setTrade_Data] = useState([]);
  const [leverage, setLeverage] = useState(1); // Default leverage
  const [portfolioUsage, setPortfolioUsage] = useState(50); // Default usage
  const [startingBalance, setStartingBalance] = useState(1000); // Default balance
  const [mainData, setMainData] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedWindow, setSelectedWindow] = useState('3M');
  const [overlayIndicators, setOverlayIndicators] = useState([]);
  const [separateIndicators, setSeparateIndicators] = useState([]);
  const [selectedStrategies, setSelectedStrategies] = useState([]);
  const [buySignals, setBuySignals] = useState([]);
  const [sellSignals, setSellSignals] = useState([]);
  const [distributionType, setDistributionType] = useState('Gain');
  const [maxBound, setMaxBound] = useState(100); // Default maximum bound  
  const maxSeparateCharts = 2;
  const [indicatorMap, setIndicatorMap] = useState({});
  const [allIndicators, setAllIndicators] = useState({});
  const [strategies, setstrategies] = useState([]);
  const [allStrategies, setallStrategies] = useState({});
  const [selectedDevelopmentStrategy, setSelectedStrategy] = useState(null);

  // Fetch Indicators Data
  const fetchIndicators = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/API_OHLC/INDICATORS/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setIndicatorMap(data.indicatorMap);
      setAllIndicators(data.allIndicators);
    } catch (error) {
      console.error('Error fetching indicators data:', error);
    }
  };

  // Fetch Strategies Data
  const fetchStrategies = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/API/STRATEGIES/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setstrategies(data.STRATEGIES_LIST);
      setallStrategies(data.STRATEGY_MAP);
    } catch (error) {
      console.error('Error fetching strategies data:', error);
    }
  };

  useEffect(() => {
    fetchIndicators();
    fetchStrategies();
  }, []);





  const Initial_Code = `
import numpy as np 
# INITIAL VERSION TO BE REPLACED ON DROPDOWN
# Input Variables Include:
# - DATA_DF: 
#   - DATE, OPEN, HIGH, LOW, CLOSE
#   - EMA_4, EMA_8, EMA_12, EMA_18, EMA_24, EMA_36, EMA_50, EMA_100, EMA_200
#   - RSI_14, RSI_20, RSI_30, ATR_10_0.35, SMA_10, SMA_50, 
#   - SIGNAL

class DEVELOPMENT_STRATEGY():
    def __init__(self, DATA_DF):
        self.DATA_DF = DATA_DF
        self.DF = self.DEVELOPMENT_STRATEGY()

    def DEVELOPMENT_STRATEGY(self):
        TAKE_PROFIT = 0.01  # Take Profit set to 1%
        STOP_LOSS = 0.02  # Stop Loss set to 2%
        
        self.DATA_DF['SIGNAL'] = 'STATIC'
        self.DATA_DF['SIGNAL'] = np.where(
            (self.DATA_DF['EMA_50'].shift(1) <= self.DATA_DF['EMA_200'].shift(1)) &
            (self.DATA_DF['EMA_50'] > self.DATA_DF['EMA_200']), "LONG",
            np.where(
                (self.DATA_DF['EMA_50'].shift(1) >= self.DATA_DF['EMA_200'].shift(1)) &
                (self.DATA_DF['EMA_50'] < self.DATA_DF['EMA_200']), "SHORT","STATIC"
            )
        )

        self.DATA_DF['TP'] = np.where(
            (self.DATA_DF['SIGNAL'] == 'LONG'),
            (self.DATA_DF['OPEN'] * (1 + TAKE_PROFIT)),
            np.where((self.DATA_DF['SIGNAL'] == 'SHORT'), self.DATA_DF['OPEN'] * (1 - TAKE_PROFIT), 0)
        )
        self.DATA_DF['SL'] = np.where(
            (self.DATA_DF['SIGNAL'] == 'LONG'),
            (self.DATA_DF['OPEN'] * (1 - STOP_LOSS)),
            np.where((self.DATA_DF['SIGNAL'] == 'SHORT'), self.DATA_DF['OPEN'] * (1 + STOP_LOSS), 0)
        )

        return self.DATA_DF
  `;

  const [code, setCode] = useState(Initial_Code);
  const [isExpanded_2, setIsExpanded_2] = useState(false);
  const [isExpanded_3, setIsExpanded_3] = useState(false);
  const [isExpanded_4, setIsExpanded_4] = useState(false);
  const [isExpanded_5, setIsExpanded_5] = useState(false);

  const toggleCollapse_2 = () => {
    setIsExpanded_2((prev) => !prev);
  };

  const toggleCollapse_3 = () => {
    setIsExpanded_3((prev) => !prev);
  };

  const toggleCollapse_4 = () => {
    setIsExpanded_4((prev) => !prev);
  };

  const toggleCollapse_5 = () => {
    setIsExpanded_5((prev) => !prev);
  };

  useEffect(() => {
    if (!mainData || mainData.length === 0) {
      setBuySignals([]);
      setSellSignals([]);
      return;
    }
  
    const extractedBuySignals = [];
    const extractedSellSignals = [];
  
    mainData.forEach((row) => {
      if (row.SIGNAL && row.SIGNAL !== 'STATIC') {
        extractedBuySignals.push({ time: row.DATE, signal: row.SIGNAL });
      }
      if (row.STRATEGY_EXIT_SEQUENTIAL && row.STRATEGY_EXIT_SEQUENTIAL !== 'NA') {
        extractedSellSignals.push({ time: row.STRATEGY_EXIT_SEQUENTIAL });
      }
    });
  
    setBuySignals(extractedBuySignals);
    setSellSignals(extractedSellSignals);
  }, [mainData]);

  const chartRef = useRef(null);

  // Fetch OHLC data
  const fetchOHLCData = async (coin, timeframe) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/API_OHLC/_TA_OHLC_/${coin}/${timeframe}/`);
      const data = await response.json();
      setApiData(data);
    } catch (error) {
      console.error('Error fetching OHLC data:', error);
    }
  };


  const fetchStrategyData = async (coin, timeframe, strategyType, leverage, portfolioUsage, startingBalance, codeToUse) => {
    const encodedCode = encodeURIComponent(codeToUse);
    try {
      const response = await fetch(`http://127.0.0.1:8000/API_OHLC/_BACKTEST_OHLC_/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coin,
          timeframe,
          strategyType,
          leverage,
          portfolioUsage,
          startingBalance,
          code: encodedCode, // Send code in the body
        }),
      });
  
      const data = await response.json();
      console.log('Fetched data:', data);
  
      const strategyOHLCData = data.find((item) => item.TYPE === 'OHLC')?.DATA || [];
      const strategyBalance_Data = data.find((item) => item.TYPE === 'BALANCE')?.DATA?.BALANCE_TYPE_0 || [];
      const strategyTrade_Data = data.find((item) => item.TYPE === 'TRADES')?.DATA?.TRADE_TYPE_0 || [];
      
      console.log('strategyOHLCData:', strategyOHLCData);
      console.log('strategyBalance_Data:', strategyBalance_Data);
      console.log('strategyTrade_Data:', strategyTrade_Data);

      setStrategyData(strategyOHLCData);
      setBalance_Data(strategyBalance_Data);
      setTrade_Data(strategyTrade_Data);
    } catch (error) {
      console.error('Error fetching strategy data:', error);
    }
  };

  

  // Update the main data whenever strategyData or apiData changes
  useEffect(() => {
    if (selectedStrategies.length > 0 && strategyData.length > 0) {
      setMainData(strategyData); // Use strategy data if a strategy is selected
    } else {
      setMainData(apiData); // Default to raw OHLC data
    }
  }, [apiData, strategyData, selectedStrategies]);

  useEffect(() => {
    fetchOHLCData(selectedCoin, selectedTimeframe);
  }, [selectedCoin, selectedTimeframe]);

  const addIndicator = (indicator) => {
    const groupedIndicators = {
      ADX: allIndicators.ADX,
      MACD: allIndicators.MACD,
      STOCHASTIC_OSCILLATOR: allIndicators.STOCHASTIC_OSCILLATOR,
      BOLLINGER_BANDS: allIndicators.BOLLINGER_BANDS,
      PARABOLIC_SAR: allIndicators.PARABOLIC_SAR,
    };
  
    if (groupedIndicators[indicator]) {
      // If the indicator is a group, add all its sub-indicators
      groupedIndicators[indicator].forEach((subIndicator) => {
        if (indicatorMap.OVERLAY.includes(indicator)) {
          if (!overlayIndicators.includes(subIndicator)) {
            setOverlayIndicators((prev) => [...prev, subIndicator]);
          }
        } else if (indicatorMap.SEPARATE.includes(indicator)) {
          if (separateIndicators.length >= maxSeparateCharts) {
            document.getElementById("separateChartLimitModal").showModal();
            return;
          }
          if (!separateIndicators.includes(subIndicator)) {
            setSeparateIndicators((prev) => [...prev, subIndicator]);
          }
        }
      });
    } else {
      // Add a single indicator as before
      const indicatorCategory = Object.entries(allIndicators).find(([_, indicators]) =>
        indicators.includes(indicator)
      )?.[0];
  
      if (indicatorMap.OVERLAY.includes(indicatorCategory)) {
        if (!overlayIndicators.includes(indicator)) {
          setOverlayIndicators((prev) => [...prev, indicator]);
        }
      } else if (indicatorMap.SEPARATE.includes(indicatorCategory)) {
        if (separateIndicators.length >= maxSeparateCharts) {
          document.getElementById("separateChartLimitModal").showModal();
          return;
        }
        if (!separateIndicators.includes(indicator)) {
          setSeparateIndicators((prev) => [...prev, indicator]);
        }
      }
    }
  };

  const removeIndicator = (indicator) => {
    const groupedIndicators = {
      ADX: allIndicators.ADX,
      MACD: allIndicators.MACD,
      STOCHASTIC_OSCILLATOR: allIndicators.STOCHASTIC_OSCILLATOR,
      BOLLINGER_BANDS: allIndicators.BOLLINGER_BANDS,
      PARABOLIC_SAR: allIndicators.PARABOLIC_SAR,
    };
  
    if (groupedIndicators[indicator]) {
      // If the indicator is a group, remove all associated sub-indicators
      const subIndicators = groupedIndicators[indicator];
      setOverlayIndicators((prev) => prev.filter((ind) => !subIndicators.includes(ind)));
      setSeparateIndicators((prev) => prev.filter((ind) => !subIndicators.includes(ind)));
    } else {
      // Otherwise, remove the individual indicator
      setOverlayIndicators((prev) => prev.filter((ind) => ind !== indicator));
      setSeparateIndicators((prev) => prev.filter((ind) => ind !== indicator));
    }
  };

  const addStrategy = (strategy) => {
    if (selectedStrategies.length >= 1) {
      document.getElementById('strategyLimitModal').showModal();
      return;
    }
    setSelectedStrategies([strategy]);
  };

  const removeStrategy = (strategy) => {
    setSelectedStrategies((prev) => prev.filter((strat) => strat !== strategy));
  };

  const handleExecuteCode = (executedCode) => {
    setCode(executedCode); // Update the code state
    setSelectedStrategies(['Development Strategy']); // Clear the existing strategies first
  
  };




  // Trigger fetching strategy data when a strategy is selected
  useEffect(() => {
    if (selectedStrategies.length > 0) {
      const strategyType = Object.keys(allStrategies).find(
        (key) => allStrategies[key] === selectedStrategies[0]
      );
      fetchStrategyData(selectedCoin, selectedTimeframe, strategyType, leverage, portfolioUsage, startingBalance, code);
    } else {
      setStrategyData([]); // Clear strategy data if no strategy is selected
      setBalance_Data([]); // Clear strategy data if no strategy is selected
      setTrade_Data([]); // Clear strategy data if no strategy is selected
    }
  }, [selectedStrategies, selectedCoin, selectedTimeframe, leverage, portfolioUsage, startingBalance]);




  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-neutral-content">Design Zone</h1>
      <div className="divider"></div>

      <div className="mb-4">
        <CoinDropdown setSelectedCoin={setSelectedCoin} />
      </div>

      <div className="flex gap-4">
        <div
          className="flex-1 bg-base-100 shadow-lg rounded-lg p-6"
          ref={chartRef}
        >
          <CandlestickChart
            apiData={mainData} // Pass main data to the chart
            overlayIndicators={overlayIndicators}
            separateIndicators={separateIndicators}
            selectedStrategies={selectedStrategies}
            buySignals={buySignals}
            sellSignals={sellSignals}
            selectedTimeframe={selectedTimeframe}
            setSelectedTimeframe={setSelectedTimeframe}
            selectedWindow={selectedWindow}
            setSelectedWindow={setSelectedWindow}
          />
        </div>

        <div
          className="bg-base-100 shadow-lg rounded-lg p-4 overflow-y-auto"
          style={{
            width: '300px',
            height: chartRef.current ? `${chartRef.current.clientHeight}px` : '400px',
          }}
        >
          <IndicatorSelector
            indicatorCategories={allIndicators}
            addIndicator={addIndicator}
            strategies={strategies}
            addStrategy={addStrategy}
          />
        </div>
      </div>

      {/* Adding badges for indicators and strategies */}
      <div className="mt-4">
      <div className="flex flex-wrap gap-2 mb-2">
  {[
    ...new Set(
      [...overlayIndicators, ...separateIndicators].map((indicator) => {
        // Check if the indicator belongs to a group
        const groupedIndicators = {
          ADX: allIndicators.ADX,
          MACD: allIndicators.MACD,
          STOCHASTIC_OSCILLATOR: allIndicators.STOCHASTIC_OSCILLATOR,
          BOLLINGER_BANDS: allIndicators.BOLLINGER_BANDS,
          PARABOLIC_SAR: allIndicators.PARABOLIC_SAR,
        };
        // Return the group name if part of a group, else return the individual indicator
        const group = Object.keys(groupedIndicators).find((key) =>
          groupedIndicators[key]?.includes(indicator)
        );
        return group || indicator;
      })
    ),
  ].map((item) => (
    <div key={item} className="badge badge-success gap-2">
      {item}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="inline-block h-4 w-4 stroke-current cursor-pointer"
        onClick={() => removeIndicator(item)}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    </div>
  ))}
</div>

        <div className="flex flex-wrap gap-2">
          {selectedStrategies.map((strategy) => (
            <div key={strategy} className="badge badge-warning gap-2">
              {strategy}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-4 w-4 stroke-current cursor-pointer"
                onClick={() => removeStrategy(strategy)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
          ))}
        </div>
      </div>



      {/* Modals for limits */}
      <dialog id="separateChartLimitModal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-neutral-content">Warning</h3>
          <p className="py-4 text-neutral-content">
            Only a maximum of 2 separate chart indicators can be added at one time. To include this indicator, first remove an existing separate chart indicator.
          </p>
          <div className="modal-action">
            <button
              className="btn"
              onClick={() => document.getElementById('separateChartLimitModal').close()}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>

      <dialog id="strategyLimitModal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-neutral-content">Warning</h3>
          <p className="py-4 text-neutral-content">
          Only one strategy can be active at a time. To include this strategy, first remove the existing active strategy.
          </p>
          <div className="modal-action">
            <button
              className="btn"
              onClick={() => document.getElementById('strategyLimitModal').close()}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>


      {/* DROP SECTIONS - ADD IN 3 kpis win rate, gain per trade, risk reward ratio or median drawdown */}
      
      <StrategyResults
        Balance_Data={Balance_Data}
        Trade_Data={Trade_Data}
        leverage={leverage}
        setLeverage={setLeverage}
        portfolioUsage={portfolioUsage}
        setPortfolioUsage={setPortfolioUsage}
        startingBalance={startingBalance}
        setStartingBalance={setStartingBalance}
        fetchStrategyData={fetchStrategyData}
        coin={selectedCoin}
        timeframe={selectedTimeframe}
        strategy_type={selectedStrategies[0]}
        code={code}
      />

<div className="collapse bg-base-100 mb-10">
  <input type="checkbox" checked={isExpanded_2} onChange={toggleCollapse_2} />
  <div className="collapse-title text-xl font-medium flex justify-between items-center text-neutral-content">
    <span>Strategy Distribution Analysis</span>
    <span>{isExpanded_2 ? '-' : '+'}</span>
  </div>
  <div className="collapse-content text-neutral-content">
    <DistributionDropDown
      onSelectDistribution={setDistributionType}
      maxBound={maxBound}
      setMaxBound={setMaxBound}
    />
    <DrawdownDistributionChart
      trades={Trade_Data}
      distributionType={distributionType}
      maxBound={maxBound}
    />
  </div>
</div>

    <div className="collapse bg-base-100 mb-10">
      <input type="checkbox" checked={isExpanded_3} onChange={toggleCollapse_3} />
      <div className="collapse-title text-xl font-medium flex justify-between items-center text-neutral-content">
        <span>Create Your Own Strategy - Interactive</span>
        <span>{isExpanded_2 ? '-' : '+'}</span>
      </div>
      <div className="collapse-content text-neutral-content">
        <p>In here have a dropdown which allows the user to amend the allocation between different strategies or to put some on pause if put on pause the funds are withdrawn from the strategy and reallocated to a holding strategy</p>
      </div>
    </div>

    <div className="collapse bg-base-100 mb-10">
      <input type="checkbox" checked={isExpanded_4} onChange={toggleCollapse_4} />
      <div className="collapse-title text-xl font-medium flex justify-between items-center text-neutral-content">
        <span>Create Your Own Development Strategy - Code Editor</span>
        <span>{isExpanded_3 ? '-' : '+'}</span>
      </div>
      <div className="collapse-content text-neutral-content flex flex-col justify-center items-center h-full w-full">
        <div className="mb-4 mt-4 w-full">
          {/* Call the new dropdown component */}
          <DevelopmentStrategyDropdown
            setSelectedStrategy={setSelectedStrategy}
            setCode={setCode} // Update the code when a strategy is selected
          />
        </div>

          {/* Python Code Editor */}
          <PythonCodeEditor
            key={selectedDevelopmentStrategy} // Unique key to trigger re-render
            onCodeChange={setCode} // Update state when the user edits the code
            initialCode={code} // Dynamically update the editor's content
            isSidebarExpanded={isSidebarExpanded}
            onExecuteCode={handleExecuteCode} // Execute the code
          />
      </div>
    </div>

      <div className="collapse bg-base-100 mb-10">
      <input type="checkbox" checked={isExpanded_5} onChange={toggleCollapse_5} />
      <div className="collapse-title text-xl font-medium flex justify-between items-center text-neutral-content">
        <span>Compare Multiple Strategies</span>
        <span>{isExpanded_2 ? '-' : '+'}</span>
      </div>
      <div className="collapse-content text-neutral-content">
        <p>In here have a dropdown which allows the user to amend the allocation between different strategies or to put some on pause if put on pause the funds are withdrawn from the strategy and reallocated to a holding strategy</p>
      </div>
    </div>

    </div>
  );
}

export default DesignZone;








// ADD IN CAPABILITY TO COMPARE ALL THE STRATEGIES ON NUMBER OF TRADES, MEDIAN LOSS, MEDIAN GAIN, MEDIAN DISTRIBUTION, WIN RATE, GAIN PER TRADE

