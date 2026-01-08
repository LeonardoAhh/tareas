# Generador de Iconos PWA

Este directorio contiene las herramientas para generar los iconos necesarios para la aplicación PWA.

## 🚀 Paso Rápido

1. Abre `generate-icons.html` en tu navegador
2. Haz clic en "Descargar Todos los Iconos"
3. Los archivos se guardarán automáticamente

## 📝 Archivos Necesarios

Tu app PWA necesita estos iconos:

- `icon-192x192.png` - Icono estándar (192x192px)
- `icon-512x512.png` - Icono grande (512x512px)
- `icon-512x512-maskable.png` - Icono maskable para Android (512x512px)
- `apple-touch-icon.png` - Icono para iOS (192x192px)

## 🛠️ Opciones de Generación

### Opción 1: Usar el Generador HTML (Recomendado)
1. Abre `generate-icons.html` en tu navegador
2. Descarga los iconos generados
3. Renombra según sea necesario

### Opción 2: Usar Herramientas Online
- [PWA Asset Generator](https://www.pwabuilder.com/)
- [Favicon Generator](https://realfavicongenerator.net/)
- [App Icon Generator](https://appicon.co/)

### Opción 3: Generar Manualmente
Usa cualquier editor de imágenes (Photoshop, Figma, Canva):
- Crea un cuadrado de 512x512px
- Usa el color primario: `#3FA8A8`
- Agrega un icono de checkmark/check circle
- Exporta en diferentes tamaños

## 🎨 Diseño del Icono

El icono actual es un **checkmark en círculo** con:
- Color de fondo: `#3FA8A8` (Teal)
- Checkmark: Blanco
- Esquinas redondeadas: 96px de radio
- Estilo: Minimalista y moderno

## ✅ Verificación

Después de generar los iconos:
1. Colócalos en `public/icons/`
2. Verifica que los nombres coincidan con `manifest.json`
3. Recarga tu app
4. Abre las DevTools → Application → Manifest
5. Verifica que los iconos se carguen correctamente

## 🐛 Solución de Problemas

**Error 404 en iconos:**
- Verifica que los archivos existan en `public/icons/`
- Revisa que los nombres sean exactos (case-sensitive)
- Limpia el caché del navegador

**Iconos no se ven en iOS:**
- Asegúrate de tener `apple-touch-icon.png`
- El archivo debe ser al menos 180x180px
- Debe estar en la raíz de `public/icons/`

**Iconos borrosos en Android:**
- Usa al menos 512x512px para el icono maskable
- Asegúrate de que el icono tenga suficiente padding (safe zone)
