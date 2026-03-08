import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { DELETE_PRODUCT } from '../graphql/productmanagement/product-mutaion';
import { Product } from '../productmanagement/productmanagement.component';
import { JwtDecoderService } from '../services/jwt-decoder.service';
import { ProductImportProgressService } from '../services/product-import-progress.service';
import { ProductImportService } from '../services/product-import.service';
import { ProductManagementFormComponent } from '../shared/product-management-form/product-management-form.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../layouts/header/header.component';
import { SidebarComponent } from '../layouts/sidebar/sidebar.component';
import { GlobalproductvarientsFormComponent } from "../shared/globalproductvarients-form/globalproductvarients-form.component";
import { SEARCH_PRODUCT_VARIANTS } from '../graphql/globalproductvarients/product-variant-query';

@Component({
  selector: 'app-globalproductvarients',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, CommonModule, ReactiveFormsModule, GlobalproductvarientsFormComponent],
  templateUrl: './globalproductvarients.component.html',
  styleUrl: './globalproductvarients.component.css'
})
export class GlobalproductvarientsComponent implements OnInit {
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

  categories: any = [];

  showImportModal = false;
  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;
  progressSubscription: any;
  importId: string = '';
  importedCount: any;
  failedCount: any;
  totalCount: any;
  variants: any[] = [];

  constructor(private jwtDecoder: JwtDecoderService, private apollo: Apollo, private progressService: ProductImportProgressService, private fb: FormBuilder, private toster: ToastrService, private importService: ProductImportService,
  ) { }

  ngOnInit(): void {
    this.getAllProductVariants()
    this.getAllProducts();

    // 🔥 debounce search pipeline
    this.searchSub = this.searchSubject.pipe(
      debounceTime(400),          // wait 400ms
      distinctUntilChanged()      // same value → no API call
    ).subscribe((value) => {
      this.getAllProductVariants(value);
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    this.searchSubject.next(value);
  }


  getAllProductVariants(
    productId?: string,
    size?: string,
    page: number = this.currentPage
  ) {
    this.apollo.query({
      query: SEARCH_PRODUCT_VARIANTS,
      variables: {
        productId: productId ?? null,
        size: size ?? null,
        page,
        limit: this.limit
      },
      fetchPolicy: 'no-cache'
    }).subscribe({
      next: (res: any) => {
        const result = res.data.getProductVariants;

        this.variants = result.data;
        this.totalItems = result.total;
        this.currentPage = result.page;
        this.limit = result.limit;
        this.totalPages = Math.ceil(this.totalItems / this.limit);

        // console.log(this.variants, "variants")
      },
      error: (err) => {
        console.error('Error fetching variants', err);
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
    this.getAllProductVariants()
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
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    this.apollo.mutate({
      mutation: DELETE_PRODUCT,
      variables: {
        _id: id,
      },
    }).subscribe({
      next: () => {
        // 🔥 Remove from UI list after backend success
        this.products = this.products.filter(p => p._id !== id);
        this.getAllProductVariants()
        this.toster.success("Product Deleted Successfully !")
      },
      error: (err) => {
        console.error('Delete error:', err);
        alert('Failed to delete product');
      },
    });
  }

  toggleAvailability(product: Product): void {
    // product.status = !product.status;
  }

  downloadTemplate(): void {
    const csvHeader =
      'name,category,description,imageUrl,tags,isVeg,isActive,isOnlineVisible\n';

    const csvRow1 =
      'Veg Burger,Fast Food,"Fresh veg patty burger","/images/products/burger.png","BESTSELLER|TRENDING",true,true,true\n';

    const csvRow2 =
      'Paneer Pizza,Fast Food,"Cheesy paneer pizza","/images/products/pizza.png","TRENDING",true,true,true\n';

    const csvRow3 =
      'Chicken Biryani,Biryani,"Hyderabadi chicken biryani","/images/products/biryani.png","BESTSELLER",false,true,true\n';

    const csvRow4 =
      'Cold Coffee,Beverages,"Chilled cold coffee","/images/products/cold-coffee.png","NEW",true,true,true\n';

    const csv = csvHeader + csvRow1 + csvRow2 + csvRow3 + csvRow4;

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
    this.getAllProductVariants(this.searchName!, this.searchCategory!, page);
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

  getAllProducts(): void {
    // this.apollo.query<any>({
    //   query: GET_ALL_INCLUDED_CATEGORIES,
    //   fetchPolicy: 'network-only'
    // }).subscribe({
    //   next: (res) => {
    //     this.categories = [...res.data.includedCategories];
    //     console.log(this.categories, "categories")
    //   },
    //   error: (err) => {
    //     console.error('GraphQL Error:', err);
    //   }
    // });
  }


  getCategoryNameById(id: string): string {
    if (!id || !this.categories?.length) {
      return '—';
    }

    const category = this.categories.find(
      (c: any) => c._id === id
    );

    return category ? category.name : 'Unknown';
  }

}
