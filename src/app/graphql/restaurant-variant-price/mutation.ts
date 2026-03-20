import { gql } from 'apollo-angular';

export const CREATE_RESTAURANT_VARIANT_PRICE = gql`
  mutation CreateRestaurantVariantPrice($input: CreateRestaurantVariantPriceInput!) {
    createRestaurantVariantPrice(input: $input) {
      _id
    }
  }
`;

export const UPDATE_RESTAURANT_VARIANT_PRICE = gql`
  mutation UpdateRestaurantVariantPrice($input: UpdateRestaurantVariantPriceInput!) {
    updateRestaurantVariantPrice(input: $input) {
      _id
    }
  }
`;

export const DELETE_RESTAURANT_VARIANT_PRICE = gql`
  mutation DeleteRestaurantVariantPrice($id: String!) {
    deleteRestaurantVariantPrice(id: $id)
  }
`;