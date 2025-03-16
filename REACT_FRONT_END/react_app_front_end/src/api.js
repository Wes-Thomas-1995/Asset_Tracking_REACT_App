// src/api.js
import axios from 'axios';

// Base URL for the API
const BASE_URL = 'http://127.0.0.1:8000/API/';

// Define API endpoints
export const ENDPOINTS = {
  DONUT_CHART: 'DONUT_CHART/',
  ALLOCATION_TABLE: 'ALLOCATION_TABLE/',
  USER_INFORMATION: 'USER_INFORMATION/',
  COMMITMENT: 'COMMITMENT/',
  ALGO_BALANCE: 'ALGO_BALANCE/',
  PERSONAL_BALANCE: 'PERSONAL_BALANCE/',
  ALGO_TRADES: 'ALGO_TRADES/',
  PERSONAL_TRADES: 'PERSONAL_TRADES/',
  TIMESERIES: 'TIMESERIES/',
  TABLES: 'TABLES/',
  COINS: 'COINS/',
};

// Fetch data from the API
export const fetchData = async (endpoint) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error; // Rethrow the error to handle it in the calling component
  }
};