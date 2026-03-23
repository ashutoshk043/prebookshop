import { gql } from 'apollo-angular';

export const GET_OFFERS = gql`
  query GetOffers($page: Int, $limit: Int, $search: String) {
    getOffers(page: $page, limit: $limit, search: $search) {
      data {
        _id
        title
        type
        productIds
        discountType
        discountValue
        minOrderValue
        isActive
        startAt
        endAt
        createdAt
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