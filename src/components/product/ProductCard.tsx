'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { ProductBadge, Button } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'large';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();

  // Get lowest price from sizes
  const lowestPrice = product.sizes.length > 0
    ? Math.min(...product.sizes.map(s => s.price))
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.sizes.length > 0) {
      const defaultSize = product.sizes[0];
      addItem({
        productId: product.id,
        name: product.name,
        size: defaultSize.size,
        price: defaultSize.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        packageQty: product.packageQty,
      });
      toast.success(`${product.name} сагсанд нэмэгдлээ`);
      openCart();
    }
  };

  // Large variant for mobile featured products - horizontal card layout
  if (variant === 'large') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href={`/product/${product.id}`}>
          <div className="group relative bg-white rounded-2xl overflow-hidden border border-coffee-200 shadow-md">
            {/* Horizontal Layout */}
            <div className="flex">
              {/* Image - Left Side */}
              <div className="relative w-2/5 aspect-square overflow-hidden bg-coffee-100 flex-shrink-0">
                <Image
                  src={product.imageUrl || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="40vw"
                />
                <ProductBadge badge={product.badge || ''} />
              </div>

              {/* Info - Right Side */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-coffee-800 font-semibold text-base line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-coffee-500 text-sm mb-1">
                    {product.packageQty}ш/багц
                  </p>
                  <p className="text-coffee-600 font-bold text-lg">
                    {formatPrice(lowestPrice)}
                    {product.sizes.length > 1 && (
                      <span className="text-sm text-coffee-400 font-normal ml-1">-с</span>
                    )}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  {product.stock > 0 ? (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      Бэлэн байгаа
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                      Дууссан
                    </span>
                  )}
                  <Button
                    onClick={handleAddToCart}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Сагслах
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/product/${product.id}`}>
        <div className="group relative bg-white rounded-2xl overflow-hidden border border-coffee-200 hover:border-coffee-500 transition-all duration-300 shadow-sm hover:shadow-lg">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-coffee-100">
            <Image
              src={product.imageUrl || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
            <ProductBadge badge={product.badge || ''} />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-coffee-700/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1"
                  size="sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Сагслах
                </Button>
                <Button variant="outline" size="icon" className="shrink-0 border-white text-white hover:bg-white hover:text-coffee-600">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="text-coffee-800 font-medium text-sm line-clamp-2 mb-2 min-h-[40px]">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-coffee-500 text-xs mb-1">
                  {product.packageQty}ш/багц
                </p>
                <p className="text-coffee-600 font-bold">
                  {formatPrice(lowestPrice)}
                  {product.sizes.length > 1 && (
                    <span className="text-xs text-coffee-400 font-normal ml-1">-с</span>
                  )}
                </p>
              </div>
              
              {product.stock > 0 ? (
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                  Бэлэн
                </span>
              ) : (
                <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                  Дууссан
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
