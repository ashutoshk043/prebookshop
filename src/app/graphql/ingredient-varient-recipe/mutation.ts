import { gql } from 'apollo-angular';

export const ADD_RECIPE = gql`
  mutation CreateRecipe($input: CreateRecipeInput!) {
    createRecipe(input: $input) {
      _id
      variantId
      ingredientId
      quantity
    }
  }
`;

export const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($input: UpdateRecipeInput!) {
    updateRecipe(input: $input) {
      _id
      variantId
      ingredientId
      quantity
    }
  }
`;

export const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: String!) {
    deleteRecipe(id: $id) {
      _id
    }
  }
`;