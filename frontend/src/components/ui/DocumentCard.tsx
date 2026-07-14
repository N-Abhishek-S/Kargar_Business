import React from 'react';
import { FileText, Download, Eye, Share2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { useDocument } from '../../shared/hooks/useDocument';
import type { DocumentKey, DocumentAnalyticsContext } from '../../config/documents';

interface DocumentCardProps {
  docKey: DocumentKey;
  analyticsContext?: DocumentAnalyticsContext;
  className?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ docKey, analyticsContext, className = '' }) => {
  const {
    doc,
    isDownloading,
    isCopied,
    toastMessage,
    handleDownload,
    handlePreview,
    handleCopyLink,
  } = useDocument(docKey, analyticsContext);

  const isAvailable = doc.available;

  return (
    <div className={`relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md ${!isAvailable ? 'opacity-80 grayscale-[0.2]' : ''} ${className}`}>
      {/* Toast Notification Overlay */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-10 animate-fade-in bg-slate-800 text-white text-xs px-3 py-2 rounded shadow-lg flex items-center gap-2">
          {isCopied ? <CheckCircle size={14} className="text-green-400" /> : <Download size={14} className="animate-bounce" />}
          {toastMessage}
        </div>
      )}

      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          
          {/* Icon/Thumbnail Column */}
          <div className="flex-shrink-0">
            {doc.thumbnail ? (
              <div className="w-16 h-16 md:w-24 md:h-24 rounded bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                <img src={doc.thumbnail} alt={`${doc.title} Thumbnail`} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <FileText size={32} />
              </div>
            )}
          </div>

          {/* Content Column */}
          <div className="flex-grow">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-navy-900 m-0">{doc.title}</h3>
              {!isAvailable && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200" title="Document is temporarily unavailable. Please contact Kargar.">
                  <AlertCircle size={12} />
                  Coming Soon
                </span>
              )}
            </div>
            
            <p className="text-slate-600 mb-4 text-sm md:text-base leading-relaxed max-w-2xl">
              {doc.description}
            </p>

            {/* Metadata tags */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs font-medium text-slate-500 mb-6">
              <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase tracking-wider">{doc.fileType}</span>
              <span className="flex items-center before:content-['•'] before:mr-3 before:text-slate-300">{doc.fileSize}</span>
              <span className="flex items-center before:content-['•'] before:mr-3 before:text-slate-300">Version {doc.content.version}</span>
              <span className="flex items-center before:content-['•'] before:mr-3 before:text-slate-300">Updated {doc.content.lastUpdated}</span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {doc.previewEnabled && (
                <Button 
                  variant="outline" 
                  size="md"
                  onClick={handlePreview}
                  disabled={!isAvailable}
                  className="font-semibold"
                  aria-label={`Preview ${doc.title}`}
                >
                  <Eye size={16} className="mr-2" />
                  Preview
                </Button>
              )}
              
              {doc.downloadEnabled && (
                <Button 
                  variant="primary" 
                  size="md"
                  onClick={handleDownload}
                  disabled={!isAvailable || isDownloading}
                  className="font-semibold shadow-sm hover:shadow"
                  aria-label={`Download ${doc.title}`}
                >
                  <Download size={16} className="mr-2" />
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
              )}

              {doc.shareEnabled && (
                <button 
                  onClick={handleCopyLink}
                  disabled={!isAvailable}
                  className="ml-auto text-slate-400 hover:text-navy-600 transition-colors p-2 rounded-full hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-600 disabled:opacity-50"
                  aria-label="Copy document link"
                  title="Copy link"
                >
                  <Share2 size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
