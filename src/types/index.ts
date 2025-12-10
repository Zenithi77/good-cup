import { CategoryId, Size, OrderStatus, PaymentStatus } from '@/lib/constants';

// Product types
export interface ProductSize {
  size: Size;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  sizes: ProductSize[];
  stock: number;
  packageQty: number;
  description: string;
  imageUrl: string;
  badge?: 'bestseller' | 'new' | 'sale' | '';
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  address?: string;
  district?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cart types
export interface CartItem {
  id: string; // productId_size
  productId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl: string;
  packageQty: number;
}

// Order types
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size: string;
  imageUrl: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryDistrict: string;
  notes?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  paymentMethod?: string;
  paidAt?: Date;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Settings type
export interface Settings {
  key: string;
  value: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
