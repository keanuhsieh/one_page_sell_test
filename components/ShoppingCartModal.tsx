
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.ts';
import { TAX_RATE } from '../constants.ts';
import { XMarkIcon, TrashIcon } from './Icons.tsx';

const ShoppingCartModal: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    return null;
  }
  const { cart, setView, updateCartQuantity, removeFromCart } = context;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  
  if(cart.length === 0) {
      setTimeout(() => setView('product'), 100);
      return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all animate-fade-in-up">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
          <button onClick={() => setView('product')} className="text-gray-500 hover:text-gray-800">
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {cart.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.id} className="flex items-center py-4 space-x-4">
                  <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-gray-600">${item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value))}
                      className="w-16 p-2 border rounded-md text-center"
                    />
                     <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-1">
                       <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="font-semibold w-24 text-right">${(item.price * item.quantity).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-8">Your cart is empty.</p>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-gray-50 rounded-b-xl">
            <div className="space-y-2">
              <div className="flex justify-between text-lg">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Tax (5%)</span>
                <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold border-t pt-2 mt-2">
                <span>Total</span>
                <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <button
              onClick={() => setView('checkout')}
              className="w-full mt-6 bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCartModal;
