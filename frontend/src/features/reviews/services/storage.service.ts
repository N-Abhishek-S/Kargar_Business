/**
 * Storage Service — localStorage + IndexedDB for draft recovery
 *
 * Stores recording drafts in IndexedDB (supports large blobs).
 * Falls back to localStorage for small data like device selections.
 */

import { StorageLogger } from './logger.service';
import { StorageKeys } from '../config/recorder.config';
import type { RecordingDraft } from '../types/video-recorder.types';

/* ================================================================
   IndexedDB — Draft Storage
   ================================================================ */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(StorageKeys.DRAFT_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(StorageKeys.DRAFT_STORE_NAME)) {
        db.createObjectStore(StorageKeys.DRAFT_STORE_NAME, { keyPath: 'id' });
        StorageLogger.info('IndexedDB store created');
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      StorageLogger.error('IndexedDB open failed', {
        error: request.error?.message,
      });
      reject(request.error);
    };
  });
}

export async function saveDraft(draft: RecordingDraft): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(StorageKeys.DRAFT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(StorageKeys.DRAFT_STORE_NAME);
    store.put(draft);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    StorageLogger.info('Draft saved', { id: draft.id, size: draft.blob.size });
  } catch (err) {
    StorageLogger.error('Failed to save draft', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function loadDraft(): Promise<RecordingDraft | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(StorageKeys.DRAFT_STORE_NAME, 'readonly');
    const store = tx.objectStore(StorageKeys.DRAFT_STORE_NAME);
    const request = store.getAll();

    const drafts = await new Promise<RecordingDraft[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (drafts.length === 0) return null;

    // Return the most recent draft
    drafts.sort((a, b) => b.createdAt - a.createdAt);
    StorageLogger.info('Draft loaded', { id: drafts[0]!.id });
    return drafts[0] ?? null;
  } catch (err) {
    StorageLogger.error('Failed to load draft', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function deleteDraft(id?: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(StorageKeys.DRAFT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(StorageKeys.DRAFT_STORE_NAME);

    if (id) {
      store.delete(id);
    } else {
      store.clear();
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    StorageLogger.info('Draft deleted', { id: id ?? 'all' });
  } catch (err) {
    StorageLogger.error('Failed to delete draft', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function hasDraft(): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction(StorageKeys.DRAFT_STORE_NAME, 'readonly');
    const store = tx.objectStore(StorageKeys.DRAFT_STORE_NAME);
    const request = store.count();

    const count = await new Promise<number>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return count > 0;
  } catch {
    return false;
  }
}
