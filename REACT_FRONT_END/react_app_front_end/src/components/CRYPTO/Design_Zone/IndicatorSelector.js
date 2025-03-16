const IndicatorSelector = ({ indicatorCategories = {}, addIndicator, strategies = [], addStrategy }) => {
  const groupedIndicators = [
    "ADX",
    "MACD",
    "STOCHASTIC_OSCILLATOR",
    "BOLLINGER_BANDS",
    "PARABOLIC_SAR",
  ];

  return (
    <div className="p-4 bg-base-100 rounded-box">
      {/* Indicators Section */}
      <ul className="menu">
        <li>
          <h2 className="menu-title text-neutral-content">Indicators</h2>
          <ul>
            {Object.entries(indicatorCategories).map(([category, indicators]) => (
              <li key={category} className="py-1">
                {groupedIndicators.includes(category) ? (
                  // Treat grouped indicators as parent buttons
                  <button
                    className="p-2 w-full text-neutral-content hover:bg-primary hover:text-white rounded cursor-pointer text-left font-medium"
                    onClick={() => addIndicator(category)} // Add the group name
                  >
                    {category}
                  </button>
                ) : (
                  // Render dropdown for categories with children
                  <details className="w-full">
                    <summary className="p-2 text-neutral-content cursor-pointer hover:text-primary font-medium">
                      {category}
                    </summary>
                    <ul className="pl-4">
                      {indicators.map((indicator) => (
                        <li key={indicator}>
                          <button
                            className="p-2 text-neutral-content hover:bg-primary hover:text-white rounded cursor-pointer w-full text-left"
                            onClick={() => addIndicator(indicator)}>
                            {indicator}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </li>
      </ul>

      <div className="divider"></div>

      {/* Strategies Section */}
      <ul className="menu mt-4">
        <li>
          <h2 className="menu-title text-neutral-content">Strategies</h2>
          <ul>
            {strategies.map((strategy) => (
              <li key={strategy} className="py-1">
                <button
                  className="p-2 text-neutral-content hover:bg-primary hover:text-white rounded cursor-pointer w-full text-left font-medium"
                  onClick={() => addStrategy(strategy)}>
                  {strategy}
                </button>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default IndicatorSelector;