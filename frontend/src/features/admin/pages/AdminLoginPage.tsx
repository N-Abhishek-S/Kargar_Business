import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Shield, KeyRound, Mail } from 'lucide-react';
import { loginAdmin } from '@/api/admin';

const loginSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
  password: z.string().min(8, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      const session = await loginAdmin(data);
      localStorage.setItem('admin_token', session.token);
      toast.success('Logged in successfully');
      void navigate('/admin');
    } catch {
      toast.error('Invalid admin credentials');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-xl shadow-navy-900/20">
            <Shield className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-navy-900">Admin Portal</h1>
          <p className="mt-2 text-sm text-gray-500">Secure access to Kargar FM management</p>
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
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<KeyRound className="h-4 w-4" />}
              {...register('password')}
              error={errors.password?.message}
            />

            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              className="mt-2"
              isLoading={isSubmitting}
            >
              Sign In to Portal
            </Button>
          </form>
        </Card>
        
        <p className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Kargar Facility Management. All rights reserved.
        </p>
      </div>
    </div>
  );
}
