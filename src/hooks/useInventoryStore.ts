import { useState, useEffect, useCallback } from 'react';

export interface InventoryItem {
  equipmentNumber: string;
  data: Record<string, string>;
  counted: number;
}

export interface UnknownScan {
  raw: string;
  normalized: string;
  timestamp: string;
}

interface InventoryState {
  items: InventoryItem[];
  unknownScans: UnknownScan[];
  equipmentColumnName: string;
  quantityColumnName: string | null;
  headers: string[];
}

const STORAGE_KEY = 'inventory-counting-state';

export function useInventoryStore() {
  const [state, setState] = useState<InventoryState>({
    items: [],
    unknownScans: [],
    equipmentColumnName: '',
    quantityColumnName: null,
    headers: []
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (state.items.length > 0 || state.unknownScans.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const setInventoryData = useCallback((
    items: InventoryItem[],
    headers: string[],
    equipmentColumnName: string,
    quantityColumnName: string | null
  ) => {
    // Preserve counts from previous state if equipment numbers match
    setState(prev => {
      const prevCountMap = new Map(
        prev.items.map(item => [item.equipmentNumber.toUpperCase(), item.counted])
      );
      
      const updatedItems = items.map(item => ({
        ...item,
        counted: prevCountMap.get(item.equipmentNumber.toUpperCase()) || 0
      }));

      return {
        ...prev,
        items: updatedItems,
        headers,
        equipmentColumnName,
        quantityColumnName,
        // Keep unknown scans from previous session
      };
    });
  }, []);

  const incrementCount = useCallback((equipmentNumber: string): number => {
    let newCount = 0;
    setState(prev => {
      const items = prev.items.map(item => {
        if (item.equipmentNumber === equipmentNumber) {
          newCount = item.counted + 1;
          return { ...item, counted: newCount };
        }
        return item;
      });
      return { ...prev, items };
    });
    return newCount;
  }, []);

  const addUnknownScan = useCallback((raw: string, normalized: string) => {
    setState(prev => ({
      ...prev,
      unknownScans: [
        ...prev.unknownScans,
        {
          raw,
          normalized,
          timestamp: new Date().toISOString()
        }
      ]
    }));
  }, []);

  const resetCounts = useCallback(() => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => ({ ...item, counted: 0 })),
      unknownScans: []
    }));
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      items: [],
      unknownScans: [],
      equipmentColumnName: '',
      quantityColumnName: null,
      headers: []
    });
  }, []);

  const getEquipmentNumbers = useCallback((): string[] => {
    return state.items.map(item => item.equipmentNumber);
  }, [state.items]);

  const getStats = useCallback(() => {
    const totalItems = state.items.length;
    const totalScanned = state.items.reduce((sum, item) => sum + item.counted, 0);
    const uniqueScanned = state.items.filter(item => item.counted > 0).length;
    const unknownCount = state.unknownScans.length;
    
    return { totalItems, totalScanned, uniqueScanned, unknownCount };
  }, [state.items, state.unknownScans]);

  return {
    ...state,
    setInventoryData,
    incrementCount,
    addUnknownScan,
    resetCounts,
    clearAll,
    getEquipmentNumbers,
    getStats
  };
}
