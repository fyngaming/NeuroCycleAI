import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc,
  query, where, onSnapshot, addDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logError } from '../lib/errorLogger';
import type { Mission, MissionProgress, MissionProof, Article } from '../types';

// ─── Missions ────────────────────────────────────────────────────

export const getMissions = (callback: (missions: Mission[]) => void) => {
  const q = query(collection(db, 'missions'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Mission)));
  });
};

export const getActiveMissions = (callback: (missions: Mission[]) => void) => {
  const now = new Date().toISOString();
  const q = query(
    collection(db, 'missions'),
    where('status', '==', 'active')
  );
  return onSnapshot(q, snap => {
    const missions = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Mission))
      .filter(m => m.launchAt <= now && m.expiresAt > now);
    callback(missions);
  });
};

export const createMission = async (mission: Omit<Mission, 'id'>) => {
  const ref = doc(collection(db, 'missions'));
  const data = Object.fromEntries(
    Object.entries({ ...mission, id: ref.id }).filter(([, v]) => v !== undefined)
  );
  await setDoc(ref, data);
  return ref.id;
};

export const updateMissionStatus = async (missionId: string, status: Mission['status']) => {
  await updateDoc(doc(db, 'missions', missionId), { status });
};

export const syncMissionStatuses = async () => {
  const now = new Date().toISOString();
  const snap = await getDocs(collection(db, 'missions'));
  snap.docs.forEach(async d => {
    const m = d.data() as Mission;
    if (m.status === 'scheduled' && m.launchAt <= now) {
      await updateDoc(d.ref, { status: 'active' });
    }
    if (m.status === 'active' && m.expiresAt <= now) {
      await updateDoc(d.ref, { status: 'expired' });
    }
  });
};

// ─── Mission Progress ─────────────────────────────────────────────

export const getUserMissionProgress = (
  userId: string,
  missionId: string,
  callback: (progress: MissionProgress | null) => void
) => {
  const ref = doc(db, 'missionProgress', `${userId}_${missionId}`);
  return onSnapshot(ref, snap => {
    callback(snap.exists() ? snap.data() as MissionProgress : null);
  });
};

export const getAllMissionProgress = (callback: (progress: MissionProgress[]) => void) => {
  return onSnapshot(collection(db, 'missionProgress'), snap => {
    callback(snap.docs.map(d => d.data() as MissionProgress));
  });
};

export const getAllUserMissionProgress = (
  userId: string,
  callback: (progress: MissionProgress[]) => void
) => {
  const q = query(collection(db, 'missionProgress'), where('userId', '==', userId));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as MissionProgress));
  });
};

export const initMissionProgress = async (userId: string, mission: Mission): Promise<MissionProgress> => {
  const id = `${userId}_${mission.id}`;
  const progress: MissionProgress = {
    missionId: mission.id,
    userId,
    current: 0,
    target: mission.target,
    completed: false,
    claimed: false,
    articlesRead: [],
    proofs: [],
    proofImages: [],
    startedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'missionProgress', id), progress);
  return progress;
};

export const updateMissionProgress = async (
  userId: string,
  missionId: string,
  updates: Partial<MissionProgress>
) => {
  const id = `${userId}_${missionId}`;
  const ref = doc(db, 'missionProgress', id);
  await setDoc(ref, updates, { merge: true });
};

export const claimMissionReward = async (
  userId: string,
  missionId: string,
  rewardPoints: number,
  currentPoints: number
) => {
  const progressId = `${userId}_${missionId}`;
  await setDoc(doc(db, 'missionProgress', progressId), {
    claimed: true,
    claimedAt: new Date().toISOString(),
  }, { merge: true });
  await setDoc(doc(db, 'users', userId), {
    points: currentPoints + rewardPoints,
  }, { merge: true });
};

// ─── Proof Submissions ────────────────────────────────────────────

export const submitProof = async (
  userId: string,
  userEmail: string,
  displayName: string,
  missionId: string,
  progressIndex: number,
  imageFile: File
): Promise<MissionProof> => {
  const proof: MissionProof = {
    id: `${userId}_${missionId}_${progressIndex}`,
    userId,
    userEmail,
    displayName,
    missionId,
    imageUrl: '',
    submittedAt: new Date().toISOString(),
    status: 'pending_review',
    progressIndex,
  };
  await setDoc(doc(db, 'missionProofs', proof.id), proof);
  return proof;
};

export const getPendingProofs = (callback: (proofs: MissionProof[]) => void) => {
  const q = query(collection(db, 'missionProofs'), where('status', '==', 'pending_review'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as MissionProof));
  });
};

