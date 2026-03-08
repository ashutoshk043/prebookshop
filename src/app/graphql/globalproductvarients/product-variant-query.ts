import { gql } from "apollo-angular";

export const SEARCH_PRODUCT_VARIANTS = gql`
  query GetProductVariants(
    $productId: String
    $size: String
    $page: Int
    $limit: Int
  ) {
    getProductVariants(
      productId: $productId
      size: $size
      page: $page
      limit: $limit
    ) {
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
    }
  }
`;