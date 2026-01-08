'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tarea, TareaFormValues, TareaStatus } from '@/lib/schemas';
import { TareaForm } from '@/components/tarea-form';
import {
  useFirebase,
  useMemoFirebase,
  useUser,
  addDocumentNonBlocking,
  useCollection,
} from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, Timestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CalendarDays,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ThemeToggle } from '@/components/theme-toggle';
import { useRouter } from 'next/navigation';

type TareaFirestore = Omit<Tarea, 'fechaInicio' | 'fechaTermino'> & {
  fechaInicio: Timestamp;
  fechaTermino: Timestamp;
};

const prioridadVariant: Record<Tarea['prioridad'], 'destructive' | 'secondary' | 'default'> = {
  alta: 'destructive',
  media: 'secondary',
  baja: 'default',
};

const prioridadTexto: Record<Tarea['prioridad'], string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

const statusOrder: TareaStatus[] = ['pendiente', 'en-progreso', 'completada'];

const statusConfig: Record<TareaStatus, { title: string; color: string }> = {
  pendiente: { title: 'Pendiente', color: 'bg-yellow-500' },
  'en-progreso': { title: 'En Progreso', color: 'bg-blue-500' },
  completada: { title: 'Completada', color: 'bg-green-500' },
};


export default function InicioPage() {
  const router = useRouter();
  const { firestore, auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const tasksCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'tasks');
  }, [firestore, user]);

  const { data: tareas, isLoading: isLoadingTasks } = useCollection<TareaFirestore>(tasksCollection);

  const agregarTarea = async (nuevaTarea: TareaFormValues) => {
    if (!tasksCollection || !user) return;
    try {
      const tareaParaGuardar = {
        ...nuevaTarea,
        userId: user.uid,
        status: 'pendiente' as TareaStatus,
      };
      await addDocumentNonBlocking(tasksCollection, tareaParaGuardar);

      toast({
        title: '✓ Tarea agregada',
        description: 'Se añadió a Pendientes',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: '✗ Error',
        description: 'No se pudo agregar la tarea',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const cambiarEstadoTarea = async (tareaId: string, currentStatus: TareaStatus, direction: 'next' | 'prev') => {
    if (!firestore || !user) return;
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex < 0 || nextIndex >= statusOrder.length) return;

    const newStatus = statusOrder[nextIndex];

    try {
      const tareaRef = doc(firestore, 'users', user.uid, 'tasks', tareaId);
      await updateDoc(tareaRef, { status: newStatus });

      toast({
        title: '✓ Movida',
        description: `A ${statusConfig[newStatus].title}`,
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: '✗ Error',
        description: 'No se pudo mover la tarea',
        variant: 'destructive',
      });
    }
  };

  const eliminarTarea = async (tareaId: string) => {
    if (!firestore || !user) return;
    setDeletingId(tareaId);
    try {
      const tareaRef = doc(firestore, 'users', user.uid, 'tasks', tareaId);
      await deleteDoc(tareaRef);

      toast({
        title: '✓ Eliminada',
        description: 'Tarea eliminada correctamente',
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: '✗ Error',
        description: 'No se pudo eliminar',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: '✓ Sesión cerrada',
        description: 'Hasta pronto',
        duration: 2000,
      });
      router.push('/');
    } catch (error) {
      toast({
        title: '✗ Error',
        description: 'No se pudo cerrar sesión',
        variant: 'destructive',
      });
    }
  };

  const formattedTareas = useMemo(() => {
    return tareas?.map(tarea => ({
      ...tarea,
      fechaInicio: tarea.fechaInicio.toDate(),
      fechaTermino: tarea.fechaTermino.toDate(),
      status: (tarea.status || 'pendiente') as Tarea['status'],
    })) || [];
  }, [tareas]);

  const groupedTasks = useMemo(() => {
    return formattedTareas.reduce((acc, task) => {
      const status = task.status || 'pendiente';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {} as Record<TareaStatus, Tarea[]>);
  }, [formattedTareas]);

  const renderTaskCard = (tarea: Tarea) => (
    <Card key={tarea.id} className="group/card transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <p className='font-medium text-sm leading-snug flex-1'>{tarea.tarea}</p>
          <Badge variant={prioridadVariant[tarea.prioridad]} className="shrink-0 text-xs ml-2">
            {prioridadTexto[tarea.prioridad]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <CalendarDays className="h-3 w-3" />
          <span>{format(tarea.fechaTermino, 'dd MMM', { locale: es })}</span>
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover/card:opacity-100 hover:text-destructive"
            onClick={() => eliminarTarea(tarea.id)}
            disabled={deletingId === tarea.id}
            aria-label="Eliminar tarea"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => cambiarEstadoTarea(tarea.id, tarea.status, 'prev')}
              disabled={tarea.status === 'pendiente'}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => cambiarEstadoTarea(tarea.id, tarea.status, 'next')}
              disabled={tarea.status === 'completada'}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeletonColumn = () => (
    <div className="space-y-3">
      <Skeleton className="h-8 w-24 rounded-md" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-background to-primary/5 safe-top safe-bottom safe-left safe-right">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 ring-2 ring-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Tareas</h1>
                <p className="text-xs text-muted-foreground">
                  {formattedTareas.length} {formattedTareas.length === 1 ? 'tarea' : 'tareas'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Task Form */}
        <Accordion type="single" collapsible className="w-full mb-8">
          <AccordionItem value="item-1" className="border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-6 hover:no-underline hover:bg-primary/5">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Nueva Tarea</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <TareaForm onSubmit={agregarTarea} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoadingTasks || isUserLoading ? (
            <>
              {renderSkeletonColumn()}
              {renderSkeletonColumn()}
              {renderSkeletonColumn()}
            </>
          ) : (
            statusOrder.map(status => (
              <div key={status} className="bg-muted/30 rounded-xl p-5 border">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                  <div className={cn('h-2 w-2 rounded-full', statusConfig[status].color)} />
                  <h2 className="font-semibold">{statusConfig[status].title}</h2>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {(groupedTasks[status] || []).length}
                  </Badge>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {(groupedTasks[status] || []).length > 0 ? (
                    (groupedTasks[status] || []).map(renderTaskCard)
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
                      <p>Sin tareas</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
