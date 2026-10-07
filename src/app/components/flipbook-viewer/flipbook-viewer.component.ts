import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { FlipbookService } from '../../services/flipbook.service';

@Component({
  selector: 'app-flipbook-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flipbook-viewer.component.html',
  styleUrls: ['./flipbook-viewer.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-in')
      ])
    ])
  ]
})
export class FlipbookViewerComponent implements OnInit, OnChanges {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Output() pageChange = new EventEmitter<number>();

  /** Spread currently shown (always even-aligned: left, left+1) */
  leftPageIndex = 0;
  rightPageIndex = 1;

  /** Page-turn animation state */
  isFlipping = false;
  flipActive = false;
  flipSide: 'left' | 'right' | null = null;
  flipFrontImage: string | null = null;
  flipBackImage: string | null = null;

  showThumbnails = false;
  zoom = 1;
  maxZoom = 2;

  private readonly FLIP_DURATION = 700;

  constructor(private flipbookService: FlipbookService) {}

  ngOnInit() {
    this.leftPageIndex = this.spreadStart(this.currentPage);
    this.rightPageIndex = this.leftPageIndex + 1;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentPage'] && !changes['currentPage'].firstChange) {
      const target = this.spreadStart(this.currentPage);
      if (target !== this.leftPageIndex) {
        this.animateToSpread(target);
      }
    }
  }

  private spreadStart(page: number): number {
    return page % 2 === 0 ? page : page - 1;
  }

  /**
   * Obtener imagen de una página
   */
  getPageImage(pageIndex: number): string | null {
    if (pageIndex < 0 || pageIndex >= this.totalPages) return null;
    return this.flipbookService.getPageImage(pageIndex);
  }

  get canFlipForward(): boolean {
    return this.rightPageIndex < this.totalPages - 1;
  }

  get canFlipBackward(): boolean {
    return this.leftPageIndex > 0;
  }

  /**
   * Animar el giro de una hoja (frente = página actual, dorso = página nueva)
   * hacia el nuevo spread indicado, revelando la página vecina por debajo
   * exactamente como gira una hoja física sobre el lomo.
   */
  private animateToSpread(newLeft: number) {
    if (this.isFlipping) return;
    if (newLeft < 0 || newLeft >= this.totalPages || newLeft === this.leftPageIndex) return;

    const forward = newLeft > this.leftPageIndex;
    const newRight = Math.min(newLeft + 1, this.totalPages - 1);

    this.isFlipping = true;
    this.flipActive = false;
    this.flipSide = forward ? 'right' : 'left';

    if (forward) {
      // La hoja que gira es la página derecha actual; su dorso es la nueva página izquierda
      this.flipFrontImage = this.getPageImage(this.rightPageIndex);
      this.flipBackImage = this.getPageImage(newLeft);
      // La nueva página derecha queda expuesta de inmediato bajo la hoja que se levanta
      this.rightPageIndex = newRight;
    } else {
      // La hoja que gira es la página izquierda actual; su dorso es la nueva página derecha
      this.flipFrontImage = this.getPageImage(this.leftPageIndex);
      this.flipBackImage = this.getPageImage(newRight);
      // La nueva página izquierda queda expuesta de inmediato bajo la hoja que se levanta
      this.leftPageIndex = newLeft;
    }

    // Dejar pintar el estado inicial (sin girar) antes de activar la transición CSS
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.flipActive = true;
      });
    });

    setTimeout(() => {
      if (forward) {
        this.leftPageIndex = newLeft;
      } else {
        this.rightPageIndex = newRight;
      }
      this.isFlipping = false;
      this.flipActive = false;
      this.flipSide = null;
      this.flipFrontImage = null;
      this.flipBackImage = null;
    }, this.FLIP_DURATION);
  }

  /**
   * Ir a la siguiente doble página
   */
  flipForward() {
    if (!this.canFlipForward) return;
    const newLeft = this.leftPageIndex + 2;
    this.animateToSpread(newLeft);
    this.pageChange.emit(newLeft);
  }

  /**
   * Ir a la página anterior
   */
  flipBackward() {
    if (!this.canFlipBackward) return;
    const newLeft = Math.max(0, this.leftPageIndex - 2);
    this.animateToSpread(newLeft);
    this.pageChange.emit(newLeft);
  }

  /**
   * Ir a una página específica (se alinea al inicio de su spread)
   */
  goToPage(pageIndex: number) {
    if (pageIndex < 0 || pageIndex >= this.totalPages) return;
    const target = this.spreadStart(pageIndex);
    if (target === this.leftPageIndex) return;
    this.animateToSpread(target);
    this.pageChange.emit(target);
  }

  /**
   * Toggle de miniaturas
   */
  toggleThumbnails() {
    this.showThumbnails = !this.showThumbnails;
  }

  /**
   * Zoom in
   */
  zoomIn() {
    if (this.zoom < this.maxZoom) {
      this.zoom += 0.1;
    }
  }

  /**
   * Zoom out
   */
  zoomOut() {
    if (this.zoom > 1) {
      this.zoom = Math.max(1, this.zoom - 0.1);
    }
  }

  /**
   * Reset zoom
   */
  resetZoom() {
    this.zoom = 1;
  }

  /**
   * Controles de teclado
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
        this.flipForward();
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.flipBackward();
        event.preventDefault();
        break;
      case '+':
      case '=':
        this.zoomIn();
        event.preventDefault();
        break;
      case '-':
      case '_':
        this.zoomOut();
        event.preventDefault();
        break;
      case '0':
        this.resetZoom();
        event.preventDefault();
        break;
    }
  }

  /**
   * Obtener lista de páginas para miniaturas
   */
  get pageList(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}
