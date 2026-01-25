import { gql } from 'apollo-angular';

export const ADD_PRODUCT = gql`
  mutation AddProduct($input: CreateProductInput!) {
    addProducts(input: $input) {
      _id
      name
      price
      stock
      status
    }
  }
`;


export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($_id: String!, $input: CreateProductInput!) {
    updateProduct(_id: $_id, input: $input) {
      _id
      name
      price
      stock
      status
    }
  }
`;
