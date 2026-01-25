import { Component, OnInit, ViewChild } from '@angular/core';
import { SidebarComponent } from "../layouts/sidebar/sidebar.component";
import { HeaderComponent } from "../layouts/header/header.component";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProductImportService } from '../services/product-import.service';
import { HttpEventType } from '@angular/common/http';
import { ProductImportProgressService } from '../services/product-import-progress.service';
import { ProductManagementFormComponent } from "../shared/product-management-form/product-management-form.component";
import { SEARCH_PRODUCTS } from '../graphql/productmanagement/product-query';
import { Apollo } from 'apollo-angular';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { JwtDecoderService } from '../services/jwt-decoder.service';


interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  variant: string;
  price: number;
  stock: number;
  imageUrl: string;
  status: string;
}

@Component({
  selector: 'app-productmanagement',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, CommonModule, ReactiveFormsModule, ProductManagementFormComponent],
  templateUrl: './productmanagement.component.html',
  styleUrl: './productmanagement.component.css'
})
export class ProductmanagementComponent implements OnInit {
  showForm = false;
  isEditMode = false;
  selectedProduct: any = null;
  @ViewChild(ProductManagementFormComponent)
  child!: ProductManagementFormComponent;
  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  products: Product[] = [

  ];

  currentPage = 1;
limit = 10;
totalItems = 0;
totalPages = 0;
searchName: string | null = null;
searchCategory: string | null = null;

  importFile: File | null = null;

  categories = ['Chinese', 'Indian', 'Italian', 'Continental', 'Desserts', 'Beverages'];
  variants = ['Half', 'Full'];

  showImportModal = false;
  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;
  progressSubscription: any;
  importId: string = '';
  importedCount: any;
  failedCount: any;
  totalCount: any;

  constructor(private jwtDecoder:JwtDecoderService, private apollo: Apollo, private progressService: ProductImportProgressService, private fb: FormBuilder, private toster: ToastrService, private importService: ProductImportService,
  ) { }

  ngOnInit(): void {
    this.getAllProducts()

    // 🔥 debounce search pipeline
    this.searchSub = this.searchSubject.pipe(
      debounceTime(400),          // wait 400ms
      distinctUntilChanged()      // same value → no API call
    ).subscribe((value) => {
      this.getAllProducts(value);
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    this.searchSubject.next(value);
  }


getAllProducts(
  name?: string,
  category?: string,
  page: number = this.currentPage 
) {

  // const decoded = this.jwtDecoder.decodeToken()

  // const userDetails = {
  //   _id:decoded.user_id,
  //   role:decoded.roleId
  // }

  this.apollo.query({
    query: SEARCH_PRODUCTS,
    variables: {
      name: name ?? null,
      category: category ?? null,
      page,
      limit: this.limit,
      user:{}
    },
    fetchPolicy: 'no-cache'
  }).subscribe({
    next: (res: any) => {
      const result = res.data.searchProducts;

      this.products = result.data;
      this.totalItems = result.total;
      this.currentPage = result.page;
      this.limit = result.limit;
      this.totalPages = Math.ceil(this.totalItems / this.limit);
    },
    error: (err) => {
      console.error('Error fetching products', err);
    }
  });
}



  openAddForm(mode: 'add' | 'edit', restaurantData?: any) {
    this.showForm = true;
    setTimeout(() => {
      if (this.child) {
        this.child.openFormFromParent(mode, restaurantData);
      }
    });
  }

  closeForm() {
    this.showForm = false;
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

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.products = this.products.filter(p => p.id !== id);
      alert('Product deleted successfully!');
    }
  }

  toggleAvailability(product: Product): void {
    // product.status = !product.status;
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

  goToPage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.getAllProducts(this.searchName!, this.searchCategory!, page);
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.goToPage(this.currentPage + 1);
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.goToPage(this.currentPage - 1);
  }
}

get pages(): number[] {
  return Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

}