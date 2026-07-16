import type { DocumentKey, DocumentAnalyticsContext } from '../../config/documents';
import { documentRegistry } from '../../config/documents';

export const trackDocumentInteraction = (
  docKey: DocumentKey,
  action: 'download' | 'preview' | 'copy_link',
  context: DocumentAnalyticsContext
) => {
  const doc = documentRegistry[docKey];

  const eventPayload = {
    event: 'Document Interaction',
    documentId: doc.id,
    documentTitle: doc.title,
    action,
    timestamp: new Date().toISOString(),
    ...context,
  };

  // Log analytics event
  console.log('[Analytics Event]', eventPayload);
};

export const downloadDocument = (docKey: DocumentKey, context?: DocumentAnalyticsContext) => {
  const doc = documentRegistry[docKey];
  if (!doc.available || !doc.downloadEnabled) {
    console.warn(`Download failed: Document ${docKey} is not available or downloads are disabled.`);
    return;
  }

  if (context) {
    trackDocumentInteraction(docKey, 'download', context);
  }

  const absoluteUrl = new URL(doc.file, window.location.origin).toString();

  // Rely on native browser download behavior.
  // The fetch/Blob approach was accidentally fetching the SPA fallback index.html on 404s,
  // causing "blank PDF" generation.
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = absoluteUrl;
  link.download = doc.downloadName;
  // If download is ignored by mobile (e.g. iOS Safari), it will navigate or open the PDF natively.
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
};

export const previewDocument = (docKey: DocumentKey, context?: DocumentAnalyticsContext) => {
  const doc = documentRegistry[docKey];
  if (!doc.available || !doc.previewEnabled) {
    console.warn(`Preview failed: Document ${docKey} is not available or previews are disabled.`);
    return;
  }

  if (context) {
    trackDocumentInteraction(docKey, 'preview', context);
  }

  const absoluteUrl = new URL(doc.file, window.location.origin).toString();
  
  // Use a hidden anchor tag instead of window.open for better mobile popup blocker bypass
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = absoluteUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
};

export const copyDocumentLink = async (docKey: DocumentKey, context?: DocumentAnalyticsContext): Promise<boolean> => {
  const doc = documentRegistry[docKey];
  if (!doc.available || !doc.shareEnabled) {
    console.warn(`Copy Link failed: Document ${docKey} is not available or sharing is disabled.`);
    return false;
  }

  if (context) {
    trackDocumentInteraction(docKey, 'copy_link', context);
  }

  try {
    const url = new URL(doc.file, window.location.origin).toString();
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy link:', error);
    return false;
  }
};

/**
 * Validates that the document assets actually exist.
 * Should be called once during app initialization.
 */
export const validateDocumentAssets = async () => {
  if (typeof window === 'undefined') return;

  const keys = Object.keys(documentRegistry) as DocumentKey[];
  
  await Promise.all(
    keys.map(async (key) => {
      const doc = documentRegistry[key];
      try {
        const response = await fetch(doc.file, { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`[Asset Validation] Missing document: ${doc.filename} at ${doc.file}`);
          documentRegistry[key].available = false;
        } else {
          documentRegistry[key].available = true;
        }
      } catch (error) {
        console.warn(`[Asset Validation] Could not verify document: ${doc.filename}`, error);
        documentRegistry[key].available = false;
      }
    })
  );
};
