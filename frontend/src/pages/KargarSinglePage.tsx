import { type SyntheticEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useInView } from 'react-intersection-observer';
import CountUpModule from 'react-countup';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  Clock,
  Cpu,
  Factory,
  Globe,
  Headphones,
  Home,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Menu,
  Phone,
  Plane,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  SprayCan,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { submitContactMessage } from '@/services/contact.service';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { TrustedClientsSection } from '@/features/reviews/components/TrustedClientsSection';

const CountUp =
  typeof CountUpModule === 'function'
    ? CountUpModule
    : (CountUpModule as unknown as { default: typeof CountUpModule }).default;

interface NavItem {
  label: string;
  href: string;
  children?: string[];
}

interface ServiceItem {
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
}

interface StatItem {
  value: string;
  label: string;
  note?: string;
  icon: LucideIcon;
  accent?: boolean;
  countTo?: number;
  suffix?: string;
}

interface FeatureItem {
  title: string;
  text: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services',
    children: ['Soft Services', 'Hard Services', 'Security Services', 'Housekeeping Services', 'Facility Support'],
  },
  {
    label: 'Sectors',
    href: '/sectors',
    children: ['IT Parks', 'Manufacturing', 'Airport Lounge', 'Corporate Offices'],
  },
  { label: 'Company Profile', href: '/company-profile' },
  { label: 'Support', href: '/support' },
  { label: 'Contact Us', href: '/contact-us' },
];

const services: ServiceItem[] = [
  {
    title: 'Soft Services',
    description: 'Housekeeping, pantry, security, waste management and more to keep your environment clean and hygienic.',
    image: '/images/page/card-soft-services.webp',
    icon: Sparkles,
  },
  {
    title: 'Hard Services',
    description: 'Electrical, HVAC, plumbing, firefighting, civil & building maintenance for smooth & reliable operations.',
    image: '/images/page/card-hard-services.webp',
    icon: Wrench,
  },
  {
    title: 'Security Services',
    description: 'Professional security personnel and advanced surveillance solutions to ensure safety 24/7.',
    image: '/images/page/card-security-services.webp',
    icon: ShieldCheck,
  },
  {
    title: 'Housekeeping Services',
    description: 'High-quality cleaning solutions for workplaces, ensuring hygiene, health, and a great first impression.',
    image: '/images/page/card-housekeeping-services.webp',
    icon: SprayCan,
  },
  {
    title: 'Facility Support',
    description: 'Manpower, helpdesk, admin support and customized facility management solutions.',
    image: '/images/page/card-facility-support.webp',
    icon: Headphones,
  },
];

const heroStats: StatItem[] = [
  { value: '10+', countTo: 10, suffix: '+', label: 'Years of Experience', icon: ShieldCheck },
  { value: '2,000+', countTo: 2000, suffix: '+', label: 'Skilled Workforce', icon: Users },
  { value: '50+', countTo: 50, suffix: '+', label: 'Sites Managed', icon: Building2 },
  { value: '10,000+', countTo: 10000, suffix: '+', label: 'Happy Clients', icon: Smile },
];

const serviceStats: StatItem[] = [
  { value: '10+', label: 'Years of Experience', note: 'Delivering excellence consistently.', icon: ShieldCheck },
  { value: '2,000+', label: 'Skilled Workforce', note: 'Trained, verified & well-equipped teams.', icon: Users },
  { value: '50+', label: 'Sites Managed', note: 'Pan India presence with strong operational network.', icon: Building2 },
  { value: '10,000+', label: 'Happy Clients', note: 'Building long-term partnerships.', icon: Smile },
  { value: '5+', label: 'Cities Pan India', note: 'Expanding our footprint across the nation.', icon: MapPin, accent: true },
];

const serviceHeroFeatures: FeatureItem[] = [
  { title: 'People First', text: 'Trained & Verified Staff', icon: Users },
  { title: 'Technology Driven', text: 'Smart & Efficient Operations', icon: Cpu },
  { title: 'Quality Assured', text: 'Strict Quality Standards', icon: BadgeCheck },
  { title: 'Sustainable Practices', text: 'Eco-friendly Solutions', icon: Leaf },
];

