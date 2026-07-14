import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { config } from '@/config';
import { BrandLogo } from '../ui/BrandLogo';
import { subscribeToNewsletter } from '@/services/newsletter.service';

// Inline SVGs for social icons to avoid lucide-react brand icon issues
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
);
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const subscribeSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'),
});

type SubscribeFormValues = z.infer<typeof subscribeSchema>;

/**
 * Enterprise Footer Component
 * - 4-column layout
 * - Newsletter subscription form with Zod validation + React Hook Form
 * - Social links and contact info
 */
export function Footer() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeSchema),
  });

  const navigate = useNavigate();

  const handleLogoClick = () => {
    void navigate('/admin/login');
  };

  const onSubscribe = async (data: SubscribeFormValues) => {
    try {
      await subscribeToNewsletter(data.email);
      toast.success('Successfully subscribed to our newsletter!');
      reset();
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 pt-20 text-gray-300">
      <Container>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 pb-16 border-b border-navy-800 max-w-sm mx-auto md:max-w-none md:mx-0 w-full">
          
          {/* Column 1: Brand & About */}
          <div className="flex flex-col gap-6">
            <div onDoubleClick={handleLogoClick} className="cursor-pointer inline-block w-max select-none" aria-label="Kargar Admin Portal Trigger">
              <BrandLogo className="w-48 overflow-hidden rounded bg-white p-2" loading="lazy" />
            </div>
            <p className="text-sm leading-relaxed">
              Pune facility management partner delivering integrated solutions 
              that optimize operations, enhance safety, and create superior workplace experiences.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li><a href="#about" className="hover:text-orange-500 transition-colors">About Us</a></li>
              <li><a href="#services" className="hover:text-orange-500 transition-colors">Our Services</a></li>
              <li><a href="#industries" className="hover:text-orange-500 transition-colors">Industries</a></li>
              <li><a href="#case-studies" className="hover:text-orange-500 transition-colors">Case Studies</a></li>
              <li><a href="#contact" className="hover:text-orange-500 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white">Contact Info</h3>
            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-orange-500" />
                <span>301, 3rd Floor, Unity Commercial, Baner, Pune, Maharashtra 411045</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-orange-500" />
                <a href="tel:+919876543210" className="hover:text-orange-500 transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-orange-500" />
                <a href="mailto:info@kargarfm.com" className="hover:text-orange-500 transition-colors">info@kargarfm.com</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white">Newsletter</h3>
            <p className="mb-4 text-sm leading-relaxed">
              Subscribe to our newsletter for the latest insights in facility management.
            </p>
            <form onSubmit={handleSubmit(onSubscribe)} className="flex flex-col gap-2">
              <Input
                placeholder="Email address"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                className="bg-navy-800 border-navy-700 text-white placeholder:text-gray-500 focus-visible:border-orange-500"
              />
              <Button type="submit" fullWidth isLoading={isSubmitting}>
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between py-6 text-xs text-gray-500 md:flex-row">
          <p>&copy; {currentYear} {config.siteName}. All rights reserved.</p>
          <div className="mt-4 flex items-center gap-6 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            <Link to="/admin/login" className="hover:text-white transition-colors">Admin Portal</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
