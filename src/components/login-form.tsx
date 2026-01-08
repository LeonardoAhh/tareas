'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransition } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { LoginSchema } from '@/lib/schemas';
import {
  useAuth,
  initiateEmailSignIn,
  initiateAnonymousSignIn,
} from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';

export function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(() => {
      initiateEmailSignIn(auth, values.email, values.password);
      // We can't await the result here in the non-blocking pattern.
      // We rely on the onAuthStateChanged listener in the provider to redirect.
      // Let's assume for now a toast is enough and we will handle redirection globally.
      toast({
        title: 'Iniciando Sesión...',
        description: 'Serás redirigido en un momento.',
      });
       router.push('/inicio');
    });
  };
  
  const handleAnonymousLogin = () => {
    startTransition(() => {
      try {
        initiateAnonymousSignIn(auth);
        toast({
          title: 'Iniciando como Anónimo',
          description: 'Serás redirigido en un momento.',
        });
        router.push('/inicio');
      } catch (error) {
        if (error instanceof FirebaseError) {
           toast({
            title: 'Error de Autenticación',
            description: error.message,
            variant: 'destructive',
          });
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input
                    placeholder="nombre@ejemplo.com"
                    {...field}
                    type="email"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>Contraseña</FormLabel>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm text-muted-foreground hover:text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    {...field}
                    type="password"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Iniciar Sesión
        </Button>
         <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleAnonymousLogin}
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continuar como Anónimo
        </Button>
      </form>
    </Form>
  );
}