const contactHighlights: FeatureItem[] = [
  { title: 'Quick Response', text: 'We aim to respond within 24 hours', icon: Headphones },
  { title: 'Expert Support', text: 'Talk to our facility management experts', icon: Users },
  { title: 'Trusted Partner', text: 'Reliable solutions for your business', icon: BadgeCheck },
];

const operatingCities = ['Mumbai', 'Pune', 'Delhi', 'Bengaluru', 'Hyderabad'];

const routeSectionMap: Record<string, string> = {
  '/sectors': 'sectors',
  '/company-profile': 'company-profile',
  '/support': 'support',
};

function isActiveRoute(currentPath: string, href: string) {
  if (href === '/') return currentPath === '/';
  if (href === '/contact-us') return currentPath === '/contact-us' || currentPath === '/contact';
  return currentPath === href;
}

function KargarButton({
  children,
  href,
  variant = 'primary',
  type = 'button',
}: {
  children: string;
  href?: string;
  variant?: 'primary' | 'dark' | 'outline';
  type?: 'button' | 'submit';
}) {
  const className = `kb-btn kb-btn--${variant}`;
  if (href) {
    return (
      <a className={className} href={href}>
        {children}
        <ArrowRight size={18} />
      </a>
    );
  }

  return (
    <button className={className} type={type}>
      {children}
      <ArrowRight size={18} />
    </button>
  );
}

