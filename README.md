# Tareas - Kanban Task Management App

Una aplicación moderna de gestión de tareas con tablero Kanban, construida con Next.js 15, Firebase y Tailwind CSS.

## ✨ Características

- 🎨 **Tablero Kanban** con tres columnas (Pendiente, En Progreso, Completada)
- 📱 **Diseño Responsive** optimizado para móvil, tablet y escritorio
- 🔥 **Autenticación Firebase** con email y contraseña
- 💾 **Base de datos en tiempo real** con Firestore
- 🌙 **Modo Oscuro/Claro** con persistencia
- ⚡ **Notificaciones Toast** para acciones del usuario
- 🎯 **Prioridades** para tareas (Alta, Media, Baja)
- 📅 **Gestión de fechas** con date-picker
- 🔄 **Sincronización en tiempo real** entre dispositivos

## 🚀 Despliegue en Vercel

### Opción 1: Despliegue con Git (Recomendado)

1. **Conecta tu repositorio a Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "Add New Project"
   - Importa tu repositorio de GitHub

2. **Configuración automática**:
   - Vercel detectará automáticamente que es un proyecto Next.js
   - No se necesitan variables de entorno (Firebase está hardcoded)
   - Haz clic en "Deploy"

3. **¡Listo!** Tu app estará disponible en `https://tu-proyecto.vercel.app`

### Opción 2: Despliegue con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Ejecutar en el directorio del proyecto
vercel

# Para producción
vercel --prod
```

## 📦 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/LeonardoAhh/tareas.git
cd tareas

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:9002`

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo en el puerto 9002
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run typecheck` - Verifica tipos de TypeScript

## 📁 Estructura del Proyecto

```
tareas/
├── src/
│   ├── app/
│   │   ├── inicio/          # Página del tablero Kanban
│   │   ├── layout.tsx       # Layout principal
│   │   └── page.tsx         # Página de login
│   ├── components/
│   │   ├── ui/              # Componentes UI de shadcn
│   │   ├── login-form.tsx   # Formulario de autenticación
│   │   └── tarea-form.tsx   # Formulario de tareas
│   ├── firebase/
│   │   ├── config.ts        # Configuración de Firebase
│   │   ├── provider.tsx     # Provider de Firebase
│   │   └── index.ts         # Hooks y utilidades
│   ├── lib/
│   │   └── schemas.ts       # Esquemas Zod de validación
│   └── hooks/               # Custom hooks
├── public/                  # Archivos estáticos
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── vercel.json
```

## 🔧 Tecnologías Utilizadas

- **Framework**: Next.js 15.5.9
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Auth + Firestore)
- **Validación**: Zod
- **Formularios**: React Hook Form
- **Iconos**: Lucide React
- **Animaciones**: Framer Motion
- **Fechas**: date-fns

## 🎨 Características del Tablero Kanban

### Columnas
- **Pendiente** (Amarillo): Tareas nuevas o por hacer
- **En Progreso** (Azul): Tareas en las que estás trabajando
- **Completada** (Verde): Tareas finalizadas

### Funcionalidades de Tareas
- **Crear**: Formulario en acordeón con descripción, prioridad y fechas
- **Mover**: Botones ← y → para cambiar entre columnas
- **Eliminar**: Botón de eliminar con confirmación visual
- **Prioridades**: Alta (rojo), Media (amarillo), Baja (azul)

## 🔐 Autenticación

La app usa Firebase Authentication con:
- Registro de nuevos usuarios
- Login con email/contraseña
- Sesión persistente
- Manejo de errores en español

## 📝 Notas de Configuración

### Firebase - Variables de Entorno (Recomendado para Producción)

Para mayor seguridad en producción, configura estas variables de entorno en Vercel:

**Variables requeridas:**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
```

**Pasos en Vercel:**
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega cada variable `NEXT_PUBLIC_FIREBASE_*`
4. Selecciona: Production, Preview, Development
5. Redeploy para aplicar cambios

**Nota:** El proyecto funciona sin variables de entorno (usa valores por defecto), pero se recomienda configurarlas en producción.

### Build Settings en Vercel
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

## 🐛 Solución de Problemas

### Error de Build
Si encuentras errores de TypeScript durante el build:
- El proyecto está configurado para ignorar errores de TS (`ignoreBuildErrors: true`)
- Ejecuta `npm run typecheck` para ver los errores localmente

### Errores de Firebase
- Verifica que las credenciales en `config.ts` sean correctas
- Asegúrate de que Firestore tenga las reglas correctas en Firebase Console

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Leonardo - [GitHub](https://github.com/LeonardoAhh)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
