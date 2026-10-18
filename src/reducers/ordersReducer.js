export const createInitialOrdersState = () => ({
  orders: [],
  reservations: [],
  menuItems: [],
  isLoaded: false,
});

export default function ordersReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        orders: action.data.orders || [],
        reservations: action.data.reservations || [],
        menuItems: action.data.menuItems || [],
        isLoaded: true,
      };
    case 'ADD_ORDER':
      return { ...state, orders: [action.order, ...state.orders] };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.id ? { ...order, status: action.status } : order
        ),
      };
    case 'ADD_RESERVATION':
      return { ...state, reservations: [action.reservation, ...state.reservations] };
    case 'UPDATE_RESERVATION_STATUS':
      return {
        ...state,
        reservations: state.reservations.map((reservation) =>
          reservation.id === action.id
            ? { ...reservation, status: action.status }
            : reservation
        ),
      };
    case 'ADD_MENU_ITEM':
      return { ...state, menuItems: [action.item, ...state.menuItems] };
    case 'UPDATE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.map((item) =>
          item.id === action.id ? { ...item, ...action.updates } : item
        ),
      };
    case 'TOGGLE_MENU_AVAILABILITY':
      return {
        ...state,
        menuItems: state.menuItems.map((item) =>
          item.id === action.id ? { ...item, isAvailable: !item.isAvailable } : item
        ),
      };
    default:
      return state;
  }
}
