'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Coffee, Truck, Shield, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { ProductCard, CategoryFilter } from '@/components/product';
import { CATEGORIES, CategoryId } from '@/lib/constants';
import { Button } from '@/components/ui';

interface BannerSettings {
  desktop: string;
  mobile: string;
}

interface CategoryImages {
  [key: string]: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<BannerSettings>({ desktop: '', mobile: '' });
  const [categoryImages, setCategoryImages] = useState<CategoryImages>({});
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide for mobile featured products
  useEffect(() => {
    if (featuredProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 4000); // 4 seconds per slide
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  const fetchProducts = useCallback(async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(productsList);
      setFeaturedProducts(productsList.filter(p => p.featured).slice(0, 6));
      setLoading(false);
    } catch {
      console.error('Error fetching products');
      setLoading(false);
    }
  }, []);

  const fetchBanner = useCallback(async () => {
    try {
      const settingsDoc = await getDocs(collection(db, 'settings'));
      // Check for 'site' document first (admin settings format)
      const siteDoc = settingsDoc.docs.find(doc => doc.id === 'site');
      if (siteDoc) {
        const data = siteDoc.data();
        setBanner({
          desktop: data.bannerImage || '',
          mobile: data.bannerImageMobile || data.bannerImage || ''
        });
        // Set category images
        if (data.categoryImages) {
          setCategoryImages(data.categoryImages);
        }
        return;
      }
      // Fallback to old format with key-value
      const bannerDoc = settingsDoc.docs.find(doc => doc.data().key === 'banner_url');
      if (bannerDoc) {
        setBanner({ desktop: bannerDoc.data().value, mobile: bannerDoc.data().value });
      }
    } catch {
      console.error('Error fetching banner');
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchBanner();
  }, [fetchProducts, fetchBanner]);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const features = [
    { icon: Coffee, title: 'Чанартай бүтээгдэхүүн', description: 'Олон улсын стандарт' },
    { icon: Truck, title: 'Хурдан хүргэлт', description: 'УБ хотод 24 цагт' },
    { icon: Shield, title: 'Баталгаат чанар', description: '100% баталгаа' },
    { icon: Headphones, title: 'Тусламж 24/7', description: 'Хэзээ ч холбогдоорой' }
  ];

  return (
    <div className="min-h-screen">
      {/* Desktop: Full Width Hero Banner */}
      <section className="hidden md:block relative">
        {/* Full Width Banner - Larger Height */}
        <div className="relative h-[80vh] min-h-[600px] max-h-[800px] w-full overflow-hidden">
          {banner.desktop ? (
            <Image
              src={banner.desktop}
              alt="Good Cup Banner"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
              quality={90}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-coffee-600 via-coffee-700 to-coffee-800" />
          )}
          {/* Subtle bottom gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Text Content - Bottom Left */}
          <div className="absolute inset-0 flex items-end pb-16 lg:pb-20">
            <div className="container mx-auto px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl"
              >
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
                  Чанартай <span className="text-coffee-300">цаасан аяга</span>
                </h1>
                <p className="text-base lg:text-lg text-white/90 mb-5 drop-shadow-md">
                  Кафе, ресторанд зориулсан бүтээгдэхүүн. Бөөний болон жижиглэнгийн худалдаа.
                </p>
                <div className="flex gap-3">
                  <Link href="/products">
                    <Button size="lg" className="group bg-coffee-500 hover:bg-coffee-400 shadow-lg">
                      Бүтээгдэхүүн үзэх
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="#categories">
                    <Button size="lg" variant="outline" className="border-white/70 text-white hover:bg-white/20 shadow-lg">
                      Ангилал
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Featured Products - Horizontal Scroll */}
        <div className="bg-white py-8 border-b border-coffee-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-coffee-800 text-2xl">Онцлох бараа</h3>
              <Link href="/products" className="text-coffee-500 hover:text-coffee-600 flex items-center gap-1 font-medium">
                Бүгдийг үзэх <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {featuredProducts.slice(0, 6).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile: Banner Full Width - Uses Mobile Banner */}
      <section className="md:hidden">
        <div className="w-full bg-coffee-100">
          <div className="relative w-full aspect-[3/2]">
            {banner.mobile ? (
              <Image
                src={banner.mobile}
                alt="Good Cup Banner"
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-coffee-400 via-coffee-500 to-coffee-600" />
            )}
          </div>
        </div>
      </section>

      {/* Mobile: Featured Products - Auto Slide Carousel */}
      <section className="md:hidden py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-coffee-800 text-lg">Онцлох бараа</h3>
            <Link href="/products" className="text-coffee-500 hover:text-coffee-600 flex items-center gap-1 text-sm font-medium">
              Бүгдийг үзэх <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Carousel Container */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {featuredProducts[currentSlide] && (
                  <ProductCard product={featuredProducts[currentSlide]} variant="large" />
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-coffee-500 w-6' 
                      : 'bg-coffee-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Text & Button Section - Mobile Only */}
      <section className="md:hidden bg-cream-50 py-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4"
        >
          <h1 className="text-2xl font-bold text-coffee-800 mb-3">
            Чанартай <span className="text-coffee-500">цаасан аяга</span>
          </h1>
          <p className="text-coffee-600 mb-4 max-w-lg mx-auto text-sm">
            Кафе, ресторанд зориулсан бүтээгдэхүүн
          </p>
          <Link href="/products">
            <Button size="lg" className="group">
              Бүтээгдэхүүн үзэх
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-8 bg-coffee-100 border-y border-coffee-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-coffee-500 text-white mb-2">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-coffee-800 font-medium text-sm mb-1">
                  {feature.title}
                </h3>
                <p className="text-coffee-600 text-xs">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-coffee-800 mb-2">
              Ангилалууд
            </h2>
            <p className="text-coffee-600 text-sm">
              Хүссэн ангиллаасаа сонгоорой
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/products?category=${category.id}`}
                  className="block group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-coffee-100 border border-coffee-200 hover:border-coffee-500 transition-all duration-300">
                    {categoryImages[category.id] ? (
                      <>
                        <Image
                          src={categoryImages[category.id]}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                        />
                        {/* Light overlay for better text visibility */}
                        <div className="absolute inset-0 bg-white/30 group-hover:bg-white/40 transition-colors" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
                        <span className="text-4xl">{category.icon}</span>
                      </div>
                    )}
                    {/* Category name overlay - BLACK text */}
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <h3 className="text-coffee-900 font-bold text-xs sm:text-sm text-center drop-shadow-sm">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Products with Filter */}
      <section className="py-12 bg-coffee-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-coffee-800 mb-4">
              Бүх бүтээгдэхүүн
            </h2>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-coffee-100 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Coffee className="w-12 h-12 text-coffee-400 mx-auto mb-3" />
              <p className="text-coffee-600">
                Энэ ангилалд бүтээгдэхүүн байхгүй байна
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