function Header({ activePath }: { activePath: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const contactPage = activePath === '/contact' || activePath === '/contact-us';

  return (
    <header className="kb-header">
      <div className="kb-topbar">
        <div className="kb-container kb-topbar__inner">
          <div className="kb-topbar__left">
            <a href="mailto:bd@kargar.co.in"><Mail size={15} /> bd@kargar.co.in</a>
            <span aria-hidden="true" />
            <a href="tel:+918788726752"><Phone size={15} /> {contactPage ? '+91 87887 26752' : '+91-8788726752'}</a>
            <span aria-hidden="true" />
            {contactPage ? (
              <a href="#contact-form"><Clock size={15} /> Mon - Sat: 09:00 AM - 06:00 PM</a>
            ) : (
              <a href="tel:+919226903010"><Phone size={15} /> +91-9226903010</a>
            )}
          </div>
          <div className="kb-socials" aria-label="Social links">
            {contactPage ? <strong>Follow Us:</strong> : null}
            <a href="https://facebook.com" aria-label="Facebook">f</a>
            <a href="https://instagram.com" aria-label="Instagram">◎</a>
            <a href="https://linkedin.com" aria-label="LinkedIn">in</a>
            <a href="https://youtube.com" aria-label="YouTube">▶</a>
          </div>
        </div>
      </div>

      <div className="kb-nav">
        <div className="kb-container kb-nav__inner">
          <a className="kb-logo" href="/" aria-label="Kargar home">
            <BrandLogo />
          </a>

          <nav className={`kb-menu ${isOpen ? 'is-open' : ''}`} aria-label="Main navigation">
            {navItems.map((item) => (
              <div className="kb-menu__item" key={item.label}>
                <a
                  className={isActiveRoute(activePath, item.href) ? 'is-active' : undefined}
                  href={item.href}
                  onClick={() => { setIsOpen(false); }}
                >
                  {item.label}
                </a>
                {item.children ? <ChevronDown size={15} /> : null}
                {item.children ? (
                  <div className="kb-dropdown">
                    {item.children.map((child) => <a href={item.href} key={child}>{child}</a>)}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>

          <div className="kb-nav__actions">
            <a className="kb-call" href="tel:+918788726752">
              <span><Phone size={24} /></span>
              <small>Call for More Information</small>
              <strong>+91-8788726752</strong>
            </a>
            <KargarButton href="/contact-us">Request Proposal</KargarButton>
            <button
              className="kb-mobile"
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
              onClick={() => { setIsOpen((value) => !value); }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="kb-section-title">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <span aria-hidden="true" />
    </div>
  );
}

function HomeHero() {
  return (
    <section className="kb-home-hero" id="home">
      <img className="kb-home-hero__image" src="/images/page/hero-building.webp" alt="" aria-hidden="true" />
      <div className="kb-home-hero__wash" />
      <div className="kb-container kb-home-hero__inner">
        <div className="kb-home-hero__copy">
          <p className="kb-eyebrow kb-eyebrow--line">Integrated Facility Management Solutions</p>
          <h1>
            Reliable Facility <br className="kb-mobile-line" />
            Management <br className="kb-mobile-line" />
            Solutions that keep <br className="kb-mobile-line" />
            your Business{' '}
            <span>Running Seamlessly</span>
          </h1>
          <p>We deliver integrated facility management services that ensure clean, safe, efficient, and productive environments.</p>
          <div className="kb-actions">
            <KargarButton href="/services" variant="dark">Explore Services</KargarButton>
            <KargarButton href="/contact-us">Request Proposal</KargarButton>
          </div>
        </div>
      </div>
      <div className="kb-container">
        <StatsOverlay stats={heroStats} />
      </div>
    </section>
  );
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

function AnimatedStatValue({
  value,
  countTo,
  suffix = '',
  active,
  reducedMotion,
  delay,
}: {
  value: string;
  countTo?: number;
  suffix?: string;
  active: boolean;
  reducedMotion: boolean;
  delay: number;
}) {
  if (reducedMotion) {
    return <>{value}</>;
  }

  if (!active || countTo === undefined) {
    return <>0{suffix}</>;
  }

  return (
    <CountUp
      start={0}
      end={countTo}
      duration={2.15}
      delay={delay}
      suffix={suffix}
      separator=","
      useEasing
    />
  );
}

function StatsOverlay({ stats }: { stats: StatItem[] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.35 });
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="kb-hero-stats" ref={ref} role="list" aria-label="Kargar operational performance statistics">
      {stats.map(({ value, countTo, suffix, label, icon: Icon }, index) => (
        <article key={label} role="listitem" aria-label={`${value} ${label}`}>
          <span className="kb-hero-stat-card__icon" aria-hidden="true">
            <Icon size={34} strokeWidth={2.35} />
          </span>
          <div>
            <strong className="kb-hero-stat-card__value" aria-hidden="true">
              <AnimatedStatValue
                value={value}
                countTo={countTo}
                suffix={suffix}
                active={inView}
                reducedMotion={prefersReducedMotion}
                delay={index * 0.12}
              />
            </strong>
            <span className="kb-hero-stat-card__label">{label}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function ClientStrip() {
  return <TrustedClientsSection />;
}

function ServicesGrid({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`kb-services-section ${compact ? 'kb-services-section--compact' : ''}`} id="services">
      <div className="kb-container">
        <SectionTitle
          eyebrow={compact ? 'What We Do' : 'What We Offer'}
          title="Our Integrated Facility Management Services"
        />
        <div className="kb-services-grid">
          {services.map(({ title, description, image, icon: Icon }) => (
            <article className="kb-service-card" key={title}>
              <img src={image} alt={title} loading="lazy" />
              <span className="kb-service-card__icon"><Icon size={31} /></span>
              <div className="kb-service-card__body">
                <h3>{title}</h3>
                <p>{description}</p>
                <a href="/contact-us">Learn More <ArrowRight size={16} /></a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesHero() {
  return (
    <section className="kb-services-hero">
      <img src="/images/page/services-hero.webp" alt="" aria-hidden="true" />
      <div className="kb-services-hero__shade" />
      <div className="kb-container kb-services-hero__inner">
        <div className="kb-services-hero__copy">
          <p className="kb-eyebrow">Our Services</p>
          <h1>Integrated Facility Management <span>Solutions for Every Need</span></h1>
          <p>
            We offer comprehensive facility management services tailored to meet the unique requirements of your business.
            Our solutions ensure efficiency, safety, and sustainability across all your operations.
          </p>
        </div>
      </div>
      <FeaturePill />
    </section>
  );
}

function FeaturePill() {
  return (
    <div className="kb-feature-pill">
      {serviceHeroFeatures.map(({ title, text, icon: Icon }) => (
        <article key={title}>
          <span><Icon size={24} /></span>
          <div>
            <strong>{title}</strong>
            <small>{text}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

function StatsBand() {
  return (
    <section className="kb-container">
      <div className="kb-stats-band">
        {serviceStats.map(({ value, label, note, icon: Icon, accent }) => (
          <article className={accent ? 'is-accent' : undefined} key={label}>
            <span><Icon size={35} /></span>
            <div>
              <strong>{value}</strong>
              <h3>{label}</h3>
              <p>{note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CompanyProfile() {
  return (
    <section className="kb-company" id="company-profile">
      <div className="kb-container kb-company__grid">
        <div>
          <p className="kb-eyebrow">Company Profile</p>
          <h2>Facility teams that keep operations moving</h2>
          <p>
            Kargar Business Services delivers integrated facility management across soft services, hard services,
            security, housekeeping, and support operations with trained teams and dependable processes.
          </p>
        </div>
        <div className="kb-company__cards">
          <article><ShieldCheck size={30} /><strong>Quality Assured</strong><span>Strict operating standards</span></article>
          <article><Users size={30} /><strong>Verified Workforce</strong><span>Trained service teams</span></article>
          <article><Cpu size={30} /><strong>Technology Driven</strong><span>Transparent operations</span></article>
        </div>
      </div>
    </section>
  );
}

function SectorsSupport() {
  const sectors = [
    { title: 'IT Parks', icon: Building2 },
    { title: 'Manufacturing', icon: Factory },
    { title: 'Airport Lounges', icon: Plane },
    { title: 'Corporate Offices', icon: Home },
  ];

  return (
    <section className="kb-sectors" id="sectors">
      <div className="kb-container">
        <SectionTitle eyebrow="Sectors" title="Built for high-performance business environments" />
        <div className="kb-sector-grid">
          {sectors.map(({ title, icon: Icon }) => (
            <article key={title}>
              <Icon size={34} />
              <h3>{title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupportBand() {
  return (
    <section className="kb-support" id="support">
      <div className="kb-container kb-support__inner">
        <div>
          <p className="kb-eyebrow">Support</p>
          <h2>Fast response. Expert coordination. Reliable follow-through.</h2>
        </div>
        <KargarButton href="/contact-us">Talk to Our Team</KargarButton>
      </div>
    </section>
  );
}

function ContactPage() {
  return (
    <section className="kb-contact-page" id="contact">
      <div className="kb-container kb-contact-grid">
        <div className="kb-contact-left">
          <div className="kb-breadcrumb"><a href="/">Home</a><span>›</span><strong>Contact Us</strong></div>
          <h1>Get in Touch <span>We&apos;re Here to Help!</span></h1>
          <p>Have a question, need a proposal, or want to learn more about our facility management solutions? Our team is ready to assist you.</p>
          <div className="kb-contact-highlights">
            {contactHighlights.map(({ title, text, icon: Icon }) => (
              <article key={title}>
                <span><Icon size={24} /></span>
                <div><strong>{title}</strong><small>{text}</small></div>
              </article>
            ))}
          </div>

          <div className="kb-info-card">
            <div className="kb-info-card__copy">
              <h2>Get in Touch</h2>
              <p>Reach out to us using any of the following channels.</p>
              <img src="/images/page/contact-building.webp" alt="Modern Kargar office building" />
            </div>
            <div className="kb-info-list">
              <ContactInfo icon={MapPin} title="Our Office" text="301, 3rd Floor, Unity Commercial, Baner, Pune, Maharashtra 411045, India" />
              <ContactInfo icon={Phone} title="Call Us" text="+91 87887 26752|Mon - Sat: 09:00 AM - 06:00 PM" />
              <ContactInfo icon={Mail} title="Email Us" text="bd@kargar.co.in|We'll reply as soon as possible" />
              <ContactInfo icon={Globe} title="Website" text="www.kargar.co.in|Visit our website for more information" />
            </div>
          </div>
          <MapPreview />
        </div>

        <div className="kb-contact-right">
          <ContactForm />
          <OperationsCard />
        </div>
      </div>
    </section>
  );
}

function ContactInfo({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  const lines = text.split('|');
  return (
    <article>
      <span><Icon size={24} /></span>
      <div>
        <strong>{title}</strong>
        {lines.map((line) => <p key={line}>{line}</p>)}
      </div>
    </article>
  );
}

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);

    try {
      const result = await submitContactMessage({
        name: getFormString(formData, 'name'),
        email: getFormString(formData, 'email'),
        phone: getFormString(formData, 'phone'),
        company: getFormString(formData, 'company'),
        subject: getFormString(formData, 'subject'),
        message: getFormString(formData, 'message'),
      });

      if (result.emailSent) {
        toast.success('Proposal submitted successfully! Our team will contact you shortly.');
      } else {
        toast.success('Proposal received successfully! Our team has your request.\nEmail notification is temporarily unavailable.', { duration: 5000 });
      }

      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit request. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="kb-contact-form" id="contact-form" onSubmit={onSubmit}>
      <h2>Send Us a Message</h2>
      <p>Fill out the form below and we&apos;ll get back to you shortly.</p>
      <div className="kb-form-grid">
        <label>Full Name <b>*</b><input name="name" placeholder="Enter your full name" required /></label>
        <label>Email Address <b>*</b><input name="email" type="email" placeholder="Enter your email address" required /></label>
        <label>Phone Number <b>*</b><input name="phone" placeholder="Enter your phone number" required /></label>
        <label>Company Name <b>*</b><input name="company" placeholder="Enter your company name" required /></label>
      </div>
      <label>Subject <b>*</b><input name="subject" placeholder="How can we help you?" required /></label>
      <label>Message <b>*</b><textarea name="message" placeholder="Type your message here..." rows={5} required /></label>
      <button className="kb-btn kb-btn--primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'} <Send size={18} />
      </button>
      <small><Lock size={15} /> We respect your privacy. Your information is safe with us.</small>
    </form>
  );
}

function MapPreview() {
  return (
    <div className="kb-map-preview" aria-label="Office area map preview">
      <span>Baner</span>
      <span>Pashan Rd</span>
      <span>Balewadi High Street</span>
      <MapPin size={46} />
    </div>
  );
}

function OperationsCard() {
  return (
    <section className="kb-operations">
      <h2>We Operate Across India</h2>
      <p>With a strong presence in 50+ sites across 5+ cities, we are always close to you.</p>
      <div>
        {operatingCities.map((city) => (
          <article key={city}>
            <Building2 size={34} />
            <strong>{city}</strong>
          </article>
        ))}
      </div>
      <KargarButton href="/sectors" variant="outline">View All Locations</KargarButton>
    </section>
  );
}

function Footer() {
  return (
    <footer className="kb-footer">
      <div className="kb-container kb-footer__inner">
        <BrandLogo />
        <span>Copyright 2026 Kargar Business Services. All rights reserved.</span>
      </div>
    </footer>
  );
}

function HomePage() {
  return (
    <>
      <HomeHero />
      <ClientStrip />
      <ServicesGrid compact />
      <CompanyProfile />
      <SectorsSupport />
      <ReviewsSection />
      <SupportBand />
    </>
  );
}

function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <ServicesGrid />
      <StatsBand />
    </>
  );
}

export function KargarSinglePage() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = 'Kargar Business Services';
  }, []);

  useEffect(() => {
    const target = routeSectionMap[pathname];
    if (!target) return;
    window.requestAnimationFrame(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }, [pathname]);

  const isServices = pathname === '/services';
  const isContact = pathname === '/contact-us' || pathname === '/contact';

  return (
    <div className="kargar-site kb-site">
      <Header activePath={pathname} />
      <main>
        {isContact ? <ContactPage /> : isServices ? <ServicesPage /> : <HomePage />}
      </main>
      <Footer />
    </div>
  );
}
