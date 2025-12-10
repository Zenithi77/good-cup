import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price to Mongolian currency
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('mn-MN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + '₮';
}

// Generate payment reference
export function generatePaymentRef(): string {
  const timestamp = Date.now().toString().slice(-6);
  return timestamp.toUpperCase();
}

// Check delivery time (UB timezone UTC+8)
export function getDeliveryMessage(): { message: string; isToday: boolean } {
  const now = new Date();
  const ubTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ulaanbaatar' }));
  const hour = ubTime.getHours();
  const day = ubTime.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Weekend or after 11:00
  if (day === 0 || day === 6 || hour >= 11) {
    const nextDay = day === 6 ? 'Даваа гарагт' : day === 0 ? 'Маргааш' : 'Маргааш';
    return {
      message: `${nextDay} хүргэлтэнд гарна`,
      isToday: false
    };
  }
  
  return {
    message: 'Өнөөдөр хүргэлтэнд гарна',
    isToday: true
  };
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone (Mongolian)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Check if user is admin
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  return email === adminEmail;
}
