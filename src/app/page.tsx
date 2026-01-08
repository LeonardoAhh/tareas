import { LoginForm } from '@/components/login-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-dvh flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 safe-top safe-bottom safe-left safe-right">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50 safe-top safe-right">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 ring-2 ring-primary/20">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
          <p className="text-sm text-muted-foreground">
            Organiza tu vida con tableros Kanban
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl shadow-black/5 p-8">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Diseñado para simplicidad y productividad
        </p>
      </div>
    </main>
  );
}
