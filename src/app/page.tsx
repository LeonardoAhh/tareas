import { LoginForm } from '@/components/login-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { CheckCircle2, Zap, Shield, Smartphone } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tareas - Organiza tu vida con Kanban',
  description: 'Aplicación web progresiva (PWA) para gestionar tus tareas con tableros Kanban. Simple, rápida y elegante. Funciona en iOS y Android.',
  keywords: ['tareas', 'kanban', 'productividad', 'pwa', 'gestión de tareas', 'organización'],
  openGraph: {
    title: 'Tareas - Kanban',
    description: 'Organiza tu vida con tableros Kanban simples y elegantes',
    type: 'website',
  },
};

export default function Home() {
  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6 md:p-8 safe-top safe-bottom safe-left safe-right">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50 safe-top safe-right">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Hero Section - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-tight">
              Organiza tus tareas de forma{' '}
              <span className="text-primary">simple y efectiva</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Gestiona tus pendientes con tableros Kanban minimalistas.
              Diseñado para productividad sin distracciones.
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Rápido y ligero</h3>
                <p className="text-sm text-muted-foreground">
                  Rendimiento optimizado para una experiencia fluida
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Seguro y privado</h3>
                <p className="text-sm text-muted-foreground">
                  Tus datos protegidos con Firebase Authentication
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Funciona en todos lados</h3>
                <p className="text-sm text-muted-foreground">
                  PWA instalable en iOS, Android y escritorio
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Mobile Hero - Only visible on mobile */}
          <div className="text-center mb-6 sm:mb-8 lg:hidden space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 mb-3 sm:mb-4 ring-2 ring-primary/20">
              <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tareas</h1>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Organiza tu vida con tableros Kanban
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 ring-2 ring-primary/20">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Comienza ahora</h2>
          </div>

          {/* Login Card */}
          <div className="bg-card border border-border rounded-2xl shadow-xl shadow-black/5 p-6 sm:p-8">
            <LoginForm />
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-4 sm:mt-6 px-4">
            Diseñado para simplicidad y productividad
          </p>
        </div>
      </div>
    </main>
  );
}
