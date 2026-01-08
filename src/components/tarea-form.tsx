'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TareaFormSchema, Tarea, TareaFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TareaFormProps {
  onSubmit: (data: TareaFormValues) => void;
  onCancel?: () => void;
  tareaInicial?: Tarea;
}

export function TareaForm({ onSubmit, onCancel, tareaInicial }: TareaFormProps) {
  const form = useForm<TareaFormValues>({
    resolver: zodResolver(TareaFormSchema),
    defaultValues: tareaInicial ? {
      ...tareaInicial,
      fechaInicio: new Date(tareaInicial.fechaInicio),
      fechaTermino: new Date(tareaInicial.fechaTermino),
    } : {
      tarea: '',
      prioridad: 'media',
      estado: 'pendiente',
      fechaInicio: new Date(),
      fechaTermino: new Date(),
    },
  });

  const handleSubmit = (data: TareaFormValues) => {
    onSubmit(data);
    form.reset({
      tarea: '',
      prioridad: 'media',
      estado: 'pendiente',
      fechaInicio: new Date(),
      fechaTermino: new Date(),
    });
  };

  // Helper para convertir Date a string formato YYYY-MM-DD
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 sm:space-y-6"
      >
        <FormField
          control={form.control}
          name="tarea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Implementar nueva función..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <FormField
            control={form.control}
            name="prioridad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Inicio</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? formatDateForInput(field.value) : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : new Date();
                      field.onChange(date);
                    }}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaTermino"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Término</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? formatDateForInput(field.value) : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : new Date();
                      field.onChange(date);
                    }}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 sm:gap-4 pt-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>}
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
}
