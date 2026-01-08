'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tarea } from '@/lib/schemas';
import { TaskCard } from './task-card';
import { useState } from 'react';
import { ListTodo, LoaderCircle, CheckCircle2 } from 'lucide-react';

interface KanbanColumnProps {
    title: string;
    estado: Tarea['estado'];
    tareas: Tarea[];
    onTaskDrop: (taskId: string, newEstado: Tarea['estado']) => void;
    onTaskMove: (taskId: string, newEstado: Tarea['estado']) => void;
    onTaskDelete: (taskId: string) => void;
    colorClass: string;
    icon: React.ReactNode;
}

const estadoOrder: Record<Tarea['estado'], number> = {
    'pendiente': 0,
    'en-progreso': 1,
    'completada': 2,
};

export function KanbanColumn({
    title,
    estado,
    tareas,
    onTaskDrop,
    onTaskMove,
    onTaskDelete,
    colorClass,
    icon,
}: KanbanColumnProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
            onTaskDrop(taskId, estado);
        }
    };

    const canMoveLeft = (currentEstado: Tarea['estado']) => {
        return estadoOrder[currentEstado] > 0;
    };

    const canMoveRight = (currentEstado: Tarea['estado']) => {
        return estadoOrder[currentEstado] < 2;
    };

    const getNewEstado = (currentEstado: Tarea['estado'], direction: 'left' | 'right'): Tarea['estado'] => {
        const newOrder = estadoOrder[currentEstado] + (direction === 'right' ? 1 : -1);
        const estados: Tarea['estado'][] = ['pendiente', 'en-progreso', 'completada'];
        return estados[newOrder];
    };

    return (
        <div className="flex flex-col h-full">
            <div className={`flex items-center justify-between mb-4 pb-3 border-b-2 ${colorClass}`}>
                <div className="flex items-center gap-2">
                    {icon}
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                <Badge variant="secondary" className="text-sm">
                    {tareas.length}
                </Badge>
            </div>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          flex-1 rounded-lg p-4 space-y-3 min-h-[400px] transition-all duration-200
          ${isDragOver ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/30'}
        `}
            >
                {tareas.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                        No hay tareas aquí
                    </div>
                ) : (
                    tareas.map((tarea) => (
                        <TaskCard
                            key={tarea.id}
                            tarea={tarea}
                            onMoveLeft={() => {
                                if (canMoveLeft(estado)) {
                                    onTaskMove(tarea.id!, getNewEstado(estado, 'left'));
                                }
                            }}
                            onMoveRight={() => {
                                if (canMoveRight(estado)) {
                                    onTaskMove(tarea.id!, getNewEstado(estado, 'right'));
                                }
                            }}
                            onDelete={() => onTaskDelete(tarea.id!)}
                            canMoveLeft={canMoveLeft(estado)}
                            canMoveRight={canMoveRight(estado)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
