import { MapPin, X, ArrowUpRight, Navigation, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface MapContainerProps {
  onClose: () => void;
}

export const MapContainer = ({ onClose }: MapContainerProps) => {
  return (
    <div className="fixed inset-0 bg-stone-50 z-[100] flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-stone-900 leading-none">NeuroMap</h2>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Cari Bank Sampah</p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-white rounded-2xl text-stone-400 shadow-sm border border-stone-100 active:scale-95 transition-transform"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-40 h-40 bg-emerald-100 rounded-[56px] flex items-center justify-center text-emerald-600 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent" />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <MapPin size={80} />
            </motion.div>
          </motion.div>

          {/* Decorative Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-emerald-100 rounded-full animate-ping opacity-50" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-stone-100 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl font-display font-bold text-stone-900 mb-3">Temukan Bank Sampah</h3>
          <p className="text-sm text-stone-500 mb-10 max-w-[300px] leading-relaxed mx-auto">
            Gunakan kekuatan Google Maps untuk mencari lokasi setor sampah terdekat dan tukarkan sampahmu menjadi <b>NeuroPoints</b>.
          </p>

          <div className="w-full space-y-4 px-4">
            <button
              onClick={() => window.open('https://www.google.com/maps/search/bank+sampah+terdekat/', '_blank')}
              className="w-full py-5 bg-stone-900 text-white rounded-3xl font-bold text-lg shadow-xl shadow-stone-200 flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <Navigation size={22} className="text-emerald-400" />
              Buka di Google Maps
              <ArrowUpRight size={18} className="opacity-50" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-4 text-stone-400 font-bold text-sm uppercase tracking-widest hover:text-stone-600 transition-colors"
            >
              Batal & Kembali
            </button>

            <p className="text-[9px] font-black text-stone-300 uppercase tracking-[0.3em]">
              Sistem akan mencari di area sekitarmu
            </p>
          </div>
        </motion.div>
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-[36px] border border-stone-100 shadow-sm mt-12 mb-4"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
            <Trash2 size={22} />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-bold text-stone-800 text-sm mb-1">Tips Sektor Berhasil</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Selalu bersihkan wadah plastik atau kaca sebelum dikirim ke bank sampah untuk memastikan proses daur ulang berjalan lancar.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
