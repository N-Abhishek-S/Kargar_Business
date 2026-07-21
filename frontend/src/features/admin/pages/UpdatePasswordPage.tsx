import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Shield, KeyRound } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { SEO } from '@/components/seo/SEO';

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;

export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error('Recovery session expired. Please request a new link.');
        void navigate('/admin/login');
      } else {
        setSessionChecked(true);
      }
    }).catch(() => {
      toast.error('Failed to check session');
      void navigate('/admin/login');
    });
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = async (data: UpdatePasswordValues) => {
    const { error } = await supabase.auth.updateUser({
      password: data.password
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully');
      void navigate('/admin');
    }
  };

  if (!sessionChecked) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      <SEO title="Update Password" robots={{ index: false, follow: false }} />
      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 flex flex-col items-start md:items-center text-left md:text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-xl shadow-navy-900/20">
            <Shield className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-navy-900">Set New Password</h1>
          <p className="mt-2 text-sm text-gray-500">Please enter your new password below</p>
        </div>

        <Card className="p-8 shadow-2xl border-0 ring-1 ring-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<KeyRound className="h-4 w-4" />}
              {...register('password')}
              error={errors.password?.message}
            />
            
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<KeyRound className="h-4 w-4" />}
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              className="mt-2"
              isLoading={isSubmitting}
            >
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
