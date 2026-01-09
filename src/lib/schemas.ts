import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Por favor, introduce una dirección de correo electrónico válida.',
  }),
  password: z.string().min(8, {
    message: 'La contraseña debe tener al menos 8 caracteres.',
  }),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: 'Por favor, introduce una dirección de correo electrónico válida.',
  }),
  password: z.string().min(8, {
    message: 'La contraseña debe tener al menos 8 caracteres.',
  }),
  firstName: z.string().min(1, {
    message: 'Por favor, introduce tu nombre.',
  }),
  lastName: z.string().min(1, {
    message: 'Por favor, introduce tu apellido.',
  }),
});

const TareaBaseSchema = z.object({
  tarea: z.string().min(1, 'La tarea no puede estar vacía.'),
  prioridad: z.enum(['baja', 'media', 'alta']),
  fechaInicio: z.date(),
  fechaTermino: z.date(),
  status: z.enum(['pendiente', 'en-progreso', 'completada']).default('pendiente'),
  recordatorio: z.object({
    fecha: z.date(),
    enviado: z.boolean().default(false),
  }).optional(),
});

export const TareaFormSchema = TareaBaseSchema.omit({ status: true }).refine(data => data.fechaTermino >= data.fechaInicio, {
  message: 'La fecha de término no puede ser anterior a la fecha de inicio.',
  path: ['fechaTermino'],
});

export const TareaSchema = TareaBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
}).refine(data => data.fechaTermino >= data.fechaInicio, {
  message: 'La fecha de término no puede ser anterior a la fecha de inicio.',
  path: ['fechaTermino'],
});

export type Login = z.infer<typeof LoginSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type Tarea = z.infer<typeof TareaSchema>;
export type TareaFormValues = z.infer<typeof TareaFormSchema>;
export type TareaStatus = Tarea['status'];
