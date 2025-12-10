// Product Categories
export const CATEGORIES = [
  {
    id: 'cup-lid-sleeve-set',
    name: 'Таг аяга жийргэвч иж бүрдэл',
    icon: '☕',
    description: 'Бүрэн иж бүрдэл'
  },
  {
    id: 'double-wall-cup',
    name: 'Давхар цаастай халууны аяга',
    icon: '🥤',
    description: 'Халуун ундаанд зориулсан давхар хана'
  },
  {
    id: 'single-wall-cup',
    name: 'Дан цаастай халууны аяга',
    icon: '☕',
    description: 'Халуун ундаанд зориулсан дан хана'
  },
  {
    id: 'cold-cup',
    name: 'Хүйтэн уух зүйлсийн аяга',
    icon: '🧊',
    description: 'Хүйтэн ундаанд зориулсан'
  },
  {
    id: 'takeout-holder',
    name: 'Take Out Holder',
    icon: '📦',
    description: 'Авч явах хайрцаг'
  },
  {
    id: 'straw',
    name: 'Соруул',
    icon: '🥤',
    description: 'Төрөл бүрийн соруул'
  }
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

// Size options
export const SIZES = ['4oz', '6oz', '8oz', '12oz', '16oz', '22oz'] as const;
export type Size = typeof SIZES[number];

// Order status
export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

// Payment status
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

// UB Districts
export const UB_DISTRICTS = [
  'Баянгол дүүрэг',
  'Баянзүрх дүүрэг',
  'Сүхбаатар дүүрэг',
  'Чингэлтэй дүүрэг',
  'Хан-Уул дүүрэг',
  'Сонгинохайрхан дүүрэг',
  'Налайх дүүрэг',
  'Багануур дүүрэг',
  'Багахангай дүүрэг'
] as const;

// Bank accounts
export const BANK_ACCOUNTS = {
  khan: {
    bankName: 'Хаан банк',
    accountNumber: '06000 5021296757',
    accountName: 'ДОЛЦОН МӨНХЧИМЭГ'
  }
};

// Minimum order amount
export const MINIMUM_ORDER_AMOUNT = 200000;
