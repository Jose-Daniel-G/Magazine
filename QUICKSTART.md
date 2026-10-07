# 🚀 Guía Rápida - Flipbook Revista Digital

## ⚡ Instalación en 3 pasos

### Paso 1: Instalar dependencias
```bash
npm install
```
Espera a que termine (5-10 minutos la primera vez)

### Paso 2: Agregar tu PDF
Coloca tu archivo PDF en:
```
src/assets/revista.pdf
```

### Paso 3: Ejecutar el proyecto
```bash
npm start
```

¡Listo! Se abrirá automáticamente en `http://localhost:4200` 🎉

---

## 📖 Controles

### Desktop
- **Click derecho/izquierdo** → Pasar página
- **← →** (Flechas) → Navegar
- **+ −** (Plus/Minus) → Zoom
- **0** → Reset zoom

### Mobile
- **Botones de flechas** → Pasar página
- **Iconos en toolbar** → Zoom y miniaturas

---

## 🔧 Comandos útiles

| Comando | Descripción |
|---------|------------|
| `npm start` | Iniciar servidor desarrollo |
| `npm run build:prod` | Compilar para producción |
| `npm test` | Ejecutar tests |
| `npm run lint` | Verificar código |

---

## 🎨 Personalización Rápida

### Cambiar PDF
En `src/app/app.component.ts`, línea ~25:
```typescript
this.flipbookService.loadPDF('assets/mi-archivo.pdf');
```

### Cambiar colores
En `src/app/app.component.css`, línea ~5:
```css
background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
```

### Cambiar título
En `src/app/app.component.ts`, línea ~13:
```typescript
title = 'Tu Título Aquí';
```

---

## ❓ Problemas Frecuentes

### "El PDF no carga"
✅ Verifica que el archivo esté en `src/assets/revista.pdf`
✅ Abre F12 (DevTools) → Console para ver errores

### "Dice 'Cargando revista...'" pero no aparece nada
✅ Espera más tiempo (PDFs grandes toman tiempo)
✅ Abre F12 → Network para ver si descarga correctamente

### "Las páginas están en blanco"
✅ Comprueba que el PDF sea válido
✅ Intenta con un PDF más pequeño
✅ Reduce la escala en `flipbook.service.ts`

---

## 📦 Desplegar (Deploy)

### Con Netlify (Gratis y fácil)
```bash
npm run build:prod
# Luego arrastra la carpeta 'dist' a https://app.netlify.com
```

### Con Vercel
```bash
npm install -g vercel
npm run build:prod
vercel
```

---

## 📚 Documentación Completa

Ver `README.md` para documentación detallada

---

**¡Listo para empezar! Cualquier pregunta, revisa la consola (F12) para errores.**
