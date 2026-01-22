import { Component, ViewChild } from '@angular/core';
import { SidebarComponent } from "../layouts/sidebar/sidebar.component";
import { HeaderComponent } from "../layouts/header/header.component";
import { SharedModule } from '../shared/shared.module';
import { CreateRestraurentFormComponent } from '../shared/create-restraurent-form/create-restraurent-form.component';
import { CommonModule } from '@angular/common';
import { Apollo, gql } from 'apollo-angular';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Component({
  selector: 'app-manage-restraurent',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, SharedModule, CommonModule],
  templateUrl: './manage-restraurent.component.html',
  styleUrl: './manage-restraurent.component.css'
})
export class ManageRestraurentComponent {

  getEndRecord() {
    throw new Error('Method not implemented.');
  }

  @ViewChild(CreateRestraurentFormComponent)
  child!: CreateRestraurentFormComponent;
  private searchSubject = new Subject<string>();
  restaurants: any[] = [];
  totalRecords = 0;
  page = 1;
  limit = 10;
  loading = false;
  error = '';
  searchText = '';
  totalPages = 0;
  pages: number[] = [];
  ownerEmailListParent: any[] = [];
  GET_RESTAURANT_SUMMARY = gql`
  query getRestaurantSummary {
    getRestaurantSummary {
      totalRestaurants
      openCount
      closedCount
    }
  }
`;

summary = {
    totalRestaurants: 0,
    openCount: 0,
    closedCount: 0,
  };




  ngAfterViewInit() {
    // ViewChild is now available
    console.log('Child component loaded:', this.child);
  }

  ngOnInit() {
    this.fetchRestaurants()
    this.fetchSummary();
    this.searchSubject
      .pipe(
        debounceTime(500),          // 500ms wait
        distinctUntilChanged()      // same value ignore
      )
      .subscribe((search) => {
        this.page = 1;
        this.fetchRestaurants(this.page, this.limit, search);
      });
  }

  constructor(private apollo: Apollo, private cookieservice: CookieService, private toster: ToastrService) { }



  // Open form in add or edit mode
  openForm(mode: 'add' | 'edit', restaurantData?: any) {
    if (this.child) {
      this.child.openFormFromParent(mode, restaurantData);
    }
  }

  // Handle form status change event
  onFormStatusChange(status: boolean) {
    console.log('Form status changed:', status);
  }

  // Handle form submission
  onFormSubmit(formData: any) {
    console.log('Form submitted with data:', formData);

    if (formData.mode === 'add') {
      // Add new restaurant logic
      const newRestaurant = {
        id: `RST${String(this.restaurants.length + 1).padStart(3, '0')}`,
        restaurantName: formData.restaurantName,
        owner: 'New Owner', // You can get this from form or auth
        category: formData.restaurantType,
        status: formData.isVerified === 'true' ? 'Open' : 'Pending'
      };
      this.restaurants.push(newRestaurant);
      alert('Restaurant added successfully!');
    } else if (formData.mode === 'edit') {
      // Update restaurant logic
      alert('Restaurant updated successfully!');
    }
  }

  // Edit existing restaurant (DYNAMIC & SAFE)
  editRestaurant(restaurant: any) {

    console.log(restaurant, "restaurant")

    const formData = {
      restaurantName: restaurant.restaurantName ?? '',
      restaurantType: restaurant.restaurantType ?? '',
      restaurantAddress: restaurant.restaurantAddress ?? '',
      pincode: restaurant.pincode ?? '',
      latitude: restaurant.latitude ?? '',
      longitude: restaurant.longitude ?? '',
      fssaiNumber: restaurant.fssaiNumber ?? '',
      gstNumber: restaurant.gstNumber ?? '',
      registrationDate: restaurant.registrationDate ?? '',
      openingTime: restaurant.openingTime ?? '',
      closingTime: restaurant.closingTime ?? '',
      logoUrl: restaurant.logoUrl ?? '',
      coverImageUrl: restaurant.coverImageUrl ?? '',
      description: restaurant.description ?? '',
      isVerified: restaurant.isVerified ? 'true' : 'false',
      id: restaurant.id,
      ownerEmail: restaurant.ownerEmail ?? '',
      verifiedBy: restaurant.verifiedBy ?? '',
    };

    this.openForm('edit', formData);
  }

  // View restaurant details
  // viewRestaurant(restaurant: any) {
  //   alert(`Viewing details for: ${restaurant.restaurantName}`);
  // }

  // Delete restaurant
  deleteRestaurant(restaurant: any) {
    if (confirm(`Are you sure you want to delete ${restaurant.restaurantName}?`)) {
      this.restaurants = this.restaurants.filter(r => r.id !== restaurant.id);
      alert('Restaurant deleted successfully!');
    }
  }

  GET_RESTAURANTS = gql`
  query getRestaurants($page: Int, $limit: Int, $search: String) {
    restaurants(page: $page, limit: $limit, search: $search) {
      data {
        id
        restaurantName
        restaurantType
        restaurantAddress
        ownerEmail
        pincode
        latitude
        longitude
        fssaiNumber
        gstNumber
        registrationDate
        openingTime
        closingTime
        logoUrl
        coverImageUrl
        description
        isVerified
        verifiedBy
        createdAt
        updatedAt
      }
      total
      page
      limit
    }
  }
`;

  fetchRestaurants(page: number = 1, limit: number = 10, search: string = '') {
    this.loading = true;

    this.apollo
      .watchQuery<any>({
        query: this.GET_RESTAURANTS,
        variables: {
          page,
          limit,
          search: search || null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe({
        next: (res) => {
          const response = res.data.restaurants;

          this.restaurants = response.data;
          this.totalRecords = response.total;
          this.page = response.page;
          this.limit = response.limit;

          // ✅ pagination calculation
          this.totalPages = Math.ceil(this.totalRecords / this.limit);
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load restaurants';
          this.loading = false;
        },
      });
  }


  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    this.searchText = value;
    this.searchSubject.next(value);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.fetchRestaurants(page, this.limit, this.searchText);
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.goToPage(this.page + 1);
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.goToPage(this.page - 1);
    }
  }

  onOwnerEmailListChange(newList: any[]) {
    this.ownerEmailListParent = newList;
    console.log('Updated in parent:', this.ownerEmailListParent);
  }

  getOwnerEmail(ownerId: string): string {
  const user = this.ownerEmailListParent.find(u => u.id === ownerId);
  return user ? user.email : 'N/A';
}

fetchSummary() {
    this.apollo
      .watchQuery<any>({
        query: this.GET_RESTAURANT_SUMMARY,
        fetchPolicy: 'network-only',
      })
      .valueChanges
      .subscribe({
        next: (res: any) => {
          this.summary = res.data.getRestaurantSummary;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load summary';
          this.loading = false;
        },
      });
  }

}
