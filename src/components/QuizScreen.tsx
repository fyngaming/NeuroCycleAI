import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ArrowRight, Clock, CheckCircle, XCircle,
  AlertTriangle, Trophy, Gift, RotateCcw, Home,
} from 'lucide-react';
import type { Mission, QuizQuestion } from '../types';
import { submitQuizResults, claimMissionReward } from '../services/missionService';

// ─── Props ────────────────────────────────────────────────────────

interface QuizScreenProps {
  mission: Mission;
  userId: string;
  userPoints: number;
  onBack: () => void;          // kembali ke misi harian
  onHome: () => void;          // kembali ke halaman utama
  onPointsUpdated: (newPoints: number) => void;
}

// ─── Timer Hook ───────────────────────────────────────────────────

const useTimer = (initialSeconds: number, running: boolean) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running, seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return { seconds, mm, ss, isUp: seconds === 0 };
};

// ─── Answer Option Button ─────────────────────────────────────────

const OptionBtn = ({
  label, text, selected, correct, showResult, onClick,
}: {
  label: 'a' | 'b' | 'c' | 'd';
  text: string;
  selected: boolean;
  correct: boolean;
  showResult: boolean;
  onClick: () => void;
}) => {
  let bg = 'bg-white border-stone-200 text-stone-700 hover:border-indigo-400 hover:bg-indigo-50';
  if (showResult) {
    if (correct) bg = 'bg-emerald-50 border-emerald-400 text-emerald-800';
    else if (selected && !correct) bg = 'bg-red-50 border-red-400 text-red-700';
    else bg = 'bg-white border-stone-100 text-stone-400';
  } else if (selected) {
    bg = 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200';
  }

  const labelColors: Record<string, string> = {
    a: showResult && correct ? 'bg-emerald-500' : showResult && selected && !correct ? 'bg-red-400' : selected && !showResult ? 'bg-white/30' : 'bg-indigo-100 text-indigo-600',
    b: showResult && correct ? 'bg-emerald-500' : showResult && selected && !correct ? 'bg-red-400' : selected && !showResult ? 'bg-white/30' : 'bg-indigo-100 text-indigo-600',
    c: showResult && correct ? 'bg-emerald-500' : showResult && selected && !correct ? 'bg-red-400' : selected && !showResult ? 'bg-white/30' : 'bg-indigo-100 text-indigo-600',
    d: showResult && correct ? 'bg-emerald-500' : showResult && selected && !correct ? 'bg-red-400' : selected && !showResult ? 'bg-white/30' : 'bg-indigo-100 text-indigo-600',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={showResult}
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${bg}`}
    >
      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 uppercase
        ${showResult && correct ? 'bg-emerald-500 text-white' :
          showResult && selected && !correct ? 'bg-red-400 text-white' :
          selected && !showResult ? 'bg-white/20 text-white' :
          'bg-indigo-100 text-indigo-600'}`}>
        {label}
      </span>
      <span className="text-sm font-medium leading-snug">{text}</span>
      {showResult && correct && <CheckCircle size={18} className="ml-auto text-emerald-500 shrink-0" />}
      {showResult && selected && !correct && <XCircle size={18} className="ml-auto text-red-400 shrink-0" />}
    </motion.button>
  );
};

// ─── QuizScreen ───────────────────────────────────────────────────

