'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Coffee, LogOut, Settings, ChevronDown, Package, LayoutDashboard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui';

export function Header() {
  const pathname = usePathname();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { openCart, getItemCount } = useCartStore();
  const { user, isAdmin, signOut } = useAuthStore();
  const itemCount = getItemCount();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/', label: 'Нүүр' },
    { href: '/products', label: 'Бүтээгдэхүүн' },
    { href: '/orders', label: 'Захиалга' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-coffee-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Coffee className="w-8 h-8 text-coffee-500" />
            <span className="text-xl font-bold text-coffee-700">Good Cup</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-coffee-100 text-coffee-700'
                    : 'text-coffee-600 hover:text-coffee-700 hover:bg-coffee-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-coffee-100 text-coffee-700'
                    : 'text-coffee-600 hover:text-coffee-700 hover:bg-coffee-50'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-1" />
                Админ
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Cart Button - Desktop only */}
            <button
              onClick={openCart}
              className="hidden md:flex relative p-2 rounded-lg text-coffee-600 hover:text-coffee-700 hover:bg-coffee-100 transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-coffee-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </button>

            {/* Profile Dropdown - Both Mobile & Desktop */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-2 rounded-lg text-coffee-600 hover:text-coffee-700 hover:bg-coffee-100 transition-colors"
              >
                {user ? (
                  <div className="w-8 h-8 rounded-full bg-coffee-500 text-white flex items-center justify-center font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                ) : (
                  <User className="w-6 h-6" />
                )}
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-coffee-200 py-2 z-50"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-coffee-100">
                          <p className="text-sm font-semibold text-coffee-800">{user.name}</p>
                          <p className="text-xs text-coffee-500">{user.email}</p>
                        </div>

                        {/* Mobile Navigation Links */}
                        <div className="md:hidden border-b border-coffee-100 py-1">
                          {navLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setUserDropdownOpen(false)}
                              className={`flex items-center space-x-3 px-4 py-2.5 transition-colors ${
                                pathname === link.href
                                  ? 'bg-coffee-50 text-coffee-700'
                                  : 'text-coffee-600 hover:bg-coffee-50'
                              }`}
                            >
                              <span className="text-sm">{link.label}</span>
                            </Link>
                          ))}
                        </div>

                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-coffee-600 hover:bg-coffee-50 transition-colors"
                        >
                          <User className="w-5 h-5" />
                          <span className="text-sm">Профайл</span>
                        </Link>

                        <Link
                          href="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-coffee-600 hover:bg-coffee-50 transition-colors"
                        >
                          <Package className="w-5 h-5" />
                          <span className="text-sm">Захиалгууд</span>
                        </Link>

                        {isAdmin && (
                          <>
                            <div className="border-t border-coffee-100 my-1"></div>
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-coffee-600 hover:bg-coffee-50 transition-colors"
                            >
                              <LayoutDashboard className="w-5 h-5" />
                              <span className="text-sm font-medium">Админ хэсэг</span>
                            </Link>
                          </>
                        )}

                        <div className="border-t border-coffee-100 my-1"></div>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            signOut();
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm">Гарах</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Mobile Navigation Links */}
                        <div className="md:hidden border-b border-coffee-100 py-1">
                          {navLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setUserDropdownOpen(false)}
                              className={`flex items-center space-x-3 px-4 py-2.5 transition-colors ${
                                pathname === link.href
                                  ? 'bg-coffee-50 text-coffee-700'
                                  : 'text-coffee-600 hover:bg-coffee-50'
                              }`}
                            >
                              <span className="text-sm">{link.label}</span>
                            </Link>
                          ))}
                        </div>

                        <Link
                          href="/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-coffee-600 hover:bg-coffee-50 transition-colors"
                        >
                          <User className="w-5 h-5" />
                          <span className="text-sm">Нэвтрэх</span>
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-coffee-600 hover:bg-coffee-50 transition-colors"
                        >
                          <ChevronDown className="w-5 h-5" />
                          <span className="text-sm">Бүртгүүлэх</span>
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
