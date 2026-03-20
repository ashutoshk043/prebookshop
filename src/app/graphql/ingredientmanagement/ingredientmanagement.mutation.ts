import { gql } from 'apollo-angular';

export const ADD_INGREDIENT = gql`
  mutation CreateIngredient($input: CreateIngredientInput!) {
    createIngredient(input: $input) {
      _id
      name
      unit
      isActive
      createdAt
    }
  }
`;

export const UPDATE_INGREDIENT = gql`
  mutation UpdateIngredient($input: UpdateIngredientInput!) {
    updateIngredient(input: $input) {
      _id
      name
      unit
      isActive
      updatedAt
    }
  }
`;

export const DELETE_INGREDIENT = gql`
  mutation DeleteIngredient($id: String!) {
    deleteIngredient(id: $id) {
      _id
      name
    }
  }
`;