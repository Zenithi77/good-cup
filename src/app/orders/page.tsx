'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, Check, Truck, X, Copy, CreditCard, RefreshCw, Loader2, Building2, Eye } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import { Badge, Button, Modal } from '@/components/ui';
import { BANK_ACCOUNTS } from '@/lib/constants';
import toast from 'react-hot-toast';

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
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Compute loading state based on user and data status
  const isLoading = useMemo(() => {
    if (!user?.email) return false;
    return !dataLoaded;
  }, [user?.email, dataLoaded]);

  // Real-time listener for orders
  useEffect(() => {
    if (!user?.email) {
      // Use setTimeout to avoid synchronous setState warning
      const timer = setTimeout(() => setDataLoaded(true), 0);
      return () => clearTimeout(timer);
    }

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('customerEmail', '==', user.email),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        paidAt: doc.data().paidAt?.toDate(),
      })) as Order[];
      
      setOrders(ordersList);
      setDataLoaded(true);
    }, (error) => {
      console.error('Error listening to orders:', error);
      setDataLoaded(true);
    });

    return () => unsubscribe();
  }, [user?.email]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success('Хуулагдлаа');
    setTimeout(() => setCopied(null), 2000);
  };

  const openPaymentModal = (order: Order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const openOrderDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-coffee-400 mx-auto mb-4" />
          <p className="text-coffee-200 text-lg mb-4">
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
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Миний захиалсан бараа
          </h1>
          <p className="text-coffee-200">
            Таны бүх захиалгын түүх болон төлөв
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-coffee-900 rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-coffee-400 mx-auto mb-4" />
            <p className="text-coffee-200 text-lg mb-2">
              Захиалга байхгүй байна
            </p>
            <p className="text-coffee-300 text-sm mb-6">
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
                          <span className="text-coffee-200 text-sm font-medium">
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
                        <p className="text-coffee-300 text-sm">
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
                        <p className="text-white font-bold text-lg">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-coffee-300 text-sm">
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
                          className="bg-coffee-800 rounded-lg px-3 py-1.5 text-sm text-coffee-100"
                        >
                          {item.productName} ({item.size}) × {item.quantity}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="bg-coffee-800 rounded-lg px-3 py-1.5 text-sm text-coffee-200">
                          +{order.items.length - 3} бусад
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {/* View Details Button - Always show */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openOrderDetailModal(order)}
                        className="border-coffee-600 text-coffee-200 hover:bg-coffee-800"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Дэлгэрэнгүй харах
                      </Button>

                      {/* Payment Button - Only for pending payments */}
                      {order.paymentStatus === 'Pending' && (
                        <Button
                          size="sm"
                          onClick={() => openPaymentModal(order)}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Төлбөр төлөх
                        </Button>
                      )}
                    </div>

                    {order.paymentStatus === 'Pending' && (
                      <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-xl p-4 mt-4">
                        <div className="flex items-center text-orange-400">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          >
                            <RefreshCw className="w-5 h-5 mr-2" />
                          </motion.div>
                          <div>
                            <p className="font-medium">Төлбөр хүлээгдэж байна</p>
                            <p className="text-xs text-orange-300/70">Автоматаар шалгаж байна...</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Paid confirmation */}
                    {order.paymentStatus === 'Paid' && order.status === 'Processing' && (
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mt-4">
                        <div className="flex items-center text-green-400">
                          <Check className="w-5 h-5 mr-2" />
                          <div>
                            <p className="font-medium">Төлбөр амжилттай!</p>
                            <p className="text-xs text-green-300/70">Захиалга боловсруулагдаж байна</p>
                          </div>
                        </div>
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
            {/* Order Info */}
            <div className="bg-coffee-800/50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-coffee-400">Захиалгын дугаар</span>
                <span className="text-coffee-100 font-medium">#{selectedOrder.paymentRef}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-coffee-400">Төлөх дүн</span>
                <span className="text-white font-bold text-xl">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Bank Account Info */}
            <div className="bg-coffee-800 rounded-xl p-4">
              <div className="flex items-center mb-4">
                <Building2 className="w-5 h-5 text-coffee-400 mr-2" />
                <span className="text-coffee-200 font-semibold">{BANK_ACCOUNTS.khan.bankName}</span>
              </div>
              
              <div className="space-y-3">
                {/* Account Number */}
                <div className="flex justify-between items-center bg-coffee-900 rounded-lg p-3">
                  <div>
                    <span className="text-coffee-400 text-xs block">Дансны дугаар</span>
                    <span className="text-coffee-100 font-mono text-lg">{BANK_ACCOUNTS.khan.accountNumber}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(BANK_ACCOUNTS.khan.accountNumber, 'account')}
                    className="p-2 text-coffee-400 hover:text-coffee-100 hover:bg-coffee-800 rounded-lg transition-colors"
                  >
                    {copied === 'account' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                {/* Account Name */}
                <div className="flex justify-between items-center">
                  <span className="text-coffee-400">Дансны нэр</span>
                  <span className="text-coffee-100">{BANK_ACCOUNTS.khan.accountName}</span>
                </div>
              </div>
            </div>

            {/* Payment Reference - IMPORTANT */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <p className="text-orange-400 text-sm mb-3 font-medium">
                ⚠️ Гүйлгээний утга дээр дараах кодыг заавал бичнэ үү:
              </p>
              <div className="flex items-center justify-between bg-coffee-900 rounded-lg p-4">
                <span className="text-3xl font-bold text-coffee-100 font-mono tracking-wider">
                  {selectedOrder.paymentRef}
                </span>
                <button
                  onClick={() => copyToClipboard(selectedOrder.paymentRef || '', 'ref')}
                  className="p-2 text-coffee-400 hover:text-coffee-100 hover:bg-coffee-800 rounded-lg transition-colors"
                >
                  {copied === 'ref' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-orange-300/70 text-xs mt-2">
                Энэ код байхгүй бол төлбөр автоматаар баталгаажихгүй
              </p>
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

      {/* Order Detail Modal */}
      <Modal
        isOpen={showOrderDetailModal}
        onClose={() => setShowOrderDetailModal(false)}
        title="Захиалгын дэлгэрэнгүй"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Status */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusConfig[selectedOrder.status as keyof typeof statusConfig]?.color as 'success' | 'warning' | 'error' | 'info'}>
                {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.label}
              </Badge>
              <Badge variant={paymentStatusConfig[selectedOrder.paymentStatus as keyof typeof paymentStatusConfig]?.color as 'success' | 'warning' | 'error' | 'info'}>
                {paymentStatusConfig[selectedOrder.paymentStatus as keyof typeof paymentStatusConfig]?.label}
              </Badge>
            </div>

            {/* Order Info */}
            <div className="bg-coffee-800/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-coffee-400">Захиалгын дугаар</span>
                <span className="text-coffee-100 font-mono">#{selectedOrder.paymentRef || selectedOrder.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-400">Огноо</span>
                <span className="text-coffee-100">
                  {selectedOrder.createdAt?.toLocaleDateString('mn-MN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-400">Нийт дүн</span>
                <span className="text-white font-bold">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-coffee-200 font-semibold mb-3">Захиалсан бүтээгдэхүүнүүд</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="bg-coffee-800 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-coffee-100">{item.productName}</p>
                      <p className="text-coffee-400 text-sm">{item.size} × {item.quantity}</p>
                    </div>
                    <span className="text-coffee-200">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Info Button - Only for pending payments */}
            {selectedOrder.paymentStatus === 'Pending' && (
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => {
                  setShowOrderDetailModal(false);
                  setTimeout(() => openPaymentModal(selectedOrder), 200);
                }}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Гүйлгээний утга болон дансны мэдээлэл харах
              </Button>
            )}

            {/* Paid Info */}
            {selectedOrder.paymentStatus === 'Paid' && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center text-green-400">
                  <Check className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-medium">Төлбөр баталгаажсан</p>
                    {selectedOrder.paidAt && (
                      <p className="text-xs text-green-300/70">
                        {selectedOrder.paidAt.toLocaleDateString('mn-MN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
