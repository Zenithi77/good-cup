'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X, Coffee, LogOut, Settings, ChevronDown, Package, LayoutDashboard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-lg text-coffee-600 hover:text-coffee-700 hover:bg-coffee-100 transition-colors"
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

            {/* User Menu with Dropdown */}
            {user ? (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-coffee-600 hover:text-coffee-700 hover:bg-coffee-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-coffee-500 text-white flex items-center justify-center font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-coffee-200 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-coffee-100">
                        <p className="text-sm font-semibold text-coffee-800">{user.name}</p>
                        <p className="text-xs text-coffee-500">{user.email}</p>
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
                          <Link
                            href="/admin/products"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-coffee-600 hover:bg-coffee-50 transition-colors"
                          >
                            <Settings className="w-5 h-5" />
                            <span className="text-sm">Бүтээгдэхүүн удирдах</span>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button variant="outline" size="sm">
                  Нэвтрэх
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-coffee-600 hover:text-coffee-700 hover:bg-coffee-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-coffee-200"
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-coffee-100 text-coffee-700'
                      : 'text-coffee-600 hover:text-coffee-700 hover:bg-coffee-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Admin Section in Mobile */}
              {isAdmin && (
                <div className="pt-2 mt-2 border-t border-coffee-100">
                  <p className="px-4 py-2 text-xs font-semibold text-coffee-400 uppercase tracking-wide">Админ хэсэг</p>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-coffee-600 hover:text-coffee-700 hover:bg-coffee-50"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-3" />
                    Админ Dashboard
                  </Link>
                  <Link
                    href="/admin/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-coffee-600 hover:text-coffee-700 hover:bg-coffee-50"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Бүтээгдэхүүн удирдах
                  </Link>
                </div>
              )}

              {/* User Section in Mobile */}
              {user ? (
                <div className="pt-2 mt-2 border-t border-coffee-100">
                  <div className="px-4 py-3 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-coffee-500 text-white flex items-center justify-center font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-coffee-800">{user.name}</p>
                      <p className="text-xs text-coffee-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-coffee-600 hover:text-coffee-700 hover:bg-coffee-50"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Профайл
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-coffee-600 hover:text-coffee-700 hover:bg-coffee-50"
                  >
                    <Package className="w-4 h-4 mr-3" />
                    Захиалгууд
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-left text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Гарах
                  </button>
                </div>
              ) : (
                <div className="pt-2 mt-2 border-t border-coffee-100">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-coffee-500 hover:text-coffee-700 hover:bg-coffee-50"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Нэвтрэх
                  </Link>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  );
}
