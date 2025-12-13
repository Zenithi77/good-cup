'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, Loader2, Trash2, Save, ImageIcon } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';

import { CATEGORIES } from '@/lib/constants';

interface CategoryImages {
  [key: string]: string;
}

interface SiteSettings {
  bannerImage: string;
  bannerImageMobile: string;
  bannerTitle: string;
  bannerSubtitle: string;
  categoryImages: CategoryImages;
  minimumOrderAmount: number;
  deliveryFee: number;
  freeDeliveryMinimum: number;
  contactPhone: string;
  contactEmail: string;
  facebookUrl: string;
  instagramUrl: string;
}

const defaultSettings: SiteSettings = {
  bannerImage: '',
  bannerImageMobile: '',
  bannerTitle: 'GOOD CUP',
  bannerSubtitle: 'Чанартай таг аяга, савны төрөлжсөн дэлгүүр',
  categoryImages: {},
  minimumOrderAmount: 200000,
  deliveryFee: 5000,
  freeDeliveryMinimum: 300000,
  contactPhone: '',
  contactEmail: '',
  facebookUrl: '',
  instagramUrl: '',
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const { isAdmin, loading } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
      if (settingsDoc.exists()) {
        setSettings({ ...defaultSettings, ...settingsDoc.data() as SiteSettings });
      }
      setLoadingSettings(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoadingSettings(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Зөвхөн зураг оруулна уу');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Зураг 5MB-аас бага байх ёстой');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setSettings(prev => ({ ...prev, bannerImage: data.url }));
      toast.success('Зураг амжилттай орууллаа');
    } catch {
      toast.error('Зураг оруулахад алдаа гарлаа');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeBannerImage = () => {
    setSettings(prev => ({ ...prev, bannerImage: '' }));
  };

  const handleMobileBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Зөвхөн зураг оруулна у|у');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Зураг 5MB-аас бага байх ёстой');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setSettings(prev => ({ ...prev, bannerImageMobile: data.url }));
      toast.success('Mobile banner орууллаа');
    } catch {
      toast.error('Зураг оруулахад алдаа гарлаа');
    } finally {
      setUploading(false);
    }
  };

  const removeMobileBanner = () => {
    setSettings(prev => ({ ...prev, bannerImageMobile: '' }));
  };

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, categoryId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Зөвхөн зураг оруулна уу');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Зураг 5MB-аас бага байх ёстой');
      return;
    }

    setUploadingCategory(categoryId);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setSettings(prev => ({
        ...prev,
        categoryImages: {
          ...prev.categoryImages,
          [categoryId]: data.url
        }
      }));
      toast.success('Ангилалын зураг орууллаа');
    } catch {
      toast.error('Зураг оруулахад алдаа гарлаа');
    } finally {
      setUploadingCategory(null);
    }
  };

  const removeCategoryImage = (categoryId: string) => {
    setSettings(prev => {
      const newCategoryImages = { ...prev.categoryImages };
      delete newCategoryImages[categoryId];
      return { ...prev, categoryImages: newCategoryImages };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), {
        ...settings,
        updatedAt: new Date(),
      });
      toast.success('Тохиргоо хадгалагдлаа');
    } catch {
      toast.error('Хадгалахад алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-500"></div>
      </div>
    );
  }

  if (loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-coffee-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-coffee-100">
            Тохиргоо
          </h1>
          <p className="text-coffee-400">
            Сайтын үндсэн тохиргоо
          </p>
        </div>

        <div className="space-y-8">
          {/* Banner Settings */}
          <div className="bg-coffee-900 rounded-xl border border-coffee-800 p-6">
            <h2 className="text-lg font-semibold text-coffee-100 mb-4">Banner зурагнууд</h2>
            <p className="text-coffee-400 text-sm mb-6">Desktop болон Mobile-д тус тусад нь banner оруулна</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Desktop Banner */}
              <div>
                <h3 className="text-sm font-medium text-coffee-200 mb-3 flex items-center gap-2">
                  🖥️ Desktop Banner
                  <span className="text-coffee-500 text-xs font-normal">(1200 x 500 px)</span>
                </h3>
                {settings.bannerImage ? (
                  <div className="relative aspect-[12/5] rounded-xl overflow-hidden bg-coffee-800">
                    <Image
                      src={settings.bannerImage}
                      alt="Desktop Banner"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={removeBannerImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[12/5] rounded-xl border-2 border-dashed border-coffee-700 hover:border-coffee-500 transition-colors cursor-pointer flex flex-col items-center justify-center bg-coffee-800/50"
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-coffee-500" />
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-coffee-500 mb-2" />
                        <p className="text-coffee-400 text-sm">Desktop banner</p>
                        <p className="text-coffee-500 text-xs">1200 x 500 px</p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {settings.bannerImage && (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    disabled={uploading}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Солих
                  </Button>
                )}
              </div>

              {/* Mobile Banner */}
              <div>
                <h3 className="text-sm font-medium text-coffee-200 mb-3 flex items-center gap-2">
                  📱 Mobile Banner
                  <span className="text-coffee-500 text-xs font-normal">(600 x 400 px)</span>
                </h3>
                {settings.bannerImageMobile ? (
                  <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-coffee-800">
                    <Image
                      src={settings.bannerImageMobile}
                      alt="Mobile Banner"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={removeMobileBanner}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => mobileFileInputRef.current?.click()}
                    className="aspect-[3/2] rounded-xl border-2 border-dashed border-coffee-700 hover:border-coffee-500 transition-colors cursor-pointer flex flex-col items-center justify-center bg-coffee-800/50"
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-coffee-500" />
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-coffee-500 mb-2" />
                        <p className="text-coffee-400 text-sm">Mobile banner</p>
                        <p className="text-coffee-500 text-xs">600 x 400 px</p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={mobileFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleMobileBannerUpload}
                  className="hidden"
                />
                {settings.bannerImageMobile && (
                  <Button
                    onClick={() => mobileFileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    disabled={uploading}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Солих
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <Input
                label="Banner гарчиг"
                value={settings.bannerTitle}
                onChange={(e) => setSettings(prev => ({ ...prev, bannerTitle: e.target.value }))}
              />
              <Input
                label="Banner тайлбар"
                value={settings.bannerSubtitle}
                onChange={(e) => setSettings(prev => ({ ...prev, bannerSubtitle: e.target.value }))}
              />
            </div>
          </div>

          {/* Category Images Settings */}
          <div className="bg-coffee-900 rounded-xl border border-coffee-800 p-6">
            <h2 className="text-lg font-semibold text-coffee-100 mb-2">Ангилалын зурагнууд</h2>
            <p className="text-coffee-400 text-sm mb-4">
              Homepage дээр card хэлбэрээр харагдана. Зөвлөмж хэмжээ: <b>400 x 400 px</b> (1:1 харьцаа)
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="relative">
                  <p className="text-coffee-300 text-xs mb-2 truncate">{category.name}</p>
                  {settings.categoryImages?.[category.id] ? (
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-coffee-800 group">
                      <Image
                        src={settings.categoryImages[category.id]}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                      {/* Dark overlay preview */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-medium text-xs text-center px-2">{category.name}</span>
                      </div>
                      <button
                        onClick={() => removeCategoryImage(category.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-coffee-700 hover:border-coffee-500 transition-colors cursor-pointer flex flex-col items-center justify-center bg-coffee-800/50">
                      {uploadingCategory === category.id ? (
                        <Loader2 className="w-6 h-6 animate-spin text-coffee-500" />
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-coffee-500 mb-1" />
                          <span className="text-coffee-500 text-xs">Зураг+</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCategoryImageUpload(e, category.id)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Settings */}
          <div className="bg-coffee-900 rounded-xl border border-coffee-800 p-6">
            <h2 className="text-lg font-semibold text-coffee-100 mb-4">Захиалгын тохиргоо</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Хамгийн бага захиалга (₮)"
                type="number"
                value={settings.minimumOrderAmount}
                onChange={(e) => setSettings(prev => ({ ...prev, minimumOrderAmount: Number(e.target.value) }))}
              />
              <Input
                label="Хүргэлтийн төлбөр (₮)"
                type="number"
                value={settings.deliveryFee}
                onChange={(e) => setSettings(prev => ({ ...prev, deliveryFee: Number(e.target.value) }))}
              />
              <Input
                label="Үнэгүй хүргэлтийн доод хэмжээ (₮)"
                type="number"
                value={settings.freeDeliveryMinimum}
                onChange={(e) => setSettings(prev => ({ ...prev, freeDeliveryMinimum: Number(e.target.value) }))}
              />
            </div>
          </div>

          {/* Contact Settings */}
          <div className="bg-coffee-900 rounded-xl border border-coffee-800 p-6">
            <h2 className="text-lg font-semibold text-coffee-100 mb-4">Холбоо барих</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Утасны дугаар"
                value={settings.contactPhone}
                onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="99001122"
              />
              <Input
                label="И-мэйл хаяг"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="info@goodcup.mn"
              />
              <Input
                label="Facebook холбоос"
                value={settings.facebookUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, facebookUrl: e.target.value }))}
                placeholder="https://facebook.com/goodcup"
              />
              <Input
                label="Instagram холбоос"
                value={settings.instagramUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                placeholder="https://instagram.com/goodcup"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Хадгалах
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
