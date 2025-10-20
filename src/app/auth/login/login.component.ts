import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

const GET_ALL_RESTAURANTS = gql`
  query {
    getAllRestaurants {
      _id
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
      createdBy
      verifiedBy {
        userId
        role
        verifiedAt
        remarks
      }
      createdAt
      updatedAt
    }
  }
`;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  restaurants: any[] = [];
  loading: boolean = false;
  error: any;

  constructor(private readonly apollo: Apollo) {}

  ngOnInit() {
    this.loading = true;

    this.apollo
      .watchQuery({
        query: GET_ALL_RESTAURANTS
      })
      .valueChanges
      .subscribe({
        next: (result: any) => {
          this.restaurants = result?.data?.getAllRestaurants;
          this.loading = result.loading;
          this.error = result.errors;
          console.log('Restaurants:', this.restaurants);
        },
        error: (err) => {
          this.loading = false;
          this.error = err;
          console.error('GraphQL Error:', err);
        }
      });
  }
}
