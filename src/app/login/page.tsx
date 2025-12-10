'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Coffee, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      toast.error('Бүх талбарыг бөглөнө үү');
      return;
    }

    try {
      await signIn(email, password);
      toast.success('Амжилттай нэвтэрлээ');
      router.push('/');
    } catch {
      toast.error('Нэвтрэхэд алдаа гарлаа');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-coffee-500 via-coffee-600 to-coffee-700">
        <div className="absolute inset-0 bg-[url('/coffee-pattern.png')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <Coffee className="w-20 h-20 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Good Cup</h1>
            <p className="text-xl text-coffee-100 max-w-md">
              Чанартай цаасан аяга, таг, соруулыг бөөний үнээр нийлүүлнэ
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-6 text-center"
          >
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-coffee-200 text-sm">Бүтээгдэхүүн</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-coffee-200 text-sm">Үйлчлүүлэгч</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-coffee-200 text-sm">Тусламж</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Back button */}
          <Link 
            href="/" 
            className="inline-flex items-center text-coffee-500 hover:text-coffee-600 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Нүүр хуудас
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2">
              <Coffee className="w-10 h-10 text-coffee-500" />
              <span className="text-2xl font-bold text-coffee-700">Good Cup</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-coffee-800 mb-2">
              Тавтай морил! 👋
            </h1>
            <p className="text-coffee-600">
              Нэвтрэхийн тулд мэдээллээ оруулна уу
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                И-мэйл хаяг
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-400" />
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-coffee-200 focus:border-coffee-500 focus:ring-0 outline-none transition-colors bg-coffee-50/50 text-coffee-800 placeholder:text-coffee-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                Нууц үг
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-coffee-200 focus:border-coffee-500 focus:ring-0 outline-none transition-colors bg-coffee-50/50 text-coffee-800 placeholder:text-coffee-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-coffee-400 hover:text-coffee-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 rounded border-coffee-300 text-coffee-500 focus:ring-coffee-500" />
                <span className="ml-2 text-sm text-coffee-600">Намайг сана</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-coffee-500 hover:text-coffee-600 font-medium">
                Нууц үг мартсан?
              </Link>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3 text-base font-semibold rounded-xl shadow-lg shadow-coffee-500/25 hover:shadow-xl hover:shadow-coffee-500/30 transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Түр хүлээнэ үү...
                </span>
              ) : 'Нэвтрэх'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-coffee-200"></div>
            <span className="px-4 text-sm text-coffee-400">эсвэл</span>
            <div className="flex-1 border-t border-coffee-200"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-coffee-200 hover:border-coffee-300 hover:bg-coffee-50 transition-all text-coffee-700 font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google-ээр нэвтрэх
            </button>
          </div>

          {/* Sign up link */}
          <p className="mt-8 text-center text-coffee-600">
            Бүртгэл байхгүй юу?{' '}
            <Link href="/register" className="text-coffee-500 hover:text-coffee-600 font-semibold">
              Бүртгүүлэх
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
