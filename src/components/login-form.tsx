'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  LoginSchema,
  RegisterSchema,
  type Login,
  type Register,
} from '@/lib/schemas';
import {
  useAuth,
  initiateEmailSignIn,
  initiateEmailSignUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

export function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const loginForm = useForm<Login>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<Register>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });


  const onLoginSubmit = async (values: Login) => {
    startTransition(async () => {
      try {
        await initiateEmailSignIn(auth, values.email, values.password);
        toast({
          title: '✓ Iniciando sesión',
          description: 'Bienvenido de vuelta',
          duration: 2000,
        });
        router.push('/inicio');
      } catch (error: any) {
        // Handle Firebase auth errors
        let errorMessage = 'Error al iniciar sesión';

        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Usuario no registrado';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Contraseña incorrecta';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Correo electrónico inválido';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Demasiados intentos. Intenta más tarde';
        } else if (error.code === 'auth/invalid-credential') {
          errorMessage = 'Credenciales incorrectas';
        }

        toast({
          title: '✗ Error',
          description: errorMessage,
          variant: 'destructive',
          duration: 4000,
        });
      }
    });
  };

  const onRegisterSubmit = async (values: Register) => {
    startTransition(async () => {
      try {
        const { email, password, firstName, lastName } = values;
        await initiateEmailSignUp(auth, email, password, { firstName, lastName });
        toast({
          title: '✓ Cuenta creada',
          description: 'Tu cuenta ha sido creada exitosamente',
          duration: 2000,
        });
        router.push('/inicio');
      } catch (error: any) {
        // Handle Firebase auth errors
        let errorMessage = 'Error al crear cuenta';

        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Este correo ya está registrado';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Correo electrónico inválido';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        }

        toast({
          title: '✗ Error',
          description: errorMessage,
          variant: 'destructive',
          duration: 4000,
        });
      }
    });
  };


  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/50 rounded-2xl">
        <TabsTrigger
          value="login"
          className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
        >
          Iniciar Sesión
        </TabsTrigger>
        <TabsTrigger
          value="register"
          className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
        >
          Registrarse
        </TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="space-y-5">
        <Form {...loginForm}>
          <form
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            className="space-y-5"
          >
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="tu@email.com"
                      {...field}
                      type="email"
                      disabled={isPending}
                      className="h-12 rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      {...field}
                      type="password"
                      disabled={isPending}
                      className="h-12 rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <InteractiveHoverButton
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold shadow-lg shadow-primary/25"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </InteractiveHoverButton>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="register" className="space-y-5">
        <Form {...registerForm}>
          <form
            onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={registerForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Juan"
                        {...field}
                        disabled={isPending}
                        className="h-12 rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Apellido</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Pérez"
                        {...field}
                        disabled={isPending}
                        className="h-12 rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={registerForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="tu@email.com"
                      {...field}
                      type="email"
                      disabled={isPending}
                      className="h-12 rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      {...field}
                      type="password"
                      disabled={isPending}
                      className="h-12 rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <InteractiveHoverButton
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold shadow-lg shadow-primary/25"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </span>
              ) : (
                'Crear Cuenta'
              )}
            </InteractiveHoverButton>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
