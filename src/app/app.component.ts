import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlipbookViewerComponent } from './components/flipbook-viewer/flipbook-viewer.component';
import { FlipbookService } from './services/flipbook.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, FlipbookViewerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Flipbook Revista Digital';
  currentPage = 0;
  totalPages = 0;
  loading = true;
  errorMessage = '';
  isSinglePage = false;

  constructor(private flipbookService: FlipbookService) {}

  ngOnInit() {
    this.updatePageMode();
    this.loadPDF();
  }

  @HostListener('window:resize')
  updatePageMode() {
    if (typeof window !== 'undefined') {
      const isSinglePage = window.matchMedia('(max-width: 768px)').matches;
      if (this.isSinglePage && !isSinglePage) {
        this.currentPage = this.spreadStart(this.currentPage);
      }
      this.isSinglePage = isSinglePage;
    }
  }

  loadPDF() {
    this.loading = true;
    this.errorMessage = '';
    
    // Cargar PDF desde assets
    this.flipbookService.loadPDF('assets/revista.pdf').then((pages) => {
      this.totalPages = pages;
      this.currentPage = 0;
      this.loading = false;
    }).catch((error) => {
      this.errorMessage = 'Error cargando el PDF: ' + error.message;
      this.loading = false;
      console.error('Error:', error);
    });
  }

  private spreadStart(page: number): number {
    return page % 2 === 0 ? page : page - 1;
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage = this.isSinglePage
        ? this.currentPage + 1
        : this.spreadStart(this.currentPage) + 2;
    }
  }

  prevPage() {
    if (this.canGoPrev) {
      this.currentPage = this.isSinglePage
        ? this.currentPage - 1
        : Math.max(0, this.spreadStart(this.currentPage) - 2);
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = this.isSinglePage ? page : this.spreadStart(page);
    }
  }

  get canGoNext(): boolean {
    return this.isSinglePage
      ? this.currentPage < this.totalPages - 1
      : this.spreadStart(this.currentPage) + 1 < this.totalPages - 1;
  }

  get canGoPrev(): boolean {
    return this.isSinglePage
      ? this.currentPage > 0
      : this.spreadStart(this.currentPage) > 0;
  }

  onPageInputChange(event: any): void {
    const value = (event.target as HTMLInputElement).value;
    const pageNumber = parseInt(value, 10);
    if (!isNaN(pageNumber)) {
      this.goToPage(pageNumber - 1);
    }
  }

  downloadPDF(): void {
    const link = document.createElement('a');
    link.href = 'assets/revista.pdf';
    link.download = 'revista.pdf';
    link.click();
  }
}
