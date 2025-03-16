// src/components/CRYPTO/CoinDropdown.js
import React, { useEffect, useState } from 'react';

const CoinDropdown = ({ setSelectedCoin }) => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    // Fetch the list of coins
    const fetchCoins = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/API_OHLC/COINS/');
        const data = await response.json();
        setCoins(data); // Expecting a simple array of strings
      } catch (error) {
        console.error('Error fetching coins:', error);
      }
    };

    fetchCoins();
  }, []);

  return (
    <select
      className="select select-bordered w-full max-w-xs text-white bg-gray-800"
      onChange={(e) => setSelectedCoin(e.target.value)}
    >
      <option disabled selected>
        Select a Coin
      </option>
      {coins.map((coin) => (
        <option key={coin} value={coin}>
          {coin}
        </option>
      ))}
    </select>
  );
};

export default CoinDropdown;