import { gql } from 'apollo-angular';

export const ADD_PRODUCT = gql`
  mutation AddProduct($input: CreateProductInput!) {
    addProducts(input: $input) {
      _id
      name
      slug
      categoryId
      isVeg
      isActive
      isOnlineVisible
    }
  }
`;


export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($_id: String!, $input: CreateProductInput!) {
    updateProduct(_id: $_id, input: $input) {
      _id
      name
      slug
      categoryId
      isVeg
      isActive
      isOnlineVisible
    }
  }
`;



export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($_id: String!) {
    deleteProduct(_id: $_id) {
      _id
      name
    }
  }
`;