import React, { createContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ordersReducer, { createInitialOrdersState } from '../reducers/ordersReducer';
import { initialMenuItems } from '../data/menu';

export const OrdersContext = createContext(null);
const STORAGE_KEY = 'restaurant-app-q10-data';

export function OrdersProvider({ children }) {
  // This reducer shares orders, reservations, and menu edits across all screens.
  const [state, dispatch] = useReducer(ordersReducer, undefined, createInitialOrdersState);

  // This effect loads saved app data once and falls back to the local mock menu.
  useEffect(() => {
    let isActive = true;

    const loadSavedData = async () => {
      try {
        const savedValue = await AsyncStorage.getItem(STORAGE_KEY);
        const savedData = savedValue ? JSON.parse(savedValue) : {};
        if (isActive) {
          dispatch({
            type: 'LOAD_DATA',
            data: {
              orders: Array.isArray(savedData.orders) ? savedData.orders : [],
              reservations: Array.isArray(savedData.reservations) ? savedData.reservations : [],
              menuItems: Array.isArray(savedData.menuItems) ? savedData.menuItems : initialMenuItems,
            },
          });
        }
      } catch (error) {
        if (isActive) {
          dispatch({
            type: 'LOAD_DATA',
            data: { orders: [], reservations: [], menuItems: initialMenuItems },
          });
        }
      }
    };

    loadSavedData();
    return () => {
      isActive = false;
    };
  }, []);

  // This effect saves shared orders, reservations, and menu changes after loading finishes.
  useEffect(() => {
    if (!state.isLoaded) return;

    const savedData = {
      orders: state.orders,
      reservations: state.reservations,
      menuItems: state.menuItems,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedData)).catch((error) => {
      console.warn('Could not save restaurant app data.', error);
    });
  }, [state.isLoaded, state.orders, state.reservations, state.menuItems]);

  return (
    <OrdersContext.Provider value={{ state, dispatch }}>
      {children}
    </OrdersContext.Provider>
  );
}
