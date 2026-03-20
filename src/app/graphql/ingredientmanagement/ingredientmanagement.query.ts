import { gql } from 'apollo-angular';

// graphql/ingredient.query.ts
export const GET_INGREDIENTS = gql`
  query GetIngredients($page: Int, $limit: Int, $search: String) {
    getIngredients(page: $page, limit: $limit, search: $search) {
      data {
        _id
        name
        unit
        isActive
        createdAt
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