import { gql } from 'apollo-angular';

export const GET_RESTAURANT_VARIANT_PRICES = gql`
  query GetRestaurantVariantPrices(
    $page: Int
    $limit: Int
    $search: String
    $restId: String   # ✅ ADD THIS
  ) {
    getRestaurantVariantPrices(
      page: $page
      limit: $limit
      search: $search
      restId: $restId   # ✅ ADD THIS
    ) {
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