import { CategoryId, OrderStatus, PaymentStatus, DeliveryType } from '@/lib/constants';

// Product types
export interface ProductSize {
  size: string;
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
  imageUrls?: string[]; // Олон зураг
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
  role: 'user' | 'admin' | 'guest';
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
  deliveryType: DeliveryType;
  deliveryAddress: string;
  deliveryDistrict: string;
  deliveryAimag?: string;
  deliverySum?: string;
  notes?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  paymentMethod?: string;
  bylCheckoutId?: number;
  bylCheckoutUrl?: string;
  paidAt?: Date;
  userId?: string;
  isGuest?: boolean;
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
