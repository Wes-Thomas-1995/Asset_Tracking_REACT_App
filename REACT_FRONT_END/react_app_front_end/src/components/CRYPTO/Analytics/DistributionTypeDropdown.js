import React from 'react';

function DistributionDropDown({ onSelectPortfolio, portfolios }) {
  const handleSelect = (event) => {
    onSelectPortfolio(event.target.value);
  };

  return (
    <select
      className="select select-bordered w-full text-gray-300 bg-transparent"
      style={{ maxWidth: '100%' }} // Ensures the dropdown stretches fully within its container
      onChange={handleSelect}
      defaultValue=""
    >
      <option disabled value="" className="text-gray-500">
        Select Distribution Type
      </option>
      {portfolios.map((portfolio, index) => (
        <option key={index} value={portfolio} className="text-gray-300 bg-base-100">
          {portfolio}
        </option>
      ))}
    </select>
  );
}

export default DistributionDropDown;