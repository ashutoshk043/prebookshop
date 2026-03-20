import { gql } from 'apollo-angular';

export const GET_RECIPES = gql`
  query GetRecipes($page: Int, $limit: Int, $search: String) {
    getRecipes(page: $page, limit: $limit, search: $search) {
      data {
        _id
        quantity
        variantId
        variantSize
        productId
        productName
        categoryId
        categoryName
        ingredientId
        ingredientName
        unit
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

export const GET_RECIPES_BY_VARIANT = gql`
  query GetRecipesByVariant($variantId: String!) {
    getRecipesByVariant(variantId: $variantId) {
      _id
      variantId
      ingredientId
      quantity
    }
  }
`;