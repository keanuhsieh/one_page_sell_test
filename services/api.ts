

import type { Order, OrderDetails } from '../types.ts';
import { TAX_RATE } from '../constants.ts';

/**
 * Creates an ECPay order by calling the backend Netlify Function.
 * This implementation is based on the POC, where Function 1 simulates the
 * entire ECPay flow and triggers Function 2 in the background.
 */
export const createEcpayOrder = async (order: Order): Promise<OrderDetails> => {
  console.log('Calling Netlify Function `create-ecpay-order` with:', order);

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = Math.round(subtotal * (1 + TAX_RATE));
  
  // Construct the payload required by the POC function
  const payload = {
    amount: totalAmount,
    customerEmail: order.customer.email,
    customerName: order.customer.name,
    // Combine item names for the mock payload
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
      // Try to get a meaningful error message from the server
      const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred.' }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log("Received from function:", result);
    return {
        orderId: result.orderId,
        message: result.message
    };

  } catch (error) {
    console.error("Error calling create-ecpay-order function:", error);
    if (error instanceof Error) {
        throw new Error(`Payment processing failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred during payment processing.');
  }
};