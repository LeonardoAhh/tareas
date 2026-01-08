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
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tarea, TareaFormValues } from '@/lib/schemas';
import { TareaForm } from '@/components/tarea-form';
import {
  useCollection,
  useFirebase,
  useMemoFirebase,
  useUser,
  addDocumentNonBlocking,
} from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';

type TareaFirestore = Omit<Tarea, 'fechaInicio' | 'fechaTermino'> & {
  fechaInicio: Timestamp;
  fechaTermino: Timestamp;
};

const prioridadVariant: Record<Tarea['prioridad'], 'destructive' | 'secondary' | 'default'> = {
  alta: 'destructive',
  media: 'secondary',
  baja: 'default',
}

const prioridadTexto: Record<Tarea['prioridad'], string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export default function InicioPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const tasksCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'tasks');
  }, [firestore, user]);

  const { data: tareas, isLoading: isLoadingTasks } = useCollection<TareaFirestore>(tasksCollection);

  const agregarTarea = (nuevaTarea: TareaFormValues) => {
    if (!tasksCollection || !user) return;

    const tareaParaGuardar = {
      ...nuevaTarea,
      userId: user.uid,
      completed: false,
    };
    addDocumentNonBlocking(tasksCollection, tareaParaGuardar);
  };
  
  const formattedTareas = useMemo(() => {
    return tareas?.map(tarea => ({
      ...tarea,
      fechaInicio: tarea.fechaInicio.toDate(),
      fechaTermino: tarea.fechaTermino.toDate(),
    })) || [];
  }, [tareas]);

  const taskDates = useMemo(() => {
    return formattedTareas.map(tarea => tarea.fechaTermino);
  }, [formattedTareas]);

  const tasksForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return formattedTareas.filter(tarea => isSameDay(tarea.fechaTermino, selectedDate));
  }, [formattedTareas, selectedDate]);

  const renderTaskItem = (tarea: Tarea) => (
    <div key={tarea.id} className="p-4 border-b last:border-b-0">
      <div className="flex items-start justify-between">
        <p className="font-medium flex-1 mr-4">{tarea.tarea}</p>
        <Badge variant={prioridadVariant[tarea.prioridad]}>
          {prioridadTexto[tarea.prioridad]}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Vence: {format(tarea.fechaTermino, 'PPP', { locale: es })}
      </p>
    </div>
  );

  const renderSkeleton = () => (
    <div className="p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );

  return (
    <div className="min-h-dvh bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Columna Izquierda: Calendario y Formulario */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nueva Tarea</CardTitle>
            </CardHeader>
            <CardContent>
              <TareaForm onSubmit={agregarTarea} />
            </CardContent>
          </Card>
          <Card className="hidden lg:block">
            <CardContent className="p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                locale={es}
                modifiers={{
                  hasTask: taskDates,
                }}
                modifiersClassNames={{
                  hasTask: 'bg-primary/20 text-primary-foreground rounded-md',
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Lista de Tareas */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                Tareas para {selectedDate ? format(selectedDate, 'd MMM yyyy', { locale: es }) : 'el día'}
              </CardTitle>
              <CardDescription>
                {tasksForSelectedDay.length > 0 
                  ? `Tienes ${tasksForSelectedDay.length} tarea(s) para este día.`
                  : 'No hay tareas para este día.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y">
                {isUserLoading || isLoadingTasks ? (
                  <>
                    {renderSkeleton()}
                    {renderSkeleton()}
                  </>
                ) : tasksForSelectedDay.length > 0 ? (
                  tasksForSelectedDay.map(renderTaskItem)
                ) : (
                  <p className="p-4 text-center text-muted-foreground">
                    Selecciona un día en el calendario para ver las tareas.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
           <Card className="mt-8 lg:hidden">
            <CardContent className="p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                locale={es}
                modifiers={{
                  hasTask: taskDates,
                }}
                modifiersClassNames={{
                  hasTask: 'bg-primary/20 rounded-md',
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}