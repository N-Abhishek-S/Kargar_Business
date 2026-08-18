import { Link } from 'react-router';
import { useDocument } from '@/shared/hooks/useDocument';
import { DocumentShowcaseCard } from './DocumentShowcaseCard';
import { CompanyStatsList } from './CompanyStatsList';
import { ExecutiveFeatureCard } from './ExecutiveFeatureCard';
import { companyTrust } from './companyTrust';

export function CompanyProfileSection() {
  const { doc, isDownloading, isCopied, handlePreview, handleDownload, handleCopyLink } = useDocument('companyProfile', {
    page: '/#company-profile',
    ctaPosition: 'section-body'
  });

  return (
    <section id="company-profile" className="relative py-[72px] bg-[#FFFFFF] overflow-hidden">
      {/* Max width 1400px, centered */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-[32px] relative z-10 flex flex-col gap-[32px]">
        
        {/* Top: Header - Left Aligned */}
        <div className="flex flex-col items-start w-full max-w-[720px]">
          <span className="text-[#A74423] font-[700] tracking-widest text-[13px] uppercase mb-[12px]">
            COMPANY PROFILE
          </span>
          <h2 className="text-[40px] md:text-[56px] font-[800] text-[#111827] leading-[1.05] tracking-[-0.02em] mb-[16px]">
            Facility teams that <br/>
            keep operations moving
          </h2>
          <p className="text-[18px] md:text-[18px] font-[400] text-[#4B5563] leading-relaxed">
            Kargar Business Services delivers integrated facility management across
            soft services,{' '}
            <Link to="/services/hard-services" className="text-[#A74423] font-[600] underline underline-offset-2 hover:text-[#8a3319] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#A74423]">
              hard services
            </Link>
            , security, and support operations, including{' '}
            <Link to="/services/soft-services/housekeeping" className="text-[#A74423] font-[600] underline underline-offset-2 hover:text-[#8a3319] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#A74423]">
              professional housekeeping services in Pune
            </Link>
            , with trained teams and dependable processes.
          </p>
        </div>

        {/* Middle: 65% / 35% Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-[24px] items-stretch">
          {/* Left Column (65%) */}
          <div className="w-full flex flex-col h-full">
            <DocumentShowcaseCard
              title="Company Profile"
              description="Discover our journey, core values, service capabilities, key industries, and the commitment that drives excellence in everything we do."
              fileSize={doc.fileSize}
              version={doc.content.version}
              lastUpdated={doc.content.lastUpdated}
              isDownloading={isDownloading}
              isCopied={isCopied}
              onPreview={handlePreview}
              onDownload={handleDownload}
              onShare={handleCopyLink}
            />
          </div>

          {/* Right Column (35%) */}
          <div className="w-full flex flex-col gap-[20px] h-full justify-between">
            {companyTrust.slice(0, 3).map((card, idx) => (
              <ExecutiveFeatureCard key={idx} card={card} />
            ))}
          </div>
        </div>

        {/* Bottom: Statistics */}
        <CompanyStatsList />
      </div>
    </section>
  );
}
