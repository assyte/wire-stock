'use client';

/* eslint-disable import/order */
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth-store';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(1, 'Şifre gereklidir'),
});

type LoginForm = z.infer<typeof loginSchema>;

// useSearchParams Suspense boundary içinde olmalı (Next.js 15 prerender)
function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@wirestock.com',
      password: 'demo123456',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      router.push(redirect);
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message || 'Giriş yapılamadı';
      setServerError(message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial" />
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Sol taraf - Form */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand shadow-glow-brand">
                <Zap className="h-5 w-5 text-background" strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl font-bold text-gradient">WireStock</span>
            </Link>

            <div>
              <h1 className="font-display text-3xl font-bold text-text-primary">
                Tekrar hoş geldin
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Hesabına giriş yaparak devam et
              </p>
            </div>

            {serverError && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@firma.com"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Şifre</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-brand hover:underline"
                  >
                    Şifremi unuttum
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    Giriş Yap
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-text-muted">veya</span>
              </div>
            </div>

            <p className="text-center text-sm text-text-secondary">
              Hesabın yok mu?{' '}
              <Link href="/register" className="font-medium text-brand hover:underline">
                Hemen kayıt ol
              </Link>
            </p>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <p className="text-xs font-medium text-text-primary">Demo Hesap</p>
              <p className="mt-1 text-xs text-text-secondary">
                <span className="text-text-muted">E-posta:</span> admin@wirestock.com
                <br />
                <span className="text-text-muted">Şifre:</span> demo123456
              </p>
            </div>
          </div>
        </div>

        {/* Sağ taraf - Görsel */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-background via-background-surface to-card lg:block">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute right-1/4 top-1/4 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between p-12">
            <div />

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs text-text-secondary backdrop-blur">
                <Zap className="h-3.5 w-3.5 text-brand" />
                <span>Elektrik sektörü için modern çözüm</span>
              </div>
              <h2 className="font-display text-4xl font-bold text-text-primary text-balance">
                Deponu <span className="text-gradient">akıllıca</span> yönet,
                <br />
                zamandan <span className="text-gradient-accent">tasarruf et</span>.
              </h2>
              <p className="max-w-md text-text-secondary">
                Barkoddan stoğa, satıştan projeye kadar her şey tek platformda. Kağıt-defter
                dönemini geride bırak.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { value: '500+', label: 'Aktif İşletme' },
                  { value: '50K+', label: 'Ürün Takibi' },
                  { value: '%40', label: 'Zaman Tasarrufu' },
                ].map((stat, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card/50 p-4 backdrop-blur">
                    <p className="font-display text-2xl font-bold text-gradient">{stat.value}</p>
                    <p className="text-xs text-text-secondary">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>© 2024 WireStock</span>
              <span>Modern elektrik, akıllı stok.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}