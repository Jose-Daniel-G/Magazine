import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

@Injectable({
  providedIn: 'root'
})
export class FlipbookService {
  private pdfDocument: any = null;
  private pageCanvas: Map<number, string> = new Map();

  constructor() {
    // Configurar el worker de PDF.js
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
      
      const totalPages = this.pdfDocument.numPages;
      console.log(`PDF cargado: ${totalPages} páginas`);

      // Pre-renderizar todas las páginas
      await this.renderAllPages();

      return totalPages;
    } catch (error) {
      console.error('Error cargando PDF:', error);
      throw new Error('No se pudo cargar el PDF');
    }
  }

  /**
   * Renderizar todas las páginas del PDF como imágenes Base64
   */
  private async renderAllPages(): Promise<void> {
    if (!this.pdfDocument) return;

    const totalPages = this.pdfDocument.numPages;
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const imageData = await this.renderPage(pageNum);
        this.pageCanvas.set(pageNum - 1, imageData);
        console.log(`Página ${pageNum} renderizada`);
      } catch (error) {
        console.error(`Error renderizando página ${pageNum}:`, error);
      }
    }
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
  }
}
