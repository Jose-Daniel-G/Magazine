# 📄 Cómo agregar PDFs

## Ubicación de archivos

Todos los PDFs deben colocarse en:
```
src/assets/
```

## Estructura recomendada

```
src/
├── assets/
│   ├── pdfs/
│   │   ├── revista.pdf          (PDF principal)
│   │   ├── catalogo.pdf         (PDFs adicionales)
│   │   └── documento.pdf
│   └── images/
│       └── (otras imágenes)
```

## Cómo cargar un PDF

### Opción 1: PDF por defecto (revista.pdf)
El proyecto está configurado para cargar `revista.pdf` automáticamente.

### Opción 2: Cargar un PDF diferente
Edita `src/app/app.component.ts`:

```typescript
loadPDF() {
  this.loading = true;
  this.errorMessage = '';
  
  // Cambiar la ruta aquí:
  this.flipbookService.loadPDF('assets/tu-archivo.pdf').then((pages) => {
    this.totalPages = pages;
    this.currentPage = 0;
    this.loading = false;
  }).catch((error) => {
    this.errorMessage = 'Error cargando el PDF: ' + error.message;
    this.loading = false;
  });
}
```

## Tamaño máximo recomendado

- **Pequeños (< 5 MB)**: Cargan en segundos
- **Medianos (5-20 MB)**: Cargan en 10-30 segundos
- **Grandes (> 20 MB)**: Requieren más tiempo y memoria

## Optimización de PDFs

Para reducir tamaño sin perder calidad:

1. **Con Ghostscript** (línea de comandos):
```bash
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
   -dPDFSETTINGS=/ebook -r150x150 \
   -sOutputFile=output.pdf input.pdf
```

2. **Con SmallPDF** (online):
   - Ir a https://smallpdf.com/compress-pdf
   - Subir archivo
   - Descargar comprimido

3. **Con ImageMagick**:
```bash
convert -density 150x150 input.pdf output.pdf
```

## Requerimientos del PDF

✅ Formato PDF válido (.pdf)
✅ PDF no protegido (sin contraseña)
✅ Páginas renderizables como imágenes
✅ Codificación UTF-8 recomendada

## Problemas comunes

### "El PDF no se carga"
- ✅ Verifica la ruta exacta
- ✅ Asegúrate que el PDF no esté protegido
- ✅ Abre F12 → Console para ver errores
- ✅ Comprueba que el archivo existe en `src/assets/`

### "El PDF carga lentamente"
- ✅ Reduce el tamaño del PDF (ver sección Optimización)
- ✅ Reduce la escala en `flipbook.service.ts` (scale = 1 en lugar de 2)
- ✅ Usa un PDF con imágenes de menor calidad

### "Se queda renderizando pages"
- ✅ El PDF es demasiado grande
- ✅ Optimiza el PDF primero
- ✅ O divide en múltiples PDFs más pequeños

## PDFs de ejemplo para pruebas

Descarga PDFs de prueba desde:
- [Sample PDFs - Mozilla](https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf)
- [Free Books PDF](https://www.pdfdrive.com/)
- [Project Gutenberg](https://www.gutenberg.org/)

## Build y Deploy

Una vez agregues tu PDF:

```bash
# Verificar que funciona localmente
npm start

# Compilar para producción
npm run build:prod

# El PDF se incluye automáticamente en dist/
```

---

**Nota:** Los PDFs se incluyen en la carpeta `dist/` cuando compiles para producción, así que asegúrate de que esté en `src/assets/`.
