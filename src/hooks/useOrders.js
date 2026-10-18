import { useContext } from 'react';
import { OrdersContext } from '../context/OrdersContext';

export default function useOrders() {
  // This hook reads shared orders, reservations, and menu data without prop drilling.
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used inside an OrdersProvider.');
  }
  return context;
}
