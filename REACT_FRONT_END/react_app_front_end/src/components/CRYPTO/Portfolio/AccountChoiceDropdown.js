import React from 'react';

function AccountChoiceDropdown({ accounts, onSelectAccount }) {
  const handleSelect = (event) => {
    onSelectAccount(event.target.value);
  };

  return (
    <select
      className="select select-bordered w-full text-gray-300 bg-transparent"
      style={{ maxWidth: '100%' }} // Ensures the dropdown stretches fully within its container
      onChange={handleSelect}
    >
      <option disabled selected className="text-gray-500">
        Select Account
      </option>
      {accounts.map((account, index) => (
        <option key={index} value={account} className="text-gray-300 bg-base-100">
          {account}
        </option>
      ))}
    </select>
  );
}

export default AccountChoiceDropdown;