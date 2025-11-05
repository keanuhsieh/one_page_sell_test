
export interface Product {
  id: string;
  name: string;
  description: string;
  specs: { [key: string]: string };
  price: number;
  images: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export enum InvoiceType {
  TWO_PART = 'two-part',
  THREE_PART = 'three-part',
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface InvoiceInfo {
  type: InvoiceType;
  companyName?: string;
  taxId?: string;
}

export interface Order {
  items: CartItem[];
  customer: CustomerInfo;
  invoice: InvoiceInfo;
}

export interface OrderDetails {
  orderId: string;
  message?: string;
}

export type OrderStatus = 'idle' | 'success' | 'failure';
