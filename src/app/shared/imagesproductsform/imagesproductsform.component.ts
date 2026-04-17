import {
  Component, Input, Output, EventEmitter, OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { HttpcallsService } from '../../services/httpcalls.service';
import { ProductImage } from '../../images/image-upload/image-upload.component';

// ── Shape stored inside each FormGroup in the images FormArray ────────────────
interface ImagePreview {
  file    : File;
  preview : string;
  name    : string;
  size    : string;
  progress: number;
  status  : 'pending' | 'uploading' | 'success' | 'error';
  error?  : string;
}

@Component({
  selector   : 'app-imagesproductsform',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule],
  templateUrl: './imagesproductsform.component.html',
  styleUrl   : './imagesproductsform.component.css'
})
export class ImagesproductsformComponent implements OnChanges {

  // ── Inputs / Outputs ─────────────────────────────────────────────────────────

  /** Pass an existing image to switch the form into Edit Mode. */
  @Input() editData: ProductImage | null = null;

  /** Emitted after all pending images upload successfully. */
  @Output() saved = new EventEmitter<void>();

  // ── Constants ─────────────────────────────────────────────────────────────────

  readonly MAX_MB  = 5;
  readonly ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // ── State ─────────────────────────────────────────────────────────────────────

  isDragOver  = false;
  isUploading = false;

  // ── Reactive Form ─────────────────────────────────────────────────────────────

  /**
   * Root form group.
   * `images` is a FormArray — each entry is one FormGroup representing
   * a single selected image (metadata + upload state).
   */
  form: FormGroup = this.fb.group({
    images: this.fb.array([], Validators.required)   // at least 1 image required
  });

  // ── Convenience accessor ───────────────────────────────────────────────────────

  /** Typed shortcut to the `images` FormArray. */
  get imagesArray(): FormArray {
    return this.form.get('images') as FormArray;
  }

  /** All FormGroups cast so the template can read .value cleanly. */
  get imageControls(): FormGroup[] {
    return this.imagesArray.controls as FormGroup[];
  }

  // ── Derived Getters ───────────────────────────────────────────────────────────

  get isEditMode()   : boolean       { return !!this.editData; }
  get pendingImages(): FormGroup[]   { return this.imageControls.filter(g => g.value.status === 'pending'); }
  get successCount() : number        { return this.imageControls.filter(g => g.value.status === 'success').length; }
  get errorCount()   : number        { return this.imageControls.filter(g => g.value.status === 'error').length; }

  constructor(private fb: FormBuilder, private apiService: HttpcallsService) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  /** Clear the FormArray whenever editData changes (e.g. switching rows). */
  ngOnChanges(): void {
    if (!this.editData) this.imagesArray.clear();
  }

  // ── Drag-and-Drop Handlers ────────────────────────────────────────────────────

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  // ── File-Input Handler (Browse button) ───────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.processFiles(Array.from(input.files));
    input.value = ''; // Reset so the same file can be picked again
  }

  // ── Core File Processing ──────────────────────────────────────────────────────

  /**
   * Validates each file (type + size), generates a Base64 preview,
   * then pushes a new FormGroup into the `images` FormArray.
   */
processFiles(files: File[]): void {
  files.forEach(file => {

    if (!this.ALLOWED.includes(file.type)) {
      console.warn('Skipped — unsupported type:', file.type, file.name);
      return;
    }

    if (file.size > this.MAX_MB * 1024 * 1024) {
      console.warn('Skipped — file too large:', file.name, this.formatSize(file.size));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageGroup = this.buildImageGroup({
        file,
        preview : e.target?.result as string,
        name    : file.name,
        size    : this.formatSize(file.size),
        progress: 0,
        status  : 'pending'
      });
      this.imagesArray.push(imageGroup);
      console.log('Image added to form:', file.name, '|', this.formatSize(file.size));
      console.log('FormArray length now:', this.imagesArray.length);
    };
    reader.readAsDataURL(file);
  });
}
  /**
   * Creates a FormGroup for a single image.
   * Each field is a FormControl so the template can bind to it directly.
   */
  private buildImageGroup(data: ImagePreview): FormGroup {
    return this.fb.group({
      file    : [data.file,    Validators.required],
      preview : [data.preview, Validators.required],
      name    : [data.name,    Validators.required],
      size    : [data.size],
      progress: [data.progress],
      status  : [data.status],
      error   : [data.error ?? null]
    });
  }

  // ── Remove a single image ─────────────────────────────────────────────────────

  removeImage(index: number): void {
    this.imagesArray.removeAt(index);
  }

  // ── Clear all images ──────────────────────────────────────────────────────────

  clearAll(): void {
    this.imagesArray.clear();
  }

  // ── Helper ───────────────────────────────────────────────────────────────────

  formatSize(bytes: number): string {
    const KB = 1024, MB = 1024 * KB;
    return bytes < MB
      ? (bytes / KB).toFixed(1) + ' KB'
      : (bytes / MB).toFixed(1) + ' MB';
  }

  // ── Upload Logic ──────────────────────────────────────────────────────────────

  /**
   * Validates the form first, then uploads each pending image sequentially.
   * Progress and status are patched back into each FormGroup in real time.
   * Emits `saved` only when all uploads succeed with zero errors.
   */
