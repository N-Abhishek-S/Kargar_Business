import { FileText, Download, Eye, Share2, BadgeCheck, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface DocumentShowcaseCardProps {
  title: string;
  description: string;
  fileSize: string;
  version?: string;
  lastUpdated?: string;
  isDownloading: boolean;
  isCopied: boolean;
  onPreview: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export function DocumentShowcaseCard({
  title,
  description,
  fileSize,
  version,
  lastUpdated,
  isDownloading,
  isCopied,
  onPreview,
  onDownload,
  onShare,
}: DocumentShowcaseCardProps) {
  return (
    <div className="relative bg-[#FFFFFF] border border-[#F3F4F6] rounded-[20px] p-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row gap-[40px] items-center sm:items-start h-full group">
      
      {/* 3D PDF Cover Mockup */}
      <div className="w-[160px] h-[220px] flex-shrink-0 [perspective:1000px] mt-2">
        <div className="relative w-full h-full rounded-[4px] rounded-l-[12px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_12px_24px_rgba(0,0,0,0.08),_inset_4px_0_12px_rgba(0,0,0,0.05)] overflow-hidden transition-transform duration-300 ease-out hover:[transform:translateY(-4px)_rotateY(10deg)_rotateX(5deg)_scale(1.02)] [transform-style:preserve-3d]">
          {/* Book binding shadow */}
          <div className="absolute left-0 top-0 bottom-0 w-[12px] bg-gradient-to-r from-black/10 to-transparent z-10" />
          
          <div className="flex flex-col h-full bg-white relative z-0">
             {/* Logo representation */}
             <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="flex items-center">
                  <div className="grid grid-cols-2 gap-[2px] w-[24px] h-[24px] mr-2">
                    <div className="border-[2px] border-[#3B82F6]" />
                    <div className="border-[2px] border-[#3B82F6]" />
                    <div className="border-[2px] border-[#3B82F6]" />
                    <div className="border-[2px] border-[#3B82F6]" />
                  </div>
                  <span className="text-[#A74423] font-bold text-[18px]">Kargar</span>
                </div>
                <span className="text-[7px] text-[#3B82F6] font-medium mt-1">Window to a Cleaner World</span>
             </div>
             {/* Diagonal geometric shapes */}
             <div className="h-[60px] w-full relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[60px] border-b-[#3B82F6] border-r-[160px] border-r-transparent" />
                <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[60px] border-b-[#A74423] border-l-[100px] border-l-transparent" />
             </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col h-full w-full justify-between">
        
        <div>
          {/* Header Section */}
          <div className="flex items-center mb-[16px]">
            <div className="flex items-center gap-[6px] bg-[#FFF5F2] text-[#A74423] border border-[#FBE6E0] px-[10px] py-[4px] rounded-md text-[11px] font-bold uppercase tracking-wide">
              <ShieldCheck size={14} />
              Official Document
            </div>
          </div>
          
          <h3 className="text-[28px] font-[800] text-[#111827] leading-tight mb-[12px]">{title}</h3>
          <p className="text-[#4B5563] text-[15px] font-[400] leading-relaxed mb-[32px] max-w-[500px]">
            {description}
          </p>

          {/* Metadata Row */}
          <div className="flex flex-row items-center gap-[24px] mb-[32px] flex-wrap">
            <div className="flex flex-col items-start gap-[8px]">
              <div className="bg-[#F9FAFB] p-[10px] rounded-[10px] text-[#6B7280]">
                <FileText size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#111827]">PDF</span>
                <span className="text-[12px] text-[#6B7280]">Format</span>
              </div>
            </div>
            
            <div className="flex flex-col items-start gap-[8px]">
              <div className="bg-[#F9FAFB] p-[10px] rounded-[10px] text-[#6B7280]">
                <Download size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#111827]">{fileSize}</span>
                <span className="text-[12px] text-[#6B7280]">File Size</span>
              </div>
            </div>

            {version && (
              <div className="flex flex-col items-start gap-[8px]">
                <div className="bg-[#F9FAFB] p-[10px] rounded-[10px] text-[#6B7280]">
                  <BadgeCheck size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#111827]">{version}</span>
                  <span className="text-[12px] text-[#6B7280]">Version</span>
                </div>
              </div>
            )}

            {lastUpdated && (
              <div className="flex flex-col items-start gap-[8px]">
                <div className="bg-[#F9FAFB] p-[10px] rounded-[10px] text-[#6B7280]">
                  <Clock size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#111827]">{lastUpdated}</span>
                  <span className="text-[12px] text-[#6B7280]">Last Updated</span>
                </div>
              </div>
            )}
          </div>

          {/* Buttons Row */}
          <div className="flex items-center gap-[12px] mb-[32px] flex-wrap">
            <Button 
              variant="outline"
              onClick={onPreview}
              className="h-[48px] px-[24px] rounded-[12px] border-[#E5E7EB] bg-[#FFFFFF] text-[#111827] font-[600] text-[15px] shadow-sm hover:bg-[#F9FAFB] transition-colors"
            >
              <Eye className="mr-[8px]" size={18} />
              Preview
            </Button>
            
            <Button 
              variant="primary" 
              onClick={onDownload}
              isLoading={isDownloading}
              className="h-[48px] px-[32px] rounded-[12px] bg-[#A74423] hover:bg-[#90391C] text-white font-[600] text-[15px] border-transparent shadow-[0_4px_14px_rgba(167,68,35,0.2)] transition-all flex-1 sm:flex-none"
            >
              <Download className="mr-[8px]" size={18} />
              Download PDF
            </Button>
            
            <button 
              onClick={onShare}
              className="h-[48px] px-[24px] rounded-[12px] border border-[#E5E7EB] flex items-center justify-center text-[#111827] bg-[#FFFFFF] font-[600] text-[15px] shadow-sm hover:bg-[#F9FAFB] transition-all"
              aria-label="Share document link"
            >
              {isCopied ? <CheckCircle2 size={18} className="text-[#10B981] mr-[8px]" /> : <Share2 size={18} className="mr-[8px]" />}
              Share Link
            </button>
          </div>
        </div>

        {/* Trusted Companies Inline Strip */}
        <div className="bg-[#FDF8F6] border border-[#FBE6E0] rounded-[12px] p-[16px] flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <div className="w-[32px] h-[32px] rounded-full bg-[#FFFFFF] shadow-sm flex items-center justify-center text-[#A74423]">
              <ShieldCheck size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-[700] text-[#111827]">Trusted by 100+ organizations</span>
              <span className="text-[11px] text-[#6B7280]">Delivering excellence. Building trust. Creating impact.</span>
            </div>
          </div>
          
          <div className="flex items-center gap-[12px]">
            <span className="text-[12px] font-[800] text-[#111827]">DLF</span>
            <span className="text-[12px] font-[800] text-[#A74423]">Godrej</span>
            <span className="text-[12px] font-[800] text-[#DC2626]">JLL</span>
            <span className="text-[12px] font-[800] bg-[#1E3A8A] text-white px-1">Colliers</span>
            <span className="text-[11px] font-[700] text-[#6B7280] bg-[#F3F4F6] px-1 rounded">+95</span>
          </div>
        </div>

      </div>
    </div>
  );
}
