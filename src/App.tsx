/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Leaf, 
  Trash2, 
  User, 
  Award, 
  Image as ImageIcon, 
  Loader2, 
  ArrowLeft,
  Info,
  CheckCircle2,
  AlertTriangle,
  Recycle,
  Droplets,
  Zap,
  Flame,
  Sprout,
  TrendingDown,
  ChevronRight,
  BookOpen,
  Plus,
  MapPin,
  Sparkles,
  BarChart3,
  Lightbulb,
  Instagram,
  ShoppingBag,
  Trees,
  Coins,
  Check,
  Minus,
  QrCode
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { analyzeWaste, WasteAnalysis } from './services/gemini';
import { EDUCATIONAL_ARTICLES } from './constants';
import { MapContainer } from './components/MapContainer';

// --- Types ---
type AppState = 'welcome' | 'main' | 'scanning' | 'result' | 'map' | 'education_detail' | 'about' | 'redemption' | 'user_dashboard' | 'waste_bank_list' | 'waste_bank_calculate' | 'waste_bank_verify';

interface ImpactRecord {
  date: string;
  co2: number;
  water: number;
  energy: number;
}

interface ScanHistoryItem {
  id: string;
  name: string;
  category: string;
  date: string;
  impact: {
    co2: number;
    water: number;
    energy: number;
  };
  image?: string;
}

interface UserData {
  points: number;
  scans: number;
  level: string;
  history: ImpactRecord[];
  scanHistory: ScanHistoryItem[];
  streak: number;
  lastLogin: string;
  mascotName?: string;
}

const AboutScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-stone-50 z-[150] overflow-y-auto"
    >
      <div className="p-6 max-w-md mx-auto min-h-screen flex flex-col">
        <header className="flex items-center justify-between mb-12">
          <button 
            onClick={onBack}
            className="p-3 bg-white rounded-2xl text-stone-400 shadow-sm border border-stone-100 active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Manifesto</span>
          </div>
        </header>

        <div className="flex-1">
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 bg-emerald-600 rounded-[40px] shadow-2xl shadow-emerald-200 flex items-center justify-center text-white mb-6 rotate-3">
              <Recycle size={48} />
            </div>
            <h1 className="text-4xl font-display font-black text-stone-900 tracking-tight mb-2">NeuroCycle</h1>
            <p className="text-stone-400 font-bold uppercase tracking-[0.3em] text-[10px]">Revolutionizing Waste</p>
          </div>

          <div className="space-y-8 pb-12">
            <section className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                Visi Kami
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                NeuroCycle bukan sekadar aplikasi pengukur sampah; ini adalah <b>ekosistem kesadaran</b>. Kami menggunakan kecerdasan buatan (AI) untuk mengubah cara manusia berinteraksi dengan limbah mereka, mengubah beban lingkungan menjadi peluang keberlanjutan.
              </p>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-900 p-6 rounded-[32px] text-white">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-emerald-400">
                  <Sparkles size={20} />
                </div>
                <h4 className="font-bold text-sm mb-2">Smart Analysis</h4>
                <p className="text-[10px] text-stone-400 leading-normal">AI kami mengidentifikasi jenis sampah dan dampak karbon secara instan.</p>
              </div>

              <div className="bg-emerald-600 p-6 rounded-[32px] text-white">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-white">
                  <Award size={20} />
                </div>
                <h4 className="font-bold text-sm mb-2">Gamification</h4>
                <p className="text-[10px] text-emerald-100 leading-normal">Tingkatkan level maskotmu dan jaga streak untuk bumi yang lebih hijau.</p>
              </div>
            </div>

            <section className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm">
              <h3 className="text-lg font-bold text-stone-900 mb-4">Misi NeuroCycle</h3>
              <ul className="space-y-4">
                {[
                  { icon: <CheckCircle2 className="text-emerald-500" />, text: "Edukasi pemilahan sampah cerdas" },
                  { icon: <CheckCircle2 className="text-emerald-500" />, text: "Koneksi ke infrastruktur daur ulang local" },
                  { icon: <CheckCircle2 className="text-emerald-500" />, text: "Pelacakan jejak karbon real-time" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-stone-600">
                    {item.icon}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <footer className="mt-auto py-8 text-center text-stone-400">
          <p className="text-[10px] font-bold uppercase tracking-widest">Built for the Future of our planet</p>
          <p className="text-[9px] mt-2 opacity-50">&copy; 2026 NeuroCycle Lab</p>
        </footer>
      </div>
    </motion.div>
  );
};

const RedemptionCenter = ({ points, onBack }: { points: number, onBack: () => void }) => {
  const OFFERS = [
    { title: 'Saldo DANA Rp 5.000', points: 5000, icon: <Zap size={24} className="text-blue-500 fill-blue-500" />, category: 'E-Wallet' },
    { title: 'Tanam 1 Mangrove', points: 10000, icon: <Trees size={24} className="text-emerald-500" />, category: 'Donasi' },
    { title: 'Voucher PLN Rp 20.000', points: 20000, icon: <Zap size={24} className="text-amber-500 fill-amber-500" />, category: 'Energi' },
    { title: 'Exclusive Tote Bag', points: 30000, icon: <ShoppingBag size={24} className="text-orange-500" />, category: 'Merchandise' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="fixed inset-0 bg-stone-50 z-[150] overflow-y-auto"
    >
      <div className="p-6 max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm border border-stone-100">
            <ArrowLeft size={20} className="text-stone-600" />
          </button>
          <div className="bg-emerald-600 px-6 py-2 rounded-2xl text-white font-bold flex items-center gap-2">
            <Coins size={18} />
            {points.toLocaleString()} <span className="text-[10px] opacity-70">NP</span>
          </div>
        </header>

        <h2 className="text-2xl font-display font-black text-stone-900 mb-2">Penukaran Poin</h2>
        <p className="text-sm text-stone-500 mb-8">Ubah kepedulianmu menjadi manfaat nyata.</p>

        <div className="space-y-4">
          {OFFERS.map((offer, idx) => (
            <div 
              key={idx}
              className="bg-white p-5 rounded-[32px] border border-stone-100 shadow-sm flex items-center gap-4 group"
            >
              <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {offer.icon}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">{offer.category}</p>
                <h4 className="font-bold text-stone-800">{offer.title}</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <Coins size={12} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-600">{offer.points.toLocaleString()} NeuroPoints</span>
                </div>
              </div>
              <button 
                disabled={points < offer.points}
                className={`py-2 px-4 rounded-xl font-bold text-xs shadow-sm transition-all ${
                  points >= offer.points 
                    ? 'bg-emerald-600 text-white shadow-emerald-100 active:scale-95' 
                    : 'bg-stone-100 text-stone-300 pointer-events-none'
                }`}
              >
                {points >= offer.points ? 'Tukar' : 'Kurang'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-emerald-100 rounded-[40px] text-center">
          <p className="text-xs font-bold text-emerald-800 mb-2">Coming Soon</p>
          <p className="text-stone-600 text-[10px] uppercase font-black tracking-widest">Evolusi Maskot: NeuroDragon</p>
        </div>
      </div>
    </motion.div>
  );
};



const UserDashboard = ({ userData, onPointsClick, onBack, onDeleteHistory, saveUserData }: { 
  userData: UserData, 
  onPointsClick: () => void, 
  onBack: () => void,
  onDeleteHistory: (id: string) => void,
  saveUserData: (data: UserData) => void
}) => {
  const [filterDate, setFilterDate] = useState('');

  const filteredHistory = useMemo(() => {
    if (!filterDate) return userData.scanHistory || [];
    return (userData.scanHistory || []).filter(item => item.date.includes(filterDate));
  }, [userData.scanHistory, filterDate]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="p-6 pb-40"
    >
      <header className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-display font-black text-stone-900">Dashboard Saya</h2>
        <div 
          onClick={onPointsClick}
          className="bg-amber-100 px-4 py-2 rounded-2xl text-amber-700 font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
        >
          <Coins size={18} />
          {userData.points.toLocaleString()}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-[32px] border border-stone-100 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-3">
            <Camera size={20} />
          </div>
          <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Total Scan</p>
          <h4 className="text-xl font-display font-bold text-stone-800">{userData.scans}</h4>
        </div>
        <div className="bg-white p-5 rounded-[32px] border border-stone-100 shadow-sm">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mb-3">
            <Award size={20} />
          </div>
          <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Level</p>
          <h4 className="text-md font-bold text-stone-800 truncate">{userData.level}</h4>
        </div>
      </div>

      {/* Rewards Teaser */}
      <div className="bg-stone-900 p-6 rounded-[32px] text-white mb-10 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
            <Sparkles size={24} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm">Tukarkan NeuroPoints</h4>
            <p className="text-[10px] text-stone-400">Saldo DANA, Pulsa, & Reward menarik.</p>
          </div>
          <button 
            onClick={onPointsClick}
            className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 active:scale-90 transition-transform"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* History List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-stone-800">Riwayat Pemindaian</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Filter Tanggal..." 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="text-[10px] px-3 py-2 bg-stone-100 rounded-xl border border-stone-200 outline-none w-32 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-stone-300 text-sm italic">Belum ada riwayat...</p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-white p-4 rounded-[28px] border border-stone-100 shadow-sm flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300"><Trash2 size={20} /></div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-stone-800 text-sm truncate">{item.name}</h4>
                    <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">{item.category}</p>
                    <p className="text-[9px] text-stone-400 mt-0.5">{item.date}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => onDeleteHistory(item.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingDown size={14} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const BottomNav = ({ active, onChange, onScan }: { active: AppState, onChange: (state: AppState) => void, onScan: () => void }) => {
  const tabs = [
    { id: 'main', icon: <Leaf />, label: 'Home' },
    { id: 'map', icon: <MapPin />, label: 'Lokasi' },
    { id: 'scan', icon: <Camera />, label: 'Pindai', isSpecial: true },
    { id: 'education_detail', icon: <BookOpen />, label: 'Edu' },
    { id: 'user_dashboard', icon: <User />, label: 'Profil' },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 h-20 bg-stone-900/95 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl z-[80] flex items-center justify-between px-2">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        if (tab.isSpecial) {
          return (
            <button
              key={tab.id}
              onClick={onScan}
              className="relative -top-10 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40 border-4 border-stone-900 active:scale-90 transition-transform">
                <Camera size={28} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mt-2">Pindai</span>
            </button>
          );
        }
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id as AppState)}
            className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 flex-1 ${
              isActive ? 'text-emerald-400' : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <motion.div
              animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
            >
              {React.cloneElement(tab.icon as React.ReactElement, { size: 20 })}
            </motion.div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'}`}>
              {tab.label}
            </span>
            {isActive && (
              <motion.div 
                layoutId="activeTab"
                className="absolute -bottom-1 w-1 h-1 bg-emerald-400 rounded-full"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

// --- Components ---

const Mascot = ({ streak, name, onRename }: { streak: number, name?: string, onRename: () => void }) => {
  // Define evolution stages
  const getStage = () => {
    if (streak >= 15) return { 
      icon: <Sparkles size={44} className="text-white" />, 
      aura: true, 
      face: "👑", 
      label: "Supreme Phoenix", 
      bgColor: "from-amber-400 via-orange-500 to-red-600" 
    };
    if (streak >= 7) return { 
      icon: <Flame size={40} className="text-white" />, 
      aura: true, 
      face: "🔥", 
      label: "Flame Knight", 
      bgColor: "from-orange-500 to-red-500" 
    };
    if (streak >= 3) return { 
      icon: <Zap size={36} className="text-white" />, 
      aura: false, 
      face: "✨", 
      label: "Bright Spark", 
      bgColor: "from-orange-400 to-orange-600" 
    };
    return { 
      icon: <Sprout size={32} className="text-white" />, 
      aura: false, 
      face: "🌱", 
      label: "Little Ember", 
      bgColor: "from-orange-300 to-orange-500" 
    };
  };

  const stage = getStage();

  return (
    <div className="flex flex-col items-center gap-4 group">
      <div className="relative cursor-pointer" onClick={onRename}>
        <AnimatePresence>
          {stage.aura && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.5, 1], 
                rotate: [0, 90, 180, 270, 360],
                opacity: [0.1, 0.3, 0.1] 
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className={`absolute -inset-8 bg-gradient-to-tr ${stage.bgColor} rounded-full blur-3xl`}
            />
          )}
        </AnimatePresence>
        
        <motion.div
          animate={{ 
            y: [0, -6, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10"
        >
          <div className={`w-20 h-20 rounded-[32px] bg-gradient-to-br ${stage.bgColor} shadow-2xl flex items-center justify-center border-4 border-white overflow-hidden`}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {stage.icon}
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center text-xl pt-1 pointer-events-none opacity-30">
              {stage.face}
            </div>
          </div>
        </motion.div>

        {/* Name Tag */}
        <motion.div 
          whileHover={{ scale: 1.1, y: -2 }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-stone-900 border-2 border-white px-4 py-1.5 rounded-full shadow-xl z-20 flex items-center gap-2"
        >
          <span className="text-[10px] font-black text-white tracking-widest uppercase">{name || "NeuroFlame"}</span>
          <div className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
            <Plus size={8} className="text-white" />
          </div>
        </motion.div>
      </div>
      
      <div className="text-center pt-2">
        <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] leading-none mb-1 shadow-sm">
          {stage.label}
        </p>
        <div className="flex items-center gap-1.5 justify-center bg-white px-3 py-1 rounded-full shadow-sm border border-stone-100">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-orange-600 uppercase italic tracking-tighter">
            {streak} Day Streak
          </span>
        </div>
      </div>
    </div>
  );
};

const LevelTimeline = ({ currentScans }: { currentScans: number }) => {
  const milestones = [
    { scans: 0, label: "Awalan", icon: "🌱" },
    { scans: 5, label: "Pecinta", icon: "🌿" },
    { scans: 10, label: "Pemilah", icon: "♻️" },
    { scans: 20, label: "Penjaga", icon: "🌳" },
    { scans: 50, label: "Pahlawan", icon: "🌍" },
    { scans: 100, label: "Legenda", icon: "👑" },
  ];

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100 mb-8 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
            <Award size={18} />
          </div>
          <h3 className="text-lg font-display font-bold text-stone-800">Linimasa Level</h3>
        </div>
        <div className="px-3 py-1 bg-amber-100 rounded-full text-[10px] font-bold text-amber-700">
          Total: {currentScans} Scans
        </div>
      </div>

      <div className="relative overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex gap-8 px-4 items-center min-w-[600px] py-4">
          {milestones.map((m, idx) => {
            const isReached = currentScans >= m.scans;
            const isNext = !isReached && (idx === 0 || currentScans >= milestones[idx - 1].scans);
            
            return (
              <div key={m.scans} className="flex-shrink-0 flex items-center relative">
                {idx > 0 && (
                  <div className={`absolute right-full w-8 h-1 -translate-y-1/2 top-1/2 ${isReached ? 'bg-emerald-400' : 'bg-stone-100'}`} />
                )}
                
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 ${
                    isReached ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 
                    isNext ? 'bg-white border-2 border-dashed border-emerald-400 text-stone-300' :
                    'bg-stone-50 text-stone-300'
                  }`}>
                    {isReached ? m.icon : "?"}
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isReached ? 'text-stone-800' : 'text-stone-300'}`}>
                      {m.label}
                    </p>
                    <p className="text-[9px] font-medium text-stone-400">
                      {m.scans} Scans
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const WelcomeScreen = ({ onStart }: { onStart: () => void }) => {
  const [slide, setSlide] = useState(0);
  
  const slides = [
    {
      icon: <Leaf size={100} />,
      title: "Selamat Datang di NeuroCycle",
      desc: "Langkah kecilmu hari ini adalah nafas baru bagi Bumi kita di masa depan.",
      color: "bg-emerald-600"
    },
    {
      icon: <Camera size={100} />,
      title: "AI Pemindai Cerdas",
      desc: "Cukup ambil foto, dan biarkan AI kami mengidentifikasi jenis serta komposisi sampahmu secara akurat.",
      color: "bg-blue-600"
    },
    {
      icon: <Award size={100} />,
      title: "Kumpulkan NeuroPoints",
      desc: "Dapatkan poin setiap kali kamu memilah sampah dengan benar dan tukarkan dengan hadiah menarik.",
      color: "bg-amber-600"
    }
  ];

  return (
    <motion.div 
      key={slide}
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className={`fixed inset-0 ${slides[slide].color} flex flex-col items-center justify-center text-white px-8 text-center z-50 transition-colors duration-700`}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12 }}
        className="mb-12 p-8 bg-white/10 rounded-[40px] backdrop-blur-xl border border-white/20 shadow-2xl"
      >
        {slides[slide].icon}
      </motion.div>
      
      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-display font-bold mb-4 tracking-tight leading-tight"
      >
        {slides[slide].title}
      </motion.h2>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-white/80 text-lg mb-16 max-w-xs leading-relaxed"
      >
        {slides[slide].desc}
      </motion.p>
      
      <div className="flex gap-2 mb-12">
        {slides.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} />
        ))}
      </div>

      <div className="flex gap-4 w-full max-w-xs">
        {slide < slides.length - 1 ? (
          <button
            onClick={() => setSlide(slide + 1)}
            className="flex-1 py-4 bg-white text-stone-900 rounded-2xl font-bold text-lg shadow-xl"
          >
            Lanjut
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex-1 py-4 bg-white text-emerald-700 rounded-2xl font-bold text-lg shadow-xl shadow-black/10"
          >
            Mulai Sekarang
          </button>
        )}
      </div>
    </motion.div>
  );
};

// FAB component removed and integrated into BottomNav

// --- Waste Bank Data & Components ---

interface WasteCategory {
  id: string;
  name: string;
  pointsPerKg: number;
  image: string;
}

const WASTE_CATEGORIES: WasteCategory[] = [
  { id: 'plastik', name: 'Plastik', pointsPerKg: 1000, image: '/dataset/Plastik/plastik_1.jpg' },
  { id: 'kertas', name: 'Kertas', pointsPerKg: 800, image: '/dataset/Kertas/R_2848.jpg' },
  { id: 'logam', name: 'Logam', pointsPerKg: 1500, image: '/dataset/Logam/R_1623.jpg' },
  { id: 'kaca', name: 'Kaca', pointsPerKg: 1200, image: '/dataset/Kaca/R_3850.jpg' },
  { id: 'kardus', name: 'Kardus', pointsPerKg: 900, image: '/dataset/Kardus/R_2152.jpg' },
  { id: 'residu', name: 'Residu', pointsPerKg: 500, image: '/dataset/Residu/residu_1.jpg' },
];

const WasteBankList = ({ 
  onNext, 
  onBack,
  selectedItems,
  onToggleItem,
  onUpdateWeight
}: { 
  onNext: () => void; 
  onBack: () => void;
  selectedItems: Record<string, number>;
  onToggleItem: (id: string) => void;
  onUpdateWeight: (id: string, weight: number) => void;
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 p-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-3 bg-white rounded-2xl text-stone-400 shadow-sm border border-stone-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold font-display text-emerald-900">Bank Sampah</h1>
      </header>

      <div className="flex-1 space-y-4 mb-24 overflow-y-auto">
        <p className="text-stone-500 mb-6 font-medium">Pilih jenis sampah yang ingin Anda setor:</p>
        
        <div className="grid grid-cols-1 gap-4">
          {WASTE_CATEGORIES.map((category) => {
            const isSelected = selectedItems[category.id] !== undefined;
            return (
              <motion.div
                key={category.id}
                whileTap={{ scale: 0.98 }}
                className={`relative p-5 rounded-[32px] border-2 transition-all ${
                  isSelected ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-white border-stone-100 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-[24px] overflow-hidden bg-stone-100 border border-stone-100">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${category.name}&background=random`;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-stone-800">{category.name}</h3>
                    <p className="text-sm text-stone-400 font-bold uppercase tracking-widest">{category.pointsPerKg} Poin/kg</p>
                  </div>
                  <button 
                    onClick={() => onToggleItem(category.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-stone-50 text-stone-300'}`}
                  >
                    <Check size={20} />
                  </button>
                </div>

                {isSelected && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-5 pt-5 border-t border-emerald-100"
                  >
                    <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-emerald-100">
                      <span className="text-sm font-bold text-stone-500 uppercase tracking-widest">Berat (kg):</span>
                      <div className="flex items-center gap-5">
                        <button 
                          onClick={() => onUpdateWeight(category.id, Math.max(0.1, (selectedItems[category.id] || 0) - 0.5))}
                          className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="text-xl font-display font-bold w-12 text-center text-emerald-700">
                          {(selectedItems[category.id] || 0).toFixed(1)}
                        </span>
                        <button 
                          onClick={() => onUpdateWeight(category.id, (selectedItems[category.id] || 0) + 0.5)}
                          className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 text-right">
                      <span className="text-emerald-600 font-display font-bold text-lg">
                        Est. {( (selectedItems[category.id] || 0) * category.pointsPerKg ).toLocaleString()} Poin
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-stone-100 flex gap-4 z-50 max-w-md mx-auto">
        <button 
          onClick={onBack}
          className="flex-1 py-4 px-6 rounded-2xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors"
        >
          Batal
        </button>
        <button 
          onClick={onNext}
          disabled={Object.keys(selectedItems).length === 0}
          className="flex-[2] py-4 px-6 rounded-2xl bg-emerald-600 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          Lanjut Hitung Poin
        </button>
      </div>
    </div>
  );
};

const WasteBankCalculate = ({
  selectedItems,
  onNext,
  onCancel
}: {
  selectedItems: Record<string, number>;
  onNext: () => void;
  onCancel: () => void;
}) => {
  const totalPoints = WASTE_CATEGORIES.reduce((acc, cat) => {
    const weight = selectedItems[cat.id] || 0;
    return acc + (weight * cat.pointsPerKg);
  }, 0);

  const totalWeight = Object.values(selectedItems).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 p-6">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-display font-bold text-emerald-900 mb-2">Ringkasan Setoran</h1>
        <p className="text-stone-400 font-medium">Estimasi poin yang akan didapatkan</p>
      </header>

      <div className="flex-1 space-y-8 max-w-md mx-auto w-full">
        <div className="bg-emerald-600 rounded-[40px] p-8 text-center text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <p className="text-emerald-100 text-xs uppercase tracking-widest font-bold mb-3 opacity-80">Total Estimasi NeuroPoints</p>
          <div className="flex items-center justify-center gap-4">
            <Award className="text-white" size={40} />
            <span className="text-6xl font-display font-bold">{totalPoints.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest px-2">Rincian Per Kategori</h3>
          <div className="space-y-3">
            {WASTE_CATEGORIES.filter(cat => selectedItems[cat.id]).map(cat => (
              <div key={cat.id} className="bg-white border border-stone-100 rounded-[28px] p-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-stone-50 overflow-hidden border border-stone-100">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800">{cat.name}</p>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{selectedItems[cat.id]} kg × {cat.pointsPerKg}</p>
                  </div>
                </div>
                <div className="text-right pr-2">
                  <p className="font-display font-bold text-emerald-600 text-lg">{(selectedItems[cat.id] * cat.pointsPerKg).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t border-stone-200 flex justify-between items-center px-4">
            <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Total Berat</span>
            <span className="text-2xl font-display font-bold text-stone-800">{totalWeight.toFixed(1)} kg</span>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 border border-stone-100 shadow-sm flex gap-5 items-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
            <MapPin size={24} />
          </div>
          <div>
            <p className="font-bold text-stone-800">Unit 01 (Pusat)</p>
            <p className="text-xs text-stone-400 font-medium">Bank Sampah Neuro - Lokasi Terdekat</p>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-4 max-w-md mx-auto w-full">
        <button 
          onClick={onNext}
          className="w-full py-5 rounded-[28px] bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
        >
          Lanjutkan ke Navigasi
        </button>
        <button 
          onClick={onCancel}
          className="w-full py-4 rounded-[24px] bg-stone-100 text-stone-500 font-bold hover:bg-stone-200 transition-all"
        >
          Ubah Pilihan
        </button>
      </div>
    </div>
  );
};

const WasteBankVerify = ({
  onSuccess,
  onCancel
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      onSuccess();
    }, 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 p-6">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-display font-bold text-emerald-900 mb-2">Verifikasi Akhir</h1>
        <p className="text-stone-400 font-medium">Upload bukti setoran di lokasi</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-10 max-w-md mx-auto w-full">
        <div className="w-full max-w-xs aspect-square rounded-[60px] border-4 border-dashed border-stone-200 flex flex-col items-center justify-center relative overflow-hidden bg-white group hover:border-emerald-300 transition-all shadow-inner">
          {preview ? (
            <img src={preview} alt="Bukti" className="w-full h-full object-cover" />
          ) : (
            <>
              <div className="w-24 h-24 rounded-[32px] bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="text-emerald-600" size={48} />
              </div>
              <p className="text-xs font-black text-stone-400 uppercase tracking-widest px-10 text-center leading-relaxed">Ketuk untuk mengambil foto bukti setoran</p>
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
            </>
          )}
        </div>

        <div className="w-full space-y-4">
          <div className="flex items-center gap-5 p-5 bg-white rounded-[32px] border border-stone-100 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
              <QrCode size={28} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-stone-800">Gunakan QR Code</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Scan di booth untuk verifikasi instan</p>
            </div>
            <ChevronRight className="text-stone-300" />
          </div>

          <div className="p-5 bg-emerald-50 rounded-[32px] border border-emerald-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Verifikasi GPS</p>
            </div>
            <p className="text-xs font-medium text-emerald-800">Sistem mengonfirmasi Anda berada di area Bank Sampah.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-4 max-w-md mx-auto w-full">
        <button 
          disabled={!preview || isUploading}
          onClick={handleUpload}
          className="w-full py-5 rounded-[28px] bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-30 flex items-center justify-center gap-3"
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span>Memverifikasi...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={24} />
              <span>Klaim NeuroPoints</span>
            </>
          )}
        </button>
        <button 
          onClick={onCancel}
          className="w-full py-4 text-stone-400 font-bold hover:text-stone-600 transition-all"
        >
          Batal & Kembali
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<AppState>('welcome');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WasteAnalysis | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [userData, setUserData] = useState<UserData>({
    points: 0,
    scans: 0,
    level: 'Pemula',
    streak: 1,
    lastLogin: new Date().toDateString(),
    mascotName: 'NeuroFlame',
    history: [
      { date: '01/05', co2: 50, water: 20, energy: 5 },
      { date: '02/05', co2: 120, water: 45, energy: 12 },
      { date: '03/05', co2: 80, water: 30, energy: 8 },
      { date: '04/05', co2: 150, water: 60, energy: 15 },
      { date: '05/05', co2: 200, water: 80, energy: 20 },
    ],
    scanHistory: []
  });
  const [progressMsg, setProgressMsg] = useState('Menginisialisasi AI...');
  const [selectedArticle, setSelectedArticle] = useState<typeof EDUCATIONAL_ARTICLES[0] | null>(null);
  const [showScanOptions, setShowScanOptions] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState<{ total: number, bonus: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // --- Waste Bank State & Handlers ---
  const [selectedWaste, setSelectedWaste] = useState<Record<string, number>>({});

  const handleWasteToggle = (id: string) => {
    setSelectedWaste(prev => {
      const newSelected = { ...prev };
      if (newSelected[id] !== undefined) {
        delete newSelected[id];
      } else {
        newSelected[id] = 1.0; // Default 1kg
      }
      return newSelected;
    });
  };

  const handleUpdateWeight = (id: string, weight: number) => {
    setSelectedWaste(prev => ({
      ...prev,
      [id]: weight
    }));
  };

  const handleVerificationSuccess = () => {
    const basePoints = WASTE_CATEGORIES.reduce((acc, cat) => {
      const weight = selectedWaste[cat.id] || 0;
      return acc + (weight * cat.pointsPerKg);
    }, 0);
    
    const bonus = 150; // Bonus for TPA delivery
    const total = basePoints + bonus;

    saveUserData({ ...userData, points: userData.points + total });
    setSelectedWaste({});
    setShowRewardModal({ total, bonus });
    setState('main');
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('neurocycle_user_v4');
      if (saved) {
        const data = JSON.parse(saved) as UserData;
        const today = new Date().toDateString();
        const last = data.lastLogin;

        if (last !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          let newStreak = data.streak || 1;
          if (last === yesterday.toDateString()) {
            newStreak += 1;
          } else if (last) {
            newStreak = 1;
          }
          
          const updated = { ...data, streak: newStreak, lastLogin: today };
          setUserData(updated);
          localStorage.setItem('neurocycle_user_v4', JSON.stringify(updated));
        } else {
          setUserData(data);
        }
      }
    } catch (error) {
      console.error("Error loading user data from local storage:", error);
      // If data is corrupted, we just stick with the default state initialized in useState
    }
  }, []);

  const saveUserData = (newData: UserData) => {
    setUserData(newData);
    localStorage.setItem('neurocycle_user_v4', JSON.stringify(newData));
  };

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleImageInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setState('scanning');
    
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const originalBase64 = await base64Promise;
      setProgressMsg('Mengoptimalkan gambar...');
      const compressedBase64 = await compressImage(originalBase64);
      setScannedImage(compressedBase64);
      
      const pureBase64 = compressedBase64.split(',')[1];
      
      setProgressMsg('Menganalisis komposisi & dampak...');
      const analysis = await analyzeWaste(pureBase64);
      setResult(analysis);
      
      // Award points & update history
      const newPoints = userData.points + 25;
      const newScans = userData.scans + 1;
      
      const todayDate = new Date();
      const todayFormatted = todayDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
      const fullDate = todayDate.toLocaleString('id-ID');

      // Add to Scan History
      const newScanItem: ScanHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: analysis.name,
        category: analysis.category,
        date: fullDate,
        impact: {
          co2: analysis.impactStats.co2Saved,
          water: analysis.impactStats.waterSaved,
          energy: analysis.impactStats.energySaved,
        },
        image: compressedBase64
      };
      
      const existingRecordIdx = userData.history.findIndex(h => h.date === todayFormatted);
      
      let newHistory = [...userData.history];
      const newImpact = analysis.impactStats;

      if (existingRecordIdx >= 0) {
        newHistory[existingRecordIdx] = {
          ...newHistory[existingRecordIdx],
          co2: newHistory[existingRecordIdx].co2 + newImpact.co2Saved,
          water: newHistory[existingRecordIdx].water + newImpact.waterSaved,
          energy: newHistory[existingRecordIdx].energy + newImpact.energySaved,
        };
      } else {
        newHistory.push({
          date: todayFormatted,
          co2: newImpact.co2Saved,
          water: newImpact.waterSaved,
          energy: newImpact.energySaved,
        });
      }

      if (newHistory.length > 7) newHistory = newHistory.slice(-7);

      let newLevel = userData.level;
      if (newScans > 50) newLevel = 'Pahlawan Bumi';
      else if (newScans > 20) newLevel = 'Penjaga Alam';
      else if (newScans > 5) newLevel = 'Pecinta Lingkungan';
      
      saveUserData({ 
        ...userData,
        points: newPoints, 
        scans: newScans, 
        level: newLevel,
        history: newHistory,
        scanHistory: [newScanItem, ...(userData.scanHistory || [])]
      });
      
      setState('result');
    } catch (err: any) {
      console.error("Detail Error Pemindaian:", err);
      const errorMsg = err.message || 'Gagal memproses gambar.';
      alert(`Error: ${errorMsg}\n\nPastikan API Key valid, koneksi internet stabil, dan kuota API Gemini Anda masih tersedia.`);
      setState('main');
    } finally {
      setLoading(false);
      // Reset input values so the same image can be picked again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const deleteHistory = (id: string) => {
    const newHistory = (userData.scanHistory || []).filter(item => item.id !== id);
    saveUserData({ ...userData, scanHistory: newHistory });
  };

  const resetScanner = () => {
    setResult(null);
    setScannedImage(null);
    setState('main');
  };

  const chartData = useMemo(() => userData.history, [userData.history]);

  return (
    <div className="min-h-screen bg-stone-50 pb-32 max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {state === 'welcome' && <WelcomeScreen onStart={() => setState('main')} />}
        {state === 'about' && <AboutScreen onBack={() => setState('main')} />}
        {state === 'redemption' && (
          <RedemptionCenter points={userData.points} onBack={() => setState('main')} />
        )}
        
        {state === 'scanning' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[60] flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative w-48 h-48 mb-8">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full"
              />
              <div className="absolute inset-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <Loader2 size={48} className="text-emerald-600 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-emerald-800 mb-2">Sedang Memindai...</h2>
            <p className="text-stone-500">{progressMsg}</p>
          </motion.div>
        )}

        {state === 'main' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-3xl shadow-sm flex items-center justify-center text-emerald-600 border border-emerald-50">
                  <User size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold text-emerald-900 leading-tight">Halo!</h1>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none">Pencinta Bumi</p>
                </div>
              </div>

              <button 
                onClick={() => setState('about')}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-2xl border border-stone-100 shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-5 h-5 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                  <Info size={12} />
                </div>
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Tentang</span>
              </button>
            </div>

            {/* Mascot & Streak Section */}
            {/* Home Screen View */}
            <div className="flex flex-col items-center gap-6 mb-8">
              <Mascot 
                streak={userData.streak || 1} 
                name={userData.mascotName} 
                onRename={() => {
                  setNewName(userData.mascotName || 'NeuroFlame');
                  setIsRenaming(true);
                }}
              />
              
              <div className="flex gap-4 w-full">
                {/* TikTok-Style Streak Badge */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 p-[1px] rounded-2xl shadow-lg shadow-orange-200/40 cursor-pointer overflow-hidden"
                >
                  <div className="bg-white/95 backdrop-blur-sm rounded-[15px] px-4 py-3 flex items-center gap-3">
                    <div className="relative">
                      <Zap size={24} className="text-orange-500 fill-orange-500 animate-pulse" />
                      <div className="absolute inset-0 bg-orange-400 blur-lg opacity-40 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-stone-800 leading-none">{userData.streak || 1}</span>
                        <span className="text-[10px] font-bold text-stone-400 uppercase">HARI</span>
                      </div>
                      <p className="text-[9px] font-bold text-orange-600 uppercase tracking-[0.1em] leading-none mt-1">NeuroStreak</p>
                    </div>
                  </div>
                </motion.div>

                {/* Tukar Poin Button */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setState('redemption')}
                  className="bg-emerald-600 p-4 rounded-2xl shadow-lg shadow-emerald-200 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <Coins size={24} className="text-white" />
                  <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Tukar Poin</span>
                </motion.button>
              </div>

              {/* Setor Sampah Button (Bank Sampah) */}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setState('waste_bank_list')}
                className="w-full bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm flex items-center gap-6 group hover:border-emerald-500/30 transition-all"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-[24px] flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Recycle size={32} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-display font-bold text-stone-800">Bank Sampah</h3>
                  <p className="text-xs text-stone-400">Setor sampah & kumpulkan NeuroPoints</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <ChevronRight size={20} />
                </div>
              </motion.button>
            </div>


            {/* Level Timeline */}
            <LevelTimeline currentScans={userData.scans} />

            {/* Points & Level Card */}
            <div className="bg-emerald-600 rounded-[32px] p-8 text-white mb-8 shadow-xl shadow-emerald-200 relative overflow-hidden">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-emerald-100 text-xs uppercase tracking-widest font-bold mb-1 opacity-80">NeuroPoints</p>
                  <h2 className="text-5xl font-display font-bold">{userData.points}</h2>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                  <Award size={32} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] text-emerald-100 font-bold uppercase tracking-widest">
                  <span>Level: {userData.level}</span>
                  <span>{userData.scans}/5 Scans untuk Level Up</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(userData.scans % 5) * 20}%` }}
                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]" 
                  />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-emerald-100 bg-white/10 p-2 rounded-xl">
                  <Info size={12} />
                  <span>NeuroPoints mewakili kontribusimu pada hutan komunitas.</span>
                </div>
              </div>
            </div>

            {/* Jejak Hijau Chart */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100 mb-8 overflow-hidden">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <BarChart3 size={18} />
                  </div>
                  <h3 className="text-lg font-display font-bold text-stone-800">Jejak Hijau</h3>
                </div>
                <TrendingDown size={18} className="text-emerald-500" />
              </div>
              
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#047857', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="co2" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCo2)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <p className="text-[10px] text-stone-400 uppercase font-bold mb-1">CO2 (g)</p>
                  <p className="font-display font-bold text-emerald-700">{userData.history.reduce((a,b) => a + b.co2, 0)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <p className="text-[10px] text-stone-400 uppercase font-bold mb-1">Air (L)</p>
                  <p className="font-display font-bold text-blue-700">{userData.history.reduce((a,b) => a + b.water, 0)}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <p className="text-[10px] text-stone-400 uppercase font-bold mb-1">Energi (kWh)</p>
                  <p className="font-display font-bold text-amber-700">{userData.history.reduce((a,b) => a + b.energy, 0).toFixed(1)}</p>
                </div>
              </div>
            </div>

            {/* Featured Articles */}
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-lg font-display font-bold text-stone-800">Edukasi Hari Ini</h3>
              <button 
                className="text-emerald-600 text-xs font-bold uppercase tracking-wider"
                onClick={() => {
                  setSelectedArticle(EDUCATIONAL_ARTICLES[0]);
                  setState('education_detail');
                }}
              >
                Lainnya
              </button>
            </div>
            <div className="grid gap-3">
              {EDUCATIONAL_ARTICLES.slice(0, 3).map((article) => (
                <div 
                  key={article.id} 
                  className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4 cursor-pointer hover:bg-stone-50 transition-colors"
                  onClick={() => {
                    setSelectedArticle(article);
                    setState('education_detail');
                  }}
                >
                  <div className={`w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center shrink-0`}>
                    {article.icon === 'Droplets' && <Droplets className="text-blue-500" />}
                    {article.icon === 'Leaf' && <Leaf className="text-green-500" />}
                    {article.icon === 'TrendingDown' && <TrendingDown className="text-amber-500" />}
                    {article.icon === 'Recycle' && <Recycle className="text-emerald-500" />}
                    {article.icon === 'Sprout' && <Sprout className="text-indigo-500" />}
                    {article.icon === 'ShoppingBag' && <ShoppingBag className="text-rose-500" />}
                    {article.icon === 'AlertTriangle' && <AlertTriangle className="text-red-500" />}
                    {article.icon === 'Trees' && <Trees className="text-emerald-500" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-800 text-sm mb-0.5">{article.title}</h4>
                    <p className="text-[10px] text-stone-400 line-clamp-1">{article.excerpt}</p>
                  </div>
                  <ChevronRight size={16} className="text-stone-300" />
                </div>
              ))}
            </div>

            {/* Credits Section */}
            <div className="mt-12 mb-8 flex flex-col items-center">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-3">
                Created by Favian Yusuf Ashari
              </p>
              <motion.a
                href="https://www.instagram.com/favajah?igsh=MWJ1ZW5hZWN0OWxneQ=="
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] text-white shadow-lg shadow-pink-200/50 transition-shadow"
              >
                <Instagram size={16} />
                <span className="text-xs font-black tracking-tight">favajah</span>
              </motion.a>
            </div>

            {/* Action Inputs */}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageInput} 
            />
            <input 
              type="file" 
              accept="image/*" 
              ref={galleryInputRef} 
              className="hidden" 
              onChange={handleImageInput} 
            />
          </motion.div>
        )}

        {state === 'map' && <MapContainer onClose={() => setState('main')} />}

        {state === 'education_detail' && selectedArticle && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed inset-0 bg-stone-50 z-[70] overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-stone-100">
              <button 
                onClick={() => setState('main')}
                className="p-3 bg-stone-100 rounded-2xl text-stone-600 hover:bg-stone-200"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-lg font-display font-bold">Detail Edukasi</h2>
              <div className="w-10" />
            </div>

            <div className="p-6">
              {/* Header Info */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-16 h-16 bg-white rounded-[24px] shadow-sm flex items-center justify-center border border-stone-100`}>
                  {selectedArticle.icon === 'Droplets' && <Droplets size={32} className="text-blue-500" />}
                  {selectedArticle.icon === 'Leaf' && <Leaf size={32} className="text-green-500" />}
                  {selectedArticle.icon === 'TrendingDown' && <TrendingDown size={32} className="text-amber-500" />}
                  {selectedArticle.icon === 'Recycle' && <Recycle size={32} className="text-emerald-500" />}
                  {selectedArticle.icon === 'Sprout' && <Sprout size={32} className="text-indigo-500" />}
                  {selectedArticle.icon === 'ShoppingBag' && <ShoppingBag size={32} className="text-rose-500" />}
                  {selectedArticle.icon === 'AlertTriangle' && <AlertTriangle size={32} className="text-red-500" />}
                  {selectedArticle.icon === 'Trees' && <Trees size={32} className="text-emerald-500" />}
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-stone-800 leading-tight">{selectedArticle.title}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{selectedArticle.author}</span>
                    <span className="w-1 h-1 bg-stone-300 rounded-full" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{selectedArticle.readTime} Baca</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-stone-100 mb-8">
                <div className="prose prose-stone max-w-none">
                  {selectedArticle.content.split('\n').map((para, i) => (
                    <p key={i} className="text-stone-600 leading-relaxed mb-4">
                      {para.startsWith('**') ? <strong>{para.replace(/\*\*/g, '')}</strong> : para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Tip Card */}
              <div className="bg-emerald-600 rounded-[32px] p-6 text-white shadow-xl shadow-emerald-200 flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Aksi Nyata</h4>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    Bagikan informasi ini ke teman-temanmu untuk memberikan dampak yang lebih luas!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'user_dashboard' && (
          <UserDashboard 
            userData={userData} 
            onDeleteHistory={deleteHistory}
            onPointsClick={() => setState('redemption')}
            onBack={() => setState('main')}
            saveUserData={saveUserData}
          />
        )}
        {state === 'result' && result && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-20"
          >
            {/* Action Bar */}
            <div className="p-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50">
              <button 
                onClick={resetScanner}
                className="p-3 bg-stone-100 rounded-2xl text-stone-600 hover:bg-stone-200"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-lg font-display font-bold">Analisis Sampah</h2>
              <div className="w-10" />
            </div>

            <div className="px-6">
              {/* Photo Display */}
              <div className="relative rounded-[40px] overflow-hidden aspect-square shadow-2xl mb-8 border-4 border-white">
                <img src={scannedImage!} alt="Scanned" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-emerald-600 flex items-center gap-2">
                  <Sparkles size={12} />
                  Confidence: {Math.round(result.accuracy)}%
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-8 border-2 border-white/50 border-dashed rounded-[32px] bg-white/10 backdrop-blur-sm flex items-center justify-center px-4"
                >
                  <div className="text-white text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Terdeteksi</p>
                    <p className="text-xl font-display font-bold">{result.name}</p>
                  </div>
                </motion.div>
              </div>

              {/* Identity & Category */}
              <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    result.category === 'Organik' ? 'bg-green-100 text-green-700' :
                    result.category === 'Anorganik' ? 'bg-blue-100 text-blue-700' :
                    result.category === 'B3' ? 'bg-red-100 text-red-700' :
                    'bg-stone-100 text-stone-700'
                  }`}>
                    {result.category}
                  </span>
                  {result.recyclable && (
                    <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <Recycle size={12} /> Daur Ulang
                    </span>
                  )}
                </div>
              </div>

              {/* Composition */}
              <div className="bg-white rounded-[40px] p-8 shadow-sm border border-stone-100 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                   Komposisi Detail
                </h3>
                <div className="space-y-6">
                  {result.composition.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-stone-800 text-sm">{item.material}</span>
                        <span className="text-emerald-600 font-display font-bold">{item.percentage}%</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ delay: 0.5 + idx * 0.1, duration: 1 }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Creative Ideas */}
              <div className="bg-amber-50 rounded-[40px] p-8 mb-6 border border-amber-100">
                <h3 className="text-sm font-bold uppercase tracking-widest text-amber-800 mb-6 flex items-center gap-2">
                  <Lightbulb size={18} /> Ide Kreasi (Upcycle)
                </h3>
                <div className="space-y-4">
                  {result.creativeIdeas.map((idea, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-8 h-8 bg-amber-200 rounded-xl flex items-center justify-center text-amber-800 font-bold shrink-0 text-sm">
                        {idx + 1}
                      </div>
                      <p className="text-amber-900/80 text-sm italic py-1 leading-relaxed">
                        "{idea}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disposal & Impact */}
              <div className="bg-emerald-50 rounded-[40px] p-8 mb-6 border border-emerald-100">
                <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-800 mb-6 flex items-center gap-2">
                  <BookOpen size={18} /> Instruksi Pembuangan
                </h3>
                <p className="text-emerald-900 text-sm leading-relaxed mb-6">
                  {result.disposalGuide}
                </p>
                
                <div className="p-6 bg-white rounded-3xl border border-emerald-100 mb-6">
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Langkah Selanjutnya</h4>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] text-stone-600 leading-normal">
                        Kirim sampah ini ke <b>TPU/TPA terdekat</b> melalui NeuroMap untuk mendapatkan <b>BONUS NeuroPoints (+50 NP)</b> dan bantu kelola lingkungan lebih baik!
                      </p>
                      <button 
                        onClick={() => setState('map')}
                        className="mt-3 text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1"
                      >
                        Cari Lokasi <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white/50 rounded-3xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-700 uppercase mb-3">Estimasi Dampak Positif:</p>
                  <div className="flex justify-between">
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-emerald-600">-{result.impactStats.co2Saved}g</p>
                      <p className="text-[10px] text-stone-400">CO2 Emissions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-blue-600">{result.impactStats.waterSaved}L</p>
                      <p className="text-[10px] text-stone-400">Air Terselamatkan</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-amber-600">{result.impactStats.energySaved}kW</p>
                      <p className="text-[10px] text-stone-400">Energi Hemat</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button 
                onClick={resetScanner}
                className="w-full py-5 bg-stone-900 text-white rounded-[32px] font-bold text-lg shadow-xl shadow-black/10 active:scale-95 transition-all mb-12"
              >
                Selesai (+25 Points)
              </button>
            </div>
          </motion.div>
        )}
        {isRenaming && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mb-6 mx-auto">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-center text-stone-800 mb-2">Beri Nama Temanmu</h3>
              <p className="text-center text-stone-500 text-sm mb-8">Pilih nama keren untuk mascot NeuroFlame milikmu!</p>
              
              <input 
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="cth: Pyro / Vulcan"
                className="w-full p-5 bg-stone-100 rounded-3xl font-bold text-lg mb-6 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                autoFocus
              />
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsRenaming(false)}
                  className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    saveUserData({ ...userData, mascotName: newName });
                    setIsRenaming(false);
                  }}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200"
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {state === 'waste_bank_list' && (
          <WasteBankList 
            onNext={() => setState('waste_bank_calculate')}
            onBack={() => setState('main')}
            selectedItems={selectedWaste}
            onToggleItem={handleWasteToggle}
            onUpdateWeight={handleUpdateWeight}
          />
        )}

        {state === 'waste_bank_calculate' && (
          <WasteBankCalculate 
            selectedItems={selectedWaste}
            onNext={() => {
              window.open('https://www.google.com/maps/search/bank+sampah+terdekat/', '_blank');
              setState('waste_bank_verify');
            }}
            onCancel={() => setState('waste_bank_list')}
          />
        )}

        {state === 'waste_bank_verify' && (
          <WasteBankVerify 
            onSuccess={handleVerificationSuccess}
            onCancel={() => setState('waste_bank_calculate')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {['main', 'map', 'user_dashboard', 'education_detail'].includes(state) && (
          <BottomNav 
            active={state} 
            onChange={(s) => setState(s)} 
            onScan={() => setShowScanOptions(true)}
          />
        )}
      </AnimatePresence>

      {/* Scan Options Modal */}
      <AnimatePresence>
        {showScanOptions && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowScanOptions(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              className="relative w-full max-w-sm bg-white rounded-t-[40px] p-8 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-stone-100 rounded-full mx-auto mb-8" />
              <h3 className="text-xl font-display font-bold text-stone-800 mb-6 text-center">Pilih Sumber Gambar</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    setShowScanOptions(false);
                    fileInputRef.current?.click();
                  }}
                  className="flex flex-col items-center gap-4 p-6 bg-emerald-50 rounded-[32px] border border-emerald-100 hover:bg-emerald-100 transition-colors"
                >
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Camera size={32} />
                  </div>
                  <span className="font-bold text-emerald-800 text-sm">Ambil Foto</span>
                </button>
                
                <button 
                  onClick={() => {
                    setShowScanOptions(false);
                    galleryInputRef.current?.click();
                  }}
                  className="flex flex-col items-center gap-4 p-6 bg-blue-50 rounded-[32px] border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <ImageIcon size={32} />
                  </div>
                  <span className="font-bold text-blue-800 text-sm">Galeri</span>
                </button>
              </div>
              
              <button 
                onClick={() => setShowScanOptions(false)}
                className="w-full mt-8 py-4 text-stone-400 font-bold text-sm uppercase tracking-widest"
              >
                Batal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reward Success Modal */}
      <AnimatePresence>
        {showRewardModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[48px] p-10 text-center shadow-2xl overflow-hidden"
            >
              {/* Confetti Background Simulation */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400" />
              
              <div className="w-24 h-24 bg-emerald-100 rounded-[36px] flex items-center justify-center text-emerald-600 mb-8 mx-auto relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Award size={56} />
                </motion.div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Sparkles size={16} />
                </div>
              </div>

              <h2 className="text-3xl font-display font-bold text-stone-800 mb-2">Luar Biasa!</h2>
              <p className="text-stone-500 text-sm mb-10">Terima kasih telah berkontribusi langsung ke Bank Sampah.</p>

              <div className="bg-stone-50 rounded-[32px] p-6 mb-10 border border-stone-100">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-200/50">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Poin Setoran</span>
                  <span className="font-display font-bold text-stone-800">+{showRewardModal.total - showRewardModal.bonus}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Bonus TPA/Map</span>
                  <span className="font-display font-bold text-emerald-600">+{showRewardModal.bonus}</span>
                </div>
                <div className="pt-4 flex justify-between items-center">
                  <span className="text-sm font-black text-stone-800 uppercase tracking-widest">Total Diterima</span>
                  <div className="flex items-center gap-2">
                    <Coins size={20} className="text-amber-500" />
                    <span className="text-3xl font-display font-bold text-emerald-600">{showRewardModal.total}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowRewardModal(null)}
                className="w-full py-5 bg-stone-900 text-white rounded-[28px] font-bold text-lg shadow-xl shadow-black/20 active:scale-95 transition-all"
              >
                Mantap!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

