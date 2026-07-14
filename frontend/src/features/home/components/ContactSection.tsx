import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { useScrollReveal } from '@/hooks/animations';
import { submitContactMessage } from '@/services/contact.service';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  company: z.string().min(2, 'Company name is required'),
  service: z.string().min(1, 'Please select a service'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const serviceOptions = [
  { label: 'Integrated Housekeeping', value: 'housekeeping' },
  { label: 'Security Management', value: 'security' },
  { label: 'Electro-Mechanical (MEP)', value: 'mep' },
  { label: 'Green Landscaping', value: 'landscaping' },
  { label: 'Hard Services', value: 'hard' },
  { label: 'Soft Services', value: 'soft' },
  { label: 'Electrical Maintenance', value: 'electrical' },
  { label: 'HVAC Maintenance', value: 'hvac' },
  { label: 'Other', value: 'other' },
];

export function ContactSection() {
  const containerRef = useScrollReveal();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const serviceParam = searchParams.get('service');
  
  const defaultService = serviceParam ?? categoryParam ?? '';
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      service: defaultService,
    }
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const result = await submitContactMessage(data);

      if (result.emailSent) {
        toast.success('Proposal submitted successfully! Our team will contact you shortly.');
      } else {
        toast.success('Proposal received successfully! Our team has your request.\nEmail notification is temporarily unavailable.', { duration: 5000 });
      }

      reset();
    } catch {
      toast.error('Unable to submit request. Please try again.');
    }
  };

  return (
    <section id="contact" className="section-padding bg-white relative" ref={containerRef}>
      <Container>
        <div className="grid lg:grid-cols-2 gap-16">
          <div data-gsap-reveal="fade-right" className="max-w-sm mx-auto lg:max-w-none lg:mx-0 w-full">
            <SectionHeading
              eyebrow="Get in Touch"
              title="Ready to Optimize Your Facility?"
              subtitle="Contact us today for a free site audit and customized facility management proposal."
            />

            <div className="mt-12 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-navy-900">Corporate Office</h4>
                  <p className="mt-1 text-gray-600 leading-relaxed">
                    301, 3rd Floor, Unity Commercial, Baner,<br />
                    Pune, Maharashtra 411045
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-navy-900">Phone</h4>
                  <p className="mt-1 text-gray-600">
                    <a href="tel:+919876543210" className="hover:text-orange-500 transition-colors">+91 98765 43210</a><br />
                    <a href="tel:+912265432100" className="hover:text-orange-500 transition-colors">022-6543-2100</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-navy-900">Email</h4>
                  <p className="mt-1 text-gray-600">
                    <a href="mailto:info@kargarfm.com" className="hover:text-orange-500 transition-colors">info@kargarfm.com</a><br />
                    <a href="mailto:sales@kargarfm.com" className="hover:text-orange-500 transition-colors">sales@kargarfm.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div data-gsap-reveal="fade-left" className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 max-w-sm mx-auto lg:max-w-none lg:mx-0 w-full">
            <h3 className="text-2xl font-bold text-navy-900 mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  {...register('name')}
                  error={errors.name?.message}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@company.com"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  placeholder="+91 XXXXX XXXXX"
                  {...register('phone')}
                  error={errors.phone?.message}
                />
                <Input
                  label="Company"
                  placeholder="Your Company Ltd."
                  {...register('company')}
                  error={errors.company?.message}
                />
              </div>

              <Select
                label="Service Required"
                placeholder="Select a service..."
                options={serviceOptions}
                {...register('service')}
                error={errors.service?.message}
              />

              <Textarea
                label="Message"
                placeholder="Tell us about your facility requirements..."
                {...register('message')}
                error={errors.message?.message}
                rows={4}
              />

              <Button 
                type="submit" 
                size="lg" 
                fullWidth 
                isLoading={isSubmitting}
                rightIcon={<Send className="h-4 w-4" />}
                className="mt-4"
              >
                Submit Request
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
