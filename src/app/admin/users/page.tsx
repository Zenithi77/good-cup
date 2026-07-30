'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserCog, Loader2 } from 'lucide-react';
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { Input, Badge, Modal, Select } from '@/components/ui';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAdmin, isEmployee, loading, user: currentUser } = useAuthStore();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'guest' | 'employee'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (isEmployee) {
      router.push('/admin/orders');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, isEmployee, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as User[];
      
      setUsers(usersList);
      setLoadingUsers(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoadingUsers(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'user' | 'employee' | 'admin') => {
    if (userId === currentUser?.id) {
      toast.error('Өөрийн эрхийг өөрчлөх боломжгүй');
      return;
    }

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date(),
      });

      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ));

      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
      }

      const roleLabel = newRole === 'admin' ? 'Админ' : newRole === 'employee' ? 'Ажилтан' : 'Хэрэглэгч';
      toast.success(`Эрхийг "${roleLabel}" болгож өөрчиллөө`);
    } catch {
      toast.error('Алдаа гарлаа');
    } finally {
      setUpdating(false);
    }
  };

  const viewUser = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const guestCount = users.filter(u => u.role === 'guest').length;
  const registeredCount = users.filter(u => u.role === 'user').length;
  const employeeCount = users.filter(u => u.role === 'employee').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

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
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-coffee-100">
            Хэрэглэгч удирдах
          </h1>
          <p className="text-coffee-400">
            Нийт {users.length} хэрэглэгч &middot; {registeredCount} бүртгэлтэй &middot; {guestCount} зочин &middot; {employeeCount} ажилтан &middot; {adminCount} админ
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-500" />
            <Input
              placeholder="Хэрэглэгч хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="sm:w-56">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              options={[
                { value: 'all', label: 'Бүх төрөл' },
                { value: 'user', label: 'Бүртгэлтэй' },
                { value: 'guest', label: 'Зочин' },
                { value: 'employee', label: 'Ажилтан' },
                { value: 'admin', label: 'Админ' },
              ]}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-coffee-900 rounded-xl border border-coffee-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-coffee-800">
                <tr>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Хэрэглэгч</th>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">И-мэйл</th>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Утас</th>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Эрх</th>
                  <th className="px-4 py-3 text-left text-coffee-300 text-sm font-medium">Бүртгүүлсэн</th>
                  <th className="px-4 py-3 text-right text-coffee-300 text-sm font-medium">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-800">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-coffee-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-coffee-400">
                      Хэрэглэгч олдсонгүй
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-coffee-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-coffee-100 font-medium">{user.name || 'Нэргүй'}</p>
                      </td>
                      <td className="px-4 py-3 text-coffee-300">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-coffee-300">
                        {user.phone || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            user.role === 'admin'
                              ? 'success'
                              : user.role === 'employee'
                              ? 'info'
                              : user.role === 'guest'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {user.role === 'admin'
                            ? 'Админ'
                            : user.role === 'employee'
                            ? 'Ажилтан'
                            : user.role === 'guest'
                            ? 'Зочин'
                            : 'Хэрэглэгч'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-coffee-400 text-sm">
                        {user.createdAt?.toLocaleDateString('mn-MN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => viewUser(user)}
                            className="p-2 text-coffee-400 hover:text-coffee-100 hover:bg-coffee-700 rounded-lg transition-colors"
                            title="Дэлгэрэнгүй"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                          {user.id !== currentUser?.id && (
                            <div className="w-32">
                              <Select
                                value={user.role === 'guest' ? 'user' : user.role}
                                onChange={(e) => handleChangeRole(user.id, e.target.value as 'user' | 'employee' | 'admin')}
                                disabled={updating}
                                options={[
                                  { value: 'user', label: 'Хэрэглэгч' },
                                  { value: 'employee', label: 'Ажилтан' },
                                  { value: 'admin', label: 'Админ' },
                                ]}
                              />
                            </div>
                          )}
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

      {/* User Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Хэрэглэгчийн мэдээлэл"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-coffee-800 rounded-xl p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-coffee-700 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-coffee-100">
                    {selectedUser.name?.charAt(0).toUpperCase() || selectedUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-coffee-100 font-bold text-lg">
                    {selectedUser.name || 'Нэргүй'}
                  </h3>
                  <Badge
                    variant={
                      selectedUser.role === 'admin'
                        ? 'success'
                        : selectedUser.role === 'employee'
                        ? 'info'
                        : selectedUser.role === 'guest'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {selectedUser.role === 'admin'
                      ? 'Админ'
                      : selectedUser.role === 'employee'
                      ? 'Ажилтан'
                      : selectedUser.role === 'guest'
                      ? 'Зочин'
                      : 'Хэрэглэгч'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-coffee-400 w-24">И-мэйл:</span>
                  <span className="text-coffee-100">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-coffee-400 w-24">Утас:</span>
                  <span className="text-coffee-100">{selectedUser.phone || '-'}</span>
                </div>
                {selectedUser.address && (
                  <div className="flex items-center gap-2">
                    <span className="text-coffee-400 w-24">Хаяг:</span>
                    <span className="text-coffee-100">{selectedUser.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-coffee-400 w-24">Бүртгүүлсэн:</span>
                  <span className="text-coffee-100">
                    {selectedUser.createdAt?.toLocaleDateString('mn-MN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Select */}
            {selectedUser.id !== currentUser?.id && (
              <div className="flex justify-end">
                <div className="w-40">
                  <Select
                    value={selectedUser.role === 'guest' ? 'user' : selectedUser.role}
                    onChange={(e) => handleChangeRole(selectedUser.id, e.target.value as 'user' | 'employee' | 'admin')}
                    disabled={updating}
                    options={[
                      { value: 'user', label: 'Хэрэглэгч' },
                      { value: 'employee', label: 'Ажилтан' },
                      { value: 'admin', label: 'Админ' },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
