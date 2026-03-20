import { gql } from 'apollo-angular';

export const GET_RESTAURANT_VARIANT_PRICES = gql`
  query GetRestaurantVariantPrices($page: Int, $limit: Int, $search: String) {
    getRestaurantVariantPrices(page: $page, limit: $limit, search: $search) {
      data {
        _id
        price
        isAvailable
        createdAt
        restaurantId
        restaurantName
        variantId
        variantSize
        productId
        productName
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