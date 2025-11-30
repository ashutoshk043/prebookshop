import { Component, EventEmitter, Input, input, Output, SimpleChanges } from '@angular/core';
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

const UPDATE_USER = gql`
  mutation updateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      _id
      name
      email
      phone
      state
      district
      block
      village
      roleId
      status
      profile
    }
  }
`;




const GET_ALL_STATES = gql`
  query GetAllStates {
    getAllStates {
      stateName
    }
  }
`;


const GET_ALL_DISTRICTS = gql`
  query GetAllDistricts($stateName: String!) {
    getAllDistricts(stateName: $stateName) {
      districtName
    }
  }
`;


const GET_ALL_SUB_DISTRICTS = gql`
query GetAllSubDistricts($districtName: String!) {
    GetAllSubDistricts(districtName: $districtName) {
      subDistrictName
    }
  }
`;


const GET_ALL_VILLAGES = gql`
query getAllVillages($subDistrictName: String!) {
    getAllVillages(subDistrictName: $subDistrictName) {
      villageName
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
  @Input() allroles!: any
  @Input() editForm!: any
  registerForm!: FormGroup;
  restraurentSelected: boolean = false
  loading: boolean = false
  // 🔥 States List (Static Example)
  states: any[] = [
  ];

  districts: any[] = [];


  subDistricts: any[] = [
  ];

  villages: any[] = [
  ];

  roles: any = []




  constructor(private fb: FormBuilder, private apollo: Apollo, private toastr: ToastrService) { }

  ngOnInit() {
    this.createRegisterForm();
    this.loadRoles();
    this.getStateLists()
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['editForm']) {

      // 👉 Case 1: EDIT MODE — patch values
      if (this.editForm) {
        setTimeout(() => this.patchRegisterForm(this.editForm), 0);
      }

      // 👉 Case 2: ADD MODE — reset clean empty form
      else {
        setTimeout(() => {
          this.registerForm.reset();
          this.createRegisterForm(); // Restore validators
        }, 0);
      }
    }
  }

  loadRoles() {
    // if (this.loggedInRestIid == 'all') {
    this.roles = [
      { id: "global-admin", name: "Global Admin" },
      { id: "india-manager", name: "India Manager" },
      { id: "state-manager", name: "State Manager" },
      { id: "district-manager", name: "District Manager" },
      { id: "block-manager", name: "Block Manager" },
      { id: "restaurant-owner", name: "Restaurant Owner" },
      { id: "restaurant-manager", name: "Restaurant Manager" },
      { id: "chef-kitchen-head", name: "Chef / Kitchen Head" },
      { id: "waiter-service-staff", name: "Waiter / Service Staff" },
      { id: "inventory-manager", name: "Inventory Manager" },
      { id: "quality-inspector", name: "Quality Inspector" },
      { id: "delivery-partner", name: "Delivery Partner" },
      { id: "support-executive", name: "Support Executive" },
      { id: "marketing-manager", name: "Marketing Manager" },
      { id: "finance-accounts", name: "Finance / Accounts" }
    ];
    // } else {
    //   this.roles = [
    //     { id: "restaurant-manager", name: "Restaurant Manager" },
    //     { id: "chef-kitchen-head", name: "Chef / Kitchen Head" },
    //     { id: "waiter-service-staff", name: "Waiter / Service Staff" },
    //     { id: "inventory-manager", name: "Inventory Manager" }
    //   ];
    // }
  }


  patchRegisterForm(data: any) {
    if (!data || !this.registerForm) return;

    // STEP 1: Patch basic fields
    this.registerForm.patchValue({
      _id: data._id,
      name: data.name ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      state: data.state ?? '',
      district: data.district ?? '',
      block: data.block ?? '',
      village: data.village ?? '',
      status: data.status ?? '',
      profile: data.profile ?? '',
      roleId: data.roleId ?? '',
      // restaurantId: data.restaurantId ?? ''
    });

    // STEP 2: Disable password validators on edit mode
    const password = this.registerForm.get('password');
    const confirm = this.registerForm.get('confirmPassword');

    password?.clearValidators();
    confirm?.clearValidators();

    password?.updateValueAndValidity();
    confirm?.updateValueAndValidity();

    this.registerForm.setValidators(null);
    this.registerForm.updateValueAndValidity();


    // -----------------------------
    // 🔥 STEP 3: PATCH DEPENDENT DROPDOWN LOGIC
    // -----------------------------

    // 1️⃣ Load districts of selected state
    if (data.state) {
      this.getAllDistricts(data.state, () => {

        // 2️⃣ After districts loaded, set selected district
        this.registerForm.patchValue({ district: data.district });

        // Load sub-districts for this district
        if (data.district) {
          this.getAllSubDistrict(data.district, () => {

            // 3️⃣ After sub-districts loaded, set selected block
            this.registerForm.patchValue({ block: data.block });

            // Load villages for this sub-district
            if (data.block) {
              this.getAllVillages(data.block, () => {

                // 4️⃣ After villages loaded, set selected village
                this.registerForm.patchValue({ village: data.village });

              });
            }
          });
        }
      });
    }
  }






  createRegisterForm() {
    this.registerForm = this.fb.group(
      {
        _id: [''],
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
        restaurantId: [this.loggedInRestIid != 'all' ? this.loggedInRestIid : ''],
        // restaurant: this.fb.group({
        //   restaurantName: [{ value: '', disabled: true }, Validators.required],
        //   restaurantType: [{ value: '', disabled: true }, Validators.required],
        //   restaurantAddress: [{ value: '', disabled: true }],
        //   pincode: [{ value: '', disabled: true }, [Validators.pattern(/^[1-9][0-9]{5}$/)]],
        //   latitude: [{ value: '', disabled: true }],
        //   longitude: [{ value: '', disabled: true }],
        //   fssaiNumber: [{ value: '', disabled: true }],
        //   gstNumber: [{ value: '', disabled: true }],
        //   panNumber: [{ value: '', disabled: true }],
        //   registrationDate: [{ value: '', disabled: true }],
        //   openingTime: [{ value: '', disabled: true }],
        //   closingTime: [{ value: '', disabled: true }],
        //   logoUrl: [{ value: '', disabled: true }],
        //   coverImageUrl: [{ value: '', disabled: true }],
        //   description: [{ value: '', disabled: true }],
        //   isVerified: [{ value: false, disabled: true }]
        // })
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields', 'Form Invalid');
      return;
    }

    // Extract payload (including disabled fields)
    const payload = this.registerForm.getRawValue();

    // Convert isVerified string -> boolean (if restaurant field exists)
    // if (payload.restaurant) {
    //   payload.restaurant.isVerified =
    //     payload.restaurant.isVerified === 'true'
    //       ? true
    //       : payload.restaurant.isVerified === 'false'
    //         ? false
    //         : payload.restaurant.isVerified;
    // }

    // ----------------------------------
    // 🔥 EDIT MODE → CALL updateUser()
    // ----------------------------------
if (this.editForm) {
  const payload = this.registerForm.getRawValue();

  // Convert _id → id for backend
  payload.id = payload._id;
  delete payload._id;

  // Remove empty password fields
  if (!payload.password) {
    delete payload.password;
    delete payload.confirmPassword;
  }

  console.log("✏️ Update Mode Payload:", payload);

  this.apollo.mutate({
    mutation: UPDATE_USER,
    variables: {
      updateUserInput: payload
    }
  })
  .subscribe({
    next: (res: any) => {
      this.loading = false;
      this.toastr.success("User updated successfully!", "Updated");

      console.log("Updated User:", res);
      this.editForm = false;
      this.registerForm.reset();
    },
    error: (err) => {
      this.loading = false;

      const message =
        err?.message ||
        err?.graphQLErrors?.[0]?.message ||
        "Something went wrong!";

      this.toastr.error(message, "Error");
    }
  });

  return;
}

    // ----------------------------------
    // 🟢 CREATE MODE → CALL Register
    // ----------------------------------

    if ('_id' in payload) {
      delete payload._id;
    }

    console.log("🆕 Create Mode Payload:", payload);

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

          this.registerForm.reset();
        },

        error: (err) => {
          this.loading = false;

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



  getStateLists() {
    this.apollo
      .watchQuery({
        query: GET_ALL_STATES
      })
      .valueChanges.subscribe({
        next: (res: any) => {
          this.states = res?.data?.getAllStates || [];
          console.log("📌 States Loaded:", this.states);
        },
        error: (err) => {
          console.error("❌ Error Fetching States:", err);
          this.toastr.error("Failed to load states", "Error");
        }
      });
  }

  getAllDistricts(stateName: string, callback?: () => void) {
    this.apollo
      .watchQuery({
        query: GET_ALL_DISTRICTS,
        variables: { stateName }
      })
      .valueChanges.subscribe({
        next: (res: any) => {
          // Store data
          this.districts = res?.data?.getAllDistricts || [];

          // 🔥 Callback execute only after API data arrives
          if (callback) callback();
        },
        error: (err) => {
          console.error("❌ Error Fetching Districts:", err);
        }
      });
  }


  getAllSubDistrict(districtName: string, callback?: () => void) {
    this.apollo
      .watchQuery({
        query: GET_ALL_SUB_DISTRICTS,
        variables: { districtName }
      })
      .valueChanges.subscribe({
        next: (res: any) => {
          // Store data
          this.subDistricts = res?.data?.GetAllSubDistricts || [];

          // 🔥 Execute callback after load
          if (callback) callback();
        },
        error: (err) => {
          console.error("❌ Error Fetching Sub-Districts:", err);
        }
      });
  }


  getAllVillages(subDistrictName: string, callback?: () => void) {
    this.apollo
      .watchQuery({
        query: GET_ALL_VILLAGES,
        variables: { subDistrictName }
      })
      .valueChanges.subscribe({
        next: (res: any) => {
          // Store data
          this.villages = res?.data?.getAllVillages || [];

          // 🔥 Execute callback when done
          if (callback) callback();
        },
        error: (err) => {
          console.error("❌ Error Fetching Villages:", err);
        }
      });
  }



  onStateChange(event: any) {
    const selectedState = event.target.value;
    this.getAllDistricts(selectedState)
  }


  onDistrictChange(event: any) {
    const selectedDistrict = event.target.value;
    this.getAllSubDistrict(selectedDistrict)
  }

  onSubDistrictChange(event: any) {
    const selectedSubDistricts = event.target.value;
    this.getAllVillages(selectedSubDistricts)
  }

}
