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
  const { isAdmin, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

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

  return (
    <div className="min-h-screen bg-coffee-950">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-coffee-900 border-b border-coffee-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14 gap-6 overflow-x-auto scrollbar-hide">
            <Link
              href="/"
              className="flex items-center gap-2 text-coffee-400 hover:text-coffee-100 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Буцах</span>
            </Link>
            
            <div className="h-6 w-px bg-coffee-700" />
            
            {adminNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors shrink-0 ${
                    isActive
                      ? 'bg-coffee-800 text-coffee-100'
                      : 'text-coffee-400 hover:text-coffee-100 hover:bg-coffee-800/50'
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
