import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const UserQR = ({ uid, qrToken, onClose }: { uid?: string; qrToken?: string; onClose: () => void }) => {
  const [copyMsg, setCopyMsg] = useState('');
  const regenerate = async () => {
    if (!uid) return;
    const newToken = Math.random().toString(36).substr(2, 9);
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { qrToken: newToken }, { merge: true });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrToken || '');
      setCopyMsg('Disalin');
      setTimeout(() => setCopyMsg(''), 1500);
    } catch (e) {
      setCopyMsg('Gagal salin');
    }
  };

  const qrPayload = qrToken ? `user:${qrToken}` : 'no-token';
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}`;

  return (
    <div className="fixed inset-0 bg-stone-900/60 flex items-center justify-center z-60 p-6">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">QR Pengguna</h3>
          <button onClick={onClose} className="text-stone-400">Tutup</button>
        </div>
        <div className="text-center py-4">
          <div className="mb-2 text-sm text-stone-500">Tunjukkan QR ini ke petugas saat setor</div>
          <div className="mb-4">
            <img src={qrSrc} alt="QR" className="mx-auto w-40 h-40 bg-white p-2 rounded-lg" />
          </div>
          <div className="bg-stone-50 p-3 rounded-xl font-mono text-sm break-all mb-3">{qrToken || 'Belum tersedia'}</div>
          <div className="text-xs text-stone-400 mb-2">{copyMsg}</div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCopy} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl">Salin Token</button>
          <button onClick={regenerate} className="flex-1 py-3 bg-amber-500 text-white rounded-xl">Regenerate</button>
        </div>
      </div>
    </div>
  );
};

export default UserQR;
