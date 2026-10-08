import { ChangeDetectorRef, Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { FlipbookService } from '../../services/flipbook.service';
import { Subscription } from 'rxjs';

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
export class FlipbookViewerComponent implements OnInit, OnChanges, OnDestroy {
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
  isSinglePage = false;

  private readonly FLIP_DURATION = 700;
  private readonly requestedPageIndexes = new Set<number>();
  private pageRenderedSubscription?: Subscription;

  constructor(
    private flipbookService: FlipbookService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.pageRenderedSubscription = this.flipbookService.pageRendered.subscribe(() => {
      this.changeDetector.detectChanges();
      this.ensurePageImages();
    });
    this.updatePageMode();
    this.syncVisiblePages();
    this.ensurePageImages();
  }

  ngOnDestroy() {
    this.pageRenderedSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentPage'] && !changes['currentPage'].firstChange) {
      if (this.isSinglePage) {
        this.leftPageIndex = this.currentPage;
        this.rightPageIndex = this.currentPage;
        this.ensurePageImages();
        return;
      }
      const target = this.spreadStart(this.currentPage);
      if (target !== this.leftPageIndex) {
        this.animateToSpread(target);
      }
      this.ensurePageImages();
    }
  }

  @HostListener('window:resize')
  updatePageMode() {
    const singlePage = typeof window !== 'undefined'
      && window.matchMedia('(max-width: 768px)').matches;
    if (singlePage !== this.isSinglePage) {
      this.isSinglePage = singlePage;
      this.syncVisiblePages();
      this.ensurePageImages();
    }
  }

  private syncVisiblePages() {
    this.leftPageIndex = this.isSinglePage
      ? this.currentPage
      : this.spreadStart(this.currentPage);
    this.rightPageIndex = this.isSinglePage
      ? this.currentPage
      : this.leftPageIndex + 1;
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
    if (this.isSinglePage) return this.currentPage < this.totalPages - 1;
    return this.rightPageIndex < this.totalPages - 1;
  }

  get canFlipBackward(): boolean {
    if (this.isSinglePage) return this.currentPage > 0;
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
    if (this.isSinglePage) {
      this.pageChange.emit(this.currentPage + 1);
      return;
    }
    const newLeft = this.leftPageIndex + 2;
    this.animateToSpread(newLeft);
    this.pageChange.emit(newLeft);
  }

  /**
   * Ir a la página anterior
   */
  flipBackward() {
    if (!this.canFlipBackward) return;
    if (this.isSinglePage) {
      this.pageChange.emit(this.currentPage - 1);
      return;
    }
    const newLeft = Math.max(0, this.leftPageIndex - 2);
    this.animateToSpread(newLeft);
    this.pageChange.emit(newLeft);
  }

  /**
   * Ir a una página específica (se alinea al inicio de su spread)
   */
  goToPage(pageIndex: number) {
    if (pageIndex < 0 || pageIndex >= this.totalPages) return;
    if (this.isSinglePage) {
      if (pageIndex !== this.currentPage) this.pageChange.emit(pageIndex);
      return;
    }
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
    if (this.showThumbnails) this.ensurePageImages();
  }

  private ensurePageImages() {
    const pageIndexes = this.showThumbnails
      ? this.pageList
      : this.isSinglePage
        ? [this.currentPage]
        : [this.leftPageIndex, this.rightPageIndex];

    for (const pageIndex of pageIndexes) {
      if (
        pageIndex < 0
        || pageIndex >= this.totalPages
        || this.flipbookService.getPageImage(pageIndex)
        || this.requestedPageIndexes.has(pageIndex)
      ) {
        continue;
      }

      this.requestedPageIndexes.add(pageIndex);
      this.flipbookService.renderPageImage(pageIndex).catch((error: unknown) => {
        this.requestedPageIndexes.delete(pageIndex);
        console.error(`Error renderizando página ${pageIndex + 1}:`, error);
      });
    }
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
