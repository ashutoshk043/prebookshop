import { gql } from 'apollo-angular';

export const CREATE_RESTAURANT_INGREDIENTS_STOCK = gql`
  mutation CreateRestaurantIngredientsStock($input: CreateRestaurantIngredientsStockInput!) {
    createRestaurantIngredientsStock(input: $input) {
      _id
    }
  }
`;

export const UPDATE_RESTAURANT_INGREDIENTS_STOCK = gql`
  mutation UpdateRestaurantIngredientsStock($input: UpdateRestaurantIngredientsStockInput!) {
    updateRestaurantIngredientsStock(input: $input) {
      _id
    }
  }
`;

export const DELETE_RESTAURANT_INGREDIENTS_STOCK = gql`
  mutation DeleteRestaurantIngredientsStock($id: String!) {
    deleteRestaurantIngredientsStock(id: $id)
  }
`;