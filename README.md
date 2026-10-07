# 📖 Flipbook - Revista Digital Interactiva

Una aplicación Angular 18 moderna para crear y leer revistas digitales con efectos de volteo de página realistas, similar a FlipHTML5.

## ✨ Características

- ✅ **Efecto de volteo de página** realista y fluido
- ✅ **Visor de PDF** integrado con renderización automática
- ✅ **Navegación intuitiva** con teclado y clicks
- ✅ **Zoom ajustable** para mejor lectura
- ✅ **Miniaturas de página** para navegación rápida
- ✅ **Totalmente responsive** (móvil, tablet, desktop)
- ✅ **Sin base de datos** - Todo en client-side
- ✅ **Animaciones suaves** con Angular Animations
- ✅ **Soporte offline** - Funciona sin internet

## 🛠️ Tecnologías

- **Angular 18** - Framework frontend
- **TypeScript** - Lenguaje de programación
- **PDF.js** - Procesamiento de PDFs
- **Angular Animations** - Animaciones fluidas
- **CSS3** - Estilos y diseño responsive

## 📋 Requisitos Previos

- Node.js 18+ (descargar desde [nodejs.org](https://nodejs.org/))
- npm 9+ o yarn 3+
- Editor de código (VS Code recomendado)

## 🚀 Instalación

### 1. Clonar o descargar el proyecto

```bash
git clone <url-del-repositorio>
cd flipbook-app
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

**Nota:** La instalación puede tomar 5-10 minutos la primera vez.

### 3. Preparar el PDF

Coloca tu archivo PDF en la carpeta `src/assets/`:

```
src/
├── assets/
│   └── revista.pdf  ← Tu PDF aquí
├── app/
├── main.ts
└── ...
```

El archivo debe llamarse `revista.pdf` o actualizar la ruta en `app.component.ts`:

```typescript
this.flipbookService.loadPDF('assets/tu-pdf.pdf');
```

### 4. Iniciar el servidor de desarrollo

```bash
npm start
# o
npm run dev  # Abre automáticamente en el navegador
```

El proyecto estará disponible en: `http://localhost:4200`

## 📁 Estructura del Proyecto

```
flipbook-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── flipbook-viewer/
│   │   │       ├── flipbook-viewer.component.ts
│   │   │       ├── flipbook-viewer.component.html
│   │   │       └── flipbook-viewer.component.css
│   │   ├── services/
│   │   │   └── flipbook.service.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   └── app.component.css
│   ├── assets/
│   │   └── revista.pdf
│   ├── environments/
│   ├── main.ts
│   ├── index.html
│   └── styles.css
├── angular.json
├── tsconfig.json
├── package.json
└── README.md
```

### Descripción de carpetas

- **app/components/** - Componentes reutilizables
- **app/services/** - Servicios para lógica compartida
- **assets/** - Archivos estáticos (PDFs, imágenes)
- **environments/** - Configuración por ambiente

## 🎮 Controles y Navegación

### Navegación con Mouse/Touchpad
- **Click izquierdo** - Siguiente página
- **Click derecho** - Página anterior
- **Botones de navegación** - En la interfaz

### Controles de Teclado
| Tecla | Acción |
|-------|--------|
| `→` | Siguiente página |
| `←` | Página anterior |
| `+` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom |

### Mobile/Tablet
- **Botones de flechas** - Navegar entre páginas
- **Pinch zoom** - Ajustar zoom (en algunos navegadores)
- **Gestos de deslizar** - Próxima/anterior página

## ⚙️ Configuración

### Cambiar el PDF de entrada

En `src/app/app.component.ts`:

```typescript
loadPDF() {
  this.flipbookService.loadPDF('assets/mi-revista.pdf');
}
```

### Personalizar colores

En `src/app/app.component.css` y `src/styles.css`:

```css
/* Cambiar gradiente de fondo */
.flipbook-container {
  background: linear-gradient(135deg, #tu-color-1 0%, #tu-color-2 100%);
}
```

### Configurar escala de renderización

En `src/app/services/flipbook.service.ts`:

```typescript
private async renderPage(pageNumber: number): Promise<string> {
  const scale = 2; // Aumentar para más calidad (más lento)
  // ...
}
```

## 📦 Compilación para Producción

```bash
npm run build:prod
```

Esto genera una carpeta `dist/` con los archivos optimizados y listos para deployar.

Tamaño típico: ~800KB (gzipped ~250KB)

## 🌐 Deployment

### Opción 1: Netlify (Recomendado)
```bash
npm install -g netlify-cli
npm run build:prod
netlify deploy --prod --dir=dist/flipbook-revista
```

### Opción 2: Vercel
```bash
npm install -g vercel
npm run build:prod
vercel deploy dist/flipbook-revista --prod
```

### Opción 3: GitHub Pages
```bash
npm run build:prod -- --base-href=/flipbook-app/
# Luego push a la rama gh-pages
```

### Opción 4: Servidor tradicional
Copiar el contenido de `dist/` a tu servidor web (Apache, Nginx, etc).

## 🔧 Desarrollo

### Ejecutar en modo desarrollo con hot reload
```bash
ng serve
```

### Ver cambios en tiempo real
El servidor automáticamente recarga cuando cambias archivos TypeScript, templates o estilos.

### Linting (verificar código)
```bash
npm run lint
```

### Testing
```bash
npm test
```

## 🐛 Solución de Problemas

### El PDF no carga
- ✅ Verifica que el archivo `revista.pdf` esté en `src/assets/`
- ✅ Asegúrate que la ruta en `app.component.ts` sea correcta
- ✅ Abre la consola (F12) para ver errores
- ✅ El PDF debe estar en formato PDF válido

### Las páginas están en blanco
- ✅ Espera a que termine de cargar (hay un spinner)
- ✅ Prueba con un PDF más pequeño primero
- ✅ Abre F12 → Console para ver mensajes de error

### Performance lento con PDFs grandes
- ✅ Reduce la escala en `flipbook.service.ts` (cambiar `scale = 2` a `scale = 1`)
- ✅ Divide el PDF en secciones más pequeñas
- ✅ Usa un servidor con compresión gzip habilitada

### Problemas de memoria con muchas páginas
- ✅ El servicio guarda todas las páginas renderizadas
- ✅ Para PDFs > 500 páginas, considera renderizar bajo demanda
- ✅ Usa un PDF optimizado (reducir calidad de imágenes)

## 📚 Documentación Adicional

- [Documentación oficial de Angular](https://angular.io/docs)
- [Documentación de PDF.js](https://mozilla.github.io/pdf.js/)
- [Angular Animations](https://angular.io/guide/animations)

## 🎨 Personalización Avanzada

### Agregar controles adicionales
Edita `src/app/components/flipbook-viewer/flipbook-viewer.component.html`

### Cambiar tema de colores
Modifica las variables CSS en `src/app/app.component.css`

### Agregar funcionalidades
- Descarga de PDF
- Búsqueda de texto
- Marcadores/Bookmarks
- Compartir en redes sociales

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

¿Preguntas o problemas? 

- Abre un issue en GitHub
- Contacta al equipo de desarrollo
- Revisa la documentación en la sección de "Solución de Problemas"

## 🚀 Roadmap Futuro

- [ ] Descarga directa de PDF
- [ ] Búsqueda de texto en páginas
- [ ] Marcadores/Favoritos
- [ ] Compartir en redes sociales
- [ ] Modo de presentación fullscreen
- [ ] Soporte para múltiples idiomas
- [ ] Progressive Web App (PWA)
- [ ] Sync con iCloud/Drive

---

**Hecho con ❤️ usando Angular 18**

Última actualización: 2024
