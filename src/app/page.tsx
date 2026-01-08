import { LoginForm } from '@/components/login-form';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mountain } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md shadow-2xl bg-card">
        <CardHeader className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Mountain className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold font-headline">LoginZen</span>
          </div>
          <CardTitle className="text-2xl">Bienvenido de Nuevo</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-6 text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Link
              href="#"
              className="font-medium text-primary hover:underline"
            >
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
