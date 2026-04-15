import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../layouts/header/header.component';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { ImagesproductsformComponent } from '../../shared/imagesproductsform/imagesproductsform.component';
import { HttpcallsService } from '../../services/httpcalls.service';
import { LazyImageDirective } from '../../directives/lazy-image.directive';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface ProductImage {
  _id: string;
  imageName: string;
  url: string;
  isVerified: boolean;
  createdAt?: string;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [FormsModule, LazyImageDirective, CommonModule, HeaderComponent, SidebarComponent, ImagesproductsformComponent],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.css'
})
export class ImageUploadComponent implements OnInit {
  productImages: ProductImage[] = [];
  isLoading = false;
  showModal = false;
  editData: ProductImage | null = null;

  // Search
  searchQuery = '';
  private searchSubject = new Subject<string>();

  // Pagination
  page = 1;
  pageSize = 21;
  totalItems = 0;

  // Selection
  selectedIds = new Set<string>();

  constructor(
    private httpService: HttpcallsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Debounce search input — waits 400ms after user stops typing
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 1; // reset to first page on new search
      this.fetchImages();
    });

    this.fetchImages();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.page = 1;
    this.fetchImages();
  }

  fetchImages(): void {
    this.isLoading = true;
    this.httpService.getProductImages(this.page, this.pageSize, this.searchQuery).subscribe({
      next: (res) => {
        this.productImages = res.data ?? res.images ?? (Array.isArray(res) ? res : []);
        this.totalItems = res.total ?? res.totalItems ?? this.productImages.length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load images. Please try again.', 'Error');
      }
    });
  }

  // ── Stats ──
  get verifiedCount(): number { return this.productImages.filter(i => i.isVerified).length; }
  get pendingCount(): number  { return this.productImages.filter(i => !i.isVerified).length; }

  // ── Pagination ──
  get totalPages(): number { return Math.ceil(this.totalItems / this.pageSize); }
  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.page;
    const delta = 2;
    const pages: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      pages.push(i);
    }
    return pages;
  }

  get showFirstPage(): boolean { return this.page > 3; }
  get showLastPage(): boolean  { return this.page < this.totalPages - 2; }
  get showLeftDots(): boolean  { return this.page > 4; }
  get showRightDots(): boolean { return this.page < this.totalPages - 3; }

  // No client-side slicing — server already returns the right page
  paginate(list: ProductImage[]): ProductImage[] { return list; }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages && p !== this.page) {
      this.page = p;
      this.fetchImages();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goFirst(): void { this.goToPage(1); }
  goPrev(): void  { this.goToPage(this.page - 1); }
  goNext(): void  { this.goToPage(this.page + 1); }
  goLast(): void  { this.goToPage(this.totalPages); }

  // ── Selection ──
  get selectedCount(): number { return this.selectedIds.size; }
  isSelected(id: string): boolean { return this.selectedIds.has(id); }
  toggleSelect(id: string): void {
    this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id);
  }
  isAllSelected(list: ProductImage[]): boolean {
    return list.length > 0 && list.every(i => this.selectedIds.has(i._id));
  }
  isSomeSelected(list: ProductImage[]): boolean {
    return list.some(i => this.selectedIds.has(i._id)) && !this.isAllSelected(list);
  }
  selectAll(list: ProductImage[]): void {
    this.isAllSelected(list)
      ? list.forEach(i => this.selectedIds.delete(i._id))
      : list.forEach(i => this.selectedIds.add(i._id));
  }
  clearSelection(): void { this.selectedIds.clear(); }

  // ── Bulk approve ──
  bulkApprove(): void {
    const ids = Array.from(this.selectedIds);
    this.httpService.bulkVerifyImages(ids, true).subscribe({
      next: () => {
        this.toastr.success(`${ids.length} image(s) approved successfully!`, 'Bulk Approved');
        this.clearSelection();
        this.fetchImages();
      },
      error: () => this.toastr.error('Bulk approve failed. Please try again.', 'Error')
    });
  }

  // ── Toggle verify ──
  toggleVerify(item: ProductImage): void {
    this.httpService.toggleVerifyImage(item._id, !item.isVerified).subscribe({
      next: () => {
        item.isVerified = !item.isVerified;
        this.toastr.success(
          item.isVerified ? `"${item.imageName}" verified!` : `"${item.imageName}" unverified!`,
          item.isVerified ? 'Verified' : 'Unverified'
        );
      },
      error: () => this.toastr.error('Failed to update verification status.', 'Error')
    });
  }

  // ── Delete ──
  deleteImage(item: ProductImage): void {
    if (!confirm(`Delete "${item.imageName}"?`)) return;
    this.httpService.deleteProductImage(item._id).subscribe({
      next: () => {
        this.productImages = this.productImages.filter(i => i._id !== item._id);
        this.totalItems = Math.max(0, this.totalItems - 1);
        this.toastr.success(`"${item.imageName}" deleted successfully.`, 'Deleted');
      },
      error: () => this.toastr.error('Failed to delete image. Please try again.', 'Error')
    });
  }

  // ── Copy URL ──
  copy(url: string): void {
    navigator.clipboard.writeText(url).then(
      () => this.toastr.info('Image URL copied to clipboard!', 'Copied'),
      () => this.toastr.error('Failed to copy URL.', 'Error')
    );
  }

  // ── View / Modal ──
  viewImage(url: string): void { window.open(url, '_blank'); }
  openModal(item: ProductImage | null = null): void { this.editData = item; this.showModal = true; }
  closeModal(): void { this.showModal = false; this.editData = null; }
  handleSave(): void {
    this.closeModal();
    this.toastr.success('Images uploaded successfully!', 'Success');
    this.fetchImages();
  }
}