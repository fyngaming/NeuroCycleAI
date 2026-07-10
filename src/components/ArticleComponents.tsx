import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, Clock, Star, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { getPublishedArticles } from '../services/missionService';
import type { Article } from '../types';
import { EDUCATIONAL_ARTICLES } from '../constants';

// ─── Helpers ──────────────────────────────────────────────────────

const toArticle = (a: typeof EDUCATIONAL_ARTICLES[0]): Article => ({
  id: a.id,
  title: a.title,
  author: a.author,
  source: a.author,
  category: a.color,
  excerpt: a.excerpt,
  readTime: a.readTime,
  contentType: 'text',
  content: a.content,
  isPublished: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  color: a.color,
  icon: a.icon,
});

const isNewArticle = (createdAt: string) => {
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 3 * 24 * 60 * 60 * 1000; // 3 hari
};

// ─── ArticleList ──────────────────────────────────────────────────

interface ArticleListProps {
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  readTodayIds?: string[];
  missionMode?: boolean;
  missionTarget?: number;
  missionReadCount?: number;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  onBack,
  onSelectArticle,
  readTodayIds = [],
  missionMode = false,
  missionTarget = 0,
  missionReadCount = 0,
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('favoriteArticles') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    const unsub = getPublishedArticles((adminArticles) => {
      const fallback = EDUCATIONAL_ARTICLES.map(toArticle);
      const adminIds = new Set(adminArticles.map(a => a.id));
      const merged = [
        ...adminArticles,
        ...fallback.filter(a => !adminIds.has(a.id)),
      ];
      setArticles(merged);
    });
    return unsub;
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(next);
    localStorage.setItem('favoriteArticles', JSON.stringify(next));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 pb-40"
    >
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900">
            {missionMode ? 'Pilih Artikel' : 'Pusat Edukasi'}
          </h2>
          {missionMode && (
            <p className="text-xs text-emerald-600 font-bold mt-1">
              Sudah dibaca: {missionReadCount}/{missionTarget} artikel
            </p>
          )}
        </div>
        <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm border border-stone-100 active:scale-95 transition-transform">
          <ArrowLeft size={20} className="text-stone-600" />
        </button>
      </header>

