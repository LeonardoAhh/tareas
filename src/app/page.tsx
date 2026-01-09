import { LoginForm } from '@/components/login-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { TaskIcon } from '@/components/task-icon';
import { Zap, Shield, Smartphone } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Task Manager - Gestiona tus tareas de forma eficiente',
  description: 'Task Manager es una aplicación moderna de gestión de tareas con Pomodoro timer, recordatorios inteligentes y sincronización en tiempo real.',
  keywords: ['task manager', 'tareas', 'productividad', 'pwa', 'gestión de tareas', 'pomodoro'],
  openGraph: {
    title: 'Task Manager',
    description: 'Gestiona tus tareas de forma eficiente con Task Manager',
    type: 'website',
  },
};

export default function Home() {
  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4 sm:p-6 md:p-8 safe-top safe-bottom safe-left safe-right overflow-hidden">
      {/* iOS-style background blur orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Theme Toggle - iOS style */}
      <div className="fixed top-6 right-6 z-50 safe-top safe-right">
        <div className="glass-card rounded-2xl p-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Hero Section - iOS inspired */}
        <div className="hidden lg:block space-y-8">
          {/* App Icon */}
          <div className="mb-4">
            <TaskIcon size={96} />
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1]">
              Task Manager
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-md">
              Gestiona tus tareas de forma eficiente con recordatorios, Pomodoro y sincronización en tiempo real
            </p>
          </div>

          {/* Features - iOS cards */}
          <div className="grid gap-4 pt-6">
            {[
              { icon: Zap, title: 'Rápido y fluido', desc: 'Optimizado para máximo rendimiento' },
              { icon: Shield, title: 'Seguro y privado', desc: 'Tus datos protegidos con Firebase' },
              { icon: Smartphone, title: 'Funciona en todo', desc: 'iOS, Android y escritorio' },
            ].map((feature, i) => (
              <div key={i} className="group flex items-center gap-4 p-4 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors shrink-0">
                  <feature.icon className="h-6 w-6 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-0.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-snug">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Section - iOS card */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Mobile App Icon */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[24px] bg-gradient-to-br from-primary to-primary/70 shadow-2xl shadow-primary/25">
              <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Mobile Title */}
          <div className="text-center mb-8 lg:hidden space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
            <p className="text-muted-foreground text-base px-4">
              Organiza tu vida de forma simple
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Inicia sesión</h2>
            <p className="text-muted-foreground">Organiza tus pendientes de forma inteligente</p>
          </div>

          {/* Login Card - iOS glassmorphism */}
          <div className="glass-card rounded-[28px] shadow-2xl shadow-black/10 p-8 sm:p-10 backdrop-blur-2xl border-2">
            <LoginForm />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6 px-4">
            Diseñado para iOS, Android y web
          </p>
        </div>
      </div>
    </main>
  );
}
