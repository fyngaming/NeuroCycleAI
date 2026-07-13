import { collection, addDoc, updateDoc, doc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export type ErrorSeverity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO';

export interface ErrorLogEntry {
  severity: ErrorSeverity;
  type: string;
  message: string;
  context: string;
  userId?: string;
  userEmail?: string;
  functionName: string;
  stack?: string;
  metadata?: Record<string, any>;
}

const OFFLINE_STORAGE_KEY = 'neurocycle_error_logs_offline';

function getOfflineLogs(): any[] {
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineLogs(logs: any[]) {
  try {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // ignore quota errors
  }
}

async function flushOfflineLogs() {
  const logs = getOfflineLogs();
  if (!logs.length) return;

  const remaining: any[] = [];
  for (const entry of logs) {
    try {
      const now = entry.timestamp ? new Date(entry.timestamp) : new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

      const q = query(
        collection(db, 'errorLogs'),
        where('type', '==', entry.type),
        where('context', '==', entry.context),
        where('timestamp', '>=', Timestamp.fromDate(fiveMinutesAgo))
      );

      const existingErrors = await getDocs(q);

      if (!existingErrors.empty) {
        const docRef = existingErrors.docs[0].ref;
        const docData = existingErrors.docs[0].data();
        await updateDoc(docRef, {
          count: (docData.count || 1) + 1,
          lastOccurred: Timestamp.fromDate(now),
          affectedUsers: docData.affectedUsers?.includes(entry.userId)
            ? docData.affectedUsers
            : [...(docData.affectedUsers || []), entry.userId].filter(Boolean)
        });
      } else {
        await addDoc(collection(db, 'errorLogs'), {
          ...entry,
          timestamp: Timestamp.fromDate(now),
          count: 1,
          lastOccurred: Timestamp.fromDate(now),
          status: 'unresolved',
          adminNotes: '',
          affectedUsers: entry.userId ? [entry.userId] : [],
          resolved: false
        });
      }
    } catch {
      remaining.push(entry);
    }
  }

  saveOfflineLogs(remaining);
}

export async function logError(entry: ErrorLogEntry) {
  const severity_emoji = {
    CRITICAL: '🚨',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: 'ℹ️'
  };

  console.error(
    `${severity_emoji[entry.severity]} [${entry.severity}] ${entry.type} (${entry.functionName}):`,
    entry.message
  );

  if (entry.severity === 'CRITICAL') {
    console.warn('🚨 CRITICAL ERROR - Admin harus segera dinotifikasi!');
  }

  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

    const q = query(
      collection(db, 'errorLogs'),
      where('type', '==', entry.type),
      where('context', '==', entry.context),
      where('timestamp', '>=', Timestamp.fromDate(fiveMinutesAgo))
    );

    const existingErrors = await getDocs(q);

    if (!existingErrors.empty) {
      const docRef = existingErrors.docs[0].ref;
      const docData = existingErrors.docs[0].data();
      await updateDoc(docRef, {
        count: (docData.count || 1) + 1,
        lastOccurred: Timestamp.fromDate(now),
        affectedUsers: docData.affectedUsers?.includes(entry.userId)
          ? docData.affectedUsers
          : [...(docData.affectedUsers || []), entry.userId].filter(Boolean)
      });
    } else {
      await addDoc(collection(db, 'errorLogs'), {
        ...entry,
        timestamp: Timestamp.fromDate(now),
        count: 1,
        lastOccurred: Timestamp.fromDate(now),
        status: 'unresolved',
        adminNotes: '',
        affectedUsers: entry.userId ? [entry.userId] : [],
        resolved: false
      });
    }

    await flushOfflineLogs();
  } catch (e) {
    console.error('❌ Failed to log error to Firestore:', e);
    const logs = getOfflineLogs();
    logs.push({
      ...entry,
      timestamp: new Date().toISOString()
    });
    saveOfflineLogs(logs);
    console.warn('⚠️ Error log disimpan offline dan akan dikirim saat koneksi tersedia.');
  }
}

export async function withErrorLogging<T>(
  fn: () => Promise<T>,
  context: string,
  userId?: string,
  functionName: string = fn.name || 'anonymous'
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    await logError({
      severity: error.severity || 'ERROR',
      type: error.code || error.name || 'unknown_error',
      message: error.message || 'Unknown error occurred',
      context,
      userId,
      functionName,
      stack: error.stack,
      metadata: {
        errorCode: error.code,
        errorName: error.name
      }
    });
    throw error;
  }
}

export function isGeminiError(error: any): boolean {
  return error?.message?.includes('Gemini') || 
         error?.code?.includes('gemini') ||
         error?.message?.includes('API');
}

export function isFirebaseError(error: any): boolean {
  return error?.code?.includes('firestore') || 
         error?.code?.includes('auth') ||
         error?.code?.includes('permission');
}
