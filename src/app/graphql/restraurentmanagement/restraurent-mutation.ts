import { gql } from 'apollo-angular';

export const DELETE_RESTAURANT = gql`
  mutation DeleteRestaurant($id: String!) {
    deleteRestaurant(id: $id) {
      id
      restaurantName
    }
  }
`;


export const CREATE_RESTAURANT = gql`
  mutation createRestaurant($input: CreateRestaurantInput!) {
    createRestaurant(input: $input) {
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
    }
  }
`;



export const UPDATE_RESTAURANT = gql`
  mutation updateRestaurant($input: CreateRestaurantInput!) {
    updateRestaurant(input: $input) {
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
    }
  }
`;


