
import React, { useState, useContext, FormEvent } from 'react';
import type { CustomerInfo, InvoiceInfo } from '../types.ts';
import { InvoiceType } from '../types.ts';
import { AppContext } from '../context/AppContext.ts';
import { XMarkIcon } from './Icons.tsx';
import { TAX_RATE } from '../constants.ts';

interface CheckoutModalProps {
  onCheckout: (customerInfo: CustomerInfo, invoiceInfo: InvoiceInfo) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ onCheckout }) => {
  const context = useContext(AppContext);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', email: '', phone: '' });
  const [invoiceType, setInvoiceType] = useState<InvoiceType>(InvoiceType.TWO_PART);
  const [threePartInfo, setThreePartInfo] = useState({ companyName: '', taxId: '' });

  if (!context) return null;
  const { setView, cart } = context;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const handleThreePartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThreePartInfo({ ...threePartInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const invoiceInfo: InvoiceInfo = {
      type: invoiceType,
      ...(invoiceType === InvoiceType.THREE_PART && threePartInfo)
    };
    onCheckout(customerInfo, invoiceInfo);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all animate-fade-in-up">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
          <button onClick={() => setView('cart')} className="text-gray-500 hover:text-gray-800">
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Customer Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" name="name" placeholder="Full Name" value={customerInfo.name} onChange={handleCustomerChange} required className="p-3 border rounded-md" />
              <input type="email" name="email" placeholder="Email Address" value={customerInfo.email} onChange={handleCustomerChange} required className="p-3 border rounded-md" />
              <input type="tel" name="phone" placeholder="Phone Number" value={customerInfo.phone} onChange={handleCustomerChange} required className="p-3 border rounded-md" />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Invoice</h3>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center p-3 border rounded-md flex-1 cursor-pointer">
                <input type="radio" name="invoiceType" value={InvoiceType.TWO_PART} checked={invoiceType === InvoiceType.TWO_PART} onChange={() => setInvoiceType(InvoiceType.TWO_PART)} className="mr-2" />
                Two-Part E-Invoice
              </label>
              <label className="flex items-center p-3 border rounded-md flex-1 cursor-pointer">
                <input type="radio" name="invoiceType" value={InvoiceType.THREE_PART} checked={invoiceType === InvoiceType.THREE_PART} onChange={() => setInvoiceType(InvoiceType.THREE_PART)} className="mr-2" />
                Three-Part (with Tax ID)
              </label>
            </div>
            {invoiceType === InvoiceType.THREE_PART && (
              <div className="grid grid-cols-1 gap-4 animate-fade-in">
                <input type="text" name="companyName" placeholder="Company Name" value={threePartInfo.companyName} onChange={handleThreePartChange} required className="p-3 border rounded-md" />
                <input type="text" name="taxId" placeholder="Tax ID Number" value={threePartInfo.taxId} onChange={handleThreePartChange} required className="p-3 border rounded-md" />
              </div>
            )}
          </section>
        
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
                <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Tax (5%):</span><span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between font-bold text-xl mt-2 pt-2 border-t"><span>Total:</span><span>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
            </div>

            <button type="submit" className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300">
              Proceed to ECPay
            </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
