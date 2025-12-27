'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, User, CreditCard, Loader2, AlertTriangle, Truck, Package, Copy, Check, Building2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, getDeliveryMessage } from '@/lib/utils';
import { UB_DISTRICTS, MINIMUM_ORDER_AMOUNT, BANK_ACCOUNTS } from '@/lib/constants';
import { Button, Input, Select, Modal } from '@/components/ui';
import toast from 'react-hot-toast';

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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [createdOrderRef, setCreatedOrderRef] = useState<string | null>(null);
  const [createdOrderTotal, setCreatedOrderTotal] = useState<number>(0);
  const [copied, setCopied] = useState<string | null>(null);
  
  const total = getTotal();
  const deliveryInfo = getDeliveryMessage();

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success('Хуулагдлаа');
    setTimeout(() => setCopied(null), 2000);
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Show terms modal first
  const handlePaymentClick = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (total < MINIMUM_ORDER_AMOUNT) {
      toast.error(`Хамгийн багадаа ${formatPrice(MINIMUM_ORDER_AMOUNT)} захиалах ёстой`);
      return;
    }

    if (!formData.customerName || !formData.customerPhone || !formData.customerEmail || !formData.deliveryAddress) {
      toast.error('Бүх талбарыг бөглөнө үү');
      return;
    }

    // Show terms modal
    setShowTermsModal(true);
    setTermsAccepted(false);
  };

  // Accept terms and proceed to create order
  const handleAcceptTerms = async () => {
    if (!termsAccepted) {
      toast.error('Нөхцөлүүдийг зөвшөөрнө үү');
      return;
    }

    setShowTermsModal(false);
    setPendingSubmit(true);
    await createOrder();
  };

  const createOrder = async () => {
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

      await addDoc(collection(db, 'orders'), orderData);
      
      // Save the payment reference and total for the modal
      setCreatedOrderRef(ref);
      setCreatedOrderTotal(total);
      
      // Clear cart
      clearCart();
      
      // Show payment modal with bank details
      setShowPaymentModal(true);
      toast.success('Захиалга амжилттай үүслээ!');
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Захиалга үүсгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
      setPendingSubmit(false);
    }
  };

  const handleGoToOrders = () => {
    setShowPaymentModal(false);
    router.push('/orders');
  };

  // Show empty cart message only if cart is empty AND payment modal is not showing
  if (items.length === 0 && !showPaymentModal) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-coffee-200 text-lg mb-4">Сагс хоосон байна</p>
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
          className="flex items-center text-coffee-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Буцах
        </motion.button>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">
          Захиалга баталгаажуулах
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handlePaymentClick} className="space-y-6">
              {/* Customer Info */}
              <div className="bg-coffee-900 rounded-2xl p-6 border border-coffee-800">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-coffee-300" />
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
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-coffee-300" />
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
                disabled={loading || pendingSubmit || total < MINIMUM_ORDER_AMOUNT}
              >
                {loading || pendingSubmit ? (
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
              <h2 className="text-lg font-semibold text-white mb-4">
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
                      <p className="text-white text-sm line-clamp-1">{item.name}</p>
                      <p className="text-coffee-300 text-xs">{item.size} × {item.quantity}</p>
                      <p className="text-coffee-200 text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-coffee-800 pt-4 space-y-2">
                <div className="flex justify-between text-coffee-300">
                  <span>Бүтээгдэхүүн</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-coffee-300">
                  <span>Хүргэлт</span>
                  <span className="text-green-400">Үнэгүй</span>
                </div>
                <div className="flex justify-between text-white font-semibold text-lg pt-2 border-t border-coffee-800">
                  <span>Нийт</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Нөхцөлүүдтэй танилцана уу"
        size="md"
      >
        <div className="space-y-6">
          {/* Delivery Terms */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <Truck className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-blue-300 font-semibold">Хүргэлтийн нөхцөл</span>
            </div>
            <ul className="space-y-2 text-coffee-300 text-sm">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Даваа-Баасан гарагт өдөр бүр 11:00 цагт хүргэлт гарна.
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                11 цагаас хойш хийгдсэн захиалга дараа өдөрт хүргэгдэнэ.
              </li>
            </ul>
          </div>

          {/* Service Terms */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <Package className="w-5 h-5 text-orange-400 mr-2" />
              <span className="text-orange-300 font-semibold">Үйлчилгээний нөхцөл</span>
            </div>
            <div className="flex items-start text-coffee-300 text-sm">
              <AlertTriangle className="w-4 h-4 text-orange-400 mr-2 mt-0.5 shrink-0" />
              <p>
                Нэг удаагийн хэрэгсэл нь задлах, буцаах боломжгүй байдаг тул та аяганы хэмжээ болон загвараа зөв сонгоно уу!!! Таньд амжилт хүсье.
              </p>
            </div>
          </div>

          {/* Accept Checkbox */}
          <div className="bg-coffee-800 rounded-xl p-4">
            <label className="flex items-start cursor-pointer group">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 rounded border-coffee-600 bg-coffee-900 text-coffee-500 focus:ring-coffee-500 focus:ring-offset-0 mt-0.5 shrink-0"
              />
              <span className="ml-3 text-coffee-200 text-sm group-hover:text-coffee-100 transition-colors">
                Дээрх нөхцөлүүдтэй танилцаж, зөвшөөрч байна
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowTermsModal(false)}
            >
              Буцах
            </Button>
            <Button
              className="flex-1"
              onClick={handleAcceptTerms}
              disabled={!termsAccepted}
            >
              Зөвшөөрч үргэлжлүүлэх
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Info Modal - Shows after order is created */}
      <Modal
        isOpen={showPaymentModal}
        onClose={handleGoToOrders}
        title="Төлбөр төлөх"
        size="md"
      >
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center text-green-400">
              <Check className="w-5 h-5 mr-2" />
              <span className="font-semibold">Захиалга амжилттай үүслээ!</span>
            </div>
            <p className="text-green-300/70 text-sm mt-1 ml-7">
              Дараах данс руу төлбөрөө шилжүүлнэ үү
            </p>
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

              {/* Amount */}
              <div className="flex justify-between items-center">
                <span className="text-coffee-400">Төлөх дүн</span>
                <span className="text-white font-bold text-xl">{formatPrice(total)}</span>
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
                {createdOrderRef}
              </span>
              <button
                onClick={() => copyToClipboard(createdOrderRef || '', 'ref')}
                className="p-2 text-coffee-400 hover:text-coffee-100 hover:bg-coffee-800 rounded-lg transition-colors"
              >
                {copied === 'ref' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-orange-300/70 text-xs mt-2">
              Энэ код байхгүй бол төлбөр автоматаар баталгаажихгүй
            </p>
          </div>

          {/* Info */}
          <div className="text-center text-coffee-400 text-sm">
            <p>Төлбөр төлсний дараа автоматаар баталгаажна</p>
            <p className="text-coffee-500 mt-1">Захиалгын хуудаснаас статусаа шалгах боломжтой</p>
          </div>

          {/* Go to Orders Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleGoToOrders}
          >
            <Package className="w-5 h-5 mr-2" />
            Миний захиалсан бараа руу очих
          </Button>
        </div>
      </Modal>
    </div>
  );
}
