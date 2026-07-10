import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Coins, 
  Gift, 
  Image as ImageIcon, 
  Save, 
  X, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  category: string;
  points: number;
  imageUrl?: string;
  isActive: boolean;
}

export default function RewardManagement() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('E-Wallet');
  const [points, setPoints] = useState<number>(1000);
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Load rewards in real-time
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'rewards'),
      (snapshot) => {
        const rewardList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Reward[];
        // Sort by points ascending
        rewardList.sort((a, b) => a.points - b.points);
        setRewards(rewardList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching rewards:', err);
        setError('Gagal memuat daftar reward: ' + err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('E-Wallet');
    setPoints(1000);
    setImageUrl('');
    setIsActive(true);
  };

  const handleEdit = (reward: Reward) => {
    setEditingId(reward.id);
    setTitle(reward.title);
    setCategory(reward.category);
    setPoints(reward.points);
    setImageUrl(reward.imageUrl || '');
    setIsActive(reward.isActive);
    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Nama hadiah tidak boleh kosong!');
      return;
    }
    if (points <= 0) {
      alert('Poin yang dibutuhkan harus lebih besar dari 0!');
      return;
    }

    const rewardData = {
      title: title.trim(),
      category: category.trim(),
      points: Number(points),
      imageUrl: imageUrl.trim() || '',
      isActive: isActive
    };

    try {
      if (editingId) {
        // Update
        const docRef = doc(db, 'rewards', editingId);
        await setDoc(docRef, rewardData, { merge: true });
        alert('Reward berhasil diperbarui!');
      } else {
        // Create
        await addDoc(collection(db, 'rewards'), rewardData);
        alert('Reward baru berhasil ditambahkan!');
      }
      resetForm();
    } catch (err: any) {
      console.error('Error saving reward:', err);
      alert('Gagal menyimpan reward: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus reward "${name}"?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'rewards', id));
      alert('Reward berhasil dihapus!');
      if (editingId === id) {
        resetForm();
      }
    } catch (err: any) {
      console.error('Error deleting reward:', err);
      alert('Gagal menghapus reward: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <div className="bg-white rounded-[48px] border border-stone-100 shadow-xl p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
        
        <h3 className="text-xl font-display font-bold text-stone-900 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <Gift size={20} />
          </div>
          {editingId ? 'Edit Reward' : 'Tambah Reward Baru'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Nama Hadiah</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="cth: Saldo DANA Rp 10.000, Kaos Keren, Tanam 1 Pohon"
                className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl font-bold text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-stone-300"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Kategori Hadiah</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl font-bold text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                <option value="E-Wallet">📱 E-Wallet</option>
                <option value="Donasi">🌳 Donasi / Lingkungan</option>
                <option value="Merchandise">👕 Merchandise</option>
                <option value="Voucher">🎟️ Voucher Belanja / Hiburan</option>
                <option value="Energi">⚡ Energi / Token Listrik</option>
                <option value="Telekomunikasi">📞 Pulsa / Paket Data</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Poin yang Dibutuhkan (NeuroPoints)</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full pl-12 pr-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl font-bold text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <Coins size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">URL Gambar Logo (Opsional)</label>
              <div className="relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full pl-12 pr-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl font-bold text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-stone-300"
                />
                <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
              <p className="text-[10px] text-stone-400 mt-2">Gunakan URL gambar dari web (contoh: Unsplash, Imgur, atau link logo merchant) untuk menghindari penyimpanan berbayar Firebase Storage.</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Status Aktif</label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? 'bg-emerald-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-stone-600">{isActive ? 'Aktif (Muncul di User)' : 'Non-aktif (Disembunyikan)'}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Save size={16} />
              {editingId ? 'Simpan Perubahan' : 'Tambah Reward'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 px-6 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold text-sm hover:bg-stone-200 active:scale-95 transition-all"
              >
                <X size={16} />
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-[48px] border border-stone-100 shadow-xl p-8 sm:p-10">
        <h3 className="text-xl font-display font-bold text-stone-900 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Coins size={20} />
          </div>
          Daftar Reward Saat Ini
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 flex items-center gap-3">
            <AlertTriangle size={24} />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-16 bg-stone-50 rounded-[32px] border border-dashed border-stone-200">
            <Gift className="mx-auto text-stone-300 mb-3" size={48} />
            <p className="text-stone-500 font-bold">Belum ada reward yang ditambahkan.</p>
            <p className="text-stone-400 text-xs mt-1">Gunakan formulir di atas untuk menambahkan reward pertama.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <motion.div
                key={reward.id}
                layout
                className={`p-5 rounded-3xl border flex items-center gap-4 bg-white shadow-sm transition-all group ${
                  reward.isActive ? 'border-stone-100 hover:border-emerald-500/20' : 'border-stone-200/60 opacity-60'
                }`}
              >
                {/* Reward Image/Icon */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100 relative group-hover:scale-105 transition-transform">
                  {reward.imageUrl ? (
                    <img 
                      src={reward.imageUrl} 
                      alt={reward.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // fallback if image link is broken
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Gift size={24} className="text-emerald-500" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-stone-100 rounded-md text-stone-500">
                      {reward.category}
                    </span>
                    {!reward.isActive && (
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-red-50 text-red-500 rounded-md">
                        Non-aktif
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-stone-800 truncate">{reward.title}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Coins size={12} className="text-amber-500" />
                    <span className="text-xs font-black text-amber-600">{reward.points.toLocaleString()} NP</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(reward)}
                    className="p-3 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-600 text-stone-400 rounded-xl transition-all active:scale-90"
                    title="Edit Reward"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(reward.id, reward.title)}
                    className="p-3 bg-stone-50 hover:bg-red-50 hover:text-red-600 text-stone-400 rounded-xl transition-all active:scale-90"
                    title="Hapus Reward"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
