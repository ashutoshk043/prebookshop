import { Component, EventEmitter, input, Output } from '@angular/core';
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
  registerForm!: FormGroup;
  restraurentSelected: boolean = false
  loading :boolean = false
  // 🔥 States List (Static Example)
  states: string[] = [
    "Uttar Pradesh",
    "Bihar",
    "Delhi",
    "Madhya Pradesh",
    "Rajasthan",
    "Maharashtra",
    "Punjab",
    "Haryana",
    "Gujarat",
    "Jharkhand"
  ];

  districts: string[] = [
    "Varanasi",
    "Lucknow",
    "Kanpur",
    "Gorakhpur",
    "Prayagraj",
    "Agra",
    "Meerut",
    "Ghaziabad",
    "Bareilly",
    "Ayodhya",
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Darbhanga",
    "Purnia",
    "Arrah",
    "Nalanda",
    "Begusarai",
    "New Delhi",
    "Central Delhi",
    "East Delhi",
    "North Delhi",
    "South Delhi",
    "West Delhi",
    "Shahdara",
    "Dwarka",
    "Bhopal",
    "Indore",
    "Gwalior",
    "Jabalpur",
    "Ujjain",
    "Rewa",
    "Sagar",
    "Ratlam",
    "Jaipur",
    "Jodhpur",
    "Udaipur",
    "Kota",
    "Ajmer",
    "Bikaner",
    "Alwar",
    "Sikar",
    "Mumbai",
    "Pune",
    "Nagpur",
    "Nashik",
    "Thane",
    "Aurangabad",
    "Kolhapur",
    "Amritsar",
    "Ludhiana",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "Gurugram",
    "Faridabad",
    "Hisar",
    "Panipat",
    "Karnal",
    "Sonipat",
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Gandhinagar",
    "Ranchi",
    "Jamshedpur",
    "Dhanbad",
    "Hazaribagh",
    "Giridih",
    "Bokaro"
  ];


  blocks: string[] = [
    "Sadar",
    "Pindra",
    "Sewapuri",
    "Harhua",
    "Kashi Vidyapeeth",
    "Chiraigaon",
    "Baragaon",
    "Shahganj",
    "Badlapur",
    "Baksha",
    "Maharajganj",
    "Kerakat",
    "Machhlishahr",
    "City",
    "Rural",
    "Rajatalab",
    "Dhanapur",
    "Naugarh",
    "Chandauli",
    "Sakaldiha",
    "Nizamabad",
    "Phoolpur",
    "Handia",
    "Karchana",
    "Koraon",
    "Meja",
    "Soraon",
    "Bahadurpur",
    "Ramnagar",
    "Chandpur",
    "Sikandarpur",
    "Belthara Road",
    "Sohaon",
    "Manihari",
    "Simri",
    "Buxar",
    "Dumraon",
    "Barhampur",
    "Chausa",
    "Rajpur",
    "Harnaut",
    "Hilsa",
    "Asthawan",
    "Islampur",
    "Bihar Sharif",
    "Bind",
    "Delhi Cantt",
    "Najafgarh",
    "Dwarka Sector",
    "Matiala",
    "Tilak Nagar",
    "Saket",
    "Malviya Nagar",
    "Mehrauli",
    "Jor Bagh",
    "Indore Urban",
    "Indore Rural",
    "Sanwer",
    "Depalpur",
    "Katpadi",
    "Perambur",
    "Anna Nagar",
    "Vasant Vihar",
    "Kurla",
    "Andheri",
    "Dadar",
    "Colaba",
    "Bandra",
    "Borivali",
    "Panvel",
    "Navi Mumbai",
    "Hinjewadi",
    "Hadapsar",
    "Kothrud",
    "Mira Road",
    "Vasai",
    "Virar",
    "Rajkot East",
    "Rajkot West",
    "Surat City",
    "Adajan",
    "Vesu",
    "Amritsar-1",
    "Amritsar-2",
    "Gurugram Sector 10",
    "Gurugram Sector 15",
    "Ballabgarh",
    "Fatehabad",
    "Rewari Urban",
    "Rewari Rural",
    "Ranchi Sadar",
    "Ormanjhi",
    "Angara",
    "Namkum",
    "Kanke"
  ];

  villages: string[] = [
    "Rampur",
    "Keshopur",
    "Bhawanipur",
    "Kharagpur",
    "Sirsila",
    "Manikpur",
    "Dhanapur",
    "Ramnagar",
    "Mahadevpur",
    "Tikri",
    "Kanchanpur",
    "Khajuri",
    "Kaithauli",
    "Baraipur",
    "Saraiya",
    "Bishunpura",
    "Paharpur",
    "Chandpur",
    "Chhitampatti",
    "Sonbarsa",
    "Naugarh Kala",
    "Naugarh Khurd",
    "Babhani",
    "Ghorawal",
    "Dudhi",
    "Pipri",
    "Gopiganj",
    "Gyanpur",
    "Bhadohi",
    "Suriyawan",
    "Sarai Akil",
    "Sarai Mamrej",
    "Basgaon",
    "Chhitupur",
    "Nagwa",
    "Lahartara",
    "Lohta",
    "Phulwaria",
    "Harhua",
    "Chandmari",
    "Susuwahi",
    "Manduadih",
    "Konia",
    "Chandrika Nagar",
    "Babatpur",
    "Chiraigaon",
    "Sirasa",
    "Jansa",
    "Arajiline",
    "Kapsethi",
    "Raja Talab",
    "Baksara",
    "Madanpur",
    "Daffi",
    "Akhari",
    "Mahgaon",
    "Rameshwar",
    "Kandwa",
    "Karsana",
    "Sewapuri",
    "Kandhiya",
    "Katesar",
    "Sarnath",
    "Pindra",
    "Sindhora",
    "Sarveshwarpur",
    "Marui",
    "Dharsauna",
    "Kaithi",
    "Zamania",
    "Ghazipur",
    "Karanda",
    "Manihari",
    "Reotipur",
    "Barachawar",
    "Mardah",
    "Fatehullahpur",
    "Kasba",
    "Madurai Pudur",
    "Shivdaspur",
    "Bhitari",
    "Karsana Kala",
    "Chhawani Line",
    "Bairagi",
    "Nibi",
    "Baraipur Kala",
    "Baraipur Khurd",
    "Sadat",
    "Mirzapur",
    "Dahina",
    "Mahuwari",
    "Dariyabad",
    "Gaura",
    "Kurthua",
    "Nibi Kalan",
    "Karanpur",
    "Lakhnoti",
    "Bhasuriya",
    "Sujabad",
    "Tikari"
  ];

  roles = [
    { id: "r1", name: "Global Admin" },
    { id: "r2", name: "India Manager" },
    { id: "r3", name: "State Manager" },
    { id: "r4", name: "District Manager" },
    { id: "r5", name: "Block Manager" },
    { id: "r6", name: "Restaurant Owner" },
    { id: "r7", name: "Restaurant Manager" },
    { id: "r8", name: "Chef / Kitchen Head" },
    { id: "r9", name: "Waiter / Service Staff" },
    { id: "r10", name: "Inventory Manager" },
    { id: "r11", name: "Quality Inspector" },
    { id: "r12", name: "Delivery Partner" },
    { id: "r14", name: "Support Executive" },
    { id: "r15", name: "Marketing Manager" },
    { id: "r16", name: "Finance / Accounts" }
  ];




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
    if (selectedRole === 'r6') {
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
  if (payload.roleId !== 'r6') {
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
