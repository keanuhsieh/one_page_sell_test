
import React, { useState, useReducer, useCallback, useEffect } from 'react';
import type { CartItem, CustomerInfo, InvoiceInfo, Order } from './types.ts';
import { AppState, CartAction, initialAppState, appReducer } from './state.ts';
import { AppContext } from './context/AppContext.ts';
import Header from './components/Header.tsx';
import ProductSection from './components/ProductSection.tsx';
import ShoppingCartModal from './components/ShoppingCartModal.tsx';
import CheckoutModal from './components/CheckoutModal.tsx';
import StatusDisplay from './components/StatusDisplay.tsx';
import { createEcpayOrder } from './services/api.ts';
import { MOCK_PRODUCT } from './constants.ts';

const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const { cart, view, orderStatus, orderDetails } = state;

  // Handle redirect from ECPay by checking URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('from_ecpay')) {
      // This page is shown for success, failure, or cancellation.
      // The real result is processed by the server-side ReturnURL.
      dispatch({ type: 'SET_ORDER_STATUS', payload: { 
        status: 'success', // Use a neutral/positive icon
        details: { 
          orderId: '', // Do not display a specific order ID here
          message: 'Thank you for your order. A confirmation email with the final transaction result will be sent to you shortly.' 
        } 
      }});
      setView('status');
      // Optional: remove the query params from URL without reloading the page
      window.history.replaceState({}, document.title, "/");
    }
  }, []); // Empty dependency array ensures this runs only once on mount


  const addToCart = (item: CartItem) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity } });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setView = (view: AppState['view']) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  };

  const handleCheckout = useCallback(async (customerInfo: CustomerInfo, invoiceInfo: InvoiceInfo) => {
    setView('processing');
    try {
      const order: Order = {
        items: cart,
        customer: customerInfo,
        invoice: invoiceInfo,
      };
      // createEcpayOrder now returns a full HTML page as a string
      const redirectHtml = await createEcpayOrder(order);
      // Replace the current page with the ECPay form to trigger redirection
      document.open();
      document.write(redirectHtml);
      document.close();

    } catch (error) {
      console.error("Payment failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      dispatch({ type: 'SET_ORDER_STATUS', payload: { status: 'failure', details: { orderId: 'N/A', message: errorMessage } }});
      // If payment fails, show the status screen
      setView('status');
    }
  }, [cart]);
  
  const resetFlow = () => {
    dispatch({ type: 'RESET' });
  };

  const contextValue = {
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    setView,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen font-sans text-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {view !== 'status' && <ProductSection product={MOCK_PRODUCT} />}
          
          {view === 'cart' && <ShoppingCartModal />}
          
          {view === 'checkout' && <CheckoutModal onCheckout={handleCheckout} />}

          {view === 'processing' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-xl text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
                <h2 className="text-2xl font-semibold">Processing Payment...</h2>
                <p className="text-gray-600 mt-2">Please wait, you will be redirected shortly.</p>
              </div>
            </div>
          )}

          {view === 'status' && <StatusDisplay status={orderStatus} details={orderDetails} onReset={resetFlow} />}
        </main>
        <footer className="text-center py-6 bg-gray-100 border-t mt-12">
            <p className="text-gray-500">&copy; 2024 Your Awesome Store. All Rights Reserved.</p>
        </footer>
      </div>
    </AppContext.Provider>
  );
};

export default App;
