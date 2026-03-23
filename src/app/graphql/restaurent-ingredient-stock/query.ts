import { gql } from 'apollo-angular';

export const GET_RESTAURANT_INGREDIENTS_STOCKS = gql`
  query GetRestaurantIngredientsStocks($page: Int, $limit: Int, $search: String) {
    getRestaurantIngredientsStocks(page: $page, limit: $limit, search: $search) {
      data {
        _id
        availableQty
        alertLevel
        createdAt
        restaurant {
          _id
          name
        }
        ingredient {
          _id
          name
          unit
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