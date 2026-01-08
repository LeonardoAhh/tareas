'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tarea, TareaFormValues } from '@/lib/schemas';
import { TareaForm } from '@/components/tarea-form';
import { KanbanColumn } from '@/components/kanban-column';
import {
  useFirebase,
  useMemoFirebase,
  useUser,
  addDocumentNonBlocking,
  useCollection,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, Timestamp, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ListTodo, LoaderCircle, CheckCircle2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

type TareaFirestore = Omit<Tarea, 'fechaInicio' | 'fechaTermino'> & {
  fechaInicio: Timestamp;
  fechaTermino: Timestamp;
};

export default function InicioPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [showForm, setShowForm] = useState(false);

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
    setShowForm(false);
  };

  const formattedTareas = useMemo(() => {
    return tareas?.map(tarea => ({
      ...tarea,
      fechaInicio: tarea.fechaInicio.toDate(),
      fechaTermino: tarea.fechaTermino.toDate(),
      estado: (tarea.estado || 'pendiente') as Tarea['estado'], // Default to 'pendiente' for existing tasks
    })) || [];
  }, [tareas]);

  const tareasPorEstado = useMemo(() => {
    return {
      pendiente: formattedTareas.filter(t => t.estado === 'pendiente'),
      'en-progreso': formattedTareas.filter(t => t.estado === 'en-progreso'),
      completada: formattedTareas.filter(t => t.estado === 'completada'),
    };
  }, [formattedTareas]);

  const handleTaskDrop = (taskId: string, newEstado: Tarea['estado']) => {
    if (!tasksCollection || !firestore || !user) return;

    const taskRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    updateDocumentNonBlocking(taskRef, { estado: newEstado });
  };

  const handleTaskMove = (taskId: string, newEstado: Tarea['estado']) => {
    if (!tasksCollection || !firestore || !user) return;

    const taskRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    updateDocumentNonBlocking(taskRef, { estado: newEstado });
  };

  const handleTaskDelete = (taskId: string) => {
    if (!tasksCollection || !firestore || !user) return;

    const taskRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    deleteDocumentNonBlocking(taskRef);
  };

  const renderSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ListTodo className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mis Tareas</h1>
                <p className="text-sm text-muted-foreground">
                  {formattedTareas.length} {formattedTareas.length === 1 ? 'tarea' : 'tareas'} en total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowForm(!showForm)}
                className="gap-2"
                variant={showForm ? "secondary" : "default"}
              >
                {showForm ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Nueva Tarea
                  </>
                )}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Task Form */}
        {showForm && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <TareaForm
              onSubmit={agregarTarea}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Kanban Board */}
        {isUserLoading || isLoadingTasks ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>{renderSkeleton()}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>{renderSkeleton()}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>{renderSkeleton()}</CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pendientes Column */}
            <Card className="bg-card/50 backdrop-blur-sm border-t-4 border-t-blue-500">
              <CardContent className="p-6">
                <KanbanColumn
                  title="Pendientes"
                  estado="pendiente"
                  tareas={tareasPorEstado.pendiente}
                  onTaskDrop={handleTaskDrop}
                  onTaskMove={handleTaskMove}
                  onTaskDelete={handleTaskDelete}
                  colorClass="border-blue-500"
                  icon={<ListTodo className="h-5 w-5 text-blue-500" />}
                />
              </CardContent>
            </Card>

            {/* En Progreso Column */}
            <Card className="bg-card/50 backdrop-blur-sm border-t-4 border-t-yellow-500">
              <CardContent className="p-6">
                <KanbanColumn
                  title="En Progreso"
                  estado="en-progreso"
                  tareas={tareasPorEstado['en-progreso']}
                  onTaskDrop={handleTaskDrop}
                  onTaskMove={handleTaskMove}
                  onTaskDelete={handleTaskDelete}
                  colorClass="border-yellow-500"
                  icon={<LoaderCircle className="h-5 w-5 text-yellow-500" />}
                />
              </CardContent>
            </Card>

            {/* Completadas Column */}
            <Card className="bg-card/50 backdrop-blur-sm border-t-4 border-t-green-500">
              <CardContent className="p-6">
                <KanbanColumn
                  title="Completadas"
                  estado="completada"
                  tareas={tareasPorEstado.completada}
                  onTaskDrop={handleTaskDrop}
                  onTaskMove={handleTaskMove}
                  onTaskDelete={handleTaskDelete}
                  colorClass="border-green-500"
                  icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