export const reviewProof = async (
  proofId: string,
  status: 'approved' | 'rejected',
  rejectedReason?: string
) => {
  await updateDoc(doc(db, 'missionProofs', proofId), {
    status,
    ...(rejectedReason ? { rejectedReason } : {}),
  });

  if (status === 'approved') {
    const proofSnap = await getDoc(doc(db, 'missionProofs', proofId));
    const proof = proofSnap.data() as MissionProof;
    const progressId = `${proof.userId}_${proof.missionId}`;
    const progressSnap = await getDoc(doc(db, 'missionProgress', progressId));

    if (progressSnap.exists()) {
      const progress = progressSnap.data() as MissionProgress;
      const newCurrent = progress.current + 1;
      const completed = newCurrent >= progress.target;
      await updateDoc(doc(db, 'missionProgress', progressId), {
        current: newCurrent,
        completed,
      });
    }
  }
};

// ─── Quiz Mission Handler ───────────────────────────────────────────

export const submitQuizResults = async (
  userId: string,
  missionId: string,
  answers: Record<string, string>,
  score: number,
  totalQuestions: number
) => {
  const progressId = `${userId}_${missionId}`;
  const completed = score >= Math.ceil(totalQuestions * 0.7);
  
  await setDoc(doc(db, 'missionProgress', progressId), {
    quizAnswers: answers,
    quizScore: score,
    current: completed ? 1 : 0,
    completed,
  }, { merge: true });
};

// ─── Articles ─────────────────────────────────────────────────────

export const getPublishedArticles = (callback: (articles: Article[]) => void) => {
  const q = query(collection(db, 'articles'), where('isPublished', '==', true));
  return onSnapshot(q, snap => {
    const articles = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Article))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    callback(articles);
  });
};

export const getAllArticles = (callback: (articles: Article[]) => void) => {
  return onSnapshot(collection(db, 'articles'), snap => {
    const articles = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Article))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    callback(articles);
  });
};

export const uploadArticle = async (article: Omit<Article, 'id'>): Promise<string> => {
  const articleRef = doc(collection(db, 'articles'));
  try {
    await setDoc(articleRef, {
      ...article,
      id: articleRef.id,
      createdAt: new Date().toISOString(),
    });
    return articleRef.id;
  } catch (e: any) {
    await logError({
      severity: 'ERROR',
      type: 'upload_article_failed',
      message: e?.message || 'Gagal mengunggah artikel',
      context: 'article_management',
      functionName: 'uploadArticle',
      stack: e instanceof Error ? e.stack : undefined,
      metadata: { title: article.title }
    });
    throw e;
  }
};

// ─── Photo Proof Approval ────────────────────────────────────────

export const approvePhotoProof = async (
  userId: string,
  missionId: string,
  currentProgress: number,
  target: number,
  pendingImage: string,
  userNotifications: any[]
) => {
  try {
    const newCurrent = Math.min(currentProgress + 1, target);
    const completed = newCurrent >= target;
    const newProofImages = [pendingImage];

    await setDoc(doc(db, 'missionProgress', `${userId}_${missionId}`), {
      current: newCurrent,
      completed,
      proofStatus: 'approved',
      pendingProofImage: null,
      proofImages: newProofImages,
    }, { merge: true });

    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Bukti Foto Disetujui! ✅',
      message: 'Foto bukti misimu telah diverifikasi oleh Admin. Progress misi bertambah!',
      date: new Date().toLocaleString('id-ID'),
      type: 'success',
      isRead: false,
    };
    await setDoc(doc(db, 'users', userId), {
      notifications: [newNotif, ...userNotifications],
    }, { merge: true });
  } catch (e: any) {
    await logError({
      severity: 'ERROR',
      type: 'approve_photo_proof_failed',
      message: e?.message || 'Gagal menyetujui bukti foto misi',
      context: 'mission_proof_review',
      functionName: 'approvePhotoProof',
      stack: e instanceof Error ? e.stack : undefined,
      metadata: { userId, missionId, currentProgress, target }
    });
    throw e;
  }
};

export const rejectPhotoProof = async (
  userId: string,
  missionId: string,
  userNotifications: any[]
) => {
  try {
    await setDoc(doc(db, 'missionProgress', `${userId}_${missionId}`), {
      proofStatus: 'rejected',
      pendingProofImage: null,
    }, { merge: true });

    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Bukti Foto Ditolak ⚠️',
      message: 'Foto bukti misimu ditolak oleh Admin. Silakan upload ulang foto yang sesuai.',
      date: new Date().toLocaleString('id-ID'),
      type: 'warning',
      isRead: false,
    };
    await setDoc(doc(db, 'users', userId), {
      notifications: [newNotif, ...userNotifications],
    }, { merge: true });
  } catch (e: any) {
    await logError({
      severity: 'ERROR',
      type: 'reject_photo_proof_failed',
      message: e?.message || 'Gagal menolak bukti foto misi',
      context: 'mission_proof_review',
      functionName: 'rejectPhotoProof',
      stack: e instanceof Error ? e.stack : undefined,
      metadata: { userId, missionId }
    });
    throw e;
  }
};

export const toggleArticlePublish = async (articleId: string, isPublished: boolean) => {
  await updateDoc(doc(db, 'articles', articleId), { isPublished });
};

export const deleteArticle = async (articleId: string) => {
  await updateDoc(doc(db, 'articles', articleId), { isPublished: false });
};