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
        orderNumber
        restaurant {
          _id
          name
        }
        items {
          _id
          productId
          variantId
          quantity
          price
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