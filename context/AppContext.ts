import React from 'react';
import type { CartItem } from '../types.ts';
import type { AppState } from '../state.ts';

interface AppContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  setView: (view: AppState['view']) => void;
}

export const AppContext = React.createContext<AppContextType | undefined>(undefined);