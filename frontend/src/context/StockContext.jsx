import React, { createContext, useState, useContext, useEffect } from 'react';

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [stockLimit, setStockLimit] = useState(() => {
    const savedValue = localStorage.getItem('stockLimit');
    return savedValue !== null ? parseInt(savedValue) : 5; 
  });

  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    localStorage.setItem('stockLimit', stockLimit.toString());
  }, [stockLimit]);

  return (
    <StockContext.Provider value={{ stockLimit, setStockLimit, notifications, setNotifications }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => useContext(StockContext);