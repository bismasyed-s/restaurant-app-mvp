import React, { createContext, useReducer } from 'react';
import cartReducer, { createInitialCartState } from '../reducers/cartReducer';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  // This reducer manages related cart, note, and promo changes with pure actions.
  const [state, dispatch] = useReducer(cartReducer, undefined, createInitialCartState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}
