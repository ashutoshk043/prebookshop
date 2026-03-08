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
        description
        imageUrl
        tags
        isVeg
        isActive
        isOnlineVisible
        createdAt
        updatedAt
        category {
          id
          name
        }
      }
      total
      page
      limit
    }
  }
`;

export const GET_ALL_CATEGORIES = gql`
  query GetCategories {
    categories {
      _id
      name
      slug
      imageUrl
      order
      priority
      categoryType
      displaySections
      badges
      isActive
      isOnlineVisible
      createdAt
      updatedAt
    }
  }
`;

export const GET_INCLUDED_CATEGORIES = gql`
  query GetIncludedCategories {
    includedCategories {
      _id
      name
      slug
      imageUrl
      order
      priority
      categoryType
      displaySections
      badges
      isActive
      isOnlineVisible
      createdAt
      updatedAt
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