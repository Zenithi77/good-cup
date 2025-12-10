'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Coffee, Truck, Shield, Headphones } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
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

  const fetchProducts = useCallback(async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(productsList);
      setFeaturedProducts(productsList.filter(p => p.featured).slice(0, 4));
      setLoading(false);
    } catch {
      console.error('Error fetching products');
      setLoading(false);
    }
  }, []);

  const fetchBanner = useCallback(async () => {
    try {
      const settingsRef = collection(db, 'settings');
      const q = query(settingsRef, where('key', '==', 'banner_url'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setBannerUrl(snapshot.docs[0].data().value);
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
    {
      icon: Coffee,
      title: 'Чанартай бүтээгдэхүүн',
      description: 'Олон улсын стандартад нийцсэн'
    },
    {
      icon: Truck,
      title: 'Хурдан хүргэлт',
      description: 'Улаанбаатар хотод 24 цагт'
    },
    {
      icon: Shield,
      title: 'Баталгаат чанар',
      description: '100% чанарын баталгаа'
    },
    {
      icon: Headphones,
      title: 'Тусламж 24/7',
      description: 'Хэзээ ч холбогдоорой'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-coffee-700 via-coffee-700/50 to-transparent" />
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Чанартай <span className="text-coffee-200">цаасан аяга</span> бөөний үнээр
            </h1>
            <p className="text-lg md:text-xl text-coffee-100 mb-8">
              Кафе, ресторан, бизнесүүдэд зориулсан чанартай цаасан аяга, таг, соруулыг хамгийн сайн үнээр нийлүүлнэ.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="group">
                  Бүтээгдэхүүн үзэх
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#categories">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-coffee-600">
                  Ангилал үзэх
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-coffee-100 border-y border-coffee-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-coffee-500 text-white mb-3">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-coffee-800 font-medium text-sm md:text-base mb-1">
                  {feature.title}
                </h3>
                <p className="text-coffee-600 text-xs md:text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-coffee-800 mb-4">
              Ангилалууд
            </h2>
            <p className="text-coffee-600 max-w-2xl mx-auto">
              Та хүссэн ангиллаасаа бүтээгдэхүүн сонгоорой
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/products?category=${category.id}`}
                  className="block group"
                >
                  <div className="bg-coffee-50 rounded-2xl p-6 text-center border border-coffee-200 hover:border-coffee-500 hover:bg-coffee-100 transition-all duration-300 shadow-sm">
                    <span className="text-4xl mb-3 block">{category.icon}</span>
                    <h3 className="text-coffee-700 font-medium text-sm group-hover:text-coffee-500 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-coffee-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-10"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-coffee-800 mb-2">
                  Онцлох бүтээгдэхүүн
                </h2>
                <p className="text-coffee-600">
                  Хамгийн их эрэлттэй бүтээгдэхүүнүүд
                </p>
              </div>
              <Link href="/products" className="hidden md:block">
                <Button variant="outline">
                  Бүгдийг үзэх
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/products">
                <Button>
                  Бүгдийг үзэх
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* All Products with Filter */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-coffee-800 mb-6">
              Бүх бүтээгдэхүүн
            </h2>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-coffee-100 rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Coffee className="w-16 h-16 text-coffee-400 mx-auto mb-4" />
              <p className="text-coffee-600 text-lg">
                Энэ ангилалд бүтээгдэхүүн байхгүй байна
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-coffee-500 to-coffee-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Бөөний үнээр захиалга өгөх
            </h2>
            <p className="text-coffee-100 max-w-2xl mx-auto mb-8">
              200,000₮-с дээш захиалга өгвөл бөөний үнээр авах боломжтой. 
              Улаанбаатар хотод үнэгүй хүргэлт.
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-white text-coffee-600 hover:bg-coffee-50">
                Захиалга өгөх
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
