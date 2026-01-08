'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tarea } from '@/lib/schemas';
import { Calendar, GripVertical, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { useState } from 'react';

const prioridadVariant: Record<Tarea['prioridad'], 'destructive' | 'secondary' | 'default'> = {
    alta: 'destructive',
    media: 'secondary',
    baja: 'default',
};

const prioridadColor: Record<Tarea['prioridad'], string> = {
    alta: 'border-l-red-500',
    media: 'border-l-yellow-500',
    baja: 'border-l-blue-500',
};

interface TaskCardProps {
    tarea: Tarea;
    onMoveLeft?: () => void;
    onMoveRight?: () => void;
    onDelete?: () => void;
    canMoveLeft: boolean;
    canMoveRight: boolean;
}

export function TaskCard({
    tarea,
    onMoveLeft,
    onMoveRight,
    onDelete,
    canMoveLeft,
    canMoveRight
}: TaskCardProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tarea.id || '');
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <Card
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`
        group cursor-move transition-all duration-200 border-l-4 
        ${prioridadColor[tarea.prioridad]}
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg hover:-translate-y-1'}
        bg-card/50 backdrop-blur-sm
      `}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardTitle className="text-base font-medium leading-tight">
                            {tarea.tarea}
                        </CardTitle>
                    </div>
                    <Badge variant={prioridadVariant[tarea.prioridad]} className="shrink-0">
                        {tarea.prioridad.charAt(0).toUpperCase() + tarea.prioridad.slice(1)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                            {format(tarea.fechaInicio, 'dd MMM', { locale: es })} - {format(tarea.fechaTermino, 'dd MMM yyyy', { locale: es })}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMoveLeft}
                        disabled={!canMoveLeft}
                        className="h-8 px-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMoveRight}
                        disabled={!canMoveRight}
                        className="h-8 px-2"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                    <div className="flex-1" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="h-8 px-2 text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
