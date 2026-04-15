import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { LogoBannerFormComponent } from '../../shared/logo-banner-form/logo-banner-form.component';
import { HeaderComponent } from '../../layouts/header/header.component';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { ToastrService } from 'ngx-toastr';
import { HttpcallsService } from '../../services/httpcalls.service';
import { LazyImageDirective } from '../../directives/lazy-image.directive';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [LazyImageDirective, CommonModule, FormsModule, LogoBannerFormComponent, HeaderComponent, SidebarComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent implements OnInit, OnDestroy {

  // ── DATA ──────────────────────────────────────────
  logos: any[]   = [];
  banners: any[] = [];

  // ── PAGINATION ────────────────────────────────────
  page       = 1;
  limit      = 12;
  total      = 0;
  totalPages = 0;

  // ── SEARCH ────────────────────────────────────────
  searchTerm      = '';
  private search$ = new Subject<string>();

  // ── UI STATE ──────────────────────────────────────
  isLoading      = false;
  editData: any  = null;
  showModal      = false;

  // ── MULTI-SELECT ──────────────────────────────────
  // Stores the _id / id of every checked card
  selectedIds = new Set<string>();

  // Quick read for the template — how many are checked right now
  get selectedCount(): number {
    return this.selectedIds.size;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private toastr: ToastrService,
    private api: HttpcallsService
  ) {}

  // ── LIFECYCLE ─────────────────────────────────────
  ngOnInit(): void {
    // Debounce search input — fires 400 ms after user stops typing
    this.search$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.page = 1;
        this.loadImages();
      });

    this.loadImages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── LOAD IMAGES ───────────────────────────────────
  loadImages(): void {
    this.isLoading = true;
    this.clearSelection(); // Reset checkboxes whenever the list refreshes

    this.api.getImages(this.page, this.limit, this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.total      = res.total      ?? 0;
          this.totalPages = res.totalPages ?? 0;

          const all: any[] = res.data ?? [];

          this.logos   = all.filter((img: any) => img.filetype?.toLowerCase() === 'logo');
          this.banners = all.filter((img: any) => img.filetype?.toLowerCase() === 'banner');

          this.isLoading = false;
        },
        error: () => {
          this.toastr.error('Failed to load images. Please try again.', 'Error');
          this.isLoading = false;
        }
      });
  }

  // ── SEARCH ────────────────────────────────────────
  onSearch(term: string): void {
    this.searchTerm = term;
    this.search$.next(term);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
    this.loadImages();
  }

  // ── PAGINATION ────────────────────────────────────
  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.loadImages();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end   = Math.min(this.totalPages, this.page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // ── MODAL ─────────────────────────────────────────
  openModal(data: any = null): void {
    this.editData  = data ? { ...data } : null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editData  = null;
  }

  // ── SAVE (ADD / EDIT) ─────────────────────────────
  handleSave(data: any): void {
    this.loadImages();
    this.closeModal();
  }

  // ── DELETE ────────────────────────────────────────
  delete(item: any, _type: string): void {
    const confirmed = confirm(`Are you sure you want to delete "${item.imageName}"?`);
    if (!confirmed) return;

    const id = item._id || item.id;

    this.api.deleteImage(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success(`"${item.imageName}" has been deleted.`, 'Image Deleted');

          // If last item on page, go back one page
          if ((this.logos.length + this.banners.length) === 1 && this.page > 1) {
            this.page--;
          }

          this.loadImages();
        },
        error: () => this.toastr.error('Failed to delete image.', 'Error')
      });
  }

  // ── VERIFY ────────────────────────────────────────
  toggleVerify(item: any): void {
    const id          = item._id || item.id;
    const newVerified = !item.isVerified;

    this.api.toggleVerifyImage(id, newVerified)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          item.isVerified = newVerified;
          item.verifiedBy = newVerified ? 'Admin' : '';

          newVerified
            ? this.toastr.success(`"${item.imageName}" has been verified.`, 'Verified')
            : this.toastr.warning(`"${item.imageName}" has been unverified.`, 'Unverified');
        },
        error: () => this.toastr.error('Failed to update verification status.', 'Error')
      });
  }

  // ── COPY URL ──────────────────────────────────────
  copy(url: string): void {
    navigator.clipboard.writeText(url)
      .then(()  => this.toastr.info('Image URL copied to clipboard.', 'Copied!'))
      .catch(() => this.toastr.error('Failed to copy URL. Please try again.', 'Copy Failed'));
  }

  // ── PAGINATE ──────────────────────────────────────
  paginate(list: any[]): any[] {
    const start = (this.page - 1) * this.limit;
    return list.slice(start, start + this.limit);
  }
approveItem(item: any): void {
  const id = item._id || item.id;

  const confirmAction = confirm(`Approve "${item.imageName}"?`);

  if (!confirmAction) return;

  this.api.verifyImage(id, true).subscribe({
    next: () => {
      item.isVerified = true;
      this.toastr.success(`"${item.imageName}" approved.`, 'Approved');
    },
    error: () => {
      this.toastr.error('Approve failed.', 'Error');
    }
  });
}
  // ── MULTI-SELECT HELPERS ───────────────────────────

  /** Toggle a single card's checked state */
  toggleSelect(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  /** Returns true when this card's checkbox should be checked */
  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  /**
   * Select-All / Deselect-All toggle for a given list (logos or banners).
   * If every item in the list is already selected, it deselects all;
   * otherwise it selects all.
   */
  selectAll(list: any[]): void {
    const ids        = list.map(i => i._id || i.id);
    const allChecked = ids.every(id => this.selectedIds.has(id));

    if (allChecked) {
      ids.forEach(id => this.selectedIds.delete(id));
    } else {
      ids.forEach(id => this.selectedIds.add(id));
    }
  }

  /** Returns true when every item in the list is selected (drives the header checkbox) */
  isAllSelected(list: any[]): boolean {
    return list.length > 0 && list.every(i => this.selectedIds.has(i._id || i.id));
  }

  /** Returns true when SOME (but not all) items are selected (indeterminate state) */
  isSomeSelected(list: any[]): boolean {
    return list.some(i => this.selectedIds.has(i._id || i.id)) && !this.isAllSelected(list);
  }

  /** Wipes the entire selection */
  clearSelection(): void {
    this.selectedIds.clear();
  }

  // ── BULK APPROVE ──────────────────────────────────
bulkApprove(): void {
  const ids = Array.from(this.selectedIds);
  if (!ids.length) return;

  const confirmAction = confirm(`Are you sure you want to approve ${ids.length} item(s)?`);

  if (!confirmAction) return;

  this.api.bulkVerifyImages(ids, true).subscribe({
    next: () => {
      this.toastr.success(`${ids.length} item(s) approved.`, 'Approved');

      [...this.logos, ...this.banners].forEach(item => {
        if (ids.includes(item._id)) {
          item.isVerified = true;
        }
      });

      this.clearSelection();
    },
    error: () => {
      this.toastr.error('Bulk approve failed.', 'Error');
    }
  });
}


  viewImage(url: string) {
  window.open(url, '_blank');
}

}