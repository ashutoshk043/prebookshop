import { gql } from 'apollo-angular';

export const GET_COUPONS = gql`
  query GetCoupons($page: Int, $limit: Int, $search: String) {
    getCoupons(page: $page, limit: $limit, search: $search) {
      data {
        _id
        code
        discountType
        discountValue
        minOrderValue
        usageLimitPerUser
        isActive
        expiryDate
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