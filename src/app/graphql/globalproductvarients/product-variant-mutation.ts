import { gql } from 'apollo-angular';

export const ADD_PRODUCT_VARIANT = gql`
  mutation CreateProductVariant($input: CreateProductVariantInput!) {
    createProductVariant(input: $input) {
      _id
      productId
      size
      isActive
      createdAt
    }
  }
`;

export const UPDATE_PRODUCT_VARIANT = gql`
  mutation UpdateProductVariant($input: UpdateProductVariantInput!) {
    updateProductVariant(input: $input) {
      _id
      productId
      size
      isActive
      updatedAt
    }
  }
`;