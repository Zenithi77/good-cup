'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Search, Eye, Check, Truck, X, Clock, Loader2 } from 'lucide-react';
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/constants';
import { Input, Select, Modal, Badge } from '@/components/ui';
import toast from 'react-hot-toast';

const statusConfig = {
  Pending: { label: 'Хүлээгдэж буй', color: 'warning' as const, icon: Clock },
  Processing: { label: 'Боловсруулж байна', color: 'info' as const, icon: Loader2 },
  Shipped: { label: 'Хүргэлтэнд', color: 'info' as const, icon: Truck },
  Delivered: { label: 'Хүргэгдсэн', color: 'success' as const, icon: Check },
  Cancelled: { label: 'Цуцлагдсан', color: 'error' as const, icon: X },
};

const paymentStatusConfig = {
  Pending: { label: 'Төлөгдөөгүй', color: 'warning' as const },
  Paid: { label: 'Төлөгдсөн', color: 'success' as const },
  Failed: { label: 'Амжилтгүй', color: 'error' as const },
  Refunded: { label: 'Буцаагдсан', color: 'info' as const },
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAdmin, loading } = useAuthStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        paidAt: doc.data().paidAt?.toDate(),
      })) as Order[];
      
      setOrders(ordersList);
      setLoadingOrders(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoadingOrders(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as Order['status'] } : null);
      }
      
      toast.success('Статус шинэчлэгдлээ');
    } catch {
      toast.error('Алдаа гарлаа');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const updateData: Partial<Order> & { updatedAt: Date; paidAt?: Date } = {
        paymentStatus: newStatus as Order['paymentStatus'],
        updatedAt: new Date(),
      };
      
      if (newStatus === 'Paid') {
        updateData.paidAt = new Date();
        updateData.status = 'Processing';
      }
      
      await updateDoc(doc(db, 'orders', orderId), updateData);
      
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, ...updateData } : o
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updateData } : null);
      }
      
      toast.success('Төлбөрийн статус шинэчлэгдлээ');
    } catch {
      toast.error('Алдаа гарлаа');
    } finally {
      setUpdating(false);
    }
  };

  const viewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentRef?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-coffee-100">
            Захиалга удирдах
          </h1>
          <p className="text-coffee-400">
            Нийт {orders.length} захиалга
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-500" />
            <Input
              placeholder="Захиалга хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Бүх статус' },
              ...ORDER_STATUSES.map(s => ({ 
                value: s, 
                label: statusConfig[s as keyof typeof statusConfig]?.label || s 
              }))
            ]}
            className="w-48"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-coffee-900 rounded-xl border border-coffee-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-coffee-800">
                <tr>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Захиалга</th>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Хэрэглэгч</th>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Дүн</th>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Статус</th>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Төлбөр</th>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Огноо</th>
                  <th className="px-4 py-3 text-right text-coffee-300 text-sm font-medium">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-800">
                {loadingOrders ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-coffee-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-coffee-400">
                      Захиалга олдсонгүй
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const status = statusConfig[order.status as keyof typeof statusConfig];
                    const paymentStatus = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig];
                    
                    return (
                      <tr key={order.id} className="hover:bg-coffee-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-coffee-100 font-medium">
                            #{order.paymentRef || order.id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-coffee-500 text-xs">
                            {order.items.length} бүтээгдэхүүн
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-coffee-100">{order.customerName}</p>
                          <p className="text-coffee-500 text-xs">{order.customerPhone}</p>
                        </td>
                        <td className="px-4 py-3 text-coffee-100 font-medium">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={status?.color}>
                            {status?.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={paymentStatus?.color}>
                            {paymentStatus?.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-coffee-400 text-sm">
                          {order.createdAt?.toLocaleDateString('mn-MN')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => viewOrder(order)}
                              className="p-2 text-coffee-400 hover:text-coffee-100 hover:bg-coffee-700 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Захиалга #${selectedOrder?.paymentRef || selectedOrder?.id.slice(-6).toUpperCase()}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-coffee-200 mb-2">Захиалгын статус</label>
                <Select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  options={ORDER_STATUSES.map(s => ({
                    value: s,
                    label: statusConfig[s as keyof typeof statusConfig]?.label || s
                  }))}
                  disabled={updating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-200 mb-2">Төлбөрийн статус</label>
                <Select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value)}
                  options={PAYMENT_STATUSES.map(s => ({
                    value: s,
                    label: paymentStatusConfig[s as keyof typeof paymentStatusConfig]?.label || s
                  }))}
                  disabled={updating}
                />
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-coffee-800 rounded-xl p-4">
              <h3 className="text-coffee-200 font-medium mb-3">Хэрэглэгчийн мэдээлэл</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-coffee-400">Нэр:</span>
                  <span className="text-coffee-100 ml-2">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-coffee-400">Утас:</span>
                  <span className="text-coffee-100 ml-2">{selectedOrder.customerPhone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-coffee-400">И-мэйл:</span>
                  <span className="text-coffee-100 ml-2">{selectedOrder.customerEmail}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-coffee-400">Хаяг:</span>
                  <span className="text-coffee-100 ml-2">
                    {selectedOrder.deliveryDistrict}, {selectedOrder.deliveryAddress}
                  </span>
                </div>
                {selectedOrder.notes && (
                  <div className="col-span-2">
                    <span className="text-coffee-400">Тэмдэглэл:</span>
                    <span className="text-coffee-100 ml-2">{selectedOrder.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-coffee-200 font-medium mb-3">Бүтээгдэхүүн</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-coffee-800 rounded-lg p-3">
                    <div>
                      <p className="text-coffee-100">{item.productName}</p>
                      <p className="text-coffee-400 text-sm">{item.size} × {item.quantity}</p>
                    </div>
                    <p className="text-coffee-100 font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t border-coffee-800">
              <span className="text-coffee-200 font-medium">Нийт дүн</span>
              <span className="text-coffee-100 text-xl font-bold">
                {formatPrice(selectedOrder.total)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
