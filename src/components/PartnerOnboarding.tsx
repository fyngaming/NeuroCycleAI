import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const PartnerOnboarding = ({ uid, onClose }: { uid?: string; onClose: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [password, setPassword] = useState('');
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // States for checking existing registration status
  const [existingPartner, setExistingPartner] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isReapplying, setIsReapplying] = useState(false);

  useEffect(() => {
    if (!uid) {
      setLoadingStatus(false);
      return;
    }
    const q = query(collection(db, 'partners'), where('ownerUid', '==', uid));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setExistingPartner({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setExistingPartner(null);
      }
      setLoadingStatus(false);
    });
    return () => unsub();
  }, [uid]);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const snap = await getDocs(collection(db, 'institutions'));
        setInstitutions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Gagal memuat institusi:', e);
      }
    };
    fetchInstitutions();
  }, []);

  const submit = async () => {
    setErrorMsg('');
    if (!name || !email || !phone || !address) {
      alert('Mohon lengkapi semua field utama (Nama, Email, Telepon, Alamat)');
      return;
    }
    if (!institutionId) {
      alert('Mohon pilih institusi');
      return;
    }
    if (!password) {
      alert('Mohon buat password untuk akun partner');
      return;
    }

    setSubmitting(true);
    try {
      const partnerCol = collection(db, 'partners');
      const partnerDocRef = existingPartner && isReapplying 
        ? doc(db, 'partners', existingPartner.id) 
        : doc(partnerCol);
      const partnerId = partnerDocRef.id;
      
      const partnerData: any = {
        name,
        email,
        phone,
        address,
        notes,
        ownerUid: uid || partnerId,
        institutionId,
        status: 'pending',
        password,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(partnerDocRef, partnerData, { merge: true });
      
      alert('✅ Permohonan pendaftaran partner berhasil dikirim! Silakan tunggu verifikasi admin.');
      setIsReapplying(false);
      onClose();
    } catch (e: any) {
      console.error('Error during partner registration:', e);
      alert('Gagal mendaftar: ' + (e.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-60 p-6">
        <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl">
          <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
          <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Memeriksa Status Kemitraan...</p>
        </div>
      </div>
    );
  }

  // If already registered and not in re-apply mode
  if (existingPartner && !isReapplying) {
    const isPending = existingPartner.status === 'pending';
    const isApproved = existingPartner.status === 'approved';
    const isRejected = existingPartner.status === 'rejected';

    return (
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-60 p-6 animate-fade-in">
        <div className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-emerald-500 to-teal-500" />
          
          <div className="text-center py-6">
            {isPending && (
              <div className="w-20 h-20 bg-amber-50 rounded-[28px] flex items-center justify-center text-amber-500 mx-auto mb-6 border border-amber-100">
                <Loader2 className="animate-spin" size={36} />
              </div>
            )}
            {isApproved && (
              <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center text-emerald-500 mx-auto mb-6 border border-emerald-100">
                <CheckCircle size={36} />
              </div>
            )}
            {isRejected && (
              <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-100">
                <XCircle size={36} />
              </div>
            )}

            <h3 className="font-display font-bold text-2xl text-stone-800 mb-2">Status Kemitraan</h3>
            <p className="text-stone-400 text-sm mb-6">Pendaftaran Bank Sampah / TPA Partner</p>

            <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 text-left mb-6 space-y-4">
              <div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Nama Mitra</p>
                  <p className="text-sm font-bold text-stone-800">{existingPartner.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Status Pengajuan</p>
                <span className={`inline-block px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mt-1.5 ${
                  isPending ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {existingPartner.status.toUpperCase()}
                </span>
              </div>
              {isRejected && existingPartner.rejectionReason && (
                <div>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                    <AlertCircle size={10} /> Alasan Penolakan
                  </p>
                  <p className="text-xs font-semibold text-red-700 mt-1 bg-red-50/50 p-2.5 rounded-xl border border-red-100/50 leading-relaxed">
                    {existingPartner.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {isRejected && (
                <button 
                  onClick={() => {
                    setName(existingPartner.name || '');
                    setEmail(existingPartner.email || '');
                    setPhone(existingPartner.phone || '');
                    setAddress(existingPartner.address || '');
                    setNotes(existingPartner.notes || '');
                    setIsReapplying(true);
                  }}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-100"
                >
                  Daftar Ulang
                </button>
              )}
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-60 p-6 animate-fade-in">
      <div className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-emerald-500 to-teal-500" />
        
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h3 className="font-display font-black text-xl text-stone-900 leading-tight">Registrasi Partner</h3>
            <p className="text-stone-400 text-xs mt-1">Daftarkan Bank Sampah / TPA Anda</p>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 rounded-xl text-stone-400 hover:text-stone-600">Close</button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1 py-2">
          {errorMsg && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">⚠️ Error Detail:</p>
              <p className="text-xs text-red-600 whitespace-pre-wrap leading-relaxed font-mono">{errorMsg}</p>
            </div>
          )}
          
          <div>
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block">Nama Bank Sampah / TPA</label>
            <input 
              placeholder="Contoh: Bank Sampah Hijau Lestari" 
              className="w-full p-4 border border-stone-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-all" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block">Email Resmi Partner</label>
            <input 
              type="email"
              placeholder="Contoh: info@banksampah.com" 
              className="w-full p-4 border border-stone-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-all" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block">No. Telepon / WhatsApp</label>
            <input 
              placeholder="Contoh: 08123456789" 
              className="w-full p-4 border border-stone-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-all" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block">Alamat Operasional TPA</label>
            <input 
              placeholder="Masukkan alamat lengkap TPA" 
              className="w-full p-4 border border-stone-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-all" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
            />
           </div>

            <div>
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block">Institusi</label>
              <select
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
                className="w-full p-4 border border-stone-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-all bg-white"
              >
                <option value="">-- Pilih Institusi --</option>
                {institutions.map((inst: any) => (
                  <option key={inst.id} value={inst.id}>{inst.name} ({inst.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block">Password Akun Partner</label>
              <input 
                type="password"
                placeholder="Buat password untuk login partner" 
                className="w-full p-4 border border-stone-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-all" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

           <div>
             <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block">Catatan Tambahan (Opsional)</label>
             <textarea 
               placeholder="Tambahkan informasi penting lainnya jika ada" 
               className="w-full p-4 border border-stone-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-all min-h-20" 
               value={notes} 
               onChange={(e) => setNotes(e.target.value)} 
            />
          </div>


        </div>

        <div className="flex gap-3 mt-6 shrink-0">
          <button 
            onClick={submit} 
            disabled={submitting} 
            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="animate-spin" size={18} /> Mengirim...</>
            ) : (
              'Kirim Permohonan'
            )}
          </button>
          <button 
            onClick={() => {
              if (isReapplying) setIsReapplying(false);
              else onClose();
            }}
            className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all active:scale-95"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerOnboarding;
