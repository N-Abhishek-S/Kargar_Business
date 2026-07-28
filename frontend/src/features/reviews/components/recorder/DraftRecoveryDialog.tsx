/**
 * Draft Recovery Dialog — Restore or discard previous recording
 */

import { Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import type { DraftRecoveryDialogProps } from '../../types/video-recorder.types';
import { recorderStrings } from '../../i18n/recorder.i18n';

export function DraftRecoveryDialog({
  draft,
  onRestore,
  onDiscard,
}: DraftRecoveryDialogProps) {
  // Compute the "ago" label once at mount time, avoiding Date.now() during render.
  const [agoLabel] = useState(() => {
    const agoMs = Date.now() - draft.createdAt;
    const agoMinutes = Math.floor(agoMs / 60_000);
    if (agoMinutes < 1) return 'Just now';
    if (agoMinutes < 60) return `${agoMinutes} min ago`;
    return `${Math.floor(agoMinutes / 60)}h ago`;
  });

  return (
    <div className="flex flex-col items-center text-center py-8 px-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-500/15 mb-4">
        <Save size={26} className="text-orange-400" />
      </div>

      <h3 className="text-base font-semibold text-white mb-1">
        {recorderStrings.draftFoundTitle}
      </h3>

      <p className="text-sm text-gray-400 max-w-sm mb-1">
        {recorderStrings.draftFoundDescription}
      </p>

      <p className="text-xs text-gray-500 mb-6">
        Saved {agoLabel}
      </p>

      {/* Thumbnail preview if available */}
      {draft.thumbnail && (
        <div className="w-40 h-24 rounded-lg overflow-hidden mb-5 ring-1 ring-white/10">
          <img src={draft.thumbnail} alt="Draft thumbnail" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRestore}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold',
            'text-white bg-orange-500 hover:bg-orange-600',
            'transition-all duration-200 recorder-focus-ring',
          )}
        >
          <Save size={16} />
          {recorderStrings.restoreDraft}
        </button>

        <button
          type="button"
          onClick={onDiscard}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium',
            'text-gray-300 bg-white/10 hover:bg-white/15',
            'transition-all duration-200 recorder-focus-ring',
          )}
        >
          <Trash2 size={16} />
          {recorderStrings.discardDraft}
        </button>
      </div>
    </div>
  );
}
