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
    fechaInicio: new Date('2024-07-28T12:00:00Z'),
    fechaTermino: new Date('2024-08-05T12:00:00Z'),
  },
  {
    id: '2',
    tarea: 'Implementar la autenticación de usuarios',
    prioridad: 'alta',
    fechaInicio: new Date('2024-08-01T12:00:00Z'),
    fechaTermino: new Date('2024-08-15T12:00:00Z'),
  },
  {
    id: '3',
    tarea: 'Actualizar las dependencias del proyecto',
    prioridad: 'media',
    fechaInicio: new Date('2024-07-29T12:00:00Z'),
    fechaTermino: new Date('2024-07-31T12:00:00Z'),
  },
  {
    id: '4',
    tarea: 'Corregir error en el formulario de contacto',
    prioridad: 'baja',
    fechaInicio: new Date('2024-07-28T12:00:00Z'),
    fechaTermino: new Date('2024-07-29T12:00:00Z'),
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
      <Card className="mx-auto max-w-7xl">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-2xl">Mis Pendientes</CardTitle>
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
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
                  <TableHead className="hidden sm:table-cell">Prioridad</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha de Inicio</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha de Término</TableHead>
                  <TableHead className="sm:hidden">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tareas.map((tarea) => (
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}