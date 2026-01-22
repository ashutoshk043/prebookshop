import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Apollo, gql } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
declare var bootstrap: any;

@Component({
  selector: 'app-create-restraurent-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule],
  templateUrl: './create-restraurent-form.component.html',
  styleUrl: './create-restraurent-form.component.css'
})
export class CreateRestraurentFormComponent {

  usersTotal: any;
  usersPage: any;
  usersLimit: any;

  @ViewChild('restaurantModal') modalElement!: ElementRef;
  @Output() formStatus = new EventEmitter<boolean>();
  @Output() formSubmit = new EventEmitter<any>();
  ownerSearch$ = new Subject<string>();

  private modalInstance: any;
  formMode: 'add' | 'edit' = 'add';
  restaurantForm!: FormGroup;
  RESTAURANT_FIELDS = `
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
`;

  GET_USERS_FROM_AUTH = gql`
  query usersFromAuth($input: UserDetailsPaginationInput!) {
    usersFromAuth(input: $input) {
      data {
        email
        id
      }
      total
      page
      limit
    }
  }
`;

  ownerEmailList:any = [
  ];
  @Output() ownerEmailListChange = new EventEmitter<any[]>();

  hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );

  minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  convertTo24(hour: string, minute: string, period: string): string {
    let h = parseInt(hour, 10);

    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    return `${h.toString().padStart(2, '0')}:${minute}`;
  }

  updateOwnerEmailList(newList: any[]) {
    this.ownerEmailList = newList;

    // 🔥 Emit करके parent में भेजो
    this.ownerEmailListChange.emit(this.ownerEmailList);
  }

CREATE_RESTAURANT = gql`
  mutation createRestaurant($input: CreateRestaurantInput!) {
    createRestaurant(input: $input) {
      ${this.RESTAURANT_FIELDS}
    }
  }
`;

UPDATE_RESTAURANT = gql`
  mutation updateRestaurant($input: CreateRestaurantInput!) {
    updateRestaurant(input: $input) {
      ${this.RESTAURANT_FIELDS}
    }
  }
`;





  constructor(private fb: FormBuilder, private apollo: Apollo, private toastr: ToastrService) {
    this.initializeForm();
    this.fetchUsersFromAuth(
      1, 1000000, ''
    ),

      this.ownerSearch$
        .pipe(
          debounceTime(400),
          distinctUntilChanged()
        )
        .subscribe(search => {
          this.fetchUsersFromAuth(1, 1000000, search);
        });
  }

  onOwnerSearch(event: { term: string }) {
    this.ownerSearch$.next(event.term || '');
  }

  initializeForm() {
    const today = this.setTodayDate();

    this.restaurantForm = this.fb.group({
      _id: [''],

      restaurantName: ['', Validators.required],
      restaurantType: ['', Validators.required],
      restaurantAddress: ['', Validators.required],

      ownerEmail: ['', [Validators.required]],

      pincode: ['', [Validators.required, Validators.pattern('[0-9]{6}')]],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],

      fssaiNumber: ['', Validators.required],

      gstNumber: ['', [
        Validators.pattern('[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}')
      ]],

      // panNumber: ['', [
      //   Validators.required,
      //   Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')
      // ]],

      registrationDate: [today, Validators.required],

      /* 🔹 Opening Time (12-hour) */
      openingHour: ['', Validators.required],
      openingMinute: ['', Validators.required],
      openingPeriod: ['', Validators.required],

      /* 🔹 Closing Time (12-hour) */
      closingHour: ['', Validators.required],
      closingMinute: ['', Validators.required],
      closingPeriod: ['', Validators.required],

      /* 🔹 Final backend fields */
      openingTime: [''],
      closingTime: [''],

      logoUrl: [''],
      coverImageUrl: [''],
      description: [''],

      isVerified: ['', Validators.required],
      verifiedBy: ['']
    });
  }


  setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    this.restaurantForm?.patchValue({
      registrationDate: today
    });
  }


  ngAfterViewInit() {
    if (this.modalElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement, {
        backdrop: 'static',
        keyboard: false
      });

      this.modalElement.nativeElement.addEventListener('hidden.bs.modal', () => {
        this.formStatus.emit(false);
        this.restaurantForm.reset();
      });
    }
  }

