import { gql } from 'apollo-angular';

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrdersInput!) {
    createOrder(input: $input) {
      _id
      subTotal
      discount
      grandTotal
      status
    }
  }
`;

export const UPDATE_ORDER = gql`
  mutation UpdateOrder($input: UpdateOrdersInput!) {
    updateOrder(input: $input) {
      _id
      status
      paymentMode
      subTotal
      discount
      grandTotal
    }
  }
`;

export const DELETE_ORDER = gql`
  mutation DeleteOrder($id: String!) {
    deleteOrder(id: $id)
  }
`;