async uploadAll(): Promise<void> {
  if (this.form.invalid || this.pendingImages.length === 0) {
    this.form.markAllAsTouched();
    console.warn('Upload blocked — form invalid or no pending images');
    return;
  }

  this.isUploading = true;

  // Collect files + map each file back to its FormGroup by filename
  const files       = this.pendingImages.map(g => g.value.file as File);
  const groupByName = new Map<string, FormGroup>(
    this.pendingImages.map(g => [g.value.name, g])
  );

  // Mark all pending images as "uploading" while the request is in flight
  this.pendingImages.forEach(g => g.patchValue({ status: 'uploading', progress: 0 }));

  console.log('──────────────────────────────────────');
  console.log('Bulk upload started —', files.length, 'file(s)');
  console.log('Files:', files.map(f => f.name));
  console.log('──────────────────────────────────────');

  this.apiService.bulkUploadImages(files, 'PRODUCT').subscribe({

    next: (event) => {

      // ── Live progress update (applies to the whole batch) ──────────────
      if (event.type === HttpEventType.UploadProgress && event.total) {
        const overallProgress = Math.round((event.loaded / event.total) * 100);
        console.log(`Overall upload progress: ${overallProgress}%`);

        // Spread the same overall % across every uploading image
        this.pendingImages.forEach(g => {
          if (g.value.status === 'uploading') {
            g.patchValue({ progress: overallProgress });
          }
        });
      }

      // ── Response received ──────────────────────────────────────────────
      else if (event.type === HttpEventType.Response) {
        const response = event.body as {
          success : boolean;
          uploaded: number;
          failed  : number;
          results : Array<{
            fileName: string;
            status  : 'success' | 'failed';
            error?  : string;
            data?   : any;
          }>;
        };

        // console.log('──────────────────────────────────────');
        // console.log('Bulk upload response received');
        // console.log('Uploaded:', response.uploaded, '| Failed:', response.failed);
        // console.log('Full response:', response);
        // console.log('──────────────────────────────────────');

        // ── Map each result back to its FormGroup ────────────────────────
        response.results.forEach(result => {
          const group = groupByName.get(result.fileName);
          if (!group) return;

          if (result.status === 'success') {
            group.patchValue({ status: 'success', progress: 100 });
            console.log('✓ Success:', result.fileName, '→ id:', result.data?.id);
          } else {
            group.patchValue({ status: 'error', error: result.error || 'Upload failed' });
            console.warn('✕ Failed:', result.fileName, '→', result.error);
          }
        });

        this.isUploading = false;

        if (this.errorCount === 0) {
          console.log('All images uploaded — emitting saved event');
          this.saved.emit();
        } else {
          console.warn(this.errorCount, 'image(s) failed — saved event NOT emitted');
        }
      }
    },

    error: (err) => {
      // ── Hard failure (network error, 500, etc.) ────────────────────────
      console.error('Bulk upload request failed entirely:', err);

      // Mark every uploading image as error
      this.pendingImages.forEach(g => {
        if (g.value.status === 'uploading') {
          g.patchValue({
            status: 'error',
            error : err?.error?.message || 'Upload failed'
          });
        }
      });

      this.isUploading = false;
    }
  });
}
}