import { gql } from 'apollo-angular';

export const ADD_PRODUCT_VARIANT = gql`
  mutation AddProductVariant($input: CreateProductVariantInput!) {
    addProductVariant(input: $input) {
      _id
      productId
      size
      isActive
      createdAt
    }
  }
`;

export const UPDATE_PRODUCT_VARIANT = gql`
  mutation UpdateProductVariant(
    $_id: ID!
    $input: CreateProductVariantInput!
  ) {
    updateProductVariant(_id: $_id, input: $input) {
      _id
      productId
      size
      isActive
      updatedAt
    }
  }
`;