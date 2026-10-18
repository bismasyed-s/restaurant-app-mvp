export const PROMO_CODES = {
  WELCOME10: 10,
  FEAST20: 20,
};

export const createInitialCartState = () => ({
  items: [],
  promoCode: null,
  discountPercent: 0,
});

export default function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find((item) => item.id === action.item.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.item.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, quantity: 1, note: '' }],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.id) };
    case 'INCREMENT':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    case 'DECREMENT':
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.id ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter((item) => item.quantity > 0),
      };
    case 'UPDATE_NOTE':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, note: action.note } : item
        ),
      };
    case 'CLEAR_CART':
      return createInitialCartState();
    case 'APPLY_PROMO': {
      const code = String(action.code || '').trim().toUpperCase();
      if (!Object.prototype.hasOwnProperty.call(PROMO_CODES, code)) return state;
      return { ...state, promoCode: code, discountPercent: PROMO_CODES[code] };
    }
    case 'REMOVE_PROMO':
      return { ...state, promoCode: null, discountPercent: 0 };
    default:
      return state;
  }
}
