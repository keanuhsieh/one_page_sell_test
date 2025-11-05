import type { CartItem, OrderStatus, OrderDetails } from './types.ts';

export interface AppState {
  cart: CartItem[];
  view: 'product' | 'cart' | 'checkout' | 'processing' | 'status';
  orderStatus: OrderStatus;
  orderDetails: OrderDetails | null;
}

export const initialAppState: AppState = {
  cart: [],
  view: 'product',
  orderStatus: 'idle',
  orderDetails: null,
};

export type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_VIEW'; payload: AppState['view'] }
  | { type: 'SET_ORDER_STATUS'; payload: { status: OrderStatus; details: OrderDetails | null } }
  | { type: 'RESET' };

export const appReducer = (state: AppState, action: CartAction): AppState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, action.payload],
      };
    }
    case 'UPDATE_CART_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter(item => item.id !== productId),
        };
      }
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        ),
      };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
      };
    case 'SET_VIEW':
      return {
        ...state,
        view: action.payload,
      };
    case 'SET_ORDER_STATUS':
      return {
        ...state,
        orderStatus: action.payload.status,
        orderDetails: action.payload.details,
      };
    case 'RESET':
        return initialAppState;
    default:
      return state;
  }
};