import React, { useState, useEffect } from 'react';

const CombinedSimulationForm = () => {
  const [type, setType] = useState('Interest');
  const [initialInvestment, setInitialInvestment] = useState(1000);
  const [periodicInvestment, setPeriodicInvestment] = useState(100);
  const [periodicFrequency, setPeriodicFrequency] = useState('Monthly');
  const [reviewHorizon, setReviewHorizon] = useState(12);
  const [reviewHorizonUnit, setReviewHorizonUnit] = useState('Months');
  const [interestRate, setInterestRate] = useState('');
  const [compoundFrequency, setCompoundFrequency] = useState('Monthly');
  const [equityInput, setEquityInput] = useState('');
  const [equityPercentage, setEquityPercentage] = useState('');
  const [equities, setEquities] = useState([]);
  const [investmentType, setInvestmentType] = useState('Reoccurring');
  const [reoccurringAmount, setReoccurringAmount] = useState(0);
  const [reoccurringFrequency, setReoccurringFrequency] = useState('Monthly');
  const [independentInvestments, setIndependentInvestments] = useState([]);
  const [error, setError] = useState(false);

  const addIndependentInvestment = () => {
    setIndependentInvestments([
      ...independentInvestments,
      { value: '', date: '', id: Date.now() },
    ]);
  };

  const removeIndependentInvestment = (id) => {
    setIndependentInvestments((prev) =>
      prev.filter((investment) => investment.id !== id)
    );
  };

  const handleIndependentChange = (id, field, value) => {
    setIndependentInvestments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addEquity = (e) => {
    if (e.key === 'Enter' && equityInput.trim() && equityPercentage.trim()) {
      const newPercentage = parseFloat(equityPercentage);
      const currentTotal = equities.reduce(
        (total, equity) => total + parseFloat(equity.percentage),
        0
      );

      if (currentTotal + newPercentage > 100) {
        setError(true);
        setTimeout(() => setError(false), 1500);
      } else {
        setEquities([
          ...equities,
          { name: equityInput.trim(), percentage: newPercentage },
        ]);
        setEquityInput('');
        setEquityPercentage('');
      }
    }
  };

  const removeEquity = (equityToRemove) => {
    setEquities(equities.filter((equity) => equity !== equityToRemove));
  };

  useEffect(() => {
    const data = {
      type,
      initialInvestment,
      periodicInvestment,
      periodicFrequency,
      reviewHorizon,
      reviewHorizonUnit,
      interestRate,
      compoundFrequency,
      equities,
      investmentType,
      reoccurringAmount,
      reoccurringFrequency,
      independentInvestments,
    };
    localStorage.setItem('SimFormMainData', JSON.stringify(data));
  }, [
    type,
    initialInvestment,
    periodicInvestment,
    periodicFrequency,
    reviewHorizon,
    reviewHorizonUnit,
    interestRate,
    compoundFrequency,
    equities,
    investmentType,
    reoccurringAmount,
    reoccurringFrequency,
    independentInvestments,
  ]);

  return (
    <div className="container p-4">
      {/* Dropdown for Investment Type */}
      <div className="form-control mb-4">
        <label className="label text-gray-300">Select Investment Type</label>
        <select
          className="select select-bordered text-gray-300"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
          }}
        >
          <option value="Interest">Interest</option>
          <option value="Equities">Equities</option>
          <option value="Crypto">Crypto</option>
        </select>
      </div>

      {/* Type-Specific Fields */}
      {type === 'Interest' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="form-control">
            <label className="label text-gray-300">Interest Rate (%)</label>
            <input
              type="number"
              className="input input-bordered text-gray-300"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
            />
          </div>
          <div className="form-control">
            <label className="label text-gray-300">Compound Frequency</label>
            <select
              className="select select-bordered text-gray-300"
              value={compoundFrequency}
              onChange={(e) => setCompoundFrequency(e.target.value)}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annually">Annually</option>
            </select>
          </div>
        </div>
      )}

      {type === 'Equities' && (
        <div className="mb-4">
          <div className="form-control mb-4">
            <label className="label text-gray-300">Add Equity</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="input input-bordered flex-1 text-gray-300"
                value={equityInput}
                placeholder="Type equity name"
                onChange={(e) => setEquityInput(e.target.value)}
              />
              <input
                type="number"
                className={`input input-bordered text-gray-300 w-20 ${
                  error ? 'border-red-500' : ''
                }`}
                value={equityPercentage}
                placeholder="%"
                onChange={(e) => setEquityPercentage(e.target.value)}
                onKeyDown={addEquity}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {equities.map((equity, index) => (
              <div key={index} className="badge badge-success gap-2">
                {`${equity.name} : ${equity.percentage}%`}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block h-4 w-4 stroke-current cursor-pointer"
                  onClick={() => removeEquity(equity)}
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
      )}

      {/* Review Horizon */}
      <div className="form-control mb-4">
        <label className="label text-gray-300">Review Horizon</label>
        <div className="flex items-center border rounded-lg overflow-hidden">
          <input
            type="number"
            className="input input-bordered flex-1 text-gray-300 border-none"
            value={reviewHorizon}
            onChange={(e) => setReviewHorizon(parseInt(e.target.value))}
          />
          <select
            className="select text-gray-300 bg-transparent border-none"
            value={reviewHorizonUnit}
            onChange={(e) => setReviewHorizonUnit(e.target.value)}
          >
            <option value="Months">Months</option>
            <option value="Quarters">Quarters</option>
            <option value="Years">Years</option>
          </select>
        </div>
      </div>

      {/* Initial Investment */}
      <div className="form-control mb-4">
        <label className="label text-gray-300">Initial Investment Amount</label>
        <input
          type="number"
          className="input input-bordered text-gray-300"
          value={initialInvestment}
          onChange={(e) => setInitialInvestment(parseFloat(e.target.value))}
        />
      </div>

      {/* Periodic Investment */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="form-control">
          <label className="label text-gray-300">Periodic Investment Amount</label>
          <input
            type="number"
            className="input input-bordered text-gray-300"
            value={periodicInvestment}
            onChange={(e) => setPeriodicInvestment(parseFloat(e.target.value))}
          />
        </div>
        <div className="form-control">
          <label className="label text-gray-300">Periodic Investment Frequency</label>
          <select
            className="select select-bordered text-gray-300"
            value={periodicFrequency}
            onChange={(e) => setPeriodicFrequency(e.target.value)}
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Annually">Annually</option>
          </select>
        </div>
      </div>

      {/* Periodic Investment Type */}
      <div className="form-control mb-4">
        <label className="label text-gray-300">Periodic Investment Type</label>
        <select
          className="select select-bordered text-gray-300"
          value={investmentType}
          onChange={(e) => {
            setInvestmentType(e.target.value);
            setReoccurringAmount(0);
            setReoccurringFrequency('');
            setIndependentInvestments([]);
          }}
        >
          <option value="Reoccurring">Reoccurring</option>
          <option value="Independent">Independent</option>
        </select>
      </div>

      {investmentType === 'Reoccurring' && (
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div className="form-control">
      <label className="label text-gray-300">Periodic Amount</label>
      <input
        type="number"
        className="input input-bordered text-gray-300"
        value={reoccurringAmount}
        onChange={(e) => setReoccurringAmount(parseFloat(e.target.value))}
      />
    </div>
    <div className="form-control">
      <label className="label text-gray-300">Frequency</label>
      <select
        className="select select-bordered text-gray-300"
        value={reoccurringFrequency}
        onChange={(e) => setReoccurringFrequency(e.target.value)}
      >
        <option value="Monthly">Monthly</option>
        <option value="Quarterly">Quarterly</option>
        <option value="Annually">Annually</option>
      </select>
    </div>
  </div>
)}

      {investmentType === 'Independent' && (
        <div className="mb-4">
          {independentInvestments.map((investment) => (
            <div
              key={investment.id}
              className="grid grid-cols-[1fr_1fr_10%] gap-4 mb-2 items-center"
            >
              <input
                type="number"
                placeholder="Value"
                className="input input-bordered text-gray-300"
                value={investment.value}
                onChange={(e) =>
                  handleIndependentChange(investment.id, 'value', e.target.value)
                }
              />
              <input
                type="date"
                className="input input-bordered text-gray-300 uppercase"
                value={investment.date}
                onChange={(e) =>
                  handleIndependentChange(investment.id, 'date', e.target.value)
                }
              />
              <button
                className="btn btn-error btn-xs rounded-full flex justify-center items-center"
                style={{ height: '32px', width: '32px' }}
                onClick={() => removeIndependentInvestment(investment.id)}
              >
                X
              </button>
            </div>
          ))}
          <button
            className="btn btn-success text-gray-300"
            onClick={addIndependentInvestment}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default CombinedSimulationForm;