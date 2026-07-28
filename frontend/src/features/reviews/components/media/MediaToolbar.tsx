import { useState } from 'react';
import { Trash2, Upload, Download, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface MediaToolbarProps {
  onReplace: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  onDownload?: () => void;
  isReplacing: boolean;
  isDeleting: boolean;
  accept?: string;
  hasMedia: boolean;
}

export function MediaToolbar({
  onReplace,
  onDelete,
  onDownload,
  isReplacing,
  isDeleting,
  accept = 'image/*',
  hasMedia
}: MediaToolbarProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onReplace(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    await onDelete();
  };

  const isLoading = isReplacing || isDeleting;

  return (
    <div className="flex items-center gap-2 mt-2">
      <label
        className={clsx(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-100 h-9 px-3 cursor-pointer",
          isLoading && "pointer-events-none opacity-50"
        )}
      >
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
          disabled={isLoading}
        />
        {isReplacing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        {hasMedia ? 'Replace' : 'Upload'}
      </label>

      {hasMedia && onDownload && (
        <button
          type="button"
          onClick={onDownload}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-100 h-9 px-3"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </button>
      )}

      {hasMedia && (
        showConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-600 font-medium ml-2">Delete?</span>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-9 px-3"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-100 h-9 px-3"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 text-red-600 border border-red-200 bg-white hover:bg-red-50 h-9 px-3 ml-auto"
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete
          </button>
        )
      )}
    </div>
  );
}
