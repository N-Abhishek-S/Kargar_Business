import { Link } from 'react-router';
import { Header, Footer } from '@/pages/KargarSinglePage';
import { SEO } from '@/components/seo/SEO';
import { buildCanonicalUrl } from '@/lib/seo/canonical';
import { getSeoEntry } from '@/features/seo/registry';
import { ShieldCheck, Mail, MapPin, Phone, Lock } from 'lucide-react';

export function PrivacyPolicyPage() {
  const seoEntry = getSeoEntry('/privacy-policy');

  return (
    <div className="kargar-site kb-site">
      <SEO
        title={seoEntry.title}
        description={seoEntry.description}
        canonicalUrl={buildCanonicalUrl('/privacy-policy')}
        robots={seoEntry.robots}
        breadcrumbItems={[{ label: 'Privacy Policy', href: '#' }]}
      />
      <Header activePath="/privacy-policy" />

      <main className="py-12 md:py-20 bg-slate-50 min-h-[60vh]">
        <div className="kb-container max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <span>›</span>
            <strong className="text-slate-900 font-medium">Privacy Policy</strong>
          </div>

          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200/80 mb-8">
            <div className="flex items-center gap-3 text-amber-600 font-semibold text-sm tracking-wide uppercase mb-3">
              <ShieldCheck size={20} />
              <span>Data Protection & Transparency</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Website Privacy Policy
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              At Kargar Business Services, we value your privacy and are committed to protecting any personal or organizational information you share with us when using our website or requesting facility management services.
            </p>
          </div>

          {/* Main Policy Content */}
          <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8 text-slate-700 leading-relaxed">
            
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
              <p className="mb-3">
                When you visit our website, interact with our services, or submit enquiries, we collect information necessary to respond to requests and deliver business services. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong>Contact & Proposal Requests:</strong> Full name, business email address, phone number, company name, subject, service interest, and any message content submitted through our online forms.</li>
                <li><strong>Technical & Analytics Data:</strong> IP address, browser type, device details, and site usage metrics collected automatically to improve performance and user experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">
                The information collected on this website is used solely for legitimate business purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>To respond to your inquiries, service requests, and proposal submissions.</li>
                <li>To coordinate integrated facility management, housekeeping, security, and maintenance operations.</li>
                <li>To communicate relevant project updates, operational notices, or support responses.</li>
                <li>To ensure site security, prevent fraud, and maintain compliance with technical standards.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">3. Data Protection & Security</h2>
              <p>
                We implement technical and organizational measures to safeguard your information against unauthorized access, alteration, disclosure, or destruction. Access to personal and corporate data is restricted to authorized personnel who require it to perform operational duties.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">4. Cookies & Web Analytics</h2>
              <p>
                Our website uses standard browser cookies and analytics software to enhance navigation, analyze aggregate visitor behavior, and optimize service delivery. You can configure your browser to decline cookies, though some features of the site may function with limited capabilities.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">5. Third-Party Sharing</h2>
              <p>
                We do not sell, rent, or trade your personal information to third parties. Information may only be disclosed if required by applicable legal obligations, regulatory mandates, or to essential technology partners who assist in operating our secure infrastructure.
              </p>
            </section>

            <section className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lock size={22} className="text-amber-600" />
                6. Contact Information & Data Inquiries
              </h2>
              <p className="mb-4 text-slate-600">
                If you have questions regarding this Privacy Policy or wish to update or review your submitted information, please reach out to us:
              </p>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Address:</strong> 301, 3rd Floor, Unity Commercial, Baner, Pune, Maharashtra 411045, India</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-amber-600 shrink-0" />
                  <span><strong>Email:</strong> <a href="mailto:bd@kargar.co.in" className="text-amber-600 hover:underline">bd@kargar.co.in</a></span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-amber-600 shrink-0" />
                  <span><strong>Phone:</strong> <a href="tel:+918788726752" className="text-amber-600 hover:underline">+91 87887 26752</a></span>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PrivacyPolicyPage;