      {missionMode && (
        <div className="mb-6 p-4 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-3">
          <BookOpen size={18} className="text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-700 font-medium leading-relaxed">
            Baca minimal <strong>2 menit</strong> per artikel. Artikel yang sudah dibaca hari ini tidak bisa dipakai ulang.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {articles.map((article) => {
          const isRead = readTodayIds.includes(article.id);
          const isFav = favorites.includes(article.id);
          const isNew = isNewArticle(article.createdAt);
          const isDisabled = missionMode && isRead;

          return (
            <motion.div
              key={article.id}
              whileTap={isDisabled ? {} : { scale: 0.98 }}
              onClick={() => !isDisabled && onSelectArticle(article)}
              className={`bg-white p-5 rounded-4xl shadow-sm border transition-all flex items-center gap-4 ${
                isDisabled
                  ? 'opacity-50 cursor-not-allowed border-stone-100'
                  : 'border-stone-100 cursor-pointer hover:border-emerald-200'
              }`}
            >
              <div className={`w-14 h-14 bg-${article.color}-50 rounded-2xl flex items-center justify-center shrink-0`}>
                {article.contentType === 'pdf'
                  ? <FileText size={24} className={`text-${article.color}-500`} />
                  : <BookOpen size={24} className={`text-${article.color}-500`} />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {isNew && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Baru</span>
                  )}
                  {isRead && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle size={8} /> Sudah Dibaca
                    </span>
                  )}
                  {article.contentType === 'pdf' && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[8px] font-black uppercase tracking-widest">PDF</span>
                  )}
                </div>
                <h4 className="font-bold text-stone-800 text-sm truncate">{article.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest bg-stone-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock size={8} /> {article.readTime}
                  </span>
                  <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest">{article.author}</span>
                </div>
              </div>

              <button
                onClick={(e) => toggleFavorite(article.id, e)}
                className={`p-2 rounded-xl transition-colors shrink-0 ${isFav ? 'text-amber-400' : 'text-stone-200 hover:text-amber-300'}`}
              >
                <Star size={18} fill={isFav ? 'currentColor' : 'none'} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── ArticleReader ────────────────────────────────────────────────

interface ArticleReaderProps {
  article: Article;
  onBack: () => void;
  onFinished?: (articleId: string) => void;
  missionMode?: boolean;
  missionProgress?: { current: number; target: number };
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({
  article,
  onBack,
  onFinished,
  missionMode = false,
  missionProgress,
}) => {
  const MIN_SECONDS = 120; // 2 menit
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev >= MIN_SECONDS) {
          clearInterval(intervalRef.current!);
          setFinished(true);
          return MIN_SECONDS;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  const handleBack = () => {
    if (!finished && missionMode) {
      setShowExitWarning(true);
    } else {
      onBack();
    }
  };

  const handleFinish = () => {
    setShowCompletionModal(true);
  };

  const handleConfirmFinish = () => {
    setShowCompletionModal(false);
    onFinished?.(article.id);
  };

  const progress = Math.min((elapsed / MIN_SECONDS) * 100, 100);
  const remaining = Math.max(MIN_SECONDS - elapsed, 0);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 bg-stone-50 z-70 overflow-y-auto"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-stone-100">
        <button
          onClick={handleBack}
          className="p-3 bg-stone-100 rounded-2xl text-stone-600 hover:bg-stone-200 active:scale-95 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-sm font-display font-bold text-stone-800 truncate max-w-[200px]">{article.title}</h2>

        {/* Timer */}
        {missionMode && (
          <div className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 ${
            finished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <Clock size={12} />
            {finished ? 'Selesai ✓' : `${mins}:${secs.toString().padStart(2, '0')}`}
          </div>
        )}
        {!missionMode && <div className="w-10" />}
      </div>

      {/* Timer Progress Bar */}
      {missionMode && (
        <div className="h-1.5 bg-stone-100">
          <motion.div
            animate={{ width: `${progress}%` }}
            className={`h-full transition-colors ${finished ? 'bg-emerald-500' : 'bg-amber-400'}`}
          />
        </div>
      )}

      {/* Mission Progress Indicator */}
      {missionMode && missionProgress && (
        <div className="mx-6 mt-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-700">Progress Misi</span>
          <div className="flex gap-1.5">
            {Array.from({ length: missionProgress.target }).map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                i < missionProgress.current ? 'bg-emerald-500 text-white' :
                i === missionProgress.current ? 'bg-amber-400 text-white' :
                'bg-stone-200 text-stone-400'
              }`}>
                {i < missionProgress.current ? '✓' : i + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 bg-${article.color}-50 rounded-3xl flex items-center justify-center border border-${article.color}-100`}>
            <BookOpen size={28} className={`text-${article.color}-500`} />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-stone-800 leading-tight">{article.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{article.author}</span>
              <span className="w-1 h-1 bg-stone-300 rounded-full" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                <Clock size={8} /> {article.readTime}
              </span>
            </div>
          </div>
        </div>

        {article.contentType === 'pdf' && article.pdfUrl ? (
          <div className="bg-white rounded-4xl border border-stone-100 overflow-hidden shadow-sm" style={{ height: '60vh' }}>
            <iframe src={article.pdfUrl} className="w-full h-full" title={article.title} />
          </div>
        ) : (
          <div className="bg-white rounded-4xl p-8 shadow-sm border border-stone-100">
            <div className="space-y-4">
              {(article.content || '').split('\n').map((para, i) => (
                <p key={i} className="text-stone-600 leading-relaxed text-sm">
                  {para.startsWith('**') ? <strong>{para.replace(/\*\*/g, '')}</strong> : para}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Finish Button */}
        {missionMode && (
          <div className="mt-8">
            {finished ? (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleFinish}
                className="w-full py-5 bg-emerald-600 text-white rounded-[28px] font-bold text-lg shadow-xl shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <CheckCircle size={24} />
                Selesai Membaca
              </motion.button>
            ) : (
              <div className="w-full py-5 bg-stone-200 text-stone-400 rounded-[28px] font-bold text-lg flex items-center justify-center gap-3 cursor-not-allowed">
                <Clock size={20} />
                Tombol aktif dalam {mins}:{secs.toString().padStart(2, '0')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exit Warning Modal */}
      <AnimatePresence>
        {showExitWarning && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm z-200 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-display font-bold text-stone-900 text-center mb-2">Yakin ingin keluar?</h3>
              <p className="text-stone-500 text-sm text-center mb-6 leading-relaxed">
                Kamu baru membaca <strong>{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</strong> dari 2 menit minimum. Progress tidak akan tersimpan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitWarning(false)}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold active:scale-95 transition-all"
                >
                  Tetap di sini
                </button>
                <button
                  onClick={() => { setShowExitWarning(false); onBack(); }}
                  className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold"
                >
                  Keluar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && missionProgress && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm z-200 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-display font-bold text-stone-900 mb-2">
                Artikel {missionProgress.current + 1}/{missionProgress.target} Selesai!
              </h3>
              <p className="text-stone-500 text-sm mb-6">
                {missionProgress.current + 1 < missionProgress.target
                  ? 'Lanjut baca artikel berikutnya?'
                  : 'Semua artikel sudah dibaca! Klaim hadiahmu sekarang.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmFinish}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold active:scale-95 transition-all"
                >
                  {missionProgress.current + 1 < missionProgress.target ? 'Pilih Artikel Lain' : 'Klaim Hadiah'}
                </button>
                <button
                  onClick={() => { setShowCompletionModal(false); onBack(); }}
                  className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold text-sm"
                >
                  Nanti Saja
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
