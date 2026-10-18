import React, { createContext, useReducer } from 'react';
import ordersReducer, { createInitialOrdersState } from '../reducers/ordersReducer';

export const OrdersContext = createContext(null);
export function OrdersProvider({ children }) {
  // This reducer shares the latest server orders and reservations across screens.
  const [state, dispatch] = useReducer(ordersReducer, undefined, createInitialOrdersState);

  return (
    <OrdersContext.Provider value={{ state, dispatch }}>
      {children}
    </OrdersContext.Provider>
  );
}
