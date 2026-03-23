import { gql } from 'apollo-angular';

export const CREATE_COUPON = gql`
  mutation CreateCoupon($input: CreateCouponsInput!) {
    createCoupon(input: $input) {
      _id
    }
  }
`;

export const UPDATE_COUPON = gql`
  mutation UpdateCoupon($input: UpdateCouponsInput!) {
    updateCoupon(input: $input) {
      _id
    }
  }
`;

export const DELETE_COUPON = gql`
  mutation DeleteCoupon($id: String!) {
    deleteCoupon(id: $id)
  }
`;