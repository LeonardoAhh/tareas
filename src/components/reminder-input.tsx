'use client';

import { useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReminderInputProps {
    value?: { fecha: Date; enviado: boolean } | null;
    onChange: (reminder: { fecha: Date; enviado: boolean } | null) => void;
}

// Helper para convertir cualquier tipo de fecha a Date
const convertToDate = (fecha: any): Date => {
    if (fecha instanceof Date) return fecha;
    if (fecha?.toDate) return fecha.toDate(); // Firestore Timestamp
    if (typeof fecha === 'string' || typeof fecha === 'number') return new Date(fecha);
    return new Date();
};

export function ReminderInput({ value, onChange }: ReminderInputProps) {
    const [showInput, setShowInput] = useState(!!value);

    const formatDateTimeLocal = (date: any): string => {
        const dateObj = convertToDate(date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        if (dateValue) {
            onChange({ fecha: new Date(dateValue), enviado: false });
        }
    };

    const handleRemove = () => {
        onChange(null);
        setShowInput(false);
    };

    const handleAdd = () => {
        // Set default to tomorrow at 9am
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        onChange({ fecha: tomorrow, enviado: false });
        setShowInput(true);
    };

    if (!showInput) {
        return (
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAdd}
                className="w-full"
            >
                <Clock className="h-4 w-4 mr-2" />
                Agregar Recordatorio
            </Button>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="recordatorio" className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recordatorio
                </Label>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemove}
                    className="h-6 w-6"
                    title="Eliminar recordatorio"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <Input
                id="recordatorio"
                type="datetime-local"
                value={value ? formatDateTimeLocal(value.fecha) : ''}
                onChange={handleDateTimeChange}
                className="h-11"
            />

            <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span>🔔</span>
                Te enviaremos una notificación en esta fecha y hora
            </p>
        </div>
    );
}
