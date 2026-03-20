import { gql } from "apollo-angular";

export const GET_PRODUCT_VARIANTS = gql`
  query GetProductVariants($input: GetVariantsInput) {
    getProductVariants(input: $input) {
      data {
        _id
        productId
        size
        isActive
        createdAt
        updatedAt
        product {
          _id
          name
        }
      }
      total
      page
      limit
      totalPages
      hasNextPage
      hasPrevPage
    }
  }
`;