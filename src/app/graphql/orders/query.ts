import { gql } from 'apollo-angular';

export const GET_ORDERS = gql`
  query GetOrders($page: Int, $limit: Int, $search: String) {
    getOrders(page: $page, limit: $limit, search: $search) {
      data {
        _id
        orderType
        status
        subTotal
        discount
        grandTotal
        paymentMode
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