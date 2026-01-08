'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Tarea } from '@/lib/schemas';
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

  const tasksCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'tasks');
  }, [firestore, user]);

  const { data: tareas, isLoading: isLoadingTasks } = useCollection<TareaFirestore>(tasksCollection);

  const agregarTarea = (nuevaTarea: Omit<Tarea, 'id'>) => {
    if (!tasksCollection) return;

    const tareaParaGuardar = {
      ...nuevaTarea,
      userId: user?.uid,
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

  const renderSkeleton = () => (
    <TableRow>
      <TableCell colSpan={5}>
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <Card className="mx-auto max-w-7xl">
        <CardHeader>
          <CardTitle className="text-2xl">Mis Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <TareaForm onSubmit={agregarTarea} />
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarea</TableHead>
                  <TableHead className="hidden sm:table-cell">Prioridad</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha de Inicio</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha de Término</TableHead>
                  <TableHead className="sm:hidden">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isUserLoading || isLoadingTasks ? (
                  renderSkeleton()
                ) : formattedTareas.length > 0 ? (
                  formattedTareas.map((tarea) => (
                    <TableRow key={tarea.id}>
                      <TableCell className="font-medium">{tarea.tarea}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={prioridadVariant[tarea.prioridad]}>
                          {prioridadTexto[tarea.prioridad]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{format(tarea.fechaInicio, 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="hidden md:table-cell">{format(tarea.fechaTermino, 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="sm:hidden">
                        <div className="flex flex-col gap-2 text-sm">
                          <div>
                            <Badge variant={prioridadVariant[tarea.prioridad]} className="mb-1">
                              {prioridadTexto[tarea.prioridad]}
                            </Badge>
                          </div>
                          <div><strong>Inicio:</strong> {format(tarea.fechaInicio, 'dd/MM/yy')}</div>
                          <div><strong>Fin:</strong> {format(tarea.fechaTermino, 'dd/MM/yy')}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Aún no tienes tareas. ¡Agrega una!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
