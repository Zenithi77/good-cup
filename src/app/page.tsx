'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Coffee, Truck, Shield, Headphones } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { ProductCard, CategoryFilter } from '@/components/product';
import { CATEGORIES, CategoryId } from '@/lib/constants';
import { Button } from '@/components/ui';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [currentSlide, setCurrentSlide] = useState(0);

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
      if (siteDoc && siteDoc.data().bannerImage) {
        setBannerUrl(siteDoc.data().bannerImage);
        return;
      }
      // Fallback to old format with key-value
      const bannerDoc = settingsDoc.docs.find(doc => doc.data().key === 'banner_url');
      if (bannerDoc) {
        setBannerUrl(bannerDoc.data().value);
      }
    } catch {
      console.error('Error fetching banner');
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchBanner();
  }, [fetchProducts, fetchBanner]);

  // Auto slide for mobile
  useEffect(() => {
    if (featuredProducts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

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
      {/* Mobile: Banner + Featured Product Side by Side */}
      <section className="md:hidden">
        <div className="grid grid-cols-2 h-[50vh]">
          {/* Banner Left */}
          <div className="relative">
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                alt="Good Cup Banner"
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-coffee-400 via-coffee-500 to-coffee-600" />
            )}
          </div>
          
          {/* Featured Product Right */}
          <div className="relative bg-white">
            {featuredProducts[currentSlide] && (
              <Link href={`/product/${featuredProducts[currentSlide].id}`} className="block h-full">
                <div className="relative h-full">
                  {featuredProducts[currentSlide].imageUrl ? (
                    <Image
                      src={featuredProducts[currentSlide].imageUrl}
                      alt={featuredProducts[currentSlide].name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-coffee-100 flex items-center justify-center">
                      <Coffee className="w-12 h-12 text-coffee-300" />
                    </div>
                  )}
                  {/* Product Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white font-medium text-sm truncate">
                      {featuredProducts[currentSlide].name}
                    </p>
                    <p className="text-coffee-200 text-xs">
                      {featuredProducts[currentSlide].sizes?.[0]?.price?.toLocaleString()}₮
                    </p>
                  </div>
                </div>
              </Link>
            )}
            {/* Navigation dots */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {featuredProducts.slice(0, 4).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Text & Button below banner - Mobile */}
        <div className="bg-cream-50 py-6 px-4 text-center">
          <h1 className="text-2xl font-bold text-coffee-800 mb-2">
            Чанартай <span className="text-coffee-500">цаасан аяга</span>
          </h1>
          <p className="text-coffee-600 mb-4 text-sm">
            Кафе, ресторанд зориулсан бүтээгдэхүүн
          </p>
          <Link href="/products">
            <Button className="group">
              Бүтээгдэхүүн үзэх
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Desktop: Full Width Banner */}
      <section className="hidden md:block">
        {/* Banner - Full Width, 100% */}
        <div className="relative w-full h-[70vh] lg:h-[80vh]">
          {bannerUrl ? (
            <Image
              src={bannerUrl}
              alt="Good Cup Banner"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-coffee-400 via-coffee-500 to-coffee-600" />
          )}
        </div>
        
        {/* Text & Button below banner - Desktop */}
        <div className="bg-cream-50 py-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-coffee-800 mb-3">
              Чанартай <span className="text-coffee-500">цаасан аяга</span>
            </h1>
            <p className="text-coffee-600 mb-6 max-w-lg mx-auto">
              Кафе, ресторанд зориулсан бүтээгдэхүүн
            </p>
            <Link href="/products">
              <Button size="lg" className="group">
                Бүтээгдэхүүн үзэх
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section - Desktop Only */}
      <section className="hidden md:block py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-coffee-800 text-2xl">Онцлох бараа</h3>
            <Link href="/products" className="text-coffee-500 hover:text-coffee-600 flex items-center gap-1 font-medium">
              Бүгдийг үзэх <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
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

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
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
                  <div className="bg-coffee-50 rounded-xl p-4 text-center border border-coffee-200 hover:border-coffee-500 hover:bg-coffee-100 transition-all duration-300">
                    <span className="text-2xl md:text-3xl mb-2 block">{category.icon}</span>
                    <h3 className="text-coffee-700 font-medium text-xs md:text-sm group-hover:text-coffee-500 transition-colors">
                      {category.name}
                    </h3>
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
