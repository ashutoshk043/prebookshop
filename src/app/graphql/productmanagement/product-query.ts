import { gql } from 'apollo-angular';

export const SEARCH_PRODUCTS = gql`
  query SearchProducts(
    $name: String
    $categoryId: String
    $page: Int
    $limit: Int
  ) {
    searchProducts(
      name: $name
      categoryId: $categoryId
      page: $page
      limit: $limit
    ) {
      data {
        _id
        name
        slug
        categoryId
        description
        imageUrl
        tags
        isVeg
        isActive
        isOnlineVisible
        createdAt
        updatedAt
      }
      total
      page
      limit
    }
  }
`;



export const GET_ALL_RESTAURANTS = gql`
  query GetAllRestaurants {
    getAllRestaurants {
      _id
      name
    }
  }
`;


export const GET_ALL_INCLUDED_CATEGORIES = gql`
  query GetAllIncludedCategories {
    includedCategories {
      _id
      name
    }
  }
`;



