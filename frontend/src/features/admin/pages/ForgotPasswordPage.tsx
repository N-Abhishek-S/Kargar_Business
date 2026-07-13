import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Shield, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/supabase/client';

const forgotPasswordSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    if (cooldown > 0) return;

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/admin/update-password`,
    });

    if (error) {
      if (error.message.includes('rate limit')) {
        toast.error('Email rate limit exceeded. Please wait a moment and try again.');
        setCooldown(60);
        const timer = setInterval(() => {
          setCooldown((c) => {
            if (c <= 1) clearInterval(timer);
            return c - 1;
          });
        }, 1000);
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Password reset link sent to your email.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 flex flex-col items-start md:items-center text-left md:text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-xl shadow-navy-900/20">
            <Shield className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-navy-900">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-500">Enter your email to receive a reset link</p>
        </div>

        <Card className="p-8 shadow-2xl border-0 ring-1 ring-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@kargarfm.com"
              leftIcon={<Mail className="h-4 w-4" />}
              {...register('email')}
              error={errors.email?.message}
            />

            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              className="mt-2"
              isLoading={isSubmitting}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Wait ${cooldown}s` : 'Send Reset Link'}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => { void navigate('/admin/login'); }}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Login
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
