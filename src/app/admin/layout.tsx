'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, ShoppingCart, Users, Settings, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Бүтээгдэхүүн', icon: Package },
  { href: '/admin/orders', label: 'Захиалга', icon: ShoppingCart },
  { href: '/admin/users', label: 'Хэрэглэгч', icon: Users },
  { href: '/admin/settings', label: 'Тохиргоо', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isEmployee, loading } = useAuthStore();

  useEffect(() => {
    if (loading) return;
    if (!isAdmin && !isEmployee) {
      router.push('/');
    } else if (isEmployee && pathname !== '/admin/orders') {
      router.push('/admin/orders');
    }
  }, [loading, isAdmin, isEmployee, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-500"></div>
      </div>
    );
  }

  if (!isAdmin && !isEmployee) {
    return null;
  }

  if (isEmployee && pathname !== '/admin/orders') {
    return null;
  }

  const visibleNav = isEmployee
    ? adminNav.filter((item) => item.href === '/admin/orders')
    : adminNav;

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-950 to-coffee-900">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-coffee-900/95 backdrop-blur-md border-b border-coffee-800 shadow-lg shadow-black/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14 gap-4 overflow-x-auto scrollbar-hide">
            <Link
              href="/"
              className="flex items-center gap-2 text-coffee-400 hover:text-coffee-100 transition-colors shrink-0 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm">Буцах</span>
            </Link>
            
            <div className="h-6 w-px bg-coffee-700" />
            
            {visibleNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-b from-coffee-500 to-coffee-600 text-white shadow-md shadow-coffee-500/30 font-medium'
                      : 'text-coffee-400 hover:text-coffee-100 hover:bg-coffee-800/70'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
