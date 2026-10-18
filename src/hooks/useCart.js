import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export default function useCart() {
  // This hook reads the shared cart so screens do not need cart props.
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider.');
  }
  return context;
}
