import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeToLoading } from '../services/api';

const GlobalLoadingContext = createContext();

export const useGlobalLoading = () => {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
  }
  return context;
};

export const GlobalLoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  // Subscribe to API loading state changes
  useEffect(() => {
    // Subscribe to API loading changes
    const unsubscribe = subscribeToLoading((isLoading) => {
      setLoading(isLoading);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // For manual loading control - components can use this to show loader
  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <GlobalLoadingContext.Provider value={{ loading, startLoading, stopLoading }}>
      {children}
    </GlobalLoadingContext.Provider>
  );
};

export default GlobalLoadingProvider;

