
import React from 'react';
import type { OrderStatus, OrderDetails } from '../types.ts';
import { CheckCircleIcon, XCircleIcon } from './Icons.tsx';

interface StatusDisplayProps {
  status: OrderStatus;
  details: OrderDetails | null;
  onReset: () => void;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, details, onReset }) => {
  if (status === 'idle' || !details) {
    return null;
  }

  const isSuccess = status === 'success';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md text-center p-8 transform transition-all animate-fade-in-up">
        {isSuccess ? (
          <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto" />
        ) : (
          <XCircleIcon className="h-20 w-20 text-red-500 mx-auto" />
        )}

        <h2 className={`mt-6 text-3xl font-bold ${isSuccess ? 'text-gray-800' : 'text-red-600'}`}>
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h2>

        {isSuccess && (
          <p className="mt-2 text-gray-600">
            Your order has been confirmed.
          </p>
        )}
        
        <div className="mt-4 text-left bg-gray-50 p-4 rounded-lg">
          {isSuccess && details.orderId && (
            <p className="text-gray-700">
              <strong>Order ID:</strong> <span className="font-mono">{details.orderId}</span>
            </p>
          )}
          {details.message && (
            <p className="mt-2 text-gray-700">
              <strong>Message:</strong> {details.message}
            </p>
          )}
        </div>

        <button
          onClick={onReset}
          className="mt-8 w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          {isSuccess ? 'Continue Shopping' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default StatusDisplay;
