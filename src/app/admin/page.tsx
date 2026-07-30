'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Users, Settings, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, isEmployee, loading } = useAuthStore();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      // Products count
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const totalProducts = productsSnapshot.size;

      // Orders
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders = ordersSnapshot.docs.map(doc => doc.data());
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'Pending').length;
      const totalRevenue = orders
        .filter(o => o.paymentStatus === 'Paid')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      // Today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter(o => {
        const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        return orderDate >= today;
      }).length;

      // Users count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        pendingOrders,
        totalRevenue,
        todayOrders,
      });
      setLoadingStats(false);
    } catch {
      console.error('Error fetching stats');
      setLoadingStats(false);
    }
  }, []);

  const fetchRecentOrders = useCallback(async () => {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setRecentOrders(orders);
    } catch {
      console.error('Error fetching recent orders');
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (isEmployee) {
      router.push('/admin/orders');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, isEmployee, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchRecentOrders();
    }
  }, [isAdmin, fetchStats, fetchRecentOrders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const statCards = [
    { label: 'Нийт бүтээгдэхүүн', value: stats.totalProducts, icon: Package, color: 'from-blue-500 to-blue-600', glow: 'shadow-blue-500/25' },
    { label: 'Нийт захиалга', value: stats.totalOrders, icon: ShoppingCart, color: 'from-green-500 to-emerald-600', glow: 'shadow-green-500/25' },
    { label: 'Хүлээгдэж буй', value: stats.pendingOrders, icon: Clock, color: 'from-orange-500 to-amber-600', glow: 'shadow-orange-500/25' },
    { label: 'Нийт хэрэглэгч', value: stats.totalUsers, icon: Users, color: 'from-purple-500 to-violet-600', glow: 'shadow-purple-500/25' },
    { label: 'Өнөөдрийн захиалга', value: stats.todayOrders, icon: TrendingUp, color: 'from-pink-500 to-rose-600', glow: 'shadow-pink-500/25' },
    { label: 'Нийт орлого', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/25' },
  ];

  const menuItems = [
    { href: '/admin/products', label: 'Бүтээгдэхүүн', icon: Package, description: 'Бүтээгдэхүүн удирдах' },
    { href: '/admin/orders', label: 'Захиалга', icon: ShoppingCart, description: 'Захиалга удирдах' },
    { href: '/admin/users', label: 'Хэрэглэгч', icon: Users, description: 'Хэрэглэгч удирдах' },
    { href: '/admin/settings', label: 'Тохиргоо', icon: Settings, description: 'Систем тохиргоо' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-coffee-100 mb-2">
            Админ хэсэг
          </h1>
          <div className="w-14 h-1 bg-gradient-to-r from-coffee-400 to-coffee-600 rounded-full mb-3" />
          <p className="text-coffee-400">
            Сайн байна уу, <span className="text-coffee-200 font-medium">{user?.name}</span>
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-coffee-900/80 backdrop-blur rounded-2xl p-4 border border-coffee-800 hover:border-coffee-600 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-lg ${stat.glow} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-coffee-400 text-xs uppercase tracking-wide mb-1">{stat.label}</p>
              <p className="text-coffee-100 text-xl font-bold">
                {loadingStats ? (
                  <span className="inline-block w-12 h-6 rounded bg-coffee-800 animate-pulse" />
                ) : (
                  stat.value
                )}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Link href={item.href}>
                <div className="bg-coffee-900/80 backdrop-blur rounded-2xl p-6 border border-coffee-800 hover:border-coffee-500/60 hover:bg-coffee-800/60 hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-coffee-600 to-coffee-800 rounded-2xl flex items-center justify-center group-hover:from-coffee-500 group-hover:to-coffee-700 shadow-lg shadow-coffee-900/40 group-hover:scale-110 transition-all duration-300">
                      <item.icon className="w-6 h-6 text-coffee-200 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-coffee-100 font-semibold">{item.label}</h3>
                      <p className="text-coffee-500 text-sm">{item.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-coffee-900/80 backdrop-blur rounded-2xl border border-coffee-800 overflow-hidden"
        >
          <div className="p-6 border-b border-coffee-800 bg-gradient-to-r from-coffee-900 to-coffee-800/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-coffee-100">Сүүлийн захиалгууд</h2>
              <Link href="/admin/orders" className="text-coffee-400 hover:text-coffee-200 text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                Бүгдийг харах →
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-coffee-800">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-coffee-400">
                Захиалга байхгүй
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-coffee-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-coffee-100 font-medium font-mono text-sm">
                        #{order.paymentRef || order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-coffee-400 text-sm">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-coffee-100 font-semibold">
                        {formatPrice(order.total)}
                      </p>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                          : 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                      }`}>
                        {order.paymentStatus === 'Paid' ? 'Төлөгдсөн' : 'Хүлээгдэж буй'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
