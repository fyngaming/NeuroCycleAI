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

/**
 * Log error ke Firestore dengan deduplication
 * Jika error yang sama terjadi dalam 5 menit, increment count saja
 */
export async function logError(entry: ErrorLogEntry) {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

    // Check if similar error already exists (last 5 minutes)
    const q = query(
      collection(db, 'errorLogs'),
      where('type', '==', entry.type),
      where('context', '==', entry.context),
      where('timestamp', '>=', Timestamp.fromDate(fiveMinutesAgo))
    );

    const existingErrors = await getDocs(q);

    if (!existingErrors.empty) {
      // Increment count jika error sama masih recent
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
      // Add new error log
      await addDoc(collection(db, 'errorLogs'), {
        ...entry,
        timestamp: Timestamp.fromDate(now),
        count: 1,
        lastOccurred: Timestamp.fromDate(now),
        status: 'unresolved', // unresolved | acknowledged | fixed
        adminNotes: '',
        affectedUsers: entry.userId ? [entry.userId] : [],
        resolved: false
      });
    }

    // Console log untuk development
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

    // Alert jika CRITICAL
    if (entry.severity === 'CRITICAL') {
      console.warn('🚨 CRITICAL ERROR - Admin harus segera dinotifikasi!');
      // TODO: Setup webhook/Telegram notification untuk admin nanti
    }
  } catch (e) {
    console.error('❌ Failed to log error to Firestore:', e);
    // Fallback: log ke console saja
    console.error('Original error:', entry);
  }
}

/**
 * Wrap async function dengan error logging
 * Gunakan: const result = await withErrorLogging(() => someAsyncFunction(), 'context', userId);
 */
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

/**
 * Utility untuk wrap Gemini API errors
 */
export function isGeminiError(error: any): boolean {
  return error?.message?.includes('Gemini') || 
         error?.code?.includes('gemini') ||
         error?.message?.includes('API');
}

/**
 * Utility untuk wrap Firebase errors
 */
export function isFirebaseError(error: any): boolean {
  return error?.code?.includes('firestore') || 
         error?.code?.includes('auth') ||
         error?.code?.includes('permission');
}
