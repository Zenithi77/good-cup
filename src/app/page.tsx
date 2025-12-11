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

interface BannerSettings {
  url: string;
  width: number;
  height: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<BannerSettings>({ url: '', width: 1200, height: 500 });

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
          url: data.bannerImage || '',
          width: data.bannerWidth || 1200,
          height: data.bannerHeight || 500
        });
        return;
      }
      // Fallback to old format with key-value
      const bannerDoc = settingsDoc.docs.find(doc => doc.data().key === 'banner_url');
      if (bannerDoc) {
        setBanner(prev => ({ ...prev, url: bannerDoc.data().value }));
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
      {/* Desktop: Banner + Featured Products Side by Side */}
      <section className="hidden md:block py-6 lg:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6" style={{ height: `${Math.min(banner.height, 700)}px` }}>
            {/* Banner Left */}
            <div className="relative rounded-2xl overflow-hidden bg-coffee-100">
              {banner.url ? (
                <Image
                  src={banner.url}
                  alt="Good Cup Banner"
                  fill
                  className="object-contain"
                  priority
                  sizes="50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-coffee-400 via-coffee-500 to-coffee-600" />
              )}
            </div>
            
            {/* Featured Products Right - 2x2 Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-coffee-800 text-xl lg:text-2xl">Онцлох бараа</h3>
                <Link href="/products" className="text-coffee-500 hover:text-coffee-600 flex items-center gap-1 font-medium">
                  Бүгдийг үзэх <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 h-[calc(100%-40px)]">
                {featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile: Banner Full Width */}
      <section className="md:hidden">
        <div className="w-full bg-coffee-100">
          <div 
            className="relative w-full"
            style={{ 
              aspectRatio: `${banner.width} / ${banner.height}`,
              maxHeight: '400px'
            }}
          >
            {banner.url ? (
              <Image
                src={banner.url}
                alt="Good Cup Banner"
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-coffee-400 via-coffee-500 to-coffee-600" />
            )}
          </div>
        </div>
      </section>

      {/* Mobile: Featured Products - Larger Cards */}
      <section className="md:hidden py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-coffee-800 text-lg">Онцлох бараа</h3>
            <Link href="/products" className="text-coffee-500 hover:text-coffee-600 flex items-center gap-1 text-sm font-medium">
              Бүгдийг үзэх <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Large Cards - 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Text & Button Section */}
      <section className="bg-cream-50 py-8 md:py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-coffee-800 mb-3">
            Чанартай <span className="text-coffee-500">цаасан аяга</span>
          </h1>
          <p className="text-coffee-600 mb-4 md:mb-6 max-w-lg mx-auto text-sm md:text-base">
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
