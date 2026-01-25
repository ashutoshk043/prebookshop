import { gql } from 'apollo-angular';

export const SEARCH_PRODUCTS = gql`
  query SearchProducts(
    $name: String
    $category: String
    $page: Int
    $limit: Int
  ) {
    searchProducts(
      name: $name
      category: $category
      page: $page
      limit: $limit
    ) {
      data {
        _id
        name
        category
        price
        stock
        description
        variant
        status
        imageUrl
        restaurantName
      }
      total
      page
      limit
    }
  }
`;
