import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { SidebarComponent } from "../layouts/sidebar/sidebar.component";
import { HeaderComponent } from "../layouts/header/header.component";
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';

interface User {
  _id: string;
  name: string;
  email: string;
  roleId: string;
  status?: string;
}

const DELETE_USER = gql`
  mutation deleteUser($userId: String!) {
    deleteUser(userId: $userId) {
      message
    }
  }
`;


@Component({
  selector: 'app-user',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, CommonModule, SharedModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  showForm = false;
  editFormData:any
  Math = Math;

  users: User[] = [];
  filteredUsers: User[] = [];

  loading = false;
  error = '';

  searchText = '';
  selectedRole = '';
  selectedStatus = '';

  // PAGINATION
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  pageNumbers: number[] = [];
  loggedInRestIid: any
  editUserDetails: any = null

  roles = [
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


  constructor(private apollo: Apollo, private cookieservice: CookieService, private toster: ToastrService) { }

  ngOnInit() {

    this.loggedInRestIid = this.getLoggedInUserDetails();

    if (this.loggedInRestIid) {
      this.fetchAllUsers(this.loggedInRestIid);  // Pass the id properly
    }
  }


  getLoggedInUserDetails(): string | null {
    try {
      const token = this.cookieservice.get('auth_token');

      if (!token) {
        console.warn('No auth_token found in cookies');
        return null;
      }

      // Decode token
      const decodedToken: any = jwtDecode(token);

      // console.log(decodedToken, "decodedToken")

      // Check property exists
      if (decodedToken && decodedToken.res_id) {
        this.loggedInRestIid = decodedToken.res_id;
        return this.loggedInRestIid; // ✅ return assigned variable
      } else {
        console.warn('res_name not found in decoded token:', decodedToken);
        this.loggedInRestIid = 'all';
        return 'all';
      }

    } catch (error) {
      console.error('Error decoding JWT:', error);
      this.loggedInRestIid = '';
      return null;
    }
  }

  openRegisterForm(status: boolean) {
     this.editFormData = null;   // VERY IMPORTANT
    this.showForm = status;
  }

  editRegisterForm(data: any) {
    this.openRegisterForm(true)
    this.editFormData = data
  }

  closeFormClicked(event: any) {
    this.openRegisterForm(event.status);
    if (!event.status) {
      this.fetchAllUsers(this.loggedInRestIid);
    }
  }

  fetchAllUsers(restId: string) {
    this.loading = true;

    const GET_ALL_USERS = gql`
    query getAllUsers($restId: String!) {
      getAllUsers(restId: $restId) {
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
        restaurantId
      }
    }
  `;

    this.apollo
      .watchQuery<{ getAllUsers: User[] }>({
        query: GET_ALL_USERS,
        variables: { restId },   // ← HERE
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe({
        next: (res) => {
          this.users = res.data.getAllUsers;
          this.filteredUsers = [...this.users];
          this.calculatePagination();
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to fetch users:', err);
          this.error = 'Failed to load users';
          this.loading = false;
        },
      });
  }


  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesRole = this.selectedRole ? user.roleId === this.selectedRole : true;
      const matchesStatus = this.selectedStatus ? user.status === this.selectedStatus : true;

      return matchesSearch && matchesRole && matchesStatus;
    });

    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.currentPage = 1;

    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getRoleName(roleId: string) {
    return this.roles.find(r => r.id === roleId)?.name || 'Unknown';
  }


  deletedUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    this.apollo.mutate({
      mutation: DELETE_USER,
      variables: { userId }
    })
      .subscribe({
        next: (res: any) => {
          this.toster.success(res.data.deleteUser.message);
          console.log("User deleted:", res.data.deleteUser.message);

          // Refresh the list
          if (this.loggedInRestIid) {
            this.fetchAllUsers(this.loggedInRestIid);
          }
        },
        error: (err) => {
          console.error("Delete failed:", err);
          this.toster.error("Failed to delete user")
          alert("Failed to delete user");
        }
      });
  }




  viewUser(userId: any) {

  }



}
