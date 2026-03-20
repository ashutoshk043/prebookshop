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
        varients
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

// product-query.ts
export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($_id: ID!) {
    getProductById(_id: $_id) {
      _id
      name
      varients
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