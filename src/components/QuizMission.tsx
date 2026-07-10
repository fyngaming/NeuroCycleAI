import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Timer, HelpCircle, CheckSquare } from 'lucide-react';
import type { Mission, MissionProgress, QuizQuestion } from '../types';
import { submitQuizResults } from '../services/missionService';

// ─── Quiz Mission Component ───────────────────────────────────────────────
export const QuizMission = ({
  mission,
  userId,
  onBack,
  onCompleted,
}: {
  mission: Mission & { questions: QuizQuestion[]; timeLimitSeconds: number };
  userId: string;
  onBack: () => void;
  onCompleted: (score: number, total: number) => void;
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(mission.timeLimitSeconds);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const handleSubmit = async () => {
    const finalScore = mission.questions.reduce((s, q) => 
      answers[q.id] === q.correctAnswer ? s + 1 : s, 0);
    await submitQuizResults(userId, mission.id, answers, finalScore, mission.questions.length);
    setScore(finalScore);
    setShowResult(true);
  };

  if (showResult) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
        <div className="bg-white rounded-[40px] p-8 text-center">
          <h2 className="text-2xl font-black mb-4">Hasil Quiz</h2>
          <p className="text-4xl font-black text-emerald-600 mb-4">{score}/{mission.questions.length}</p>
          <div className="bg-stone-50 rounded-2xl p-4 mb-4 text-left">
            {mission.questions.map((q, idx) => (
              <div key={q.id} className="flex justify-between text-xs py-1 border-b last:border-0">
                <span>{idx+1}. {q.question.substring(0, 30)}...</span>
                <span className={answers[q.id] === q.correctAnswer ? 'text-emerald-600' : 'text-red-500'}>
                  {answers[q.id] === q.correctAnswer ? '✓ Benar' : `✗ (${q.correctAnswer.toUpperCase()})`}
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => onCompleted(score, mission.questions.length)} 
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold mt-4">
            Kembali ke Halaman Utama
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm"><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-2 text-sm font-bold"><Timer size={16} /> {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
      </div>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {mission.questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-4 rounded-2xl border">
            <p className="font-bold text-sm mb-2">{idx+1}. {q.question}</p>
            {['a','b','c','d'].map(opt => (
              <label key={opt} className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="radio" name={q.id} value={opt} 
                  checked={answers[q.id] === opt}
                  onChange={e => setAnswers({...answers, [q.id]: e.target.value})} 
                  className="w-4 h-4" />
                <span className="text-xs">{q.options[opt as keyof typeof q.options]}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={Object.keys(answers).length < mission.questions.length}
        className="w-full mt-4 py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50">
        Akhiri Quiz
      </button>
    </motion.div>
  );
};

export default QuizMission;