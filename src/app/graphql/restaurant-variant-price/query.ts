import { gql } from 'apollo-angular';

export const GET_RESTAURANT_VARIANT_PRICES = gql`
  query GetRestaurantVariantPrices($page: Int, $limit: Int, $search: String) {
    getRestaurantVariantPrices(page: $page, limit: $limit, search: $search) {
      data {
        _id
        price
        mrp
        isAvailable
        variant {
          _id
          name
          productId
        }
        product {
          _id
          name
        }
        restaurant {
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