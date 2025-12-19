import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState({ USD: 1.0, EUR: 0.92, GBP: 0.79, JPY: 149.5, ZAR: 18.5 });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get(`${API}/currency/rates`);
        setRates(response.data);
      } catch (error) {
        console.error('Failed to fetch currency rates:', error);
      }
    };
    fetchRates();
  }, []);

  const convertPrice = (priceInUSD) => {
    return (priceInUSD * rates[currency]).toFixed(2);
  };

  const getCurrencySymbol = () => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      ZAR: 'R'
    };
    return symbols[currency] || '$';
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, convertPrice, getCurrencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};