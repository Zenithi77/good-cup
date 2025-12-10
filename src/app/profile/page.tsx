'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Package, LogOut, MapPin, Phone, Mail, Edit, Save, X } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { Button, Input, Select } from '@/components/ui';
import { UB_DISTRICTS } from '@/lib/constants';
import toast from 'react-hot-toast';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  district: string;
  address: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuthStore();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    district: '',
    address: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.id));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          name: data.name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          district: data.district || '',
          address: data.address || '',
        });
      } else {
        setProfile(prev => ({
          ...prev,
          email: user.email || '',
        }));
      }
      setLoadingProfile(false);
    } catch {
      console.error('Error fetching profile');
      setLoadingProfile(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleSave = async () => {
    if (!profile.name.trim()) {
      toast.error('Нэр оруулна уу');
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user!.id), {
        name: profile.name,
        phone: profile.phone,
        district: profile.district,
        address: profile.address,
        updatedAt: new Date(),
      });
      
      setEditing(false);
      toast.success('Мэдээлэл хадгалагдлаа');
    } catch {
      toast.error('Алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      toast.success('Амжилттай гарлаа');
    } catch {
      toast.error('Алдаа гарлаа');
    }
  };

  if (loading || loadingProfile || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-coffee-100">
            Миний профайл
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-coffee-900 rounded-xl border border-coffee-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-coffee-800 to-coffee-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-coffee-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-coffee-100">
                  {profile.name?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">
                  {profile.name || 'Хэрэглэгч'}
                </h2>
                <p className="text-coffee-300">{profile.email}</p>
              </div>
              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Засах
                </Button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {editing ? (
              <div className="space-y-4">
                <Input
                  label="Нэр"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Таны нэр"
                />
                <Input
                  label="И-мэйл"
                  value={profile.email}
                  disabled
                  className="bg-coffee-800"
                />
                <Input
                  label="Утасны дугаар"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="99001122"
                />
                <Select
                  label="Дүүрэг"
                  value={profile.district}
                  onChange={(e) => setProfile(prev => ({ ...prev, district: e.target.value }))}
                  options={[
                    { value: '', label: 'Дүүрэг сонгох' },
                    ...UB_DISTRICTS.map((d: string) => ({ value: d, label: d }))
                  ]}
                />
                <Input
                  label="Дэлгэрэнгүй хаяг"
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Хороо, байр, тоот"
                />
                
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Хадгалах
                  </Button>
                  <Button
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Болих
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-coffee-800 rounded-lg">
                  <User className="w-5 h-5 text-coffee-400" />
                  <div>
                    <p className="text-coffee-400 text-sm">Нэр</p>
                    <p className="text-coffee-100">{profile.name || '-'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-coffee-800 rounded-lg">
                  <Mail className="w-5 h-5 text-coffee-400" />
                  <div>
                    <p className="text-coffee-400 text-sm">И-мэйл</p>
                    <p className="text-coffee-100">{profile.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-coffee-800 rounded-lg">
                  <Phone className="w-5 h-5 text-coffee-400" />
                  <div>
                    <p className="text-coffee-400 text-sm">Утас</p>
                    <p className="text-coffee-100">{profile.phone || '-'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-coffee-800 rounded-lg">
                  <MapPin className="w-5 h-5 text-coffee-400" />
                  <div>
                    <p className="text-coffee-400 text-sm">Хаяг</p>
                    <p className="text-coffee-100">
                      {profile.district && profile.address
                        ? `${profile.district}, ${profile.address}`
                        : profile.district || profile.address || '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => router.push('/orders')}
            className="w-full flex items-center gap-3 p-4 bg-coffee-900 border border-coffee-800 rounded-xl hover:bg-coffee-800 transition-colors"
          >
            <Package className="w-5 h-5 text-coffee-400" />
            <span className="text-coffee-100 flex-1 text-left">Миний захиалгууд</span>
            <span className="text-coffee-500">→</span>
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-4 bg-coffee-900 border border-red-900/50 rounded-xl hover:bg-red-900/20 transition-colors text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left">Гарах</span>
          </button>
        </div>
      </div>
    </div>
  );
}
