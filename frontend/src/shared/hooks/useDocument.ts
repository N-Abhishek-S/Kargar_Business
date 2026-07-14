import { useState, useEffect, useCallback, useRef } from 'react';
import type { DocumentKey, DocumentAnalyticsContext } from '../../config/documents';
import { documentRegistry } from '../../config/documents';
import { downloadDocument, previewDocument, copyDocumentLink } from '../utils/document';

export function useDocument(docKey: DocumentKey, context?: DocumentAnalyticsContext) {
  const [doc, setDoc] = useState(documentRegistry[docKey]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync doc in case validation updates it asynchronously
  useEffect(() => {
    // Poll briefly to catch any async asset validation changes
    const interval = setInterval(() => {
      setDoc({...documentRegistry[docKey]}); // Clone to trigger re-render if properties mutated
    }, 1000);
    
    const timeout = setTimeout(() => { clearInterval(interval); }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [docKey]);

  const showToast = useCallback((msg: string, duration = 3000) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, duration);
  }, []);

  const handleDownload = useCallback(() => {
    if (!doc.available || !doc.downloadEnabled) return;
    setIsDownloading(true);
    showToast(`${doc.title} download started...`);
    downloadDocument(docKey, context);
    
    setTimeout(() => { setIsDownloading(false); }, 2000);
  }, [doc, docKey, context, showToast]);

  const handlePreview = useCallback(() => {
    if (!doc.available || !doc.previewEnabled) return;
    previewDocument(docKey, context);
  }, [doc, docKey, context]);

  const handleCopyLink = useCallback(async () => {
    if (!doc.available || !doc.shareEnabled) return;
    const success = await copyDocumentLink(docKey, context);
    if (success) {
      setIsCopied(true);
      showToast('Link copied to clipboard');
      setTimeout(() => { setIsCopied(false); }, 2000);
    } else {
      showToast('Failed to copy link');
    }
  }, [doc, docKey, context, showToast]);

  // Clean up toast timeout
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) { clearTimeout(toastTimeoutRef.current); }
    };
  }, []);

  return {
    doc,
    isDownloading,
    isCopied,
    toastMessage,
    handleDownload,
    handlePreview,
    handleCopyLink,
  };
}
