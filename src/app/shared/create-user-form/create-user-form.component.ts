import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";
import { Apollo, gql } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';

const REGISTER_USER_WITH_RESTRAURENT = gql`
  mutation registerUser($input: CreateUserInput!) {
    registerUser(createUserInput: $input) {
      _id
      name
      email
      phone
      password
      state
      district
      block
      village
      roleId
      status
      permissions
      profile
      createdBy
      restaurant {
        restaurantName
        restaurantType
        restaurantAddress
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
        description
        isVerified
      }
    }
  }
`;

const REGISTER_USER = gql`
mutation registerUser($input: CreateUserInput!) {
    registerUser(createUserInput: $input) {
      _id
      name
      email
      phone
      password
      state
      district
      block
      village
      roleId
      status
      profile
      permissions
      createdBy
    }
  }
`;

@Component({
  selector: 'app-create-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './create-user-form.component.html',
  styleUrls: ['./create-user-form.component.css']
})
export class CreateUserFormComponent {
  @Output() closeForm = new EventEmitter<boolean>();
  @Input() loggedInRestIid!: string;
  @Input() allroles!:any
  registerForm!: FormGroup;
  restraurentSelected: boolean = false
  loading :boolean = false
  // 🔥 States List (Static Example)
  states: string[] = [
    "Uttar Pradesh",
  ];

  districts: string[] = [
    "Varanasi"
  ];


  blocks: string[] = [
    "Sadar"
  ];

  villages: string[] = [
    "Rampur"
  ];

roles = this.loggedInRestIid == 'all' ? [
  { id: "global-admin",          name: "Global Admin" },
  { id: "india-manager",         name: "India Manager" },
  { id: "state-manager",         name: "State Manager" },
  { id: "district-manager",      name: "District Manager" },
  { id: "block-manager",         name: "Block Manager" },
  { id: "restaurant-owner",      name: "Restaurant Owner" },
  { id: "restaurant-manager",    name: "Restaurant Manager" },
  { id: "chef-kitchen-head",     name: "Chef / Kitchen Head" },
  { id: "waiter-service-staff",  name: "Waiter / Service Staff" },
  { id: "inventory-manager",     name: "Inventory Manager" },
  { id: "quality-inspector",     name: "Quality Inspector" },
  { id: "delivery-partner",      name: "Delivery Partner" },
  { id: "support-executive",     name: "Support Executive" },
  { id: "marketing-manager",     name: "Marketing Manager" },
  { id: "finance-accounts",      name: "Finance / Accounts" }
] : [
  // { id: "global-admin",          name: "Global Admin" },
  // { id: "india-manager",         name: "India Manager" },
  // { id: "state-manager",         name: "State Manager" },
  // { id: "district-manager",      name: "District Manager" },
  // { id: "block-manager",         name: "Block Manager" },
  // { id: "restaurant-owner",      name: "Restaurant Owner" },
  { id: "restaurant-manager",    name: "Restaurant Manager" },
  { id: "chef-kitchen-head",     name: "Chef / Kitchen Head" },
  { id: "waiter-service-staff",  name: "Waiter / Service Staff" },
  { id: "inventory-manager",     name: "Inventory Manager" },
  // { id: "quality-inspector",     name: "Quality Inspector" },
  // { id: "delivery-partner",      name: "Delivery Partner" },
  // { id: "support-executive",     name: "Support Executive" },
  // { id: "marketing-manager",     name: "Marketing Manager" },
  // { id: "finance-accounts",      name: "Finance / Accounts" }
]  ;





  constructor(private fb: FormBuilder, private apollo: Apollo, private toastr:ToastrService) { }

  ngOnInit() {
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Za-z ]+$/)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        state: ['', Validators.required],
        district: ['', Validators.required],
        block: ['', Validators.required],
        village: ['', Validators.required],
        status: ['', Validators.required],
        profile: [''],
        roleId: ['', Validators.required],
        restaurantId:[this.loggedInRestIid != 'all' ? this.loggedInRestIid : ''],
        restaurant: this.fb.group({
          restaurantName: [{ value: '', disabled: true }, Validators.required],
          restaurantType: [{ value: '', disabled: true }, Validators.required],
          restaurantAddress: [{ value: '', disabled: true }],
          pincode: [{ value: '', disabled: true }, [Validators.pattern(/^[1-9][0-9]{5}$/)]],
          latitude: [{ value: '', disabled: true }],
          longitude: [{ value: '', disabled: true }],
          fssaiNumber: [{ value: '', disabled: true }],
          gstNumber: [{ value: '', disabled: true }],
          panNumber: [{ value: '', disabled: true }],
          registrationDate: [{ value: '', disabled: true }],
          openingTime: [{ value: '', disabled: true }],
          closingTime: [{ value: '', disabled: true }],
          logoUrl: [{ value: '', disabled: true }],
          coverImageUrl: [{ value: '', disabled: true }],
          description: [{ value: '', disabled: true }],
          isVerified: [{ value: false, disabled: true }]
        })
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  onRoleChange(event: any) {
    const selectedRole = event.target.value;
    const restaurantGroup = this.registerForm.get('restaurant') as FormGroup;

    // Suppose 'r6' is the restaurant role ID
    if (selectedRole === 'restaurant-owner') {
      this.restraurentSelected = true
      Object.keys(restaurantGroup.controls).forEach(field => {
        restaurantGroup.get(field)?.enable();
      });
    } else {
      this.restraurentSelected = false
      Object.keys(restaurantGroup.controls).forEach(field => {
        restaurantGroup.get(field)?.disable();
      });
      restaurantGroup.reset();
    }
  }


onSubmit(): void {
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    this.toastr.error('Please fill all required fields', 'Form Invalid');
    return;
  }

  // Extract full payload including disabled fields
  const payload = this.registerForm.getRawValue();

  // Convert isVerified string -> boolean (if restaurant exists)
  if (payload.restaurant) {
    payload.restaurant.isVerified =
      payload.restaurant.isVerified === 'true'
        ? true
        : payload.restaurant.isVerified === 'false'
        ? false
        : payload.restaurant.isVerified;
  }

  // Remove restaurant field if role is NOT r6
  if (payload.roleId !== 'restaurant-owner') {
    delete payload.restaurant;
  }

  console.log("📦 Final Payload Sent:", payload);

  // Show loader
  this.loading = true;

  this.apollo
    .mutate({
      mutation:
        this.restraurentSelected
          ? REGISTER_USER_WITH_RESTRAURENT
          : REGISTER_USER,
      variables: { input: payload },
    })
    .subscribe({
      next: (res: any) => {
        this.loading = false;

        this.toastr.success('User created successfully!', 'Success');

        // console.log('Success:', res);

        // Reset form after success
        this.registerForm.reset();
      },

      error: (err) => {
        this.loading = false;

        console.error('❌ Error:', err);

        const message =
          err?.message ||
          err?.graphQLErrors?.[0]?.message ||
          'Something went wrong!';

        this.toastr.error(message, 'Error');
      },
    });
}


  closeFormClicked() {
    this.closeForm.emit(false);
  }
}
