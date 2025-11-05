

import type { Order, OrderDetails } from '../types.ts';
import { TAX_RATE } from '../constants.ts';

/**
 * Calls the backend to create a real ECPay order.
 * The backend will return a full HTML page with an auto-submitting form.
 * This function returns that HTML as a string.
 */
export const createEcpayOrder = async (order: Order): Promise<string> => {
  console.log('Calling Netlify Function `create-ecpay-order` with:', order);

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = Math.round(subtotal * (1 + TAX_RATE));
  
  const payload = {
    amount: totalAmount,
    customerEmail: order.customer.email,
    customerName: order.customer.name,
    itemName: order.items.map(item => `${item.name} x${item.quantity}`).join('#')
  };

  try {
    const response = await fetch('/.netlify/functions/create-ecpay-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    // The response is now expected to be an HTML string
    const htmlRedirectPage = await response.text();
    return htmlRedirectPage;

  } catch (error) {
    console.error("Error calling create-ecpay-order function:", error);
    if (error instanceof Error) {
        throw new Error(`Payment processing failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred during payment processing.');
  }
};