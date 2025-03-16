import React from 'react';

function DistributionDropDown({ onSelectDistribution, maxBound, setMaxBound }) {
  return (
    <div className="grid grid-cols-2 gap-4 items-center">
      {/* Dropdown for distribution type */}
      <select
        className="select select-bordered w-full text-gray-300 bg-transparent"
        onChange={(e) => onSelectDistribution(e.target.value)}
        defaultValue="Gain"
      >
        <option disabled value="">
          Select Distribution Type
        </option>
        <option value="Gain">Gain</option>
        <option value="Loss">Loss</option>
        <option value="Drawdown">Drawdown</option>
      </select>

      {/* Input for maximum bound */}
      <input
        type="number"
        className="input input-bordered w-full text-gray-300 bg-transparent"
        placeholder="Set Max Bound"
        value={maxBound}
        onChange={(e) => setMaxBound(Number(e.target.value))}
      />
    </div>
  );
}

export default DistributionDropDown;