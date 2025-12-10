'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, User, Copy, Check, CreditCard, Building, Loader2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, getDeliveryMessage } from '@/lib/utils';
import { UB_DISTRICTS, BANK_ACCOUNTS, MINIMUM_ORDER_AMOUNT } from '@/lib/constants';
import { Button, Input, Select, Modal } from '@/components/ui';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
    deliveryAddress: '',
    deliveryDistrict: UB_DISTRICTS[0],
    notes: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [orderId, setOrderId] = useState('');
  const [copied, setCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const total = getTotal();
  const deliveryInfo = getDeliveryMessage();

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerPhone: user.phone || prev.customerPhone,
        customerEmail: user.email || prev.customerEmail,
      }));
    }
  }, [user]);

  // Polling for payment status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (orderId && showPaymentModal && !paymentSuccess) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/payment/status/${orderId}`);
          const data = await response.json();
          
          if (data.paymentStatus === 'Paid') {
            setPaymentSuccess(true);
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId, showPaymentModal, paymentSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (total < MINIMUM_ORDER_AMOUNT) {
      toast.error(`Хамгийн багадаа ${formatPrice(MINIMUM_ORDER_AMOUNT)} захиалах ёстой`);
      return;
    }

    if (!formData.customerName || !formData.customerPhone || !formData.customerEmail || !formData.deliveryAddress) {
      toast.error('Бүх талбарыг бөглөнө үү');
      return;
    }

    setLoading(true);

    try {
      // Generate payment reference
      const ref = Date.now().toString().slice(-6).toUpperCase();
      
      // Create order in Firestore
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          imageUrl: item.imageUrl,
        })),
        total,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        deliveryAddress: formData.deliveryAddress,
        deliveryDistrict: formData.deliveryDistrict,
        notes: formData.notes,
        status: 'Pending',
        paymentStatus: 'Pending',
        paymentRef: ref,
        paymentMethod: 'bank_transfer',
        userId: user?.id || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      setOrderId(docRef.id);
      setPaymentRef(ref);
      setShowPaymentModal(true);
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Захиалга үүсгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Хуулагдлаа');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentComplete = () => {
    clearCart();
    router.push('/orders');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-coffee-400 text-lg mb-4">Сагс хоосон байна</p>
          <Button onClick={() => router.push('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Бүтээгдэхүүн үзэх
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center text-coffee-400 hover:text-coffee-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Буцах
        </motion.button>

        <h1 className="text-2xl md:text-3xl font-bold text-coffee-100 mb-8">
          Захиалга баталгаажуулах
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Info */}
              <div className="bg-coffee-900 rounded-2xl p-6 border border-coffee-800">
                <h2 className="text-lg font-semibold text-coffee-100 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-coffee-400" />
                  Хэрэглэгчийн мэдээлэл
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Нэр"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Таны нэр"
                    required
                  />
                  <Input
                    label="Утас"
                    name="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder="99119911"
                    required
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="И-мэйл"
                      name="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-coffee-900 rounded-2xl p-6 border border-coffee-800">
                <h2 className="text-lg font-semibold text-coffee-100 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-coffee-400" />
                  Хүргэлтийн мэдээлэл
                </h2>

                <div className="space-y-4">
                  <Select
                    label="Дүүрэг"
                    name="deliveryDistrict"
                    value={formData.deliveryDistrict}
                    onChange={handleInputChange}
                    options={UB_DISTRICTS.map(d => ({ value: d, label: d }))}
                  />
                  <Input
                    label="Дэлгэрэнгүй хаяг"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    placeholder="Хороо, байр, тоот..."
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-coffee-200 mb-1.5">
                      Нэмэлт тэмдэглэл
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Нэмэлт мэдээлэл..."
                      rows={3}
                      className="flex w-full rounded-lg border border-coffee-700 bg-coffee-900 px-3 py-2 text-sm text-coffee-100 placeholder:text-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Delivery time message */}
                <div className={`mt-4 p-3 rounded-lg ${deliveryInfo.isToday ? 'bg-green-500/10 border border-green-500/30' : 'bg-orange-500/10 border border-orange-500/30'}`}>
                  <p className={`text-sm ${deliveryInfo.isToday ? 'text-green-400' : 'text-orange-400'}`}>
                    🚚 {deliveryInfo.message}
                  </p>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || total < MINIMUM_ORDER_AMOUNT}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Захиалга үүсгэж байна...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Төлбөр төлөх ({formatPrice(total)})
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-coffee-900 rounded-2xl p-6 border border-coffee-800 sticky top-24">
              <h2 className="text-lg font-semibold text-coffee-100 mb-4">
                Захиалгын дүн
              </h2>

              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-coffee-800 shrink-0">
                      <Image
                        src={item.imageUrl || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-coffee-100 text-sm line-clamp-1">{item.name}</p>
                      <p className="text-coffee-400 text-xs">{item.size} × {item.quantity}</p>
                      <p className="text-coffee-300 text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-coffee-800 pt-4 space-y-2">
                <div className="flex justify-between text-coffee-400">
                  <span>Бүтээгдэхүүн</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-coffee-400">
                  <span>Хүргэлт</span>
                  <span className="text-green-400">Үнэгүй</span>
                </div>
                <div className="flex justify-between text-coffee-100 font-semibold text-lg pt-2 border-t border-coffee-800">
                  <span>Нийт</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => !paymentSuccess && setShowPaymentModal(false)}
        title={paymentSuccess ? 'Төлбөр амжилттай!' : 'Төлбөр төлөх'}
        size="md"
      >
        <AnimatePresence mode="wait">
          {paymentSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-coffee-100 mb-2">
                Баярлалаа!
              </h3>
              <p className="text-coffee-400 mb-6">
                Таны төлбөр амжилттай баталгаажлаа. {deliveryInfo.message}
              </p>
              
              <Button onClick={handlePaymentComplete} className="w-full">
                Ойлголоо
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="payment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Bank Info */}
              <div className="bg-coffee-800 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <Building className="w-5 h-5 text-coffee-400 mr-2" />
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
                    <span className="text-coffee-100 font-bold">{formatPrice(total)}</span>
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
                    {paymentRef}
                  </span>
                  <button
                    onClick={() => copyToClipboard(paymentRef)}
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
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </div>
  );
}
