import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Por favor, introduce una dirección de correo electrónico válida.',
  }),
  password: z.string().min(8, {
    message: 'La contraseña debe tener al menos 8 caracteres.',
  }),
});

export const TareaSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  completed: z.boolean().optional(),
  tarea: z.string().min(1, 'La tarea no puede estar vacía.'),
  prioridad: z.enum(['baja', 'media', 'alta']),
  fechaInicio: z.date(),
  fechaTermino: z.date(),
}).refine(data => data.fechaTermino >= data.fechaInicio, {
  message: 'La fecha de término no puede ser anterior a la fecha de inicio.',
  path: ['fechaTermino'],
});

export type Tarea = z.infer<typeof TareaSchema>;
