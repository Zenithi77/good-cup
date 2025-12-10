'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, ArrowLeft, Package, Check } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import { useCartStore } from '@/store/cartStore';
import { Button, ProductBadge } from '@/components/ui';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  
  const { addItem, openCart } = useCartStore();

  const fetchProduct = async () => {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      if (productDoc.exists()) {
        const productData = { id: productDoc.id, ...productDoc.data() } as Product;
        setProduct(productData);
        if (productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0].size);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const getSelectedPrice = () => {
    if (!product) return 0;
    const sizeObj = product.sizes.find(s => s.size === selectedSize);
    return sizeObj?.price || 0;
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      size: selectedSize,
      price: getSelectedPrice(),
      quantity,
      imageUrl: product.imageUrl,
      packageQty: product.packageQty,
    });
    
    toast.success(`${product.name} сагсанд нэмэгдлээ`);
    openCart();
  };

  const getCategoryName = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-cream-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-coffee-100 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-coffee-100 rounded animate-pulse w-3/4" />
              <div className="h-6 bg-coffee-100 rounded animate-pulse w-1/2" />
              <div className="h-24 bg-coffee-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-8 bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-coffee-600 text-lg mb-4">Бүтээгдэхүүн олдсонгүй</p>
          <Button onClick={() => router.push('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Буцах
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 pb-32 md:pb-8 bg-cream-50">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center text-coffee-600 hover:text-coffee-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Буцах
        </motion.button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-coffee-200 shadow-sm">
              <Image
                src={product.imageUrl || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              <ProductBadge badge={product.badge || ''} />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category */}
            <p className="text-coffee-500 text-sm font-medium">
              {getCategoryName(product.category)}
            </p>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-coffee-800">
              {product.name}
            </h1>

            {/* Description */}
            {product.description && (
              <p className="text-coffee-600 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Package info */}
            <div className="flex items-center space-x-2 text-coffee-500">
              <Package className="w-5 h-5" />
              <span>{product.packageQty}ш / багц</span>
            </div>

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <h3 className="text-coffee-700 font-medium mb-3">Хэмжээ сонгох</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sizeObj) => (
                    <button
                      key={sizeObj.size}
                      onClick={() => setSelectedSize(sizeObj.size)}
                      className={`px-4 py-3 rounded-xl border-2 transition-all ${
                        selectedSize === sizeObj.size
                          ? 'border-coffee-500 bg-coffee-500 text-white'
                          : 'border-coffee-200 bg-white text-coffee-700 hover:border-coffee-400'
                      }`}
                    >
                      <span className="block font-medium">{sizeObj.size}</span>
                      <span className={`block text-sm ${selectedSize === sizeObj.size ? 'text-coffee-100' : 'text-coffee-500'}`}>
                        {formatPrice(sizeObj.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity - Hidden on mobile, shown on desktop */}
            <div className="hidden md:block">
              <h3 className="text-coffee-700 font-medium mb-3">Тоо ширхэг</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white border-2 border-coffee-200 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-coffee-500 hover:text-coffee-700 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-4 text-coffee-800 font-medium min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-coffee-500 hover:text-coffee-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-coffee-500 text-sm">
                  = {quantity * product.packageQty} ширхэг
                </p>
              </div>
            </div>

            {/* Price & Add to cart - Desktop only */}
            <div className="hidden md:flex items-center justify-between pt-4 border-t border-coffee-200">
              <div>
                <p className="text-coffee-500 text-sm">Нийт үнэ</p>
                <p className="text-2xl font-bold text-coffee-800">
                  {formatPrice(getSelectedPrice() * quantity)}
                </p>
              </div>
              
              <Button
                onClick={handleAddToCart}
                size="lg"
                disabled={!selectedSize || product.stock <= 0}
                className="min-w-[160px]"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Сагслах
              </Button>
            </div>

            {/* Stock status */}
            <div className="flex items-center space-x-2">
              {product.stock > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">Нөөцөд байгаа</span>
                </>
              ) : (
                <span className="text-red-500 font-medium">Дууссан</span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-coffee-200 shadow-lg p-4 z-30">
        <div className="flex items-center gap-4">
          {/* Quantity */}
          <div className="flex items-center bg-coffee-50 border border-coffee-200 rounded-xl">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-coffee-500 hover:text-coffee-700 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="px-3 text-coffee-800 font-medium min-w-[40px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-coffee-500 hover:text-coffee-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Price & Add Button */}
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-coffee-500 text-xs">Нийт үнэ</p>
              <p className="text-lg font-bold text-coffee-800">
                {formatPrice(getSelectedPrice() * quantity)}
              </p>
            </div>
            
            <Button
              onClick={handleAddToCart}
              disabled={!selectedSize || product.stock <= 0}
              className="px-6"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Сагслах
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
