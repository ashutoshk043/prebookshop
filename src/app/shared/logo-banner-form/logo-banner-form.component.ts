import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { HttpcallsService } from '../../services/httpcalls.service';


@Component({
  selector: 'app-logo-banner-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './logo-banner-form.component.html',
  styleUrl: './logo-banner-form.component.css'
})
export class LogoBannerFormComponent implements OnInit {

  @Output() save = new EventEmitter<any>();
  @Input() editData: any = null;

  form!: FormGroup;

  previewUrl: string | null = null;
  selectedFileName: string | null = null;
  selectedFile: File | null = null;
  isDragOver = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private api: HttpcallsService,
  ) {}
ngOnInit(): void {
  this.form = this.fb.group({
    id:         [null],
    imageName:  ['', Validators.required],
    imageType:  ['', Validators.required],
    imageUrl:   [null, Validators.required],
  });

  if (this.editData) {
    console.log('Edit Data:', this.editData);

    this.form.patchValue({
      id: this.editData._id, // ✅ FIX
      imageName: this.editData.imageName || 'Image', // fallback if missing
      imageType: this.editData.filetype?.toLowerCase(), // ✅ FIX (MAIN)
      imageUrl: this.editData.url // ✅ correct
    });

    if (this.editData.url) {
      this.previewUrl       = this.editData.url;
      this.selectedFileName = 'Current image';
    }
  }
}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file) this.processFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(_event: DragEvent) {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file) this.processFile(file);
  }

  processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, GIF, WebP, SVG).');
      return;
    }

    if (file.size > 100 * 1024) {
      alert('File too large. Maximum size is 100 KB.');
      return;
    }

    this.selectedFile     = file;
    this.selectedFileName = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      this.previewUrl = base64;
      this.form.patchValue({ imageUrl: base64 });
      this.form.get('imageUrl')?.markAsDirty();
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.previewUrl       = null;
    this.selectedFileName = null;
    this.selectedFile     = null;
    this.form.patchValue({ imageUrl: null });
    this.form.get('imageUrl')?.markAsTouched();
  }

submit() {
  if (this.form.invalid) return;

  if (!this.selectedFile) {
    alert('File is required');
    return;
  }

  const type: 'LOGO' | 'BANNER' =
    this.form.get('imageType')?.value === 'logo' ? 'LOGO' : 'BANNER';

  const payload = {
    file: this.selectedFile,
    filetype: type,
    imageName: this.form.get('imageName')?.value ?? '',
  };

  this.api.uploadImage(payload).subscribe({
    next: (res: any) => {
      this.save.emit({
        // imageType: type,
        // imageName: res?.data?.imageName || '',
        // imageUrl: res?.data?.url || '',
      });

      this.toastr.success('Uploaded successfully ✅');
    },
    error: (err: any) => {
      console.error('❌ Upload error:', err);
      this.toastr.error('Upload failed ❌');
    },
  });
}
}