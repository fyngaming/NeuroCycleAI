// ─── Article Types ───────────────────────────────────────────────
export interface Article {
  id: string;
  title: string;
  author: string;
  source?: string;
  category?: string;
  excerpt: string;
  readTime: string;
  contentType: 'text' | 'pdf';
  content?: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  createdAt: string;
  color: string;
  icon: string;
}

// ─── Mission Types ────────────────────────────────────────────────
export type MissionType = 'login' | 'scan' | 'read_article' | 'photo_proof' | 'deposit' | 'quiz';
export type MissionStatus = 'scheduled' | 'active' | 'expired';
export type ProofStatus = 'pending_review' | 'approved' | 'rejected';

export interface QuizQuestion {
  id: string;
  question: string;
  options: { a: string; b: string; c: string; d: string };
  correctAnswer: 'a' | 'b' | 'c' | 'd';
}

export interface MissionProof {
  id: string;
  userId: string;
  userEmail: string;
  displayName: string;
  missionId: string;
  imageUrl: string;
  submittedAt: string;
  status: ProofStatus;
  rejectedReason?: string;
  progressIndex: number;    // which step this proof is for (0-based)
}

export interface MissionProgress {
  missionId: string;
  userId: string;
  current: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  claimedAt?: string;
  articlesRead: string[];
  proofs: MissionProof[];
  proofImages: string[];        // base64 foto bukti yang sudah approved
  pendingProofImage?: string;   // foto bukti menunggu review admin
  proofStatus?: 'pending_review' | 'approved' | 'rejected'; // status review terkini
  startedAt: string;
  quizScore?: number;           // untuk tipe quiz
  quizAnswers?: Record<string, string>; // questionId -> selected answer
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  target: number;           // e.g. 3 (times) or 1 for quiz completion
  rewardPoints: number;
  minReadMinutes?: number;  // for read_article type (default 2)
  status: MissionStatus;
  launchAt: string;         // ISO string — when to go live
  expiresAt: string;        // ISO string — 24h after launchAt
  createdAt: string;
  icon: string;             // emoji
  // Quiz-specific fields
  questions?: QuizQuestion[];
  timeLimitSeconds?: number;
}