export const QuizScreen: React.FC<QuizScreenProps> = ({
  mission, userId, userPoints, onBack, onHome, onPointsUpdated,
}) => {
  const questions: QuizQuestion[] = mission.questions || [];
  const totalQ = questions.length;
  const timeLimitSeconds = mission.timeLimitSeconds || 300;
  const pointsPerQuestion = totalQ > 0 ? Math.floor(mission.rewardPoints / totalQ) : 0;

  // State
  const [phase, setPhase] = useState<'quiz' | 'confirm_end' | 'result'>('quiz');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> answer
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [claimed, setClaimed] = useState(false);

  const { seconds, mm, ss, isUp } = useTimer(timeLimitSeconds, phase === 'quiz');

  // Auto-end when timer runs out
  useEffect(() => {
    if (isUp && phase === 'quiz') handleFinish();
  }, [isUp, phase]);

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === totalQ - 1;
  const selectedAnswer = answers[currentQ?.id] as 'a' | 'b' | 'c' | 'd' | undefined;

  const handleSelectAnswer = (opt: 'a' | 'b' | 'c' | 'd') => {
    if (phase !== 'quiz') return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: opt }));
  };

  const handleNext = () => {
    if (currentIdx < totalQ - 1) setCurrentIdx(i => i + 1);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  };

  const handleFinish = useCallback(async () => {
    setPhase('result');
    // Calculate score
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setSubmitting(true);
    try {
      await submitQuizResults(userId, mission.id, answers, correct, totalQ);
    } catch (e) {
      console.error('submitQuizResults error:', e);
    } finally {
      setSubmitting(false);
    }
  }, [answers, questions, userId, mission.id, totalQ]);

  const handleClaim = async () => {
    if (claimed) return;
    try {
      await claimMissionReward(userId, mission.id, mission.rewardPoints, userPoints);
      onPointsUpdated(userPoints + mission.rewardPoints);
      setClaimed(true);
    } catch (e) {
      console.error('claimMissionReward error:', e);
    }
  };

  // ── Confirm End Modal ────────────────────────────────────────────
  const ConfirmModal = () => (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[300] flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
        className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl text-center"
      >
        <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-amber-500" />
        </div>
        <h3 className="text-xl font-display font-bold text-stone-900 mb-2">Akhiri Quiz?</h3>
        <p className="text-sm text-stone-500 mb-2">
          Apakah kamu yakin ingin mengakhiri quiz sekarang?
        </p>
        <p className="text-xs text-stone-400 mb-6">
          Soal yang belum dijawab akan dihitung sebagai jawaban kosong.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setPhase('quiz')}
            className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-2xl font-bold text-sm active:scale-95 transition-all"
          >
            Lanjut Kerjakan
          </button>
          <button
            onClick={handleFinish}
            className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-red-200"
          >
            Ya, Akhiri
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  // ── Result Screen ─────────────────────────────────────────────────
  if (phase === 'result') {
    const pct = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;
    const passed = score >= Math.ceil(totalQ * 0.7);
    const earnedPoints = passed ? mission.rewardPoints : Math.floor((score / totalQ) * mission.rewardPoints);

    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 pb-10"
      >
        {/* Score Header */}
        <div className="text-center pt-8 pb-6">
          <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-4 shadow-lg ${
            passed ? 'bg-emerald-500 shadow-emerald-200' : 'bg-amber-400 shadow-amber-200'
          }`}>
            {passed ? <Trophy size={40} className="text-white" /> : <RotateCcw size={40} className="text-white" />}
          </div>
          <h2 className="text-3xl font-display font-black text-stone-900 mb-1">
            {passed ? 'Luar Biasa! 🎉' : 'Terus Semangat! 💪'}
          </h2>
          <p className="text-sm text-stone-500 mb-4">{mission.title}</p>

          <div className="inline-flex items-center gap-3 bg-white rounded-3xl px-6 py-3 shadow-sm border border-stone-100 mb-2">
            <span className={`text-4xl font-display font-black ${passed ? 'text-emerald-600' : 'text-amber-500'}`}>
              {score}/{totalQ}
            </span>
            <div className="text-left">
              <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Skor Kamu</p>
              <p className="text-sm font-bold text-stone-700">{pct}% Benar</p>
            </div>
          </div>

          {/* Points earned */}
          <div className={`mt-4 mx-auto max-w-xs p-4 rounded-3xl border ${
            passed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <p className={`text-2xl font-display font-black ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
              +{earnedPoints.toLocaleString()} NP
            </p>
            <p className={`text-xs font-bold mt-0.5 ${passed ? 'text-emerald-500' : 'text-amber-500'}`}>
              {passed ? 'Selamat! Reward penuh kamu dapatkan 🏆' : `${score} benar × ${pointsPerQuestion} NP per soal`}
            </p>
          </div>

          {/* Claim Button */}
          {!claimed ? (
            <motion.button
              animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              onClick={handleClaim}
              disabled={submitting}
              className="mt-4 w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50"
            >
              <Gift size={18} />
              Klaim {earnedPoints.toLocaleString()} NP
            </motion.button>
          ) : (
            <div className="mt-4 w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-bold text-sm">
              <CheckCircle size={18} />
              Reward sudah diklaim ✓
            </div>
          )}
        </div>

        {/* Answer Review */}
        <div className="max-w-lg mx-auto">
          <h3 className="text-sm font-black text-stone-600 uppercase tracking-widest mb-4 px-1">
            📋 Kunci Jawaban & Evaluasi
          </h3>
          <div className="space-y-4 mb-8">
            {questions.map((q, idx) => {
              const userAns = answers[q.id] as 'a' | 'b' | 'c' | 'd' | undefined;
              const isCorrect = userAns === q.correctAnswer;
              return (
                <div key={q.id} className={`bg-white rounded-3xl p-5 border-2 ${isCorrect ? 'border-emerald-200' : 'border-red-200'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                    }`}>{idx + 1}</span>
                    <p className="text-sm font-bold text-stone-800 leading-snug">{q.question}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 text-xs">
                    {(['a', 'b', 'c', 'd'] as const).map(opt => (
                      <div key={opt} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                        opt === q.correctAnswer ? 'bg-emerald-100 text-emerald-800 font-bold' :
                        opt === userAns && !isCorrect ? 'bg-red-100 text-red-700 font-bold' :
                        'text-stone-400'
                      }`}>
                        <span className="font-black uppercase w-4">{opt}.</span>
                        <span>{q.options[opt]}</span>
                        {opt === q.correctAnswer && <CheckCircle size={12} className="ml-auto text-emerald-600 shrink-0" />}
                        {opt === userAns && !isCorrect && <XCircle size={12} className="ml-auto text-red-500 shrink-0" />}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                    }`}>{isCorrect ? '✓ Benar' : '✗ Salah'}</span>
                    {!isCorrect && userAns && (
                      <span className="text-[10px] text-stone-400 font-medium">
                        Jawabanmu: <strong className="text-red-500">{userAns.toUpperCase()}</strong> · Kunci: <strong className="text-emerald-600">{q.correctAnswer.toUpperCase()}</strong>
                      </span>
                    )}
                    {!userAns && (
                      <span className="text-[10px] text-stone-400 font-medium">Tidak dijawab · Kunci: <strong className="text-emerald-600">{q.correctAnswer.toUpperCase()}</strong></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Back to Home */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onHome}
            className="w-full py-5 bg-stone-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
          >
            <Home size={18} />
            Kembali ke Halaman Utama
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ── Quiz Phase ────────────────────────────────────────────────────
  const timerWarning = seconds <= 30;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-100 px-5 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={onBack}
            className="p-2.5 bg-stone-100 rounded-xl text-stone-600 active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-center flex-1 mx-3">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Quiz Misi</p>
            <p className="text-sm font-bold text-stone-800 truncate">{mission.title}</p>
          </div>
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-sm transition-colors ${
            timerWarning ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-700'
          }`}>
            <Clock size={14} />
            {mm}:{ss}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-lg mx-auto mt-3">
          <div className="flex justify-between text-[10px] font-bold text-stone-400 mb-1">
            <span>Soal {currentIdx + 1} dari {totalQ}</span>
            <span>{Object.keys(answers).length} dijawab</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${((currentIdx + 1) / totalQ) * 100}%` }}
              className="h-full bg-indigo-500 rounded-full"
            />
          </div>
          {/* Dot indicators */}
          <div className="flex gap-1 mt-2 flex-wrap">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className={`w-6 h-2 rounded-full transition-all ${
                  i === currentIdx ? 'bg-indigo-600' :
                  answers[q.id] ? 'bg-indigo-300' :
                  'bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question Body */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              {/* Question Card */}
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100 mb-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0">
                    {currentIdx + 1}
                  </span>
                  <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">
                    Soal {currentIdx + 1} / {totalQ}
                  </p>
                </div>
                <p className="text-base font-bold text-stone-800 leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-6">
                {(['a', 'b', 'c', 'd'] as const).map(opt => (
                  <OptionBtn
                    key={opt}
                    label={opt}
                    text={currentQ.options[opt]}
                    selected={selectedAnswer === opt}
                    correct={opt === currentQ.correctAnswer}
                    showResult={false}
                    onClick={() => handleSelectAnswer(opt)}
                  />
                ))}
              </div>

              {/* Poin per soal info */}
              <div className="flex items-center justify-center gap-2 py-2 px-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-4">
                <span className="text-xs font-bold text-indigo-600">🎯 Nilai soal ini:</span>
                <span className="text-sm font-black text-indigo-700">+{pointsPerQuestion} NP</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-stone-100 px-5 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {/* Prev */}
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 px-5 py-3.5 bg-stone-100 text-stone-700 rounded-2xl font-bold text-sm disabled:opacity-30 active:scale-95 transition-all"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

          {/* Next or Finish */}
          {isLast ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setPhase('confirm_end')}
              className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-200 active:scale-95 transition-all"
            >
              <Trophy size={16} />
              Akhiri Quiz Sekarang
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 transition-all"
            >
              Lanjutkan
              <ArrowRight size={16} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Confirm End Modal */}
      <AnimatePresence>
        {phase === 'confirm_end' && <ConfirmModal />}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizScreen;
