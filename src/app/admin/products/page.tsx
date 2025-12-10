'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Plus, Pencil, Trash2, Search, Upload, X, Loader2 } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import { CATEGORIES, SIZES } from '@/lib/constants';
import { Button, Input, Select, Modal } from '@/components/ui';
import toast from 'react-hot-toast';

interface FormProduct {
  name: string;
  category: string;
  sizes: { size: string; price: string }[];
  stock: string;
  packageQty: string;
  description: string;
  imageUrl: string;
  badge: string;
  featured: boolean;
}

const emptyProduct: FormProduct = {
  name: '',
  category: 'double-wall-cup',
  sizes: [{ size: '8oz', price: '' }],
  stock: '100',
  packageQty: '50',
  description: '',
  imageUrl: '',
  badge: '',
  featured: false,
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAdmin, loading } = useAuthStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(productsList);
      setLoadingProducts(false);
    } catch {
      console.error('Error fetching products');
      setLoadingProducts(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'good-cup/products');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        toast.success('Зураг амжилттай хуулагдлаа');
      } else {
        toast.error('Зураг хуулахад алдаа гарлаа');
      }
    } catch {
      toast.error('Зураг хуулахад алдаа гарлаа');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '8oz', price: '' }]
    }));
  };

  const handleRemoveSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const handleSizeChange = (index: number, field: 'size' | 'price', value: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || formData.sizes.length === 0) {
      toast.error('Бүх талбарыг бөглөнө үү');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        sizes: formData.sizes.map(s => ({ size: s.size, price: Number(s.price) || 0 })),
        stock: Number(formData.stock) || 0,
        packageQty: Number(formData.packageQty) || 0,
        description: formData.description,
        imageUrl: formData.imageUrl,
        badge: formData.badge,
        featured: formData.featured,
        updatedAt: new Date(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Бүтээгдэхүүн шинэчлэгдлээ');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date(),
        });
        toast.success('Бүтээгдэхүүн нэмэгдлээ');
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData(emptyProduct);
      fetchProducts();
    } catch {
      toast.error('Алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      sizes: product.sizes.map(s => ({ size: s.size, price: String(s.price) })),
      stock: String(product.stock),
      packageQty: String(product.packageQty),
      description: product.description,
      imageUrl: product.imageUrl,
      badge: product.badge || '',
      featured: product.featured,
    });
    setShowModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Устгахдаа итгэлтэй байна уу?')) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      toast.success('Бүтээгдэхүүн устгагдлаа');
      fetchProducts();
    } catch {
      toast.error('Устгахад алдаа гарлаа');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setShowModal(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-coffee-100">
              Бүтээгдэхүүн удирдах
            </h1>
            <p className="text-coffee-400">
              Нийт {products.length} бүтээгдэхүүн
            </p>
          </div>
          
          <Button onClick={openAddModal}>
            <Plus className="w-5 h-5 mr-2" />
            Бүтээгдэхүүн нэмэх
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-500" />
          <Input
            placeholder="Бүтээгдэхүүн хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Table */}
        <div className="bg-coffee-900 rounded-xl border border-coffee-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-coffee-800">
                <tr>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Зураг</th>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Нэр</th>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Ангилал</th>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Үнэ</th>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Нөөц</th>
                  <th className="px-4 py-3 text-right text-coffee-300 text-sm font-medium">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-800">
                {loadingProducts ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-coffee-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-coffee-400">
                      Бүтээгдэхүүн олдсонгүй
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-coffee-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-coffee-800">
                          <Image
                            src={product.imageUrl || '/placeholder.png'}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-coffee-100 font-medium">{product.name}</p>
                        <p className="text-coffee-500 text-xs">{product.packageQty}ш/багц</p>
                      </td>
                      <td className="px-4 py-3 text-coffee-300 text-sm">
                        {CATEGORIES.find(c => c.id === product.category)?.name}
                      </td>
                      <td className="px-4 py-3 text-coffee-300 text-sm">
                        {product.sizes.length > 0 && formatPrice(product.sizes[0].price)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-coffee-400 hover:text-coffee-100 hover:bg-coffee-700 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-coffee-400 hover:text-red-400 hover:bg-coffee-700 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Бүтээгдэхүүн засах' : 'Бүтээгдэхүүн нэмэх'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-coffee-200 mb-2">Зураг</label>
            <div className="flex items-start space-x-4">
              {formData.imageUrl ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-coffee-800">
                  <Image
                    src={formData.imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-coffee-700 flex flex-col items-center justify-center cursor-pointer hover:border-coffee-500 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-coffee-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-coffee-400" />
                      <span className="text-xs text-coffee-500 mt-1">Хуулах</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Name */}
          <Input
            label="Нэр"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          {/* Category */}
          <Select
            label="Ангилал"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            options={CATEGORIES.map(c => ({ value: c.id, label: c.name }))}
          />

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium text-coffee-200 mb-2">Хэмжээ & Үнэ</label>
            <div className="space-y-2">
              {formData.sizes.map((size, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Select
                    value={size.size}
                    onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                    options={SIZES.map(s => ({ value: s, label: s }))}
                    className="w-24"
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={size.price}
                    onChange={(e) => handleSizeChange(index, 'price', e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Үнэ"
                    className="flex-1"
                  />
                  {formData.sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(index)}
                      className="p-2 text-red-400 hover:bg-coffee-700 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSize}
                className="text-sm text-coffee-400 hover:text-coffee-200"
              >
                + Хэмжээ нэмэх
              </button>
            </div>
          </div>

          {/* Stock & Package */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Нөөц"
              type="text"
              inputMode="numeric"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value.replace(/[^0-9]/g, '') }))}
            />
            <Input
              label="Багцын тоо"
              type="text"
              inputMode="numeric"
              value={formData.packageQty}
              onChange={(e) => setFormData(prev => ({ ...prev, packageQty: e.target.value.replace(/[^0-9]/g, '') }))}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-coffee-200 mb-1.5">Тайлбар</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="flex w-full rounded-lg border border-coffee-700 bg-coffee-900 px-3 py-2 text-sm text-coffee-100 placeholder:text-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          </div>

          {/* Badge & Featured */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Badge"
              value={formData.badge}
              onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
              options={[
                { value: '', label: 'Байхгүй' },
                { value: 'bestseller', label: 'Бестселлер' },
                { value: 'new', label: 'Шинэ' },
                { value: 'sale', label: 'Хямдрал' },
              ]}
            />
            <div className="flex items-center space-x-2 pt-7">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="w-4 h-4 rounded border-coffee-700 bg-coffee-900 text-coffee-500 focus:ring-coffee-500"
              />
              <label htmlFor="featured" className="text-coffee-200 text-sm">
                Онцлох бүтээгдэхүүн
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Болих
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Хадгалж байна...
                </>
              ) : (
                'Хадгалах'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
