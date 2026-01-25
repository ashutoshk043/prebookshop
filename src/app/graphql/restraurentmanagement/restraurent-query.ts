import { gql } from 'apollo-angular';

export const GET_RESTAURANTS = gql`
  query GetRestaurants($page: Int, $limit: Int, $search: String) {
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


 export const GET_RESTAURANT_SUMMARY = gql`
  query getRestaurantSummary {
    getRestaurantSummary {
      totalRestaurants
      openCount
      closedCount
    }
  }
`;

export const GET_USERS_FROM_AUTH = gql`
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