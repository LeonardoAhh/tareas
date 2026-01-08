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

  const onLoginSubmit = (values: Login) => {
    startTransition(() => {
      initiateEmailSignIn(auth, values.email, values.password);
      toast({
        title: '✓ Iniciando sesión',
        description: 'Bienvenido de vuelta',
        duration: 2000,
      });
      router.push('/inicio');
    });
  };

  const onRegisterSubmit = (values: Register) => {
    startTransition(() => {
      const { email, password, firstName, lastName } = values;
      initiateEmailSignUp(auth, email, password, { firstName, lastName });
      toast({
        title: '✓ Cuenta creada',
        description: 'Tu cuenta ha sido creada exitosamente',
        duration: 2000,
      });
      router.push('/inicio');
    });
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
        <TabsTrigger value="register">Registrarse</TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="space-y-4">
        <Form {...loginForm}>
          <form
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            className="space-y-4"
          >
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="tu@email.com"
                      {...field}
                      type="email"
                      disabled={isPending}
                      className="h-11"
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
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      {...field}
                      type="password"
                      disabled={isPending}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-11" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="register" className="space-y-4">
        <Form {...registerForm}>
          <form
            onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={registerForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Juan"
                        {...field}
                        disabled={isPending}
                        className="h-11"
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
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Pérez"
                        {...field}
                        disabled={isPending}
                        className="h-11"
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
                  <FormLabel>Correo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="tu@email.com"
                      {...field}
                      type="email"
                      disabled={isPending}
                      className="h-11"
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
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      {...field}
                      type="password"
                      disabled={isPending}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-11" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cuenta
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
