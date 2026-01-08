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
import { collection, Timestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  CalendarDays, 
  ListTodo,
  Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
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
const prioridadColor: Record<Tarea['prioridad'], string> = {
  alta: 'from-red-500/20 to-orange-500/20 border-red-500/30',
  media: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
  baja: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
};
export default function InicioPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
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
        completed: false,
      };
      await addDocumentNonBlocking(tasksCollection, tareaParaGuardar);
      
      toast({
        title: '✅ Tarea agregada',
        description: 'La tarea se ha agregado correctamente',
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
  const toggleTareaCompletada = async (tareaId: string, completed: boolean) => {
    if (!firestore || !user) return;
    try {
      const tareaRef = doc(firestore, 'users', user.uid, 'tasks', tareaId);
      await updateDoc(tareaRef, { completed: !completed });
      
      toast({
        title: !completed ? '✅ Tarea completada' : '🔄 Tarea reactivada',
        description: !completed ? '¡Buen trabajo!' : 'La tarea se marcó como pendiente',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'No se pudo actualizar la tarea',
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
  const taskDates = useMemo(() => {
    return formattedTareas.map(tarea => tarea.fechaTermino);
  }, [formattedTareas]);
  const tasksForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return formattedTareas.filter(tarea => isSameDay(tarea.fechaTermino, selectedDate));
  }, [formattedTareas, selectedDate]);
  const taskStats = useMemo(() => {
    const total = formattedTareas.length;
    const completed = formattedTareas.filter(t => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [formattedTareas]);
  const renderTaskItem = (tarea: Tarea, index: number) => (
    <motion.div
      key={tarea.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'group relative overflow-hidden rounded-lg border p-4 transition-all duration-300',
        'hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50',
        tarea.completed && 'opacity-60 bg-muted/30'
      )}
    >
      {/* Gradiente de fondo según prioridad */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100',
        prioridadColor[tarea.prioridad]
      )} />
      <div className="relative flex items-start gap-3">
        {/* Checkbox para completar */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 rounded-full p-0 hover:bg-transparent"
          onClick={() => toggleTareaCompletada(tarea.id, tarea.completed)}
          aria-label={tarea.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
        >
          {tarea.completed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
          )}
        </Button>
        {/* Contenido de la tarea */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className={cn(
              'font-medium text-sm md:text-base leading-snug',
              tarea.completed && 'line-through text-muted-foreground'
            )}>
              {tarea.tarea}
            </p>
            <Badge 
              variant={prioridadVariant[tarea.prioridad]}
              className="shrink-0 text-xs"
            >
              {prioridadTexto[tarea.prioridad]}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span>{format(tarea.fechaTermino, 'PPP', { locale: es })}</span>
            </div>
          </div>
        </div>
        {/* Botón eliminar */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
          onClick={() => eliminarTarea(tarea.id)}
          disabled={deletingId === tarea.id}
          aria-label="Eliminar tarea"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
  const renderSkeleton = () => (
    <div className="p-4 space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-5 w-5 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header con estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Mis Tareas
            </h1>
          </div>
          
          {!isUserLoading && !isLoadingTasks && (
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ListTodo className="h-4 w-4" />
                <span><strong>{taskStats.total}</strong> tareas totales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span><strong>{taskStats.completed}</strong> completadas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle className="h-4 w-4 text-orange-500" />
                <span><strong>{taskStats.pending}</strong> pendientes</span>
              </div>
            </div>
          )}
        </motion.div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna Izquierda: Calendario y Formulario */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-primary/20 shadow-xl shadow-primary/5">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl">Agregar Nueva Tarea</CardTitle>
                  <CardDescription>
                    Crea una nueva tarea y organiza tu día
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TareaForm onSubmit={agregarTarea} />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <Card className="border-primary/20 shadow-xl shadow-primary/5">
                <CardContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full rounded-md"
                    locale={es}
                    modifiers={{
                      hasTask: taskDates,
                    }}
                    modifiersClassNames={{
                      hasTask: 'bg-primary/20 text-primary-foreground font-semibold rounded-md ring-2 ring-primary/30',
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
          {/* Columna Derecha: Lista de Tareas */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-primary/20 shadow-xl shadow-primary/5">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-lg">
                    {selectedDate ? format(selectedDate, 'd MMM yyyy', { locale: es }) : 'Selecciona un día'}
                  </CardTitle>
                  <CardDescription>
                    {tasksForSelectedDay.length > 0
                      ? `${tasksForSelectedDay.length} tarea${tasksForSelectedDay.length !== 1 ? 's' : ''} para este día`
                      : 'No hay tareas programadas'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[calc(100vh-24rem)] overflow-y-auto px-4 pb-4">
                    <div className="space-y-3">
                      {isUserLoading || isLoadingTasks ? (
                        <>
                          {renderSkeleton()}
                          {renderSkeleton()}
                          {renderSkeleton()}
                        </>
                      ) : tasksForSelectedDay.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                          {tasksForSelectedDay.map((tarea, index) => renderTaskItem(tarea, index))}
                        </AnimatePresence>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-12 text-center"
                        >
                          <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-3" />
                          <p className="text-sm text-muted-foreground">
                            No hay tareas para este día
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Selecciona otro día o crea una nueva tarea
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            {/* Calendario móvil */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:hidden"
            >
              <Card className="border-primary/20 shadow-xl shadow-primary/5">
                <CardContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full rounded-md"
                    locale={es}
                    modifiers={{
                      hasTask: taskDates,
                    }}
                    modifiersClassNames={{
                      hasTask: 'bg-primary/20 text-primary-foreground font-semibold rounded-md ring-2 ring-primary/30',
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}