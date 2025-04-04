"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Create the context
export const StoreStatusContext = createContext({
  isStoreOpen: true,
  isLoading: true
});

// Custom hook to use the store status
export const useStoreStatus = () => useContext(StoreStatusContext);

// Provider component
export function StoreStatusProvider({ children }) {
  // Get store status from Convex
  const storeStatus = useQuery(api.storeStatus.getStoreStatus);
  const isLoading = storeStatus === undefined;
  
  // Default to open if data is still loading
  const isStoreOpen = isLoading ? true : storeStatus?.isOpen;
  
  return (
    <StoreStatusContext.Provider value={{ isStoreOpen, isLoading }}>
      {children}
    </StoreStatusContext.Provider>
  );
}