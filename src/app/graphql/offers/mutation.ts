import { gql } from 'apollo-angular';

export const CREATE_OFFER = gql`
  mutation CreateOffer($input: CreateOffersInput!) {
    createOffer(input: $input) {
      _id
    }
  }
`;

export const UPDATE_OFFER = gql`
  mutation UpdateOffer($input: UpdateOffersInput!) {
    updateOffer(input: $input) {
      _id
    }
  }
`;

export const DELETE_OFFER = gql`
  mutation DeleteOffer($id: String!) {
    deleteOffer(id: $id)
  }
`;