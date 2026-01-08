'use client';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tarea, TareaFormValues, TareaStatus } from '@/lib/schemas';
import { TareaForm } from '@/components/tarea-form';
import {
  useCollection,
  useFirebase,
  useMemoFirebase,
  useUser,
  addDocumentNonBlocking,
} from '@/firebase';
import { collection, Timestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2, 
  CalendarDays, 
  Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
  const { firestore } = useFirebase();
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
        title: '✅ Tarea agregada',
        description: 'Tu nueva tarea está en la columna "Pendiente".',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: '❌ Error',
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
        title: '🚀 Estado actualizado',
        description: `La tarea se movió a "${statusConfig[newStatus].title}".`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'No se pudo actualizar el estado de la tarea',
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
        title: '🗑️ Tarea eliminada',
        description: 'La tarea se ha eliminado correctamente',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'No se pudo eliminar la tarea',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formattedTareas = useMemo(() => {
    return tareas?.map(tarea => ({
      ...tarea,
      fechaInicio: tarea.fechaInicio.toDate(),
      fechaTermino: tarea.fechaTermino.toDate(),
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
    <Card key={tarea.id} className="group/card mb-3 transition-all duration-300 hover:shadow-lg hover:border-primary/50">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <p className='font-medium text-sm leading-snug'>{tarea.tarea}</p>
          <Badge variant={prioridadVariant[tarea.prioridad]} className="shrink-0 text-xs">
            {prioridadTexto[tarea.prioridad]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <CalendarDays className="h-3 w-3" />
          <span>Finaliza: {format(tarea.fechaTermino, 'dd MMM', { locale: es })}</span>
        </div>
        <div className="flex items-center justify-between">
           <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover/card:opacity-100 hover:text-destructive"
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
              className="h-6 w-6"
              onClick={() => cambiarEstadoTarea(tarea.id, tarea.status, 'prev')}
              disabled={tarea.status === 'pendiente'}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
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
    <div className="flex-1 space-y-4">
      <Skeleton className="h-8 w-1/2 rounded-md" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
  
  return (
    <div className="min-h-dvh bg-gradient-to-br from-background to-primary/5 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Tablero de Tareas
            </h1>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className={cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'h-10 px-4 py-2'
              )}>
                <Plus className="mr-2 h-4 w-4" /> Agregar Nueva Tarea
            </AccordionTrigger>
            <AccordionContent>
              <Card className="mt-4 border-primary/20 shadow-xl shadow-primary/5">
                <CardContent className="p-6">
                  <TareaForm onSubmit={agregarTarea} />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {isLoadingTasks || isUserLoading ? (
            <>
              {renderSkeletonColumn()}
              {renderSkeletonColumn()}
              {renderSkeletonColumn()}
            </>
          ) : (
            statusOrder.map(status => (
              <div key={status} className="bg-muted/40 rounded-lg p-4 h-full">
                <div className="flex items-center gap-2 mb-4">
                   <div className={cn('h-3 w-3 rounded-full', statusConfig[status].color)} />
                   <h2 className="font-semibold text-lg">{statusConfig[status].title}</h2>
                   <Badge variant="secondary" className="rounded-full">
                    {(groupedTasks[status] || []).length}
                   </Badge>
                </div>
                <div className="space-y-3 min-h-[100px]">
                  {(groupedTasks[status] || []).length > 0 ? (
                    (groupedTasks[status] || []).map(renderTaskCard)
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground">
                       <p>No hay tareas aquí.</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