openFormFromParent(mode: 'add' | 'edit', data?: any) {
  // console.log('Opening form for mode:', mode);
  // console.log('Restaurant data:', data);
  // console.log('OwnerEmailList:', this.ownerEmailList);

  this.formMode = mode;
  this.restaurantForm.reset();

  if (mode === 'edit' && data) {
    const opening = this.convertFrom24(data.openingTime);
    const closing = this.convertFrom24(data.closingTime);

    const patchData: any = {
      _id: data.id || data._id,
      restaurantName: data.restaurantName ?? '',
      restaurantType: data.restaurantType ?? '',
      restaurantAddress: data.restaurantAddress ?? '',
      pincode: data.pincode ?? '',
      latitude: data.latitude ?? '',
      longitude: data.longitude ?? '',
      fssaiNumber: data.fssaiNumber ?? '',
      gstNumber: data.gstNumber ?? '',
      registrationDate: data.registrationDate ?? '',
      logoUrl: data.logoUrl ?? '',
      coverImageUrl: data.coverImageUrl ?? '',
      description: data.description ?? '',
      verifiedBy: data.verifiedBy ?? '',
      isVerified: data.isVerified ? 'true' : 'false',
      openingHour: opening.hour,
      openingMinute: opening.minute,
      openingPeriod: opening.period,
      closingHour: closing.hour,
      closingMinute: closing.minute,
      closingPeriod: closing.period,
      ownerEmail: data.ownerEmail ?? '',  // check console to see if ownerId exists
    };

    this.restaurantForm.patchValue(patchData);
  } else {
    this.setTodayDate();
  }

  this.modalInstance?.show();
}




  closeForm() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  onSubmitRestaurant(): void {

    // ❌ Invalid form
    if (this.restaurantForm.invalid) {
      this.restaurantForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields', 'Form Invalid');
      return;
    }

    const payload: any = this.restaurantForm.getRawValue();

    payload.isVerified = Boolean(payload.isVerified);

    // 🔁 Convert AM/PM → 24 hour (FOR BOTH MODES)
    payload.openingTime = this.convertTo24(
      payload.openingHour,
      payload.openingMinute,
      payload.openingPeriod
    );

    payload.closingTime = this.convertTo24(
      payload.closingHour,
      payload.closingMinute,
      payload.closingPeriod
    );

    // ❌ Remove UI-only fields
    delete payload.openingHour;
    delete payload.openingMinute;
    delete payload.openingPeriod;
    delete payload.closingHour;
    delete payload.closingMinute;
    delete payload.closingPeriod;

    // ----------------------------------
    // ✏️ EDIT MODE
    // ----------------------------------
    if (this.formMode === 'edit') {
      payload.id = payload._id;
      delete payload._id;

      console.log('✏️ Update Restaurant Payload:', payload);

      this.apollo.mutate({
        mutation: this.UPDATE_RESTAURANT,
        variables: { input: payload }
      }).subscribe({
        next: (res: any) => {
          this.toastr.success('Restaurant updated successfully!', 'Updated');
          this.formMode = 'add';
          this.restaurantForm.reset();
        },
        error: (err) => {
          this.toastr.error(
            err?.graphQLErrors?.[0]?.message || 'Something went wrong!',
            'Error'
          );
        }
      });

      return;
    }

    // ----------------------------------
    // 🟢 CREATE MODE
    // ----------------------------------
    delete payload._id;

    console.log('🆕 Create Restaurant Payload:', payload);
    this.apollo.mutate({
      mutation: this.CREATE_RESTAURANT,
      variables: { input: payload }
    }).subscribe({
      next: (res: any) => {
        this.toastr.success('Restaurant added successfully!', 'Success');
        this.restaurantForm.reset();
      },
      error: (err) => {
        this.toastr.error(
          err?.graphQLErrors?.[0]?.message || 'Something went wrong!',
          'Error'
        );
      }
    });
  }



  onCancel() {
    this.closeForm();
  }

  onReset() {
    this.restaurantForm.reset();
  }

  // Helper method to mark all fields as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.restaurantForm.controls;
  }



  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);

        // 🔹 Patch values into form
        this.restaurantForm.patchValue({
          latitude: latitude.toString(),
          longitude: longitude.toString()
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Location permission denied or unavailable');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }


  convertFrom24(time: string): { hour: string; minute: string; period: 'AM' | 'PM' } {
    if (!time) {
      return { hour: '12', minute: '00', period: 'AM' };
    }

    let [h, m] = time.split(':').map(Number);
    const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';

    if (h === 0) h = 12;
    else if (h > 12) h -= 12;

    return {
      hour: h.toString().padStart(2, '0'),
      minute: m.toString().padStart(2, '0'),
      period
    };
  }



  fetchUsersFromAuth(
    page: number,
    limit: number,
    search: string
  ) {

    this.apollo
      .watchQuery<{
        usersFromAuth: {
          data: any[];
          total: number;
          page: number;
          limit: number;
        };
      }>({
        query: this.GET_USERS_FROM_AUTH,
        variables: {
          input: {
            page,
            limit,
            search: search || null,
          },
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe({
        next: (res: any) => {
          const response = res.data.usersFromAuth;

          this.ownerEmailList = response.data;
          this.usersTotal = response.total;
          this.usersPage = response.page;
          this.usersLimit = response.limit;
           this.updateOwnerEmailList(this.ownerEmailList);

          // console.log('Users from Auth:', this.ownerEmailList);
        },
        error: (err) => {
          console.error('Failed to fetch users from auth:', err);
        },
      });
  }


}