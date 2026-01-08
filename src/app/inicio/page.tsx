'use client';

import { useState, useMemo, useRef } from 'react';
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
  Pencil,
  Search,
  X,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PulsatingButton } from '@/components/ui/pulsating-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRouter } from 'next/navigation';
import { triggerConfetti } from '@/lib/confetti';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal';

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
  const [editingTask, setEditingTask] = useState<Tarea | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'alta' | 'media' | 'baja'>('all');
  const [draggedTask, setDraggedTask] = useState<Tarea | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TareaStatus | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const actualizarTarea = async (tareaActualizada: TareaFormValues) => {
    if (!firestore || !user || !editingTask) return;
    try {
      const tareaRef = doc(firestore, 'users', user.uid, 'tasks', editingTask.id);
      await updateDoc(tareaRef, {
        tarea: tareaActualizada.tarea,
        prioridad: tareaActualizada.prioridad,
        fechaInicio: tareaActualizada.fechaInicio,
        fechaTermino: tareaActualizada.fechaTermino,
      });

      setEditingTask(null);
      toast({
        title: '✓ Tarea actualizada',
        description: 'Los cambios se guardaron correctamente',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: '✗ Error',
        description: 'No se pudo actualizar la tarea',
        variant: 'destructive',
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

      // Trigger confetti if task is completed
      if (newStatus === 'completada') {
        triggerConfetti();
      }

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

  const handleEdit = (tarea: Tarea) => {
    setEditingTask(tarea);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterPriority('all');
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      callback: () => {
        const accordionTrigger = document.querySelector('[data-state]') as HTMLButtonElement;
        if (accordionTrigger) {
          accordionTrigger.click();
        }
      },
      description: 'Nueva tarea',
    },
    {
      key: '/',
      callback: () => {
        searchInputRef.current?.focus();
      },
      description: 'Buscar tareas',
    },
    {
      key: '?',
      shiftKey: true,
      callback: () => {
        setShowShortcutsModal((prev) => !prev);
      },
      description: 'Mostrar ayuda',
    },
  ]);


  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, tarea: Tarea) => {
    setDraggedTask(tarea);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);

    // Añadir clase visual al elemento arrastrado
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TareaStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TareaStatus) => {
    e.preventDefault();

    if (!draggedTask || !firestore || !user) return;

    // Si la tarea ya está en esta columna, no hacer nada
    if (draggedTask.status === newStatus) {
      setDraggedTask(null);
      setDragOverColumn(null);
      return;
    }

    try {
      const tareaRef = doc(firestore, 'users', user.uid, 'tasks', draggedTask.id);
      await updateDoc(tareaRef, { status: newStatus });

      // Trigger confetti if task is completed
      if (newStatus === 'completada') {
        triggerConfetti();
      }

      toast({
        title: '✓ Tarea movida',
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

    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const formattedTareas = useMemo(() => {
    return tareas?.map(tarea => ({
      ...tarea,
      fechaInicio: tarea.fechaInicio.toDate(),
      fechaTermino: tarea.fechaTermino.toDate(),
      status: (tarea.status || 'pendiente') as Tarea['status'],
    })) || [];
  }, [tareas]);

  // Filtrado de tareas
  const filteredTareas = useMemo(() => {
    return formattedTareas.filter(tarea => {
      const matchesSearch = tarea.tarea
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesPriority = filterPriority === 'all'
        || tarea.prioridad === filterPriority;

      return matchesSearch && matchesPriority;
    });
  }, [formattedTareas, searchTerm, filterPriority]);

  const groupedTasks = useMemo(() => {
    return filteredTareas.reduce((acc, task) => {
      const status = task.status || 'pendiente';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {} as Record<TareaStatus, Tarea[]>);
  }, [filteredTareas]);

  const renderTaskCard = (tarea: Tarea) => (
    <Card
      key={tarea.id}
      draggable
      onDragStart={(e) => handleDragStart(e, tarea)}
      onDragEnd={handleDragEnd}
      className={cn(
        "glass-card group/card transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-move",
        draggedTask?.id === tarea.id && "opacity-50"
      )}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity" />
            <p className='font-medium text-sm leading-snug flex-1 break-words'>{tarea.tarea}</p>
          </div>
          <Badge variant={prioridadVariant[tarea.prioridad]} className="shrink-0 text-xs">
            {prioridadTexto[tarea.prioridad]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 ml-6">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span className="truncate">{format(tarea.fechaTermino, 'dd MMM', { locale: es })}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 opacity-0 transition-opacity group-hover/card:opacity-100 hover:text-primary"
              onClick={() => handleEdit(tarea)}
              aria-label="Editar tarea"
            >
              <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
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
          </div>
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

  const hasFilters = searchTerm || filterPriority !== 'all';

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-background to-primary/5 safe-top safe-bottom safe-left safe-right">
      {/* Header - Responsive */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 ring-2 ring-primary/20 shrink-0">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold truncate">Tareas</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {filteredTareas.length} de {formattedTareas.length} {filteredTareas.length === 1 ? 'tarea' : 'tareas'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <ThemeToggle />
              <PulsatingButton
                onClick={handleLogout}
                className="h-9 w-9 sm:h-10 sm:w-10 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg p-0"
                title="Cerrar sesión"
                pulseColor="rgba(239, 68, 68, 0.4)"
                duration="2s"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </PulsatingButton>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  className="shrink-0"
                  title="Limpiar filtros"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive */}
      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-7xl">
        {/* Task Form - Responsive */}
        <Accordion
          type="single"
          collapsible
          className="w-full mb-4 sm:mb-6 md:mb-8"
          value={editingTask ? "item-1" : undefined}
        >
          <AccordionItem value="item-1" className="border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 hover:no-underline hover:bg-primary/5">
              <div className="flex items-center gap-2">
                {editingTask ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                <span className="text-sm sm:text-base">
                  {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <TareaForm
                onSubmit={editingTask ? actualizarTarea : agregarTarea}
                onCancel={editingTask ? handleCancelEdit : undefined}
                tareaInicial={editingTask || undefined}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Kanban Board - Full Responsive with Drag & Drop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {isLoadingTasks || isUserLoading ? (
            <>
              {renderSkeletonColumn()}
              {renderSkeletonColumn()}
              <div className="hidden lg:block">{renderSkeletonColumn()}</div>
            </>
          ) : (
            statusOrder.map(status => (
              <div
                key={status}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
                className={cn(
                  "glass rounded-xl p-4 sm:p-5 transition-all duration-200",
                  dragOverColumn === status && "ring-2 ring-primary ring-offset-2 bg-primary/10"
                )}
              >
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
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center text-xs sm:text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                      <p>Arrastra tareas aquí</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        open={showShortcutsModal}
        onOpenChange={setShowShortcutsModal}
      />
    </div>
  );
}
