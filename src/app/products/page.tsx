'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Coffee, Search, Loader2, ArrowLeft } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { ProductCard } from '@/components/product';
import { CATEGORIES, CategoryId } from '@/lib/constants';

interface CategoryImages {
  [key: string]: string;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category') as CategoryId | null;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoryImages, setCategoryImages] = useState<CategoryImages>({});

  const fetchProducts = useCallback(async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(productsList);
      setLoading(false);
    } catch {
      console.error('Error fetching products');
      setLoading(false);
    }
  }, []);

  const fetchCategoryImages = useCallback(async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
      if (settingsDoc.exists() && settingsDoc.data().categoryImages) {
        setCategoryImages(settingsDoc.data().categoryImages);
      }
    } catch {
      console.error('Error fetching category images');
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategoryImages();
  }, [fetchProducts, fetchCategoryImages]);

  // Get current category info
  const currentCategory = categoryParam 
    ? CATEGORIES.find(c => c.id === categoryParam) 
    : null;

  // Filter products based on category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = !categoryParam || product.category === categoryParam;
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // If no category selected, show category cards
  if (!categoryParam) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-coffee-800 mb-2">
              Бүтээгдэхүүний ангилалууд
            </h1>
            <p className="text-coffee-600 text-sm">
              Хүссэн ангиллаасаа сонгоорой
            </p>
          </motion.div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/products?category=${category.id}`}
                  className="block group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-coffee-100 border border-coffee-200 hover:border-coffee-500 hover:shadow-lg transition-all duration-300">
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
                        <span className="text-5xl">{category.icon}</span>
                      </div>
                    )}
                    {/* Category name overlay - BLACK text */}
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <h3 className="text-coffee-900 font-bold text-sm sm:text-base text-center drop-shadow-sm">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Category selected - show products with search
  return (
    <div className="min-h-screen py-8 pb-24">
      <div className="container mx-auto px-4">
        {/* Header with category name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-xl md:text-2xl font-bold text-coffee-800 mb-1">
            {currentCategory?.name || 'Бүтээгдэхүүн'}
          </h1>
          <p className="text-coffee-500 text-sm">
            {currentCategory?.description}
          </p>
        </motion.div>

        {/* Search for this category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-400" />
            <input
              placeholder={`${currentCategory?.name || 'Энэ ангилал'}-аас хайх...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-coffee-200 focus:border-coffee-500 focus:ring-0 outline-none transition-colors bg-white text-coffee-800 placeholder:text-coffee-400"
            />
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-coffee-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Coffee className="w-16 h-16 text-coffee-400 mx-auto mb-4" />
            <p className="text-coffee-600 text-lg mb-2">
              Бүтээгдэхүүн олдсонгүй
            </p>
            <p className="text-coffee-500 text-sm">
              {searchQuery ? 'Өөр хайлт оруулна уу' : 'Энэ ангилалд бүтээгдэхүүн байхгүй байна'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-coffee-600 text-sm mb-4">
              {filteredProducts.length} бүтээгдэхүүн
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Back Button - Fixed bottom left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-6 left-4 z-40"
      >
        <button
          onClick={() => router.push('/products')}
          className="flex items-center gap-2 px-4 py-3 bg-coffee-800 text-white rounded-full shadow-lg hover:bg-coffee-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Буцах</span>
        </button>
      </motion.div>
    </div>
  );
}

function ProductsLoading() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-coffee-500" />
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}
