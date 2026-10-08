import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlipbookService {
  private pdfDocument: any = null;
  private pageCanvas: Map<number, string> = new Map();
  private pageRenderTasks = new Map<number, Promise<string>>();
  readonly pageRendered = new Subject<number>();

  constructor() {
    // Configurar el worker de PDF.js
      // pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';
    // pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }

  /**
   * Cargar un PDF y renderizar todas sus páginas como imágenes
   * @param pdfPath - Ruta del PDF en assets
   * @returns Promesa que resuelve con el número total de páginas
   */
  async loadPDF(pdfPath: string): Promise<number> {
    try {
      // Cargar el documento PDF
      this.pdfDocument = await pdfjsLib.getDocument(pdfPath).promise;
      this.pageCanvas.clear();
      this.pageRenderTasks.clear();
      
      const totalPages = this.pdfDocument.numPages;
      console.log(`PDF cargado: ${totalPages} páginas`);

      return totalPages;
    } catch (error) {
      console.error('Error cargando PDF:', error);
      throw new Error('No se pudo cargar el PDF');
    }
  }

  renderPageImage(pageIndex: number): Promise<string> {
    const cachedImage = this.pageCanvas.get(pageIndex);
    if (cachedImage) return Promise.resolve(cachedImage);

    const existingTask = this.pageRenderTasks.get(pageIndex);
    if (existingTask) return existingTask;

    if (!this.pdfDocument || pageIndex < 0 || pageIndex >= this.pdfDocument.numPages) {
      return Promise.reject(new Error(`Índice de página inválido: ${pageIndex}`));
    }

    const task = this.renderPage(pageIndex + 1).then((imageData) => {
      this.pageCanvas.set(pageIndex, imageData);
      this.pageRendered.next(pageIndex);
      return imageData;
    }).finally(() => {
      this.pageRenderTasks.delete(pageIndex);
    });

    this.pageRenderTasks.set(pageIndex, task);
    return task;
  }

  /**
   * Renderizar una página específica del PDF
   * @param pageNumber - Número de página (1-indexed)
   * @returns Promesa que resuelve con la imagen en Base64
   */
  private async renderPage(pageNumber: number): Promise<string> {
    try {
      const page = await this.pdfDocument.getPage(pageNumber);
      
      // Establecer escala
      const scale = 2; // Mayor calidad
      const viewport = page.getViewport({ scale });

      // Crear canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Renderizar página en el canvas
      const renderTask = page.render({
        canvasContext: context!,
        viewport: viewport
      });

      await renderTask.promise;

      // Convertir a Base64
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error(`Error renderizando página ${pageNumber}:`, error);
      throw error;
    }
  }

  /**
   * Obtener la imagen de una página específica
   * @param pageIndex - Índice de página (0-indexed)
   * @returns String Base64 de la imagen
   */
  getPageImage(pageIndex: number): string | null {
    return this.pageCanvas.get(pageIndex) || null;
  }

  /**
   * Obtener todas las imágenes de las páginas
   */
  getAllPages(): Map<number, string> {
    return this.pageCanvas;
  }

  /**
   * Limpiar recursos
   */
  destroy(): void {
    if (this.pdfDocument) {
      this.pdfDocument.destroy();
      this.pdfDocument = null;
    }
    this.pageCanvas.clear();
    this.pageRenderTasks.clear();
  }
}
