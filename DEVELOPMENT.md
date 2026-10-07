# 📝 Notas de Desarrollo

## Arquitectura Actual

```
┌─────────────────────────────────────────┐
│        AppComponent (Main)              │
│  - Control de estado general            │
│  - Manejo de página actual              │
│  - Navegación principal                 │
└────────────┬────────────────────────────┘
             │
    ┌────────┴──────────┐
    │                   │
┌───▼───────────────┐   ┌──────────────────┐
│ FlipbookViewer    │   │ FlipbookService  │
│ - Renderizado     │   │ - Cargar PDF     │
│ - Animaciones     │   │ - Renderizar pgs │
│ - UI             │   │ - Cache páginas  │
└───────────────────┘   └──────────────────┘
```

## Componentes Principales

### 1. AppComponent
- **Ubicación:** `src/app/app.component.ts`
- **Responsabilidades:**
  - Cargar PDF
  - Gestionar estado de página actual
  - Controlar navegación general
  - Mostrar/ocultar states (loading, error)

### 2. FlipbookViewerComponent
- **Ubicación:** `src/app/components/flipbook-viewer/`
- **Responsabilidades:**
  - Mostrar páginas en vista doble
  - Renderizar animaciones de volteo
  - Controles de zoom
  - Miniaturas de página

### 3. FlipbookService
- **Ubicación:** `src/app/services/flipbook.service.ts`
- **Responsabilidades:**
  - Cargar PDF con PDF.js
  - Renderizar páginas como imágenes
  - Cache de páginas en Map
  - Gestionar instancia del documento

## Flujo de Datos

```
1. Usuario carga página
2. AppComponent.loadPDF() → FlipbookService.loadPDF()
3. FlipbookService renderiza TODAS las páginas (async)
4. Se guardan como Base64 en Map
5. FlipbookViewer obtiene imágenes según página actual
6. Animaciones y UI responden a cambios
```

## Cómo Extender el Proyecto

### Agregar descarga de PDF

En `flipbook-viewer.component.ts`:
```typescript
downloadPDF() {
  const link = document.createElement('a');
  link.href = 'assets/revista.pdf';
  link.download = 'revista.pdf';
  link.click();
}
```

### Agregar búsqueda de texto

Requeriría:
1. Extraer texto del PDF (PDF.js tiene método `getTextContent()`)
2. Indexar por página
3. Agregar UI de búsqueda
4. Navegar a página del resultado

### Agregar marcadores (bookmarks)

```typescript
// En AppComponent
bookmarks: Map<number, string> = new Map();

addBookmark(page: number, title: string) {
  this.bookmarks.set(page, title);
}
```

### Agregar anotaciones

Requerería canvas sobre las páginas para dibujar/escribir notas.

### Agregar salto a página específica

Ya está implementado:
```typescript
goToPage(page: number) {
  this.currentPage = page;
  this.pageChange.emit(this.currentPage);
  this.updatePages();
}
```

## Optimizaciones Posibles

### 1. Renderización Lazy (bajo demanda)
En lugar de renderizar todas las páginas de una vez:
```typescript
// Renderizar solo ±2 páginas de la actual
```
Reduce memoria inicial, aumenta tiempo de flip.

### 2. Web Workers
Para no bloquear UI mientras renderiza:
```typescript
// Mover renderización a worker thread
const worker = new Worker('render.worker.ts');
```

### 3. IndexedDB para cache persistente
Guardar páginas renderizadas en IndexedDB para cargas posteriores.

### 4. Service Worker
Para PWA y funcionamiento offline:
```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
```

## Performance Tips

### Páginas grandes (100+)
- Usar renderización lazy
- Reducir escala (scale = 1 en lugar de 2)
- Comprimir PDF previamente

### PDFs de alta calidad
- Pueden ser lentosos al renderizar
- Opción: renderizar en resolución más baja para preview
- Full res bajo demanda

### Memory leaks
- El Map de páginas nunca se limpia
- Para muy largo uso: agregar límite de páginas cacheadas
- Implementar LRU (Least Recently Used) cache

## Testing

### Unidades (Unit Tests)
```bash
npm test
```

Crear tests para:
- FlipbookService.renderPage()
- FlipbookViewerComponent.flipForward()
- Cálculos de índices

### E2E (Integration Tests)
```bash
ng e2e
```

Probar:
- Cargar PDF completo
- Navegación de inicio a fin
- Controles de teclado

## Estructura de carpetas (Mejoras)

```
src/
├── app/
│   ├── components/
│   │   ├── flipbook-viewer/
│   │   ├── page-navigator/    (NEW)
│   │   └── bookmark-panel/    (NEW)
│   ├── services/
│   │   ├── flipbook.service.ts
│   │   ├── search.service.ts    (NEW)
│   │   └── annotation.service.ts (NEW)
│   ├── models/                 (NEW)
│   │   ├── page.model.ts
│   │   └── bookmark.model.ts
│   ├── guards/                 (NEW)
│   │   └── pdf-loaded.guard.ts
│   └── interceptors/           (NEW)
│       └── pdf-error.interceptor.ts
```

## Dependencias posibles para agregar

```json
{
  "@ng-bootstrap/ng-bootstrap": "^16.0",      // Componentes Bootstrap
  "pdfjs-viewer": "^1.0",                      // Visor avanzado
  "ngx-infinite-scroll": "^14.0",             // Scroll infinito
  "ngx-translate": "^14.0",                   // Internacionalización
  "ngx-progressbar": "^14.0",                 // Barra de progreso
  "html2canvas": "^1.4",                      // Capturas de pantalla
  "jspdf": "^2.5"                             // Generar PDFs
}
```

## Problemas conocidos

### PDF.js CDN
- Usa CDN de cdnjs.cloudflare.com
- Si cambia URL, actualizar en `flipbook.service.ts`

### Renderización en navegadores antiguos
- Usa CSS Grid y Flexbox
- IE11 no compatible
- Mínimo: Chrome 90+, Firefox 88+, Safari 14+

### CORS con PDFs remotos
- No funciona con PDFs en servidores sin CORS habilitado
- Solución: proxying en backend

## Notas de Rendimiento

| Métrica | Valor |
|---------|-------|
| Carga inicial | ~2-5 segundos |
| Time to Interactive | ~3-7 segundos |
| Bundle size | ~250KB (gzipped) |
| Memory (100 páginas) | ~50-100MB |

## Próximas características ideales

- [ ] Descarga de PDF
- [ ] Búsqueda de texto
- [ ] Marcadores/Favoritos
- [ ] Compartir en redes
- [ ] Fullscreen mode
- [ ] Modo presentación
- [ ] Anotaciones
- [ ] Historial de lectura
- [ ] Tema dark mode
- [ ] PWA con offline

---

**Última actualización:** 2024
**Autor:** Daniel Grijalba
