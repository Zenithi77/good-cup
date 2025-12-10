'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, Check, Truck, X, Copy, CreditCard, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import { Badge, Button, Modal } from '@/components/ui';
import { BANK_ACCOUNTS } from '@/lib/constants';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const statusConfig = {
  Pending: { label: 'Хүлээгдэж буй', color: 'warning', icon: Clock },
  Processing: { label: 'Боловсруулж байна', color: 'info', icon: Package },
  Shipped: { label: 'Хүргэлтэнд гарсан', color: 'info', icon: Truck },
  Delivered: { label: 'Хүргэгдсэн', color: 'success', icon: Check },
  Cancelled: { label: 'Цуцлагдсан', color: 'error', icon: X },
};

const paymentStatusConfig = {
  Pending: { label: 'Төлөгдөөгүй', color: 'warning' },
  Paid: { label: 'Төлөгдсөн', color: 'success' },
  Failed: { label: 'Амжилтгүй', color: 'error' },
  Refunded: { label: 'Буцаагдсан', color: 'info' },
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Polling for payment status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (user?.email && orders.some(o => o.paymentStatus === 'Pending')) {
      interval = setInterval(async () => {
        const pendingOrders = orders.filter(o => o.paymentStatus === 'Pending');
        
        for (const order of pendingOrders) {
          try {
            const response = await fetch(`/api/payment/status/${order.id}`);
            const data = await response.json();
            
            if (data.paymentStatus === 'Paid') {
              setOrders(prev => prev.map(o => 
                o.id === order.id ? { ...o, paymentStatus: 'Paid', status: 'Processing' } : o
              ));
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
              toast.success(`Захиалга #${order.paymentRef} төлөгдлөө!`);
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orders, user]);

  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('customerEmail', '==', user?.email),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        paidAt: doc.data().paidAt?.toDate(),
      })) as Order[];
      
      setOrders(ordersList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Хуулагдлаа');
    setTimeout(() => setCopied(false), 2000);
  };

  const openPaymentModal = (order: Order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-coffee-600 mx-auto mb-4" />
          <p className="text-coffee-400 text-lg mb-4">
            Захиалга харахын тулд нэвтэрнэ үү
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Нэвтрэх
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-coffee-100 mb-2">
            Миний захиалгууд
          </h1>
          <p className="text-coffee-400">
            Бүх захиалгын түүх
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-coffee-900 rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-coffee-600 mx-auto mb-4" />
            <p className="text-coffee-400 text-lg mb-2">
              Захиалга байхгүй байна
            </p>
            <p className="text-coffee-500 text-sm mb-6">
              Та анхны захиалгаа өгөөрэй
            </p>
            <Button onClick={() => window.location.href = '/products'}>
              Бүтээгдэхүүн үзэх
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
              const paymentInfo = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig];
              const StatusIcon = statusInfo?.icon || Package;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-coffee-900 rounded-2xl border border-coffee-800 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 md:p-6 border-b border-coffee-800">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-coffee-400 text-sm">
                            #{order.paymentRef || order.id.slice(-6).toUpperCase()}
                          </span>
                          <Badge variant={statusInfo?.color as 'success' | 'warning' | 'error' | 'info'}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo?.label}
                          </Badge>
                          <Badge variant={paymentInfo?.color as 'success' | 'warning' | 'error' | 'info'}>
                            {paymentInfo?.label}
                          </Badge>
                        </div>
                        <p className="text-coffee-500 text-sm">
                          {order.createdAt?.toLocaleDateString('mn-MN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-coffee-100 font-bold text-lg">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-coffee-400 text-sm">
                          {order.items.length} бүтээгдэхүүн
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="p-4 md:p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div
                          key={i}
                          className="bg-coffee-800 rounded-lg px-3 py-1 text-sm text-coffee-300"
                        >
                          {item.productName} ({item.size}) × {item.quantity}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="bg-coffee-800 rounded-lg px-3 py-1 text-sm text-coffee-400">
                          +{order.items.length - 3} бусад
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {order.paymentStatus === 'Pending' && (
                      <div className="flex items-center justify-between pt-4 border-t border-coffee-800">
                        <div className="flex items-center text-orange-400 text-sm">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Төлбөр хүлээж байна
                        </div>
                        <Button
                          size="sm"
                          onClick={() => openPaymentModal(order)}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Төлбөр төлөх
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Төлбөр төлөх"
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Bank Info */}
            <div className="bg-coffee-800 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <CreditCard className="w-5 h-5 text-coffee-400 mr-2" />
                <span className="text-coffee-200 font-medium">{BANK_ACCOUNTS.khan.bankName}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-coffee-400">Дансны дугаар</span>
                  <button
                    onClick={() => copyToClipboard(BANK_ACCOUNTS.khan.accountNumber)}
                    className="flex items-center text-coffee-100 hover:text-coffee-300"
                  >
                    {BANK_ACCOUNTS.khan.accountNumber}
                    {copied ? <Check className="w-4 h-4 ml-2 text-green-400" /> : <Copy className="w-4 h-4 ml-2" />}
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-coffee-400">Дансны нэр</span>
                  <span className="text-coffee-100">{BANK_ACCOUNTS.khan.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-coffee-400">Дүн</span>
                  <span className="text-coffee-100 font-bold">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Reference */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <p className="text-orange-400 text-sm mb-2">
                ⚠️ Гүйлгээний утга дээр дараах кодыг бичнэ үү:
              </p>
              <div className="flex items-center justify-between bg-coffee-900 rounded-lg p-3">
                <span className="text-2xl font-bold text-coffee-100 font-mono">
                  {selectedOrder.paymentRef}
                </span>
                <button
                  onClick={() => copyToClipboard(selectedOrder.paymentRef || '')}
                  className="p-2 text-coffee-400 hover:text-coffee-100 hover:bg-coffee-800 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              <div className="flex items-center justify-center text-coffee-400">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Төлбөр хүлээж байна...</span>
              </div>
              <p className="text-coffee-500 text-sm mt-2">
                Төлбөр төлсний дараа автоматаар баталгаажна
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
