import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../layouts/sidebar/sidebar.component";
import { HeaderComponent } from "../layouts/header/header.component";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProductImportService } from '../services/product-import.service';
import { HttpEventType } from '@angular/common/http';
import { ProductImportProgressService } from '../services/product-import-progress.service';

interface Product {
  id: string;
  productName: string;
  category: string;
  description: string;
  variantType: string;
  price: number;
  unit: string;
  stock: number;
  ingredients: string;
  available: boolean;
}

@Component({
  selector: 'app-productmanagement',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './productmanagement.component.html',
  styleUrl: './productmanagement.component.css'
})
export class ProductmanagementComponent implements OnInit {
  showModal = false;
  isEditMode = false;
  productForm!: FormGroup;
  
  products: Product[] = [
    {
      id: 'PRD-001',
      productName: 'Paneer Fried Rice',
      category: 'Chinese',
      description: 'Spicy veg fried rice',
      variantType: 'Half',
      price: 60,
      unit: 'Plate',
      stock: 50,
      ingredients: 'Rice:100,Paneer:50,Oil:10,Veggies:30',
      available: true
    },
    {
      id: 'PRD-002',
      productName: 'Veg Manchurian',
      category: 'Chinese',
      description: 'Crispy veg balls in sauce',
      variantType: 'Full',
      price: 120,
      unit: 'Plate',
      stock: 30,
      ingredients: 'Cabbage:100,Flour:50,Sauces:30',
      available: true
    },
    {
      id: 'PRD-003',
      productName: 'Butter Naan',
      category: 'Indian',
      description: 'Soft butter naan',
      variantType: 'Single',
      price: 25,
      unit: 'Piece',
      stock: 100,
      ingredients: 'Flour:200,Butter:20,Yeast:5',
      available: false
    },
    {
      id: 'PRD-004',
      productName: 'Dal Makhani',
      category: 'Indian',
      description: 'Creamy black lentils',
      variantType: 'Full',
      price: 180,
      unit: 'Bowl',
      stock: 15,
      ingredients: 'Dal:200,Butter:50,Cream:30',
      available: true
    }
  ];

  importFile: File | null = null;

  categories = ['Chinese', 'Indian', 'Italian', 'Continental', 'Desserts', 'Beverages'];
  variants = ['Half', 'Full', 'Single', 'Regular', 'Large'];
  units = ['Plate', 'Piece', 'Bowl', 'Glass', 'Kg'];

  showImportModal = false;
  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;
  progressSubscription: any;
  importId: string = '';
  importedCount: any;
  failedCount: any;
  totalCount: any;

  constructor(private progressService:ProductImportProgressService, private fb: FormBuilder, private toster:ToastrService, private importService: ProductImportService,
) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      id: [''],
      productName: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      description: [''],
      variantType: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      unit: [''],
      stock: [0, [Validators.required, Validators.min(0)]],
      ingredients: [''],
      restraurentId:[''],
      available: [true]
    });
  }

  get totalProducts(): number {
    return this.products.length;
  }

  get availableProducts(): number {
    return this.products.filter(p => p.available).length;
  }

  get lowStockProducts(): number {
    return this.products.filter(p => p.stock < 20 && p.stock > 0).length;
  }

  get categoriesCount(): number {
    return this.categories.length;
  }

  // Form getters for validation
  get productName() {
    return this.productForm.get('productName');
  }

  get category() {
    return this.productForm.get('category');
  }

  get price() {
    return this.productForm.get('price');
  }

  get stock() {
    return this.productForm.get('stock');
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.productForm.reset({
      id: '',
      productName: '',
      category: '',
      description: '',
      variantType: '',
      price: 0,
      unit: '',
      stock: 0,
      ingredients: '',
      available: true
    });
    this.showModal = true;
  }

  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.productForm.patchValue(product);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.productForm.reset();
  }

openImportModal() {
    this.showImportModal = true;
    this.reset();
  }

  closeImportModal() {
    this.showImportModal = false;
    this.reset();
  }

  reset() {
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.uploading = false;
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

handleImport() {
  if (!this.selectedFile) {
    this.toster.warning('Please select a CSV file');
    return;
  }

  this.uploading = true;
  this.uploadProgress = 0;

  // 1️⃣ Upload file to backend
this.importService.uploadCsv(this.selectedFile).subscribe({
  next: async (event) => {
    if (event.type === HttpEventType.Response) {
      const importId = event.body.importId;
      this.toster.success('File uploaded. Import started!');

      try {
        await this.progressService.connect(importId); // wait for join

        this.progressSubscription = this.progressService.getProgress().subscribe({
          next: (data) => {
            this.uploadProgress = data.progress;
            this.importedCount = data.importedCount
            this.failedCount = data.failedCount
            this.totalCount = data.total

            // alert(this.uploadProgress)

            console.log(`Imported: ${data.importedCount}, Failed: ${data.failedCount}, Total: ${data.total}`);

            if (data.progress >= 100) {
              // this.uploading = false;
              this.toster.success('Import completed!');
            }
          },
          error: (err) => {
            console.error('Socket progress error', err);
            this.uploading = false;
          }
        });
      } catch (err) {
        console.error('Socket failed to connect/join', err);
      }
    }
  },
  error: () => {
    this.uploading = false;
    this.toster.error('Upload failed');
  }
});

}


  saveProduct(): void {
    if (this.productForm.invalid) {
      this.toster.error("Please fill in all required fields correctly")
      // alert('Please fill in all required fields correctly');
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    const productData = this.productForm.value;

    if (this.isEditMode) {
      const index = this.products.findIndex(p => p.id === productData.id);
      if (index !== -1) {
        this.products[index] = productData;
        alert('Product updated successfully!');
      }
    } else {
      productData.id = 'PRD-' + String(this.products.length + 1).padStart(3, '0');
      this.products.push(productData);
      alert('Product added successfully!');
    }

    this.closeModal();
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.products = this.products.filter(p => p.id !== id);
      alert('Product deleted successfully!');
    }
  }

  toggleAvailability(product: Product): void {
    product.available = !product.available;
  }

  downloadTemplate(): void {
    const csvHeader = 'productName,category,description,variantType,price,unit,stock,ingredients,available\n';
    const csvData = 'Paneer Fried Rice,Chinese,Spicy veg fried rice,Half,60,Plate,50,Rice:100;Paneer:50;Oil:10,TRUE\n';
    const csvData2 = 'Veg Noodles,Chinese,Stir fried noodles,Full,80,Plate,40,Noodles:150;Veggies:50;Sauces:20,TRUE';
    const csv = csvHeader + csvData + csvData2;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}