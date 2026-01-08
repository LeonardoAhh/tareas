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
  LogOut,
  Menu
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

const statusConfig: Record<TareaStatus, { title: string; color: string; icon: string }> = {
  pendiente: { title: 'Pendiente', color: 'bg-yellow-500', icon: '📋' },
  'en-progreso': { title: 'En Progreso', color: 'bg-blue-500', icon: '⚡' },
  completada: { title: 'Completada', color: 'bg-green-500', icon: '✓' },
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
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className='font-medium text-sm leading-snug flex-1 break-words'>{tarea.tarea}</p>
          <Badge variant={prioridadVariant[tarea.prioridad]} className="shrink-0 text-xs">
            {prioridadTexto[tarea.prioridad]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span className="truncate">{format(tarea.fechaTermino, 'dd MMM', { locale: es })}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 opacity-0 transition-opacity group-hover/card:opacity-100 hover:text-destructive"
            onClick={() => eliminarTarea(tarea.id)}
            disabled={deletingId === tarea.id}
            aria-label="Eliminar tarea"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={() => cambiarEstadoTarea(tarea.id, tarea.status, 'prev')}
              disabled={tarea.status === 'pendiente'}
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={() => cambiarEstadoTarea(tarea.id, tarea.status, 'next')}
              disabled={tarea.status === 'completada'}
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
      {/* Header - Responsive */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 ring-2 ring-primary/20 shrink-0">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold truncate">Tareas</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {formattedTareas.length} {formattedTareas.length === 1 ? 'tarea' : 'tareas'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-destructive/10 hover:text-destructive"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive */}
      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-7xl">
        {/* Task Form - Responsive */}
        <Accordion type="single" collapsible className="w-full mb-4 sm:mb-6 md:mb-8">
          <AccordionItem value="item-1" className="border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 hover:no-underline hover:bg-primary/5">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="text-sm sm:text-base">Nueva Tarea</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <TareaForm onSubmit={agregarTarea} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Kanban Board - Full Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {isLoadingTasks || isUserLoading ? (
            <>
              {renderSkeletonColumn()}
              {renderSkeletonColumn()}
              <div className="hidden lg:block">{renderSkeletonColumn()}</div>
            </>
          ) : (
            statusOrder.map(status => (
              <div key={status} className="bg-muted/30 rounded-xl p-4 sm:p-5 border">
                <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">
                  <div className={cn('h-2 w-2 rounded-full shrink-0', statusConfig[status].color)} />
                  <h2 className="font-semibold text-sm sm:text-base truncate flex-1">
                    {statusConfig[status].title}
                  </h2>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {(groupedTasks[status] || []).length}
                  </Badge>
                </div>
                <div className="space-y-2 sm:space-y-3 min-h-[150px] sm:min-h-[200px]">
                  {(groupedTasks[status] || []).length > 0 ? (
                    (groupedTasks[status] || []).map(renderTaskCard)
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center text-xs sm:text-sm text-muted-foreground">
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
