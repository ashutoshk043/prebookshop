import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Apollo, gql } from 'apollo-angular';

const GET_RESTAURANT_PROFILE = gql`
  query GetRestaurantProfile($restId: String!) {
    getRestaurantProfile(restId: $restId) {
      name
      ownerName
      type
      phone
      email
      address
      city
      state
      pincode
      latitude
      longitude
      fssaiNumber
      gstNumber
      panNumber
      registrationDate
      openingTime
      closingTime
      isOpen
      rating
      totalOrders
      logoUrl
      coverImageUrl
      description
      isVerified
    }
  }
`;



const UPDATE_RESTAURANT = gql`
  mutation UpdateRestaurant($id: ID!, $updateRestaurantDto: UpdateRestaurantDto!) {
    updateRestaurant(id: $id, updateRestaurantDto: $updateRestaurantDto) {
       _id
      name
      ownerName
      type
      phone
      email
      description
      address
      city
      state
      pincode
      latitude
      longitude
      fssaiNumber
      gstNumber
      panNumber
      registrationDate
      openingTime
      closingTime
      logoUrl
      coverImageUrl
      isVerified
    }
  }
`;


@Component({
  selector: 'app-restraurent-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './restraurent-profile.component.html',
  styleUrl: './restraurent-profile.component.css'
})
export class RestraurentProfileComponent implements OnInit {
  restaurantForm!: FormGroup;
  showPaymentModal = false;
  showSuccessModal = false;
  isProcessing = false;
  loading = false;
    logoPreview: string | null = null;
coverPreview: string | null = null;

  // ⚙️ Replace with dynamic restaurant ID later
  restId = '69003056360539d1a8520b98';

  constructor(private fb: FormBuilder, private apollo: Apollo) { }

  ngOnInit(): void {
    this.initializeForm();
    this.restaurantForm.get('isVerified')?.disable();
    this.fetchRestaurantProfile();
  }

  initializeForm(): void {
    this.restaurantForm = this.fb.group({
      // Basic Information
      name: ['', Validators.required],
      ownerName: ['', Validators.required],
      type: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      description: [''],

      // Location Details
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', Validators.pattern(/^[0-9]{6}$/)],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],

      // Legal Information
      fssaiNumber: ['', Validators.required],
      gstNumber: [''],
      panNumber: ['', Validators.required],
      registrationDate: ['', Validators.required],

      // Operating Hours
      openingTime: ['', Validators.required],
      closingTime: ['', Validators.required],

      // Media & Additional
      logoUrl: ['', Validators.required],
      coverImageUrl: ['', Validators.required],
      isVerified: [false, Validators.required]
    });
  }
  fetchRestaurantProfile(): void {
    this.loading = true;

    this.apollo
      .query({
        query: GET_RESTAURANT_PROFILE,
        variables: { restId: this.restId }
      })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          const profile = res?.data?.getRestaurantProfile;

          if (profile) {
            // 🧩 Make a mutable clone (to avoid read-only property issue)
            const profileCopy: any = { ...profile };

            // ✅ Safe date conversion
            if (profileCopy.registrationDate) {
              try {
                const dateObj = new Date(profileCopy.registrationDate);
                if (!isNaN(dateObj.getTime())) {
                  profileCopy.registrationDate = dateObj.toISOString().split('T')[0];
                  // profileCopy.isVerified = true
                } else {
                  console.warn('⚠️ Invalid registrationDate received:', profileCopy.registrationDate);
                  profileCopy.registrationDate = '';
                }
              } catch (err) {
                console.error('❌ Error parsing registrationDate:', err);
                profileCopy.registrationDate = '';
              }
            } else {
              profileCopy.registrationDate = '';
            }

            // ✅ Patch the form with clone
            this.restaurantForm.patchValue(profileCopy);
            console.log('✅ Restaurant profile patched successfully:', profileCopy);
          } else {
            console.warn('⚠️ No restaurant profile found.');
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('❌ Error fetching restaurant profile:', err);
          alert('Error fetching restaurant data.');
        }
      });
  }



  onSubmit(): void {
   const formValue = this.restaurantForm.value;

  // Prepare DTO (remove file objects for now — just send URLs)
  const updateDto: any = {
    ...formValue,
    registrationDate: new Date(formValue.registrationDate).toISOString(),
  };

  // 🧠 If files are used instead of URLs, handle upload separately before mutation
  if (updateDto.logoUrl instanceof File) updateDto.logoUrl = '';
  if (updateDto.coverImageUrl instanceof File) updateDto.coverImageUrl = '';

  console.log('🛰 Sending updateRestaurant mutation:', updateDto);

  this.apollo
    .mutate({
      mutation: UPDATE_RESTAURANT,
      variables: {
        id: this.restId,
        updateRestaurantDto: updateDto,
      },
    })
    .subscribe({
      next: (response: any) => {
        console.log('✅ Restaurant updated successfully:', response);
        this.showSuccessModal = true;
      },
      error: (error) => {
        console.error('❌ Error updating restaurant:', error);
        alert(error.message);
      },
    });
  }

  onCancel(): void {
    if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      this.restaurantForm.reset();
      window.location.reload();
    }
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    document.body.style.overflow = 'auto';
  }

  processPayment(): void {
    this.isProcessing = true;

    setTimeout(() => {
      this.isProcessing = false;
      this.showPaymentModal = false;
      this.showSuccessModal = true;
      this.submitFormData();
    }, 2000);
  }

  submitFormData(): void {
    const formData = this.restaurantForm.value;
    console.log('Submitting to backend:', formData);
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    document.body.style.overflow = 'auto';
    this.restaurantForm.reset();
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.restaurantForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.restaurantForm.get(fieldName);
    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('email')) return 'Please enter a valid email address';
    if (field?.hasError('pattern')) {
      if (fieldName === 'phone') return 'Please enter a valid 10-digit phone number';
      if (fieldName === 'pincode') return 'Please enter a valid 6-digit pincode';
    }
    if (field?.hasError('min') || field?.hasError('max')) return 'Please enter a valid value';
    return '';
  }



onFileSelected(event: any, type: 'logo' | 'cover'): void {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    if (type === 'logo') {
      this.logoPreview = reader.result as string;
      this.restaurantForm.patchValue({ logoUrl: file });
    } else {
      this.coverPreview = reader.result as string;
      this.restaurantForm.patchValue({ coverImageUrl: file });
    }
  };
  reader.readAsDataURL(file);
}

}
