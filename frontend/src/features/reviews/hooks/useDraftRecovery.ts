/**
 * useDraftRecovery — Crash recovery via IndexedDB
 */

import { useState, useCallback, useEffect } from 'react';
import { saveDraft as saveToStorage, loadDraft, deleteDraft } from '../services/storage.service';
import { StorageLogger } from '../services/logger.service';
import { RecorderFlags } from '../config/recorder.config';
import type { RecordingDraft, VideoMetadata, UseDraftRecoveryReturn } from '../types/video-recorder.types';

// Extract flag to a runtime variable so TypeScript doesn't narrow `true as const`
const draftRecoveryEnabled: boolean = RecorderFlags.ENABLE_DRAFT_RECOVERY;

export function useDraftRecovery(): UseDraftRecoveryReturn {
  const [hasDraft, setHasDraft] = useState(false);
  const [draft, setDraft] = useState<RecordingDraft | null>(null);

  // Check for existing draft on mount
  useEffect(() => {
    if (!draftRecoveryEnabled) return;

    void (async () => {
      const existing = await loadDraft();
      if (existing) {
        setDraft(existing);
        setHasDraft(true);
        StorageLogger.info('Draft found', { id: existing.id });
      }
    })();
  }, []);

  const saveDraft = useCallback(
    async (blob: Blob, metadata: VideoMetadata, thumbnail: string) => {
      if (!draftRecoveryEnabled) return;

      const draftData: RecordingDraft = {
        id: crypto.randomUUID(),
        blob,
        metadata,
        thumbnail,
        createdAt: Date.now(),
      };

      await saveToStorage(draftData);
      setDraft(draftData);
      setHasDraft(true);
    },
    [],
  );

  const restoreDraft = useCallback(async () => {
    const existing = await loadDraft();
    if (existing) {
      StorageLogger.info('Draft restored', { id: existing.id });
    }
    return existing;
  }, []);

  const discardDraft = useCallback(async () => {
    await deleteDraft();
    setDraft(null);
    setHasDraft(false);
    StorageLogger.info('Draft discarded');
  }, []);

  return { hasDraft, draft, saveDraft, restoreDraft, discardDraft };
}
