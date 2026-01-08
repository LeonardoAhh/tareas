'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { PlusCircle } from 'lucide-react';

const tareasIniciales: Tarea[] = [
  {
    id: '1',
    tarea: 'Diseñar la nueva página de inicio',
    prioridad: 'alta',
    fechaInicio: new Date('2024-07-28'),
    fechaTermino: new Date('2024-08-05'),
  },
  {
    id: '2',
    tarea: 'Implementar la autenticación de usuarios',
    prioridad: 'alta',
    fechaInicio: new Date('2024-08-01'),
    fechaTermino: new Date('2024-08-15'),
  },
  {
    id: '3',
    tarea: 'Actualizar las dependencias del proyecto',
    prioridad: 'media',
    fechaInicio: new Date('2024-07-29'),
    fechaTermino: new Date('2024-07-31'),
  },
  {
    id: '4',
    tarea: 'Corregir error en el formulario de contacto',
    prioridad: 'baja',
    fechaInicio: new Date('2024-07-28'),
    fechaTermino: new Date('2024-07-29'),
  },
];

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
  const [tareas, setTareas] = useState<Tarea[]>(tareasIniciales);
  const [showForm, setShowForm] = useState(false);

  const agregarTarea = (nuevaTarea: Omit<Tarea, 'id'>) => {
    const tareaConId: Tarea = { ...nuevaTarea, id: Date.now().toString() };
    setTareas(prev => [...prev, tareaConId]);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Mis Pendientes</CardTitle>
          <Button onClick={() => setShowForm(true)}>
            <PlusCircle className="mr-2" />
            Agregar Tarea
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-8">
              <TareaForm onSubmit={agregarTarea} onCancel={() => setShowForm(false)} />
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Fecha de Inicio</TableHead>
                  <TableHead>Fecha de Término</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tareas.map((tarea) => (
                  <TableRow key={tarea.id}>
                    <TableCell>{tarea.tarea}</TableCell>
                    <TableCell>
                      <Badge variant={prioridadVariant[tarea.prioridad]}>
                        {prioridadTexto[tarea.prioridad]}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(tarea.fechaInicio, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(tarea.fechaTermino, 'dd/MM/yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
