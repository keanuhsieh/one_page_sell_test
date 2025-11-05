import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.ts';
import { ShoppingCartIcon } from './Icons.tsx';

const Header: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    return null;
  }

  const { cart, setView } = context;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-md z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">AuraLens</h1>
        <button
          onClick={() => setView('cart')}
          className="relative text-gray-600 hover:text-blue-600 transition-colors"
          aria-label={`Shopping cart with ${totalItems} items`}
        >
          <ShoppingCartIcon className="h-7 w-7" